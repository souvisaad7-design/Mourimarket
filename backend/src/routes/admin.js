import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { removeUploads, sendFile } from '../middleware/upload.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// ---------- Statistics ----------

router.get('/stats', async (_req, res) => {
  const [totals, byCategory, byCity, daily, recent] = await Promise.all([
    query(`SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM users WHERE account_type = 'merchant') AS merchants,
      (SELECT COUNT(*) FROM users WHERE created_at > now() - interval '7 days') AS new_users_7d,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM products WHERE status = 'pending') AS pending_products,
      (SELECT COUNT(*) FROM products WHERE status = 'approved' AND availability = 'available') AS live_products,
      (SELECT COUNT(*) FROM products WHERE availability = 'sold') AS sold_products,
      (SELECT COUNT(*) FROM stores) AS stores,
      (SELECT COUNT(*) FROM messages) AS messages,
      (SELECT COUNT(*) FROM reports WHERE status = 'open') AS open_reports,
      (SELECT COUNT(*) FROM products WHERE featured_until > now()) AS featured_products,
      (SELECT COUNT(*) FROM users WHERE is_verified) AS verified_users,
      (SELECT COUNT(*) FROM upgrade_requests WHERE status = 'pending') AS pending_upgrades,
      (SELECT COALESCE(SUM(views), 0) FROM products) AS views`),
    query(`SELECT c.slug, c.name_ar, c.name_fr, c.name_en, COUNT(p.id) AS n
           FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'approved'
           GROUP BY c.id ORDER BY n DESC`),
    query(`SELECT city, COUNT(*) AS n FROM products WHERE status = 'approved' GROUP BY city ORDER BY n DESC LIMIT 10`),
    query(`SELECT to_char(d, 'YYYY-MM-DD') AS day,
             (SELECT COUNT(*) FROM products WHERE created_at::date = d) AS products,
             (SELECT COUNT(*) FROM users WHERE created_at::date = d) AS users
           FROM generate_series(current_date - 13, current_date, interval '1 day') AS d ORDER BY d`),
    // Latest activity: the 5 most recent new listings or new accounts, newest first.
    query(`(SELECT 'listing' AS kind, p.id, p.title AS label, p.status, p.price, u.id AS actor_id, u.name AS actor,
              NULL AS account_type, p.created_at,
              (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS image
            FROM products p JOIN users u ON u.id = p.seller_id
            ORDER BY p.created_at DESC LIMIT 5)
           UNION ALL
           (SELECT 'user' AS kind, u.id, u.name AS label, NULL AS status, NULL AS price, u.id AS actor_id, u.name AS actor,
              u.account_type, u.created_at, u.avatar_url AS image
            FROM users u
            ORDER BY u.created_at DESC LIMIT 5)
           ORDER BY created_at DESC, kind LIMIT 5`),
  ]);
  res.json({ totals: totals.rows[0], byCategory: byCategory.rows, byCity: byCity.rows, daily: daily.rows, recent: recent.rows });
});

// ---------- Users ----------

router.get('/users', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const params = [q];
  const where = `WHERE ($1 = '' OR u.name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')`;
  const [items, total] = await Promise.all([
    query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.account_type, u.city, u.is_active, u.is_verified, u.created_at,
         (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id) AS products_count
       FROM users u ${where} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    query(`SELECT COUNT(*) AS n FROM users u ${where}`, params),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit });
});

router.patch('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const data = parse(
    z.object({
      isActive: z.boolean().optional(),
      role: z.enum(['user', 'admin']).optional(),
      accountType: z.enum(['buyer', 'individual', 'merchant']).optional(),
      isVerified: z.boolean().optional(),
    }),
    req.body,
  );
  const before = (await query('SELECT is_verified FROM users WHERE id = $1', [id])).rows[0];
  if (id === req.user.id && (data.isActive === false || data.role === 'user')) throw badRequest('cannot_demote_self');
  const { rows } = await query(
    `UPDATE users SET is_active = COALESCE($1, is_active), role = COALESCE($2, role),
       account_type = COALESCE($3, account_type), is_verified = COALESCE($5, is_verified), updated_at = now()
     WHERE id = $4 RETURNING id, name, email, role, account_type, is_active, is_verified`,
    [data.isActive ?? null, data.role ?? null, data.accountType ?? null, id, data.isVerified ?? null],
  );
  if (!rows[0]) throw notFound('user_not_found');
  if (data.isVerified === true && before && !before.is_verified) {
    await notify(id, 'account_verified', {}, `/users/${id}`);
  }
  res.json({ user: rows[0] });
});

/**
 * POST /admin/users/:id/reset-password – set a temporary password and return it once,
 * so the admin can pass it to a user who logs in by phone (no SMS in this version).
 */
router.post('/users/:id/reset-password', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(10);
  const temp = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  const { rowCount } = await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
    await bcrypt.hash(temp, 12), id,
  ]);
  if (!rowCount) throw notFound('user_not_found');
  res.json({ password: temp });
});

// ---------- Listings moderation ----------

router.get('/products', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const featuredOnly = req.query.status === 'featured';
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const params = [status, q];
  const where = `WHERE ($1 = '' OR p.status = $1) AND ($2 = '' OR p.title ILIKE '%' || $2 || '%')
    ${featuredOnly ? 'AND p.featured_until > now()' : ''}`;
  const [items, total] = await Promise.all([
    query(
      `SELECT ${PRODUCT_SELECT}, p.description, p.rejection_reason, u.email AS seller_email,
         (SELECT COUNT(*) FROM reports r WHERE r.product_id = p.id AND r.status = 'open') AS open_reports
       ${PRODUCT_FROM} ${where} ORDER BY (p.status = 'pending') DESC, p.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    query(`SELECT COUNT(*) AS n ${PRODUCT_FROM} ${where}`, params),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit });
});

router.patch('/products/:id/status', async (req, res) => {
  const data = parse(
    z.object({ status: z.enum(['approved', 'rejected', 'pending']), reason: z.string().trim().max(500).optional() }),
    req.body,
  );
  if (data.status === 'rejected' && !data.reason) throw badRequest('validation_error', { reason: 'required' });
  const { rows } = await query(
    `UPDATE products SET status = $1, rejection_reason = $2, updated_at = now() WHERE id = $3
     RETURNING id, seller_id, title`,
    [data.status, data.status === 'rejected' ? data.reason : null, parseInt(req.params.id, 10) || 0],
  );
  const p = rows[0];
  if (!p) throw notFound('product_not_found');
  if (data.status !== 'pending') {
    await notify(p.seller_id, `product_${data.status}`, { title: p.title, reason: data.reason || null }, `/products/${p.id}`);
  }
  res.json({ ok: true });
});

/** PATCH /admin/products/:id/feature {days} – feature for N days (0 removes). */
router.patch('/products/:id/feature', async (req, res) => {
  const { days } = parse(z.object({ days: z.coerce.number().int().min(0).max(365) }), req.body);
  const { rows } = await query(
    `UPDATE products SET featured_until = CASE WHEN $1::int > 0 THEN now() + make_interval(days => $1::int) ELSE NULL END,
       updated_at = now()
     WHERE id = $2 AND status = 'approved' RETURNING id, seller_id, title, featured_until`,
    [days, parseInt(req.params.id, 10) || 0],
  );
  const p = rows[0];
  if (!p) throw notFound('product_not_found');
  if (days > 0) await notify(p.seller_id, 'product_featured', { title: p.title, days }, `/products/${p.id}`);
  res.json({ ok: true, featuredUntil: p.featured_until });
});

router.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query('SELECT seller_id, title FROM products WHERE id = $1', [id]);
  if (!rows[0]) throw notFound('product_not_found');
  const imgs = await query('SELECT url FROM product_images WHERE product_id = $1', [id]);
  await query('DELETE FROM products WHERE id = $1', [id]);
  removeUploads(imgs.rows.map((r) => r.url));
  await notify(rows[0].seller_id, 'product_deleted', { title: rows[0].title, reason: req.body?.reason || null });
  res.json({ ok: true });
});

// ---------- Categories ----------

const categorySchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/, 'invalid_slug'),
  nameAr: z.string().trim().min(2).max(80),
  nameFr: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
  icon: z.string().trim().max(16).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

router.post('/categories', async (req, res) => {
  const d = parse(categorySchema, req.body);
  try {
    const { rows } = await query(
      `INSERT INTO categories (slug, name_ar, name_fr, name_en, icon, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [d.slug, d.nameAr, d.nameFr, d.nameEn, d.icon || null, d.sortOrder],
    );
    res.status(201).json({ category: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('slug_taken');
    throw err;
  }
});

router.put('/categories/:id', async (req, res) => {
  const d = parse(categorySchema, req.body);
  try {
    const { rows } = await query(
      `UPDATE categories SET slug=$1, name_ar=$2, name_fr=$3, name_en=$4, icon=$5, sort_order=$6 WHERE id=$7 RETURNING *`,
      [d.slug, d.nameAr, d.nameFr, d.nameEn, d.icon || null, d.sortOrder, parseInt(req.params.id, 10) || 0],
    );
    if (!rows[0]) throw notFound('category_not_found');
    res.json({ category: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('slug_taken');
    throw err;
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  } catch (err) {
    if (err.code === '23503') throw conflict('category_in_use');
    throw err;
  }
  res.json({ ok: true });
});

// ---------- Reports ----------

router.get('/reports', async (req, res) => {
  const status = ['open', 'resolved', 'dismissed'].includes(req.query.status) ? req.query.status : 'open';
  const { rows } = await query(
    `SELECT r.*, u.name AS reporter_name, p.title AS product_title, p.status AS product_status,
       p.seller_id, s.name AS seller_name, h.name AS handled_by_name
     FROM reports r
     JOIN users u ON u.id = r.reporter_id
     JOIN products p ON p.id = r.product_id
     JOIN users s ON s.id = p.seller_id
     LEFT JOIN users h ON h.id = r.handled_by
     WHERE r.status = $1 ORDER BY r.created_at DESC LIMIT 200`,
    [status],
  );
  res.json({ items: rows });
});

router.patch('/reports/:id', async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(['resolved', 'dismissed', 'open']) }), req.body);
  const { rowCount } = await query(
    `UPDATE reports SET status = $1::text, handled_by = $2, resolved_at = CASE WHEN $1::text = 'open' THEN NULL ELSE now() END
     WHERE id = $3`,
    [status, req.user.id, parseInt(req.params.id, 10) || 0],
  );
  if (!rowCount) throw notFound('report_not_found');
  res.json({ ok: true });
});

// ---------- Stores ----------

router.get('/stores', async (_req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.name, s.slug, s.city, s.is_active, s.created_at, u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
       u.is_verified AS owner_verified,
       (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id) AS products_count
     FROM stores s JOIN users u ON u.id = s.owner_id ORDER BY s.created_at DESC`,
  );
  res.json({ items: rows });
});

router.patch('/stores/:id', async (req, res) => {
  const { isActive } = parse(z.object({ isActive: z.boolean() }), req.body);
  const { rows } = await query('UPDATE stores SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING owner_id, name', [
    isActive, parseInt(req.params.id, 10) || 0,
  ]);
  if (!rows[0]) throw notFound('store_not_found');
  await notify(rows[0].owner_id, isActive ? 'store_enabled' : 'store_disabled', { name: rows[0].name }, '/dashboard/store');
  res.json({ ok: true });
});

export default router;

// ---------- Verification & featuring requests ----------

router.get('/upgrade-requests', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const kind = ['verify', 'feature'].includes(req.query.kind) ? req.query.kind : '';
  const params = [status, kind];
  const where = `WHERE r.status = $1 AND ($2 = '' OR r.kind = $2)`;
  const [items, total, counts] = await Promise.all([
    query(
      `SELECT r.id, r.kind, r.product_id, r.days, r.amount, r.payment_method, r.payment_ref, r.note, r.status,
         r.admin_note, r.created_at, r.reviewed_at, (r.receipt_file_id IS NOT NULL) AS has_receipt,
         u.id AS user_id, u.name AS user_name, u.phone AS user_phone, u.account_type, u.is_verified, u.avatar_url,
         p.title AS product_title, p.status AS product_status, p.availability AS product_availability, p.featured_until,
         (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS product_image,
         rv.name AS reviewed_by_name
       FROM upgrade_requests r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN products p ON p.id = r.product_id
       LEFT JOIN users rv ON rv.id = r.reviewed_by
       ${where} ORDER BY r.created_at ${status === 'pending' ? 'ASC' : 'DESC'} LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    query(`SELECT COUNT(*) AS n FROM upgrade_requests r ${where}`, params),
    query(`SELECT status, COUNT(*) AS n FROM upgrade_requests GROUP BY status`),
  ]);
  res.json({
    items: items.rows, total: total.rows[0].n, page, limit,
    counts: Object.fromEntries(counts.rows.map((c) => [c.status, Number(c.n)])),
  });
});

/** GET /admin/upgrade-requests/:id/receipt – the private receipt image (admins only). */
router.get('/upgrade-requests/:id/receipt', async (req, res) => {
  const { rows } = await query('SELECT receipt_file_id FROM upgrade_requests WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  if (!rows[0]?.receipt_file_id) throw notFound();
  return sendFile(res, rows[0].receipt_file_id, { isPrivate: true });
});

/**
 * PATCH /admin/upgrade-requests/:id {status: 'approved'|'rejected', note}
 * Approving a verification marks the account verified; approving a featuring
 * request features the listing for the paid number of days (added to any time left).
 */
router.patch('/upgrade-requests/:id', async (req, res) => {
  const data = parse(
    z.object({ status: z.enum(['approved', 'rejected']), note: z.string().trim().max(500).optional() }),
    req.body,
  );
  if (data.status === 'rejected' && !data.note) throw badRequest('validation_error', { note: 'required' });
  const id = parseInt(req.params.id, 10) || 0;

  const result = await tx(async (client) => {
    const r = (await client.query('SELECT * FROM upgrade_requests WHERE id = $1 FOR UPDATE', [id])).rows[0];
    if (!r) throw notFound('request_not_found');
    if (r.status !== 'pending') throw conflict('request_already_reviewed');
    let product = null;
    if (data.status === 'approved') {
      if (r.kind === 'verify') {
        await client.query('UPDATE users SET is_verified = true, updated_at = now() WHERE id = $1', [r.user_id]);
      } else {
        const { rows } = await client.query(
          `UPDATE products SET featured_until = GREATEST(COALESCE(featured_until, now()), now()) + make_interval(days => $1::int),
             updated_at = now()
           WHERE id = $2 AND status = 'approved' RETURNING id, title, featured_until`,
          [r.days, r.product_id],
        );
        if (!rows[0]) throw badRequest('product_not_featurable');
        product = rows[0];
      }
    }
    await client.query(
      `UPDATE upgrade_requests SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $4`,
      [data.status, data.note || null, req.user.id, id],
    );
    if (r.kind === 'feature' && !product) {
      product = (await client.query('SELECT id, title FROM products WHERE id = $1', [r.product_id])).rows[0] || null;
    }
    if (data.status === 'approved') {
      if (r.kind === 'verify') await notify(r.user_id, 'account_verified', {}, `/users/${r.user_id}`, client);
      else await notify(r.user_id, 'product_featured', { title: product.title, days: r.days }, `/products/${product.id}`, client);
    } else {
      await notify(r.user_id, `upgrade_rejected_${r.kind}`, { title: product?.title || null, reason: data.note }, '/dashboard', client);
    }
    return { ok: true, featuredUntil: product?.featured_until || null };
  });
  res.json(result);
});
