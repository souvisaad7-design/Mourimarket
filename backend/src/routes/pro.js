// Souk Pro: free tools for sellers and stores.
// - Inventory: units in stock per listing (quick edit, no new review), low-stock alerts.
// - Discount coupons on delivery orders (percent or amount, minimum, number of uses, expiry, shown on the store).
// - Sales reports from delivered orders (per day, best listings, coupons) with CSV export.
// - Store page look: cover image, colour, tagline, opening hours, pinned listings.
// Invoices are printed from the order page in the browser (no server-side PDF needed).
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { normalizeCode } from '../lib/coupons.js';
import { badRequest, conflict, forbidden, notFound, parse } from '../lib/http.js';
import { limiter } from '../lib/rateLimit.js';
import { notify } from '../lib/notify.js';
import { normalizePhone } from '../lib/phone.js';
import { STAFF_ROLES, staffOf } from '../lib/staff.js';
import { requireModule } from '../lib/settings.js';
import { requireAuth } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';

const router = Router();
router.use(['/pro', '/staff'], requireAuth);
const writeLimiter = limiter('pro-write', { windowMs: 60 * 1000, limit: 60, keyGenerator: (req) => String(req.user.id) });

const sellerOnly = (req) => { if (req.user.account_type === 'buyer') throw forbidden('seller_only'); };

// ---------- Inventory ----------

/** GET /api/pro/inventory – my listings with stock and units promised to open orders. */
router.get('/pro/inventory', async (req, res) => {
  sellerOnly(req);
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.stock, p.availability, p.status,
       (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS cover_url,
       (SELECT COUNT(*)::int FROM orders o WHERE o.product_id = p.id AND o.status NOT IN ('delivered', 'cancelled')) AS open_orders,
       (SELECT COUNT(*)::int FROM orders o WHERE o.product_id = p.id AND o.status = 'delivered') AS delivered
     FROM products p WHERE p.seller_id = $1 AND p.status <> 'rejected'
     ORDER BY (p.stock IS NOT NULL AND p.stock <= 2) DESC, p.updated_at DESC LIMIT 300`,
    [req.user.id],
  );
  res.json({ items: rows.map((r) => ({ ...r, price: Number(r.price) })) });
});

/** PATCH /api/pro/inventory/:id { stock: number | null } – restocking does not send the listing back to review. */
router.patch('/pro/inventory/:id', requireModule('pro'), writeLimiter, async (req, res) => {
  const { stock } = parse(z.object({ stock: z.coerce.number().int().min(0, 'min_0').max(100000).nullable() }), {
    stock: req.body?.stock === '' || req.body?.stock === undefined ? null : req.body.stock,
  });
  const { rows } = await query('SELECT id, seller_id, availability FROM products WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  const p = rows[0];
  if (!p) throw notFound('product_not_found');
  if (p.seller_id !== req.user.id) throw forbidden();
  // Restocking an item that sold out puts it back on sale; stock 0 marks it sold out.
  const { rows: out } = await query(
    `UPDATE products SET stock = $2::int,
       availability = CASE WHEN $2::int IS NOT NULL AND $2::int > 0 THEN 'available' WHEN $2::int = 0 THEN 'sold' ELSE availability END,
       sold_at = CASE WHEN $2::int = 0 THEN COALESCE(sold_at, now()) WHEN $2::int > 0 THEN NULL ELSE sold_at END,
       updated_at = now() WHERE id = $1 RETURNING id, stock, availability`,
    [p.id, stock],
  );
  res.json({ product: out[0] });
});

// ---------- Coupons ----------

const couponSchema = z.object({
  code: z.string().trim().min(3, 'min_3').max(30).transform(normalizeCode).refine((v) => /^[A-Z0-9\-_؀-ۿ]{3,30}$/.test(v), 'invalid'),
  kind: z.enum(['percent', 'amount']),
  value: z.coerce.number().int().min(1, 'min_1').max(1e10),
  minTotal: z.coerce.number().int().min(0).max(1e11).default(0),
  maxUses: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.coerce.number().int().min(1).max(100000).nullable()).default(null),
  expiresAt: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'invalid').nullable()).default(null),
  isPublic: z.boolean().default(false),
}).refine((d) => d.kind !== 'percent' || d.value <= 90, { message: 'max_90', path: ['value'] });

const COUPON_FIELDS = 'id, code, kind, value, min_total, max_uses, uses, expires_at, is_public, is_active, created_at';
const couponOut = (c) => ({ ...c, value: Number(c.value), min_total: Number(c.min_total) });

router.get('/pro/coupons', async (req, res) => {
  sellerOnly(req);
  const { rows } = await query(`SELECT ${COUPON_FIELDS} FROM coupons WHERE seller_id = $1 ORDER BY is_active DESC, created_at DESC`, [req.user.id]);
  res.json({ items: rows.map(couponOut) });
});

router.post('/pro/coupons', requireModule('pro'), writeLimiter, async (req, res) => {
  sellerOnly(req);
  const d = parse(couponSchema, req.body);
  const { rows: n } = await query('SELECT COUNT(*)::int AS n FROM coupons WHERE seller_id = $1 AND is_active', [req.user.id]);
  if (n[0].n >= 30) throw badRequest('too_many_coupons');
  try {
    const { rows } = await query(
      `INSERT INTO coupons (seller_id, code, kind, value, min_total, max_uses, expires_at, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COUPON_FIELDS}`,
      [req.user.id, d.code, d.kind, d.value, d.minTotal, d.maxUses, d.expiresAt, d.isPublic],
    );
    res.status(201).json({ coupon: couponOut(rows[0]) });
  } catch (err) {
    if (err.code === '23505') throw conflict('coupon_exists');
    throw err;
  }
});

/** PATCH /api/pro/coupons/:id { isActive?, isPublic? } */
router.patch('/pro/coupons/:id', writeLimiter, async (req, res) => {
  const d = parse(z.object({ isActive: z.boolean().optional(), isPublic: z.boolean().optional() }), req.body);
  const { rows } = await query(
    `UPDATE coupons SET is_active = COALESCE($3, is_active), is_public = COALESCE($4, is_public)
     WHERE id = $1 AND seller_id = $2 RETURNING ${COUPON_FIELDS}`,
    [parseInt(req.params.id, 10) || 0, req.user.id, d.isActive ?? null, d.isPublic ?? null],
  );
  if (!rows[0]) throw notFound('coupon_not_found');
  res.json({ coupon: couponOut(rows[0]) });
});

router.delete('/pro/coupons/:id', writeLimiter, async (req, res) => {
  // Orders keep the code they used (coupon_code); only the link is cleared.
  const { rowCount } = await query('DELETE FROM coupons WHERE id = $1 AND seller_id = $2', [parseInt(req.params.id, 10) || 0, req.user.id]);
  if (!rowCount) throw notFound('coupon_not_found');
  res.json({ ok: true });
});

// ---------- Sales reports ----------

const periodDays = (q) => ({ 7: 7, 30: 30, 90: 90, 365: 365 }[parseInt(q, 10)] || 30);

/** GET /api/pro/reports?days=7|30|90|365 */
router.get('/pro/reports', async (req, res) => {
  sellerOnly(req);
  const days = periodDays(req.query.days);
  const p = [req.user.id, String(days)];
  const since = "now() - ($2 || ' days')::interval";
  const [sum, series, top, coupons, manual] = await Promise.all([
    query(`SELECT
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
        COUNT(*) FILTER (WHERE status NOT IN ('delivered', 'cancelled'))::int AS open,
        COALESCE(SUM(item_price - discount) FILTER (WHERE status = 'delivered'), 0) AS revenue,
        COALESCE(SUM(discount) FILTER (WHERE status = 'delivered'), 0) AS discounts,
        COUNT(DISTINCT buyer_id) FILTER (WHERE status = 'delivered')::int AS buyers
      FROM orders WHERE seller_id = $1 AND created_at >= ${since}`, p),
    query(`SELECT to_char(date_trunc('day', delivered_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS orders, SUM(item_price - discount) AS revenue
      FROM orders WHERE seller_id = $1 AND status = 'delivered' AND delivered_at >= ${since} GROUP BY 1 ORDER BY 1`, p),
    query(`SELECT product_id, product_title AS title, COUNT(*)::int AS orders, SUM(item_price - discount) AS revenue
      FROM orders WHERE seller_id = $1 AND status = 'delivered' AND delivered_at >= ${since} GROUP BY 1, 2 ORDER BY revenue DESC LIMIT 10`, p),
    query(`SELECT coupon_code AS code, COUNT(*)::int AS orders, SUM(discount) AS discount
      FROM orders WHERE seller_id = $1 AND status = 'delivered' AND coupon_code IS NOT NULL AND delivered_at >= ${since} GROUP BY 1 ORDER BY orders DESC LIMIT 10`, p),
    // Sales the seller recorded by hand (marked "sold" without a delivery order).
    query(`SELECT COUNT(*)::int AS n, COALESCE(SUM(price), 0) AS value FROM products p
      WHERE seller_id = $1 AND availability = 'sold' AND sold_at >= ${since}
        AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.product_id = p.id AND o.status = 'delivered')`, p),
  ]);
  const s = sum.rows[0];
  const revenue = Number(s.revenue);
  res.json({
    days,
    summary: {
      delivered: s.delivered, cancelled: s.cancelled, open: s.open, buyers: s.buyers, revenue, discounts: Number(s.discounts),
      average: s.delivered ? Math.round(revenue / s.delivered) : 0,
      cancelRate: s.delivered + s.cancelled ? Math.round((100 * s.cancelled) / (s.delivered + s.cancelled)) : 0,
      manualSales: manual.rows[0].n, manualValue: Number(manual.rows[0].value),
    },
    series: series.rows.map((r) => ({ ...r, revenue: Number(r.revenue) })),
    top: top.rows.map((r) => ({ ...r, revenue: Number(r.revenue) })),
    coupons: coupons.rows.map((r) => ({ ...r, discount: Number(r.discount) })),
  });
});

/** GET /api/pro/reports.csv?days= – my delivered and cancelled orders, for a spreadsheet. */
router.get('/pro/reports.csv', async (req, res) => {
  sellerOnly(req);
  const days = periodDays(req.query.days);
  const { rows } = await query(
    `SELECT id, created_at, delivered_at, status, product_title, item_price, discount, coupon_code, delivery_fee, total, payment_method, city
     FROM orders WHERE seller_id = $1 AND created_at >= now() - ($2 || ' days')::interval ORDER BY id`,
    [req.user.id, String(days)],
  );
  const cell = (v) => {
    const x = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v);
    return `"${(/^[=+\-@]/.test(x) ? `'${x}` : x).replace(/"/g, '""')}"`;
  };
  const cols = ['id', 'created_at', 'delivered_at', 'status', 'product_title', 'item_price', 'discount', 'coupon_code', 'delivery_fee', 'total', 'payment_method', 'city'];
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="sales-${days}d.csv"` });
  res.send(`﻿${[cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n')}`);
});

// ---------- Store page look ----------

async function myStore(userId) {
  const { rows } = await query('SELECT id, banner_url FROM stores WHERE owner_id = $1', [userId]);
  if (!rows[0]) throw notFound('store_not_found');
  return rows[0];
}

/** PUT /api/pro/store-look { tagline, hours, themeColor, pinnedIds } */
router.put('/pro/store-look', requireModule('pro'), writeLimiter, async (req, res) => {
  const d = parse(z.object({
    tagline: z.string().trim().max(140).optional().transform((v) => v || null),
    hours: z.string().trim().max(200).optional().transform((v) => v || null),
    themeColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'invalid').optional().or(z.literal('')).transform((v) => v || null),
    pinnedIds: z.array(z.coerce.number().int().positive()).max(4).default([]),
  }), req.body);
  const store = await myStore(req.user.id);
  // Only my own live listings can be pinned.
  const { rows: ok } = await query(
    "SELECT id FROM products WHERE id = ANY($1::int[]) AND seller_id = $2 AND status = 'approved'", [d.pinnedIds, req.user.id],
  );
  const allowed = new Set(ok.map((r) => r.id));
  const pinned = [...new Set(d.pinnedIds)].filter((id) => allowed.has(id));
  const { rows } = await query(
    `UPDATE stores SET tagline = $2, hours = $3, theme_color = $4, pinned_ids = $5::int[], updated_at = now() WHERE id = $1
     RETURNING tagline, hours, theme_color, pinned_ids, banner_url`,
    [store.id, d.tagline, d.hours, d.themeColor, pinned],
  );
  res.json({ look: rows[0] });
});

/** POST /api/pro/store-banner (multipart "banner") – the cover image at the top of the store page. */
router.post('/pro/store-banner', requireModule('pro'), writeLimiter, upload.single('banner'), async (req, res) => {
  const store = await myStore(req.user.id);
  if (!req.file) throw badRequest('validation_error', { banner: 'required' });
  const url = await saveFile(req.file);
  await query('UPDATE stores SET banner_url = $2, updated_at = now() WHERE id = $1', [store.id, url]);
  if (store.banner_url) removeUploads([store.banner_url]);
  res.json({ banner_url: url });
});

router.delete('/pro/store-banner', writeLimiter, async (req, res) => {
  const store = await myStore(req.user.id);
  await query('UPDATE stores SET banner_url = NULL, updated_at = now() WHERE id = $1', [store.id]);
  if (store.banner_url) removeUploads([store.banner_url]);
  res.json({ ok: true });
});

// ---------- Store staff ----------

const STAFF_SELECT = `ss.user_id, ss.role, ss.created_at, u.name, u.phone, u.avatar_url`;

/** GET /api/pro/staff – my store's employees. */
router.get('/pro/staff', async (req, res) => {
  const store = await myStore(req.user.id);
  const { rows } = await query(`SELECT ${STAFF_SELECT} FROM store_staff ss JOIN users u ON u.id = ss.user_id WHERE ss.store_id = $1 ORDER BY ss.created_at`, [store.id]);
  res.json({ items: rows });
});

/** POST /api/pro/staff { login (phone or email of an existing account), role } */
router.post('/pro/staff', requireModule('pro'), writeLimiter, async (req, res) => {
  const d = parse(z.object({ login: z.string().trim().min(3).max(160), role: z.enum(STAFF_ROLES) }), req.body);
  const store = await myStore(req.user.id);
  const phone = d.login.includes('@') ? null : normalizePhone(d.login);
  const { rows } = await query(
    'SELECT id, name, is_active, role FROM users WHERE ($1::text IS NOT NULL AND phone = $1) OR ($2::text IS NOT NULL AND lower(email) = lower($2))',
    [phone, d.login.includes('@') ? d.login : null],
  );
  const u = rows[0];
  if (!u || !u.is_active) throw notFound('user_not_found');
  if (u.id === req.user.id) throw badRequest('staff_self');
  if (u.role === 'admin') throw badRequest('staff_admin');
  const { rows: count } = await query('SELECT COUNT(*)::int AS n FROM store_staff WHERE store_id = $1', [store.id]);
  if (count[0].n >= 20) throw badRequest('too_many_staff');
  try {
    await query('INSERT INTO store_staff (store_id, user_id, role, added_by) VALUES ($1, $2, $3, $4)', [store.id, u.id, d.role, req.user.id]);
  } catch (err) {
    if (err.code === '23505') throw conflict('staff_elsewhere');
    throw err;
  }
  const { rows: st } = await query('SELECT name FROM stores WHERE id = $1', [store.id]);
  await notify(u.id, 'staff_added', { store: st[0].name, role: d.role }, '/staff');
  res.status(201).json({ member: { user_id: u.id, name: u.name, role: d.role } });
});

/** PATCH /api/pro/staff/:userId { role } */
router.patch('/pro/staff/:userId', writeLimiter, async (req, res) => {
  const { role } = parse(z.object({ role: z.enum(STAFF_ROLES) }), req.body);
  const store = await myStore(req.user.id);
  const { rowCount } = await query('UPDATE store_staff SET role = $3 WHERE store_id = $1 AND user_id = $2', [store.id, parseInt(req.params.userId, 10) || 0, role]);
  if (!rowCount) throw notFound('staff_not_found');
  res.json({ role });
});

/** DELETE /api/pro/staff/:userId – remove an employee (takes effect at once). */
router.delete('/pro/staff/:userId', writeLimiter, async (req, res) => {
  const store = await myStore(req.user.id);
  const { rowCount } = await query('DELETE FROM store_staff WHERE store_id = $1 AND user_id = $2', [store.id, parseInt(req.params.userId, 10) || 0]);
  if (!rowCount) throw notFound('staff_not_found');
  res.json({ ok: true });
});

/** GET /api/staff/me – the store I work for and my role (null if none). */
router.get('/staff/me', async (req, res) => {
  res.json({ staff: await staffOf(req.user.id) });
});

/** DELETE /api/staff/me – leave the store. */
router.delete('/staff/me', async (req, res) => {
  await query('DELETE FROM store_staff WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

export default router;
