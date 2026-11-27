// Secure payment (manual escrow) for delivery orders:
// the buyer pays the platform (Bankily / Masrvi / Sedad) and uploads the receipt → an admin confirms the money
// is held → the seller ships → the buyer confirms receipt (or opens a dispute) → an admin pays the seller
// (or refunds the buyer). Nobody but the buyer, the seller and the admins sees the payment details.
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, forbidden, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { onEscrowHeld, onEscrowRefunded, onEscrowReleased } from '../lib/pay.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { savePrivateFile, sendFile, upload } from '../middleware/upload.js';

const router = Router();
const CHANNELS = ['bankily', 'masrvi', 'sedad'];

async function adminsNotify(type, data, link) {
  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  for (const a of admins.rows) await notify(a.id, type, data, link);
}

async function myEscrowOrder(id, userId) {
  const o = (await query("SELECT * FROM orders WHERE id = $1 AND payment_method = 'escrow'", [parseInt(id, 10) || 0])).rows[0];
  if (!o || o.buyer_id !== userId) throw notFound('order_not_found');
  return o;
}

/** POST /api/orders/:id/payment (multipart "receipt", channel, ref) – the buyer sends proof of payment. */
router.post('/orders/:id/payment', requireAuth, limiter('escrow-receipt', { windowMs: 60 * 60 * 1000, limit: 10, keyGenerator: (req) => String(req.user.id) }), upload.single('receipt'), async (req, res) => {
  const d = parse(z.object({ channel: z.enum(CHANNELS), ref: z.string().trim().max(80).optional().transform((v) => v || null) }), req.body);
  const o = await myEscrowOrder(req.params.id, req.user.id);
  if (!['awaiting_payment', 'submitted'].includes(o.payment_status) || o.status === 'cancelled') throw conflict('payment_closed');
  if (!req.file) throw badRequest('validation_error', { receipt: 'required' });
  await tx(async (client) => {
    const fileId = await savePrivateFile(req.file, client);
    await client.query(
      "UPDATE orders SET payment_status = 'submitted', pay_channel = $1, pay_ref = $2, pay_receipt_file_id = $3, payment_updated_at = now() WHERE id = $4",
      [d.channel, d.ref, fileId, o.id],
    );
  });
  await adminsNotify('escrow_submitted', { id: o.id, title: o.product_title, amount: Number(o.total) }, '/admin/escrow');
  res.json({ paymentStatus: 'submitted' });
});

/** POST /api/orders/:id/confirm-receipt – the buyer got the item: the seller can be paid. */
router.post('/orders/:id/confirm-receipt', requireAuth, async (req, res) => {
  const o = await myEscrowOrder(req.params.id, req.user.id);
  if (o.status !== 'delivered' || o.payment_status !== 'held') throw conflict('payment_closed');
  await query("UPDATE orders SET payment_status = 'release_due', payment_updated_at = now() WHERE id = $1", [o.id]);
  await notify(o.seller_id, 'escrow_release_due', { id: o.id, title: o.product_title }, `/orders/${o.id}`);
  await adminsNotify('escrow_release_due', { id: o.id, title: o.product_title }, '/admin/escrow');
  res.json({ paymentStatus: 'release_due' });
});

/** POST /api/orders/:id/dispute { reason } – something is wrong: the money stays held until an admin decides. */
router.post('/orders/:id/dispute', requireAuth, async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().trim().min(5, 'min_5').max(500) }), req.body);
  const o = await myEscrowOrder(req.params.id, req.user.id);
  if (!['held', 'release_due'].includes(o.payment_status)) throw conflict('payment_closed');
  await query("UPDATE orders SET payment_status = 'disputed', dispute_reason = $1, payment_updated_at = now() WHERE id = $2", [reason, o.id]);
  await notify(o.seller_id, 'escrow_disputed', { id: o.id, title: o.product_title }, `/orders/${o.id}`);
  await adminsNotify('escrow_disputed', { id: o.id, title: o.product_title }, '/admin/escrow');
  res.json({ paymentStatus: 'disputed' });
});

// ---------- Admin ----------

/** GET /api/admin/escrow?status= – secure-payment orders that need attention first. */
router.get('/admin/escrow', requireAuth, requireAdmin, async (req, res) => {
  const statuses = ['submitted', 'held', 'release_due', 'released', 'disputed', 'refund_due', 'refunded', 'awaiting_payment'];
  const status = statuses.includes(req.query.status) ? req.query.status : null;
  const { rows } = await query(
    `SELECT o.id, o.product_title, o.status, o.total, o.item_price, o.delivery_fee, o.payment_status, o.pay_channel, o.pay_ref, o.pay_receipt_file_id,
       o.payout_ref, o.dispute_reason, o.payment_updated_at, o.created_at, o.delivered_at,
       b.name AS buyer_name, b.phone AS buyer_phone, s.name AS seller_name, s.phone AS seller_phone
     FROM orders o JOIN users b ON b.id = o.buyer_id JOIN users s ON s.id = o.seller_id
     WHERE o.payment_method = 'escrow' ${status ? 'AND o.payment_status = $1' : ''}
     ORDER BY (o.payment_status IN ('submitted', 'release_due', 'disputed', 'refund_due')) DESC, o.payment_updated_at DESC NULLS LAST LIMIT 200`,
    status ? [status] : [],
  );
  const counts = await query("SELECT payment_status, COUNT(*)::int AS n FROM orders WHERE payment_method = 'escrow' GROUP BY payment_status");
  res.json({ items: rows, counts: Object.fromEntries(counts.rows.map((c) => [c.payment_status, c.n])) });
});

/** GET /api/admin/escrow/:id/receipt – the buyer's payment receipt (private file). */
router.get('/admin/escrow/:id/receipt', requireAuth, requireAdmin, async (req, res) => {
  const o = (await query('SELECT pay_receipt_file_id FROM orders WHERE id = $1', [parseInt(req.params.id, 10) || 0])).rows[0];
  if (!o?.pay_receipt_file_id) throw notFound();
  return sendFile(res, o.pay_receipt_file_id, { isPrivate: true });
});

// action → [allowed current statuses, new status, who is told, notification]
const ACTIONS = {
  confirm: [['submitted'], 'held', 'both', 'escrow_held'],
  reject: [['submitted'], 'awaiting_payment', 'buyer', 'escrow_rejected'],
  release: [['release_due', 'disputed', 'held'], 'released', 'both', 'escrow_released'],
  refund: [['disputed', 'refund_due', 'held', 'submitted'], 'refunded', 'both', 'escrow_refunded'],
};

/** PATCH /api/admin/escrow/:id { action: confirm | reject | release | refund, ref?, note? } */
router.patch('/admin/escrow/:id', requireAuth, requireAdmin, async (req, res) => {
  const d = parse(z.object({ action: z.enum(Object.keys(ACTIONS)), ref: z.string().trim().max(120).optional(), note: z.string().trim().max(300).optional() }), req.body);
  const [from, to, who, type] = ACTIONS[d.action];
  if ((d.action === 'release' || d.action === 'refund') && !d.ref) throw badRequest('validation_error', { ref: 'required' });
  if (d.action === 'reject' && !d.note) throw badRequest('validation_error', { note: 'required' });
  const o = await tx(async (client) => {
    const row = (await client.query("SELECT * FROM orders WHERE id = $1 AND payment_method = 'escrow' FOR UPDATE", [parseInt(req.params.id, 10) || 0])).rows[0];
    if (!row) throw notFound('order_not_found');
    if (!from.includes(row.payment_status)) throw conflict('payment_closed');
    // Paying the seller only once the item was delivered (or the dispute was decided for the seller).
    if (d.action === 'release' && row.status !== 'delivered') throw badRequest('not_delivered');
    await client.query('UPDATE orders SET payment_status = $1, payout_ref = COALESCE($2, payout_ref), payment_updated_at = now() WHERE id = $3', [to, d.ref || null, row.id]);
    await client.query('INSERT INTO order_events (order_id, status, actor_id, actor_role, note) VALUES ($1, $2, $3, $4, $5)', [row.id, `payment_${to}`, req.user.id, 'admin', d.note || null]);
    // Souk Pay records: money in, the payout of each share, or the refund.
    if (d.action === 'confirm') await onEscrowHeld(client, row, req.user.id);
    if (d.action === 'release') row.settlement = await onEscrowReleased(client, row, req.user.id, d.ref);
    if (d.action === 'refund') {
      // Refunding a receipt that was never confirmed still means the money had arrived: record it first.
      if (row.payment_status === 'submitted') await onEscrowHeld(client, row, req.user.id);
      await onEscrowRefunded(client, row, req.user.id, d.ref);
    }
    return row;
  });
  const sellerGets = o.settlement ? Number(o.settlement.seller_amount) : Number(o.item_price);
  const data = { id: o.id, title: o.product_title, amount: d.action === 'release' ? sellerGets : Number(o.total), reason: d.note || null };
  if (who === 'buyer' || who === 'both') await notify(o.buyer_id, type, data, `/orders/${o.id}`);
  if (who === 'both') await notify(o.seller_id, type, data, `/orders/${o.id}`);
  res.json({ paymentStatus: to });
});

export default router;
