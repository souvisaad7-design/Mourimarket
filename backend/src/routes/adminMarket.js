// Admin → Marketplace tools: every auction (cancel / extend), every store coupon, every store employee,
// and every "wanted" ad (hide / show). Cancelling an auction uses POST /api/auctions/:id/cancel (admins allowed).
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { conflict, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

/** GET /api/admin/market/auctions?status=active|ended|cancelled */
router.get('/auctions', async (req, res) => {
  const status = ['active', 'ended', 'cancelled'].includes(req.query.status) ? req.query.status : 'active';
  const { rows } = await query(
    `SELECT a.id, a.product_id, a.status, a.start_price, a.min_increment, a.reserve_price, a.current_bid, a.bid_count, a.ends_at, a.ended_at,
       a.created_at, a.reserve_met, a.cancel_reason, p.title, s.name AS seller_name, w.name AS winner_name, l.name AS leader_name
     FROM auctions a JOIN products p ON p.id = a.product_id JOIN users s ON s.id = a.seller_id
     LEFT JOIN users w ON w.id = a.winner_id LEFT JOIN users l ON l.id = a.current_bidder_id
     WHERE a.status = $1 ORDER BY ${status === 'active' ? 'a.ends_at ASC' : 'COALESCE(a.ended_at, a.created_at) DESC'} LIMIT 200`,
    [status],
  );
  const num = ['start_price', 'min_increment', 'reserve_price', 'current_bid'];
  res.json({ items: rows.map((r) => { for (const k of num) if (r[k] !== null) r[k] = Number(r[k]); return r; }) });
});

/** POST /api/admin/market/auctions/:id/extend { hours } – give a running auction more time. */
router.post('/auctions/:id/extend', async (req, res) => {
  const { hours } = parse(z.object({ hours: z.coerce.number().int().min(1).max(24 * 14) }), req.body);
  const { rows } = await query(
    `UPDATE auctions SET ends_at = GREATEST(ends_at, now()) + ($2 || ' hours')::interval WHERE id = $1 AND status = 'active' RETURNING ends_at`,
    [parseInt(req.params.id, 10) || 0, String(hours)],
  );
  if (!rows[0]) throw conflict('auction_closed');
  res.json({ ends_at: rows[0].ends_at });
});

/** GET /api/admin/market/coupons?q= */
router.get('/coupons', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const { rows } = await query(
    `SELECT c.id, c.code, c.kind, c.value, c.min_total, c.max_uses, c.uses, c.expires_at, c.is_public, c.is_active, c.created_at,
       u.id AS seller_id, u.name AS seller_name, s.name AS store_name
     FROM coupons c JOIN users u ON u.id = c.seller_id LEFT JOIN stores s ON s.owner_id = c.seller_id
     WHERE ($1 = '' OR c.code ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%' OR s.name ILIKE '%' || $1 || '%')
     ORDER BY c.is_active DESC, c.created_at DESC LIMIT 300`,
    [q],
  );
  res.json({ items: rows.map((r) => ({ ...r, value: Number(r.value), min_total: Number(r.min_total) })) });
});

/** PATCH /api/admin/market/coupons/:id { isActive } */
router.patch('/coupons/:id', async (req, res) => {
  const { isActive } = parse(z.object({ isActive: z.boolean() }), req.body);
  const { rows } = await query('UPDATE coupons SET is_active = $2 WHERE id = $1 RETURNING id, is_active', [parseInt(req.params.id, 10) || 0, isActive]);
  if (!rows[0]) throw notFound('coupon_not_found');
  res.json({ coupon: rows[0] });
});

router.delete('/coupons/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM coupons WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  if (!rowCount) throw notFound('coupon_not_found');
  res.json({ ok: true });
});

/** GET /api/admin/market/staff – every store employee. */
router.get('/staff', async (_req, res) => {
  const { rows } = await query(
    `SELECT ss.user_id, ss.role, ss.created_at, u.name, u.phone, s.id AS store_id, s.name AS store_name, s.slug, o.name AS owner_name
     FROM store_staff ss JOIN users u ON u.id = ss.user_id JOIN stores s ON s.id = ss.store_id JOIN users o ON o.id = s.owner_id
     ORDER BY s.name, ss.created_at LIMIT 500`,
  );
  res.json({ items: rows });
});

router.delete('/staff/:userId', async (req, res) => {
  const { rowCount } = await query('DELETE FROM store_staff WHERE user_id = $1', [parseInt(req.params.userId, 10) || 0]);
  if (!rowCount) throw notFound('staff_not_found');
  res.json({ ok: true });
});

/** GET /api/admin/market/wanted?status=active|closed|hidden&q= */
router.get('/wanted', async (req, res) => {
  const status = ['active', 'closed', 'hidden'].includes(req.query.status) ? req.query.status : 'active';
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const { rows } = await query(
    `SELECT w.id, w.title, w.description, w.city, w.budget, w.status, w.replies, w.created_at, w.expires_at, u.id AS user_id, u.name AS user_name
     FROM wanted_ads w JOIN users u ON u.id = w.user_id
     WHERE w.status = $1 AND ($2 = '' OR w.title ILIKE '%' || $2 || '%' OR u.name ILIKE '%' || $2 || '%')
     ORDER BY w.created_at DESC LIMIT 300`,
    [status, q],
  );
  res.json({ items: rows });
});

/** PATCH /api/admin/market/wanted/:id { status: active | hidden, reason? } */
router.patch('/wanted/:id', async (req, res) => {
  const d = parse(z.object({ status: z.enum(['active', 'hidden']), reason: z.string().trim().max(200).optional() }), req.body);
  const { rows } = await query('UPDATE wanted_ads SET status = $2 WHERE id = $1 RETURNING id, user_id, title, status', [parseInt(req.params.id, 10) || 0, d.status]);
  if (!rows[0]) throw notFound('not_found');
  if (d.status === 'hidden') await notify(rows[0].user_id, 'wanted_hidden', { title: rows[0].title, reason: d.reason || '' }, '/wanted');
  res.json({ wanted: rows[0] });
});

export default router;
