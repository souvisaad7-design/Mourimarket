// Authenticated user features: favorites, messaging, notifications, reviews, reports.
import { Router } from 'express';
import { limiter } from '../lib/rateLimit.js';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { PAYMENT_METHODS, REPORT_REASONS } from '../lib/constants.js';
import { getSettings, paidUpgradesEnabled } from '../lib/settings.js';
import { badRequest, conflict, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { requireAuth } from '../middleware/auth.js';
import { requireVerifiedPhone } from '../middleware/phone.js';
import { savePrivateFile, upload } from '../middleware/upload.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';

const router = Router();
router.use(requireAuth);

// Light anti-spam on anything that writes user-generated text.
const writeLimiter = limiter('account-write', { windowMs: 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) });

// ---------- Favorites ----------

router.get('/favorites', async (req, res) => {
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, true AS is_favorite ${PRODUCT_FROM}
     JOIN favorites f ON f.product_id = p.id
     WHERE f.user_id = $1 AND p.status = 'approved' ORDER BY f.created_at DESC`,
    [req.user.id],
  );
  res.json({ items: rows });
});

router.post('/favorites/:productId', async (req, res) => {
  const id = parseInt(req.params.productId, 10) || 0;
  const { rowCount } = await query(`SELECT 1 FROM products WHERE id = $1 AND status = 'approved'`, [id]);
  if (!rowCount) throw notFound('product_not_found');
  await query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, id]);
  res.status(201).json({ ok: true });
});

router.delete('/favorites/:productId', async (req, res) => {
  await query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [
    req.user.id, parseInt(req.params.productId, 10) || 0,
  ]);
  res.json({ ok: true });
});

// ---------- Conversations & messages ----------

const CONVERSATION_SELECT = `
  cv.id, cv.product_id, cv.buyer_id, cv.seller_id, cv.last_message_at,
  p.title AS product_title, p.price AS product_price, p.availability AS product_availability,
  (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS product_cover,
  CASE WHEN cv.buyer_id = $1 THEN cv.seller_id ELSE cv.buyer_id END AS other_id,
  CASE WHEN cv.buyer_id = $1 THEN us.name ELSE ub.name END AS other_name,
  (SELECT body FROM messages m WHERE m.conversation_id = cv.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = cv.id AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread`;

const CONVERSATION_FROM = `
  FROM conversations cv
  LEFT JOIN products p ON p.id = cv.product_id
  JOIN users ub ON ub.id = cv.buyer_id
  JOIN users us ON us.id = cv.seller_id`;

router.get('/conversations', async (req, res) => {
  const { rows } = await query(
    `SELECT ${CONVERSATION_SELECT} ${CONVERSATION_FROM}
     WHERE cv.buyer_id = $1 OR cv.seller_id = $1 ORDER BY cv.last_message_at DESC`,
    [req.user.id],
  );
  res.json({ items: rows });
});

const messageBody = z.string().trim().min(1, 'required').max(2000, 'too_long');

/** POST /api/conversations – start (or reuse) a conversation about a product with a first message. */
router.post('/conversations', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const data = parse(z.object({ productId: z.coerce.number().int().positive(), body: messageBody }), req.body);
  const { rows: prows } = await query(
    `SELECT p.id, p.seller_id, p.title FROM products p JOIN users u ON u.id = p.seller_id
     WHERE p.id = $1 AND p.status = 'approved' AND u.is_active`,
    [data.productId],
  );
  const product = prows[0];
  if (!product) throw notFound('product_not_found');
  if (product.seller_id === req.user.id) throw badRequest('cannot_message_self');

  const conversationId = await tx(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES ($1, $2, $3)
       ON CONFLICT (product_id, buyer_id, seller_id) DO UPDATE SET last_message_at = now()
       RETURNING id`,
      [product.id, req.user.id, product.seller_id],
    );
    const id = rows[0].id;
    await client.query('INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3)', [
      id, req.user.id, data.body,
    ]);
    await notify(product.seller_id, 'new_message',
      { from: req.user.name, title: product.title, conversationId: id }, `/messages/${id}`, client);
    return id;
  });
  res.status(201).json({ conversationId });
});

async function loadConversation(id, userId) {
  const { rows } = await query(
    `SELECT ${CONVERSATION_SELECT} ${CONVERSATION_FROM} WHERE cv.id = $2`,
    [userId, parseInt(id, 10) || 0],
  );
  const cv = rows[0];
  if (!cv) throw notFound('conversation_not_found');
  if (cv.buyer_id !== userId && cv.seller_id !== userId) throw forbidden();
  return cv;
}

router.get('/conversations/:id', async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { rows } = await query(
    'SELECT id, sender_id, body, read_at, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at, id',
    [conversation.id],
  );
  await query(
    'UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL',
    [conversation.id, req.user.id],
  );
  // Reading the thread also clears its message notifications.
  await query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND type IN ('new_message','seller_reply')
     AND data->>'conversationId' = $2`,
    [req.user.id, String(conversation.id)],
  );
  res.json({ conversation, messages: rows });
});

router.post('/conversations/:id/messages', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { body } = parse(z.object({ body: messageBody }), req.body);
  const { rows } = await query(
    'INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING id, sender_id, body, read_at, created_at',
    [conversation.id, req.user.id, body],
  );
  await query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
  const isSeller = req.user.id === conversation.seller_id;
  await notify(conversation.other_id, isSeller ? 'seller_reply' : 'new_message',
    { from: req.user.name, title: conversation.product_title, conversationId: conversation.id },
    `/messages/${conversation.id}`);
  res.status(201).json({ message: rows[0] });
});

// ---------- Notifications ----------

router.get('/notifications', async (req, res) => {
  const { limit, offset } = pagination(req.query, { defaultLimit: 30 });
  const { rows } = await query(
    `SELECT id, type, data, link, is_read, created_at FROM notifications
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [req.user.id],
  );
  res.json({ items: rows });
});

/** Badge counts for the header, polled by the client. */
router.get('/notifications/summary', async (req, res) => {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND NOT is_read) AS notifications,
            (SELECT COUNT(*) FROM messages m JOIN conversations cv ON cv.id = m.conversation_id
             WHERE (cv.buyer_id = $1 OR cv.seller_id = $1) AND m.sender_id <> $1 AND m.read_at IS NULL) AS messages`,
    [req.user.id],
  );
  res.json(rows[0]);
});

router.post('/notifications/read-all', async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE user_id = $1 AND NOT is_read', [req.user.id]);
  res.json({ ok: true });
});

router.patch('/notifications/:id/read', async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [
    parseInt(req.params.id, 10) || 0, req.user.id,
  ]);
  res.json({ ok: true });
});

// ---------- Reviews (only for documented sales) ----------

router.post('/reviews', writeLimiter, async (req, res) => {
  const data = parse(
    z.object({
      productId: z.coerce.number().int().positive(),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  const { rows } = await query('SELECT id, seller_id, sold_to_id, title FROM products WHERE id = $1', [data.productId]);
  const product = rows[0];
  if (!product) throw notFound('product_not_found');
  if (product.sold_to_id !== req.user.id) throw forbidden('review_requires_sale');
  try {
    await query(
      'INSERT INTO reviews (product_id, reviewer_id, seller_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
      [product.id, req.user.id, product.seller_id, data.rating, data.comment || null],
    );
  } catch (err) {
    if (err.code === '23505') throw conflict('already_reviewed');
    throw err;
  }
  await notify(product.seller_id, 'new_review', { rating: data.rating, title: product.title }, `/users/${product.seller_id}`);
  res.status(201).json({ ok: true });
});

// ---------- Reports ----------

router.post('/reports', writeLimiter, async (req, res) => {
  const data = parse(
    z.object({
      productId: z.coerce.number().int().positive(),
      reason: z.enum(REPORT_REASONS),
      details: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  const { rowCount } = await query('SELECT 1 FROM products WHERE id = $1', [data.productId]);
  if (!rowCount) throw notFound('product_not_found');
  const dup = await query(
    `SELECT 1 FROM reports WHERE reporter_id = $1 AND product_id = $2 AND status = 'open'`,
    [req.user.id, data.productId],
  );
  if (dup.rowCount) throw conflict('already_reported');
  await query('INSERT INTO reports (reporter_id, product_id, reason, details) VALUES ($1, $2, $3, $4)', [
    req.user.id, data.productId, data.reason, data.details || null,
  ]);
  res.status(201).json({ ok: true });
});

export default router;

// ---------- Verification & featuring requests ----------

// The site is free unless PAID_UPGRADES=true: the request endpoints then do not exist.
router.use('/upgrade-requests', async (_req, _res, next) => ((await paidUpgradesEnabled()) ? next() : next(notFound())));

/** GET /api/upgrade-requests – the signed-in user's own requests. */
router.get('/upgrade-requests', async (req, res) => {
  const { rows } = await query(
    `SELECT r.id, r.kind, r.product_id, p.title AS product_title, r.days, r.amount, r.payment_method,
       r.status, r.admin_note, r.created_at, r.reviewed_at
     FROM upgrade_requests r LEFT JOIN products p ON p.id = r.product_id
     WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
    [req.user.id],
  );
  res.json({ items: rows });
});

const upgradeSchema = z.object({
  kind: z.enum(['verify', 'feature']),
  productId: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().positive().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentRef: z.string().trim().max(80).optional().transform((v) => v || null),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

/**
 * POST /api/upgrade-requests (multipart, field "receipt") – ask to have the account
 * verified or a listing featured, with a photo of the payment receipt.
 * The price is set by the server, never by the client.
 */
router.post('/upgrade-requests', writeLimiter, upload.single('receipt'), async (req, res) => {
  const data = parse(upgradeSchema, req.body);
  if (!req.file) throw badRequest('validation_error', { receipt: 'required' });
  const me = (await query('SELECT account_type, is_verified FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!me || me.account_type === 'buyer') throw forbidden('sellers_only');

  let amount;
  let product = null;
  if (data.kind === 'verify') {
    if (me.is_verified) throw conflict('already_verified');
    amount = (await getSettings()).pricing.verifyPrice;
  } else {
    const plan = (await getSettings()).pricing.featurePlans.find((x) => x.days === data.days);
    if (!plan) throw badRequest('validation_error', { days: 'invalid' });
    if (!data.productId) throw badRequest('validation_error', { productId: 'required' });
    product = (await query('SELECT id, title, seller_id, status, availability FROM products WHERE id = $1', [data.productId])).rows[0];
    if (!product || product.seller_id !== req.user.id) throw notFound('product_not_found');
    if (product.status !== 'approved' || product.availability !== 'available') throw badRequest('product_not_featurable');
    amount = plan.price;
  }

  const request = await tx(async (client) => {
    const fileId = await savePrivateFile(req.file, client);
    try {
      const { rows } = await client.query(
        `INSERT INTO upgrade_requests (user_id, kind, product_id, days, amount, payment_method, payment_ref, note, receipt_file_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, kind, product_id, days, amount, status, created_at`,
        [req.user.id, data.kind, product?.id ?? null, data.kind === 'feature' ? data.days : null, amount,
          data.paymentMethod, data.paymentRef, data.note, fileId],
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') throw conflict('request_pending');
      throw err;
    }
  });

  // Let the admins know there is something to review.
  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  await Promise.all(admins.rows.map((a) => notify(a.id, `upgrade_request_${data.kind}`, {
    name: req.user.name, title: product?.title || null,
  }, '/admin/requests')));

  res.status(201).json({ request });
});
