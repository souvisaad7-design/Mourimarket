// Souk Pay API.
// People: their wallet (what they are owed as sellers, the cash they carry as couriers), and the cash hand-over:
//   the courier says "I gave the seller their money" → the seller confirms (or says they did not get it).
// Admins: totals, who holds whose money, every movement (with CSV export), recording cash handed to the
//   platform or payouts, settling disputes, the commission, and the state of each payment provider.
// Provider webhooks have an entry point, but every gateway is off until it is connected (merchant contract).
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { gatewayFor, positionOf, providerStatus, transfer } from '../lib/pay.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const ACCOUNTS = ['buyer', 'courier', 'seller', 'platform', 'escrow'];
const METHODS = ['cash', 'bankily', 'masrvi', 'sedad', 'other'];
const writeLimiter = limiter('pay-write', { windowMs: 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) });

async function notifyAdmins(type, data, link, client = { query }) {
  const { rows } = await client.query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  for (const a of rows) await notify(a.id, type, data, link, client);
}

const TRANSFER_SELECT = `t.id, t.order_id, t.from_account, t.from_user, t.to_account, t.to_user, t.amount, t.kind, t.method, t.ref, t.note,
  t.status, t.created_at, t.confirmed_at, o.product_title, fu.name AS from_name, tu.name AS to_name`;
const TRANSFER_FROM = `FROM pay_transfers t LEFT JOIN orders o ON o.id = t.order_id
  LEFT JOIN users fu ON fu.id = t.from_user LEFT JOIN users tu ON tu.id = t.to_user`;
const num = (row, keys) => { for (const k of keys) if (row[k] !== null && row[k] !== undefined) row[k] = Number(row[k]); return row; };

// ---------- Wallet ----------

/** GET /api/pay/me – my position, my sales and deliveries with their hand-over state, my latest movements. */
router.get('/pay/me', requireAuth, async (req, res) => {
  const uid = req.user.id;
  const handover = `(SELECT json_build_object('id', h.id, 'status', h.status, 'amount', h.amount, 'created_at', h.created_at)
     FROM pay_transfers h WHERE h.order_id = s.order_id AND h.kind = 'handover' AND h.status <> 'cancelled' ORDER BY h.id DESC LIMIT 1) AS handover`;
  const [position, sales, deliveries, moves] = await Promise.all([
    positionOf(uid),
    query(`SELECT s.order_id, s.method, s.total, s.seller_amount, s.courier_amount, s.platform_amount, s.created_at, o.product_title, cu.name AS courier_name, ${handover},
             (SELECT h.status FROM pay_transfers h WHERE h.order_id = s.order_id AND h.kind = 'payout' AND h.to_account = 'seller' AND h.status = 'confirmed' LIMIT 1) AS payout
           FROM order_settlements s JOIN orders o ON o.id = s.order_id LEFT JOIN users cu ON cu.id = s.courier_user_id
           WHERE s.seller_id = $1 AND NOT s.is_void ORDER BY s.created_at DESC LIMIT 50`, [uid]),
    query(`SELECT s.order_id, s.method, s.total, s.seller_amount, s.courier_amount, s.platform_amount, s.created_at, o.product_title, se.name AS seller_name, ${handover}
           FROM order_settlements s JOIN orders o ON o.id = s.order_id LEFT JOIN users se ON se.id = s.seller_id
           WHERE s.courier_user_id = $1 AND NOT s.is_void ORDER BY s.created_at DESC LIMIT 50`, [uid]),
    query(`SELECT ${TRANSFER_SELECT} ${TRANSFER_FROM} WHERE (t.from_user = $1 OR t.to_user = $1) AND t.status <> 'cancelled' ORDER BY t.id DESC LIMIT 50`, [uid]),
  ]);
  const amounts = ['total', 'seller_amount', 'courier_amount', 'platform_amount'];
  res.json({
    position,
    sales: sales.rows.map((r) => num(r, amounts)),
    deliveries: deliveries.rows.map((r) => num(r, amounts)),
    transfers: moves.rows.map((r) => ({ ...num(r, ['amount']), mine: r.from_user === uid ? 'out' : 'in' })),
  });
});

/** POST /api/pay/orders/:id/handover { method?, ref? } – the courier gave the seller their share. */
router.post('/pay/orders/:id/handover', requireAuth, writeLimiter, async (req, res) => {
  const d = parse(z.object({ method: z.enum(METHODS).default('cash'), ref: z.string().trim().max(120).optional() }), req.body || {});
  const t = await tx(async (client) => {
    const { rows } = await client.query(
      `SELECT s.*, o.product_title FROM order_settlements s JOIN orders o ON o.id = s.order_id WHERE s.order_id = $1 FOR UPDATE OF s`,
      [parseInt(req.params.id, 10) || 0],
    );
    const s = rows[0];
    if (!s || s.courier_user_id !== req.user.id) throw notFound('order_not_found');
    if (s.is_void || s.method !== 'cod') throw badRequest('nothing_to_hand_over');
    if (!(Number(s.seller_amount) > 0)) throw badRequest('nothing_to_hand_over');
    try {
      const row = await transfer(client, {
        orderId: s.order_id, from: 'courier', fromUser: req.user.id, to: 'seller', toUser: s.seller_id, amount: Number(s.seller_amount),
        kind: 'handover', method: d.method, ref: d.ref, status: 'pending', by: req.user.id,
      });
      await notify(s.seller_id, 'pay_handover', { id: s.order_id, title: s.product_title, amount: Number(s.seller_amount), from: req.user.name }, '/wallet', client);
      return row;
    } catch (err) {
      if (err.code === '23505') throw conflict('handover_exists');
      throw err;
    }
  });
  res.status(201).json({ transfer: num(t, ['amount']) });
});

async function myIncoming(client, id, userId) {
  const { rows } = await client.query('SELECT t.*, o.product_title FROM pay_transfers t LEFT JOIN orders o ON o.id = t.order_id WHERE t.id = $1 FOR UPDATE OF t', [parseInt(id, 10) || 0]);
  const t = rows[0];
  if (!t || t.to_user !== userId) throw notFound('transfer_not_found');
  if (t.status !== 'pending') throw conflict('transfer_closed');
  return t;
}

/** POST /api/pay/transfers/:id/confirm – "I received this money". */
router.post('/pay/transfers/:id/confirm', requireAuth, writeLimiter, async (req, res) => {
  await tx(async (client) => {
    const t = await myIncoming(client, req.params.id, req.user.id);
    await client.query("UPDATE pay_transfers SET status = 'confirmed', confirmed_by = $2, confirmed_at = now() WHERE id = $1", [t.id, req.user.id]);
    if (t.from_user) await notify(t.from_user, 'pay_confirmed', { id: t.order_id, title: t.product_title || '', amount: Number(t.amount), from: req.user.name }, '/wallet', client);
  });
  res.json({ status: 'confirmed' });
});

/** POST /api/pay/transfers/:id/dispute { reason } – "I did not get this money": an admin looks into it. */
router.post('/pay/transfers/:id/dispute', requireAuth, writeLimiter, async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().trim().min(3, 'min_3').max(300) }), req.body);
  await tx(async (client) => {
    const t = await myIncoming(client, req.params.id, req.user.id);
    await client.query("UPDATE pay_transfers SET status = 'disputed', note = $2 WHERE id = $1", [t.id, reason]);
    const data = { id: t.order_id, title: t.product_title || '', amount: Number(t.amount), from: req.user.name };
    if (t.from_user) await notify(t.from_user, 'pay_disputed', data, '/wallet', client);
    await notifyAdmins('pay_disputed', data, '/admin/pay', client);
  });
  res.json({ status: 'disputed' });
});

/** POST /api/pay/transfers/:id/cancel – the sender takes back a hand-over not yet confirmed (e.g. a mistake). */
router.post('/pay/transfers/:id/cancel', requireAuth, writeLimiter, async (req, res) => {
  const { rowCount } = await query(
    "UPDATE pay_transfers SET status = 'cancelled' WHERE id = $1 AND from_user = $2 AND status = 'pending'",
    [parseInt(req.params.id, 10) || 0, req.user.id],
  );
  if (!rowCount) throw conflict('transfer_closed');
  res.json({ status: 'cancelled' });
});

// ---------- Provider webhooks (ready, but every gateway is off) ----------

/** POST /api/pay/webhook/:provider – where a connected gateway would confirm payments. */
router.post('/pay/webhook/:provider', async (req, res) => {
  const g = gatewayFor(req.params.provider);
  if (!g) return res.status(404).json({ error: 'not_found' });
  return res.status(503).json({ error: 'provider_disabled' });
});

// ---------- Admin ----------

const admin = Router();
admin.use(requireAuth, requireAdmin);

/** GET /api/admin/pay/summary */
admin.get('/summary', async (_req, res) => {
  const holders = (account, entitled) => `
    WITH ent AS (${entitled}),
    inn AS (SELECT to_user AS u, SUM(amount) AS a FROM pay_transfers WHERE to_account = '${account}' AND status = 'confirmed' AND to_user IS NOT NULL GROUP BY 1),
    outt AS (SELECT from_user AS u, SUM(amount) AS a FROM pay_transfers WHERE from_account = '${account}' AND status = 'confirmed' AND from_user IS NOT NULL GROUP BY 1),
    ids AS (SELECT u FROM ent UNION SELECT u FROM inn UNION SELECT u FROM outt)
    SELECT us.id, us.name, us.phone, COALESCE(inn.a, 0) - COALESCE(outt.a, 0) AS held, COALESCE(ent.e, 0) AS entitled
    FROM ids JOIN users us ON us.id = ids.u LEFT JOIN ent ON ent.u = ids.u LEFT JOIN inn ON inn.u = ids.u LEFT JOIN outt ON outt.u = ids.u`;
  const [totals, couriers, sellers, providers, disputed, pending] = await Promise.all([
    query(`SELECT
        COALESCE((SELECT SUM(total) FROM order_settlements WHERE NOT is_void), 0) AS volume,
        COALESCE((SELECT COUNT(*) FROM order_settlements WHERE NOT is_void), 0) AS orders,
        COALESCE((SELECT SUM(platform_amount) FROM order_settlements WHERE NOT is_void), 0) AS platform_entitled,
        COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE to_account = 'platform' AND status = 'confirmed'), 0)
          - COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE from_account = 'platform' AND status = 'confirmed'), 0) AS platform_held,
        COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE to_account = 'escrow' AND status = 'confirmed'), 0)
          - COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE from_account = 'escrow' AND status = 'confirmed'), 0) AS escrow_held`),
    query(`${holders('courier', "SELECT courier_user_id AS u, SUM(courier_amount) AS e FROM order_settlements WHERE NOT is_void AND courier_user_id IS NOT NULL GROUP BY 1")}`),
    query(`${holders('seller', 'SELECT seller_id AS u, SUM(seller_amount) AS e FROM order_settlements WHERE NOT is_void AND seller_id IS NOT NULL GROUP BY 1')}`),
    providerStatus(),
    query("SELECT COUNT(*)::int AS n FROM pay_transfers WHERE status = 'disputed'"),
    query("SELECT COUNT(*)::int AS n FROM pay_transfers WHERE status = 'pending'"),
  ]);
  const t = Object.fromEntries(Object.entries(totals.rows[0]).map(([k, v]) => [k, Number(v)]));
  const courierRows = couriers.rows.map((r) => ({ id: r.id, name: r.name, phone: r.phone, cash: Number(r.held) - Number(r.entitled), earned: Number(r.entitled) }))
    .filter((r) => r.cash !== 0).sort((a, b) => b.cash - a.cash);
  const sellerRows = sellers.rows.map((r) => ({ id: r.id, name: r.name, phone: r.phone, due: Number(r.entitled) - Number(r.held), entitled: Number(r.entitled) }))
    .filter((r) => r.due !== 0).sort((a, b) => b.due - a.due);
  res.json({
    totals: {
      ...t,
      platform_due: t.platform_entitled - t.platform_held,
      couriers_cash: courierRows.reduce((n, r) => n + Math.max(0, r.cash), 0),
      sellers_due: sellerRows.reduce((n, r) => n + Math.max(0, r.due), 0),
      disputed: disputed.rows[0].n, pending: pending.rows[0].n,
    },
    couriers: courierRows.slice(0, 100),
    sellers: sellerRows.slice(0, 100),
    providers,
  });
});

/** GET /api/admin/pay/transfers?status=&kind=&user= */
admin.get('/transfers', async (req, res) => {
  const params = [];
  const where = [];
  const add = (sql, v) => { params.push(v); where.push(sql.replaceAll('?', `$${params.length}`)); };
  if (['pending', 'confirmed', 'disputed', 'cancelled'].includes(req.query.status)) add('t.status = ?', req.query.status);
  if (typeof req.query.kind === 'string' && /^[a-z_]{2,20}$/.test(req.query.kind)) add('t.kind = ?', req.query.kind);
  if (parseInt(req.query.user, 10)) add('(t.from_user = ? OR t.to_user = ?)', parseInt(req.query.user, 10));
  const { rows } = await query(
    `SELECT ${TRANSFER_SELECT} ${TRANSFER_FROM} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY (t.status = 'disputed') DESC, t.id DESC LIMIT 300`, params,
  );
  res.json({ items: rows.map((r) => num(r, ['amount'])) });
});

/** GET /api/admin/pay/export.csv – every movement, for a spreadsheet. */
admin.get('/export.csv', async (_req, res) => {
  const { rows } = await query(`SELECT ${TRANSFER_SELECT} ${TRANSFER_FROM} ORDER BY t.id`);
  const cell = (v) => {
    const s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v);
    // Quote everything; neutralise spreadsheet formulas.
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const cols = ['id', 'created_at', 'order_id', 'product_title', 'kind', 'from_account', 'from_name', 'to_account', 'to_name', 'amount', 'method', 'ref', 'status', 'note', 'confirmed_at'];
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="souk-pay.csv"' });
  res.send(`﻿${csv}`);
});

/**
 * POST /api/admin/pay/transfers { from, fromUser?, to, toUser?, amount, kind, method, ref?, note? }
 * Record money the admin handled: a courier's cash handed to the platform, a payout to a seller, a correction.
 */
admin.post('/transfers', async (req, res) => {
  const d = parse(z.object({
    from: z.enum(ACCOUNTS), fromUser: z.coerce.number().int().positive().optional().nullable(),
    to: z.enum(ACCOUNTS), toUser: z.coerce.number().int().positive().optional().nullable(),
    amount: z.coerce.number().int().min(1).max(1e11),
    kind: z.enum(['remittance', 'payout', 'adjustment']),
    method: z.enum(METHODS).default('cash'),
    orderId: z.coerce.number().int().positive().optional().nullable(),
    ref: z.string().trim().max(120).optional(), note: z.string().trim().max(300).optional(),
  }), req.body);
  if (d.from === d.to && d.fromUser === d.toUser) throw badRequest('validation_error', { to: 'same_account' });
  for (const [acc, user, field] of [[d.from, d.fromUser, 'fromUser'], [d.to, d.toUser, 'toUser']]) {
    const needsUser = ['buyer', 'courier', 'seller'].includes(acc);
    if (needsUser && !user) throw badRequest('validation_error', { [field]: 'required' });
    if (!needsUser && user) throw badRequest('validation_error', { [field]: 'not_allowed' });
  }
  if (d.kind === 'adjustment' && !d.note) throw badRequest('validation_error', { note: 'required' });
  const t = await tx(async (client) => {
    for (const u of [d.fromUser, d.toUser].filter(Boolean)) {
      if (!(await client.query('SELECT 1 FROM users WHERE id = $1', [u])).rowCount) throw notFound('user_not_found');
    }
    const row = await transfer(client, {
      orderId: d.orderId, from: d.from, fromUser: d.fromUser, to: d.to, toUser: d.toUser, amount: d.amount,
      kind: d.kind, method: d.method, ref: d.ref, note: d.note, by: req.user.id,
    });
    const data = { amount: d.amount, ref: d.ref || '' };
    if (d.fromUser) await notify(d.fromUser, 'pay_recorded_out', data, '/wallet', client);
    if (d.toUser) await notify(d.toUser, 'pay_recorded_in', data, '/wallet', client);
    return row;
  });
  res.status(201).json({ transfer: num(t, ['amount']) });
});

/** PATCH /api/admin/pay/transfers/:id { action: confirm | cancel, note? } – settle a pending or disputed movement. */
admin.patch('/transfers/:id', async (req, res) => {
  const d = parse(z.object({ action: z.enum(['confirm', 'cancel']), note: z.string().trim().max(300).optional() }), req.body);
  const t = await tx(async (client) => {
    const { rows } = await client.query('SELECT t.*, o.product_title FROM pay_transfers t LEFT JOIN orders o ON o.id = t.order_id WHERE t.id = $1 FOR UPDATE OF t', [parseInt(req.params.id, 10) || 0]);
    const row = rows[0];
    if (!row) throw notFound('transfer_not_found');
    if (!['pending', 'disputed'].includes(row.status)) throw conflict('transfer_closed');
    if (d.action === 'confirm') {
      await client.query("UPDATE pay_transfers SET status = 'confirmed', confirmed_by = $2, confirmed_at = now(), note = COALESCE($3, note) WHERE id = $1", [row.id, req.user.id, d.note || null]);
    } else {
      await client.query("UPDATE pay_transfers SET status = 'cancelled', note = COALESCE($2, note) WHERE id = $1", [row.id, d.note || null]);
    }
    const data = { id: row.order_id, title: row.product_title || '', amount: Number(row.amount), decision: d.action };
    for (const u of [row.from_user, row.to_user].filter(Boolean)) await notify(u, 'pay_resolved', data, '/wallet', client);
    return row;
  });
  res.json({ status: d.action === 'confirm' ? 'confirmed' : 'cancelled', id: t.id });
});

router.use('/admin/pay', admin);

export default router;
