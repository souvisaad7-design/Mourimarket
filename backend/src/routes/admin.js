import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { normalizePhone } from '../lib/phone.js';
import { getSettings, saveSettings } from '../lib/settings.js';
import { assertCity, cityKey, getCities, invalidateCities } from '../lib/cities.js';
import { requireAdmin, requireAuth, signToken } from '../middleware/auth.js';
import { removeUploads, saveFile, sendFile, upload } from '../middleware/upload.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';
import { onApproved } from '../lib/alerts.js';

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
      (SELECT COUNT(*) FROM users WHERE merchant_status = 'pending') AS pending_merchants,
      (SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')) AS open_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'delivered') AS delivered_orders,
      (SELECT COUNT(*) FROM couriers WHERE status = 'pending') AS pending_couriers,
      (SELECT COUNT(*) FROM couriers WHERE status = 'approved') AS active_couriers,
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
  const where = `WHERE ($1 = '' OR u.name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%' OR u.phone LIKE '%' || $1 || '%')`;
  const [items, total] = await Promise.all([
    query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.account_type, u.city, u.bio, u.is_active, u.is_verified, u.created_at,
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
       account_type = COALESCE($3, account_type), is_verified = COALESCE($5, is_verified),
       merchant_status = CASE WHEN $3::text = 'merchant' THEN 'approved'
                              WHEN $3::text IS NOT NULL THEN NULL ELSE merchant_status END,
       updated_at = now()
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
  if (data.status === 'approved') await onApproved(p.id);
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
    `SELECT s.id, s.name, s.slug, s.city, s.description, s.phone, s.whatsapp, s.email, s.is_active, s.created_at, u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
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

// ---------- Merchant account requests ----------

/** GET /admin/merchant-requests?status=pending|approved|rejected */
router.get('/merchant-requests', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const [items, total, counts] = await Promise.all([
    query(
      `SELECT u.id, u.name, u.phone, u.email, u.city, u.bio, u.avatar_url, u.account_type, u.is_verified, u.is_active,
         u.merchant_status, u.merchant_note, u.merchant_requested_at, u.merchant_reviewed_at, u.created_at,
         rv.name AS reviewed_by_name,
         (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id) AS listings_count,
         (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.status = 'approved') AS approved_count,
         (SELECT COUNT(*) FROM reports r JOIN products p ON p.id = r.product_id WHERE p.seller_id = u.id) AS reports_count,
         (SELECT row_to_json(s) FROM (SELECT id, name, slug FROM stores WHERE owner_id = u.id) s) AS store
       FROM users u LEFT JOIN users rv ON rv.id = u.merchant_reviewed_by
       WHERE u.merchant_status = $1
       ORDER BY ${status === 'pending' ? 'u.merchant_requested_at ASC' : 'COALESCE(u.merchant_reviewed_at, u.merchant_requested_at) DESC NULLS LAST'}
       LIMIT ${limit} OFFSET ${offset}`,
      [status],
    ),
    query('SELECT COUNT(*) AS n FROM users WHERE merchant_status = $1', [status]),
    query('SELECT merchant_status AS status, COUNT(*) AS n FROM users WHERE merchant_status IS NOT NULL GROUP BY merchant_status'),
  ]);
  res.json({
    items: items.rows, total: total.rows[0].n, page, limit,
    counts: Object.fromEntries(counts.rows.map((c) => [c.status, Number(c.n)])),
  });
});

/** PATCH /admin/merchant-requests/:id {status: 'approved'|'rejected', note} */
router.patch('/merchant-requests/:id', async (req, res) => {
  const data = parse(
    z.object({ status: z.enum(['approved', 'rejected']), note: z.string().trim().max(500).optional() }),
    req.body,
  );
  if (data.status === 'rejected' && !data.note) throw badRequest('validation_error', { note: 'required' });
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query(
    `UPDATE users SET merchant_status = $1,
       account_type = CASE WHEN $1 = 'approved' THEN 'merchant' ELSE account_type END,
       merchant_note = $2, merchant_reviewed_by = $3, merchant_reviewed_at = now(), updated_at = now()
     WHERE id = $4 AND merchant_status = 'pending' RETURNING id, account_type, merchant_status`,
    [data.status, data.status === 'rejected' ? data.note : null, req.user.id, id],
  );
  if (!rows[0]) {
    const exists = (await query('SELECT 1 FROM users WHERE id = $1', [id])).rowCount;
    throw exists ? conflict('request_already_reviewed') : notFound('user_not_found');
  }
  if (data.status === 'approved') await notify(id, 'merchant_approved', {}, '/dashboard/store');
  else await notify(id, 'merchant_rejected', { reason: data.note }, '/profile');
  res.json({ user: rows[0] });
});

// ---------- Site settings (texts, contact, switches) ----------

router.get('/settings', async (_req, res) => {
  const { rows } = await query(
    `SELECT s.key, s.updated_at, u.name AS updated_by_name FROM site_settings s LEFT JOIN users u ON u.id = s.updated_by`,
  );
  res.json({ settings: await getSettings({ fresh: true }), updated: rows });
});

/** PUT /admin/settings { contact?, social?, announcement?, features?, payment?, texts? } – each section replaced whole. */
router.put('/settings', async (req, res) => {
  res.json({ settings: await saveSettings(req.body, req.user.id) });
});

// ---------- The admin's own account (login email + password) ----------

router.put('/account', async (req, res) => {
  const data = parse(
    z.object({
      currentPassword: z.string().min(1),
      name: z.string().trim().min(2, 'min_2').max(100).optional(),
      email: z.string().trim().toLowerCase().email('invalid_email').max(160).optional(),
      newPassword: z.string().min(8, 'min_8').max(128).optional().or(z.literal('')),
    }),
    req.body,
  );
  const me = (await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!(await bcrypt.compare(data.currentPassword, me.password_hash))) throw badRequest('wrong_password');
  if (data.email && (await query('SELECT 1 FROM users WHERE email = $1 AND id <> $2', [data.email, req.user.id])).rowCount) {
    throw conflict('email_taken');
  }
  const hash = data.newPassword ? await bcrypt.hash(data.newPassword, 12) : null;
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
       password_hash = COALESCE($3, password_hash), updated_at = now()
     WHERE id = $4 RETURNING id, name, email, role`,
    [data.name ?? null, data.email ?? null, hash, req.user.id],
  );
  res.json({ user: rows[0], passwordChanged: Boolean(hash), token: hash ? signToken(rows[0]) : undefined });
});

// ---------- Users: edit details, delete ----------

router.put('/users/:id/profile', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const data = parse(
    z.object({
      name: z.string().trim().min(2, 'min_2').max(100),
      phone: z.string().trim().max(30).optional().or(z.literal('')),
      email: z.string().trim().toLowerCase().email('invalid_email').max(160).optional().or(z.literal('')),
      city: cityKey.optional().or(z.literal('')),
      bio: z.string().trim().max(500).optional(),
    }),
    req.body,
  );
  await assertCity(data.city);
  const phone = data.phone ? normalizePhone(data.phone) : null;
  if (data.phone && !phone) throw badRequest('validation_error', { phone: 'invalid_phone' });
  if (!phone && !data.email) throw badRequest('validation_error', { phone: 'required' });
  try {
    const { rows } = await query(
      `UPDATE users SET name = $1, phone = $2, email = $3, city = $4, bio = $5, updated_at = now()
       WHERE id = $6 RETURNING id, name, phone, email, city, bio`,
      [data.name, phone, data.email || null, data.city || null, data.bio || null, id],
    );
    if (!rows[0]) throw notFound('user_not_found');
    res.json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict(String(err.constraint || err.detail).includes('phone') ? 'phone_taken' : 'email_taken');
    throw err;
  }
});

/** DELETE /admin/users/:id – removes the account and everything it owns (listings, store, messages…). */
router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  if (id === req.user.id) throw badRequest('cannot_delete_self');
  const u = (await query('SELECT role, avatar_url FROM users WHERE id = $1', [id])).rows[0];
  if (!u) throw notFound('user_not_found');
  if (u.role === 'admin') throw badRequest('cannot_delete_admin');
  const files = await query(
    `SELECT i.url FROM product_images i JOIN products p ON p.id = i.product_id WHERE p.seller_id = $1
     UNION ALL SELECT logo_url FROM stores WHERE owner_id = $1`,
    [id],
  );
  await query('DELETE FROM users WHERE id = $1', [id]);
  removeUploads([u.avatar_url, ...files.rows.map((r) => r.url)]);
  res.json({ ok: true });
});

// ---------- Stores: edit, delete ----------

router.put('/stores/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const data = parse(
    z.object({
      name: z.string().trim().min(2, 'min_2').max(100),
      description: z.string().trim().max(2000).optional(),
      phone: z.string().trim().max(30).optional(),
      whatsapp: z.string().trim().max(30).optional(),
      email: z.string().trim().max(160).optional(),
      city: cityKey.optional().or(z.literal('')),
    }),
    req.body,
  );
  await assertCity(data.city);
  const { rows } = await query(
    `UPDATE stores SET name = $1, description = $2, phone = $3, whatsapp = $4, email = $5, city = $6, updated_at = now()
     WHERE id = $7 RETURNING id, name, slug`,
    [data.name, data.description || null, data.phone || null, data.whatsapp || null, data.email || null, data.city || null, id],
  );
  if (!rows[0]) throw notFound('store_not_found');
  res.json({ store: rows[0] });
});

router.delete('/stores/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM stores WHERE id = $1 RETURNING owner_id, name, logo_url', [parseInt(req.params.id, 10) || 0]);
  if (!rows[0]) throw notFound('store_not_found');
  removeUploads([rows[0].logo_url]);
  await notify(rows[0].owner_id, 'store_disabled', { name: rows[0].name }, '/dashboard/store');
  res.json({ ok: true });
});

// ---------- Reviews ----------

router.get('/reviews', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const [items, total] = await Promise.all([
    query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.product_id, p.title AS product_title,
         r.reviewer_id, rv.name AS reviewer_name, r.seller_id, s.name AS seller_name
       FROM reviews r JOIN products p ON p.id = r.product_id JOIN users rv ON rv.id = r.reviewer_id JOIN users s ON s.id = r.seller_id
       ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    ),
    query('SELECT COUNT(*) AS n FROM reviews'),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit });
});

router.delete('/reviews/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM reviews WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  if (!rowCount) throw notFound();
  res.json({ ok: true });
});

// ---------- Files (uploaded images) ----------

const FILE_USAGE = `
  (SELECT json_build_object('kind', 'listing', 'id', p.id, 'label', p.title)
     FROM product_images i JOIN products p ON p.id = i.product_id WHERE i.url = '/uploads/f/' || f.id LIMIT 1),
  (SELECT json_build_object('kind', 'avatar', 'id', u.id, 'label', u.name) FROM users u WHERE u.avatar_url = '/uploads/f/' || f.id LIMIT 1),
  (SELECT json_build_object('kind', 'store', 'id', s.id, 'label', s.name, 'slug', s.slug) FROM stores s WHERE s.logo_url = '/uploads/f/' || f.id LIMIT 1)`;

router.get('/files', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 48, maxLimit: 96 });
  const unused = req.query.filter === 'unused';
  const where = `WHERE NOT f.is_private ${unused ? `AND COALESCE(${FILE_USAGE}) IS NULL` : ''}`;
  const [items, total, sum] = await Promise.all([
    query(
      `SELECT f.id, f.mime, octet_length(f.data) AS size, f.created_at, '/uploads/f/' || f.id AS url,
         COALESCE(${FILE_USAGE}) AS used_by
       FROM files f ${where} ORDER BY f.id DESC LIMIT ${limit} OFFSET ${offset}`,
    ),
    query(`SELECT COUNT(*) AS n FROM files f ${where}`),
    query('SELECT COUNT(*) AS n, COALESCE(SUM(octet_length(data)), 0) AS bytes FROM files WHERE NOT is_private'),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit, totals: sum.rows[0] });
});

/** DELETE /admin/files/:id – also detaches it from the listing / avatar / store logo using it. */
router.delete('/files/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const url = `/uploads/f/${id}`;
  await tx(async (client) => {
    await client.query('DELETE FROM product_images WHERE url = $1', [url]);
    await client.query('UPDATE users SET avatar_url = NULL WHERE avatar_url = $1', [url]);
    await client.query('UPDATE stores SET logo_url = NULL WHERE logo_url = $1', [url]);
    const { rowCount } = await client.query('DELETE FROM files WHERE id = $1 AND NOT is_private', [id]);
    if (!rowCount) throw notFound();
  });
  res.json({ ok: true });
});

// ---------- Add a user ----------

router.post('/users', async (req, res) => {
  const data = parse(
    z.object({
      name: z.string().trim().min(2, 'min_2').max(100),
      phone: z.string().trim().max(30).optional().or(z.literal('')),
      email: z.string().trim().toLowerCase().email('invalid_email').max(160).optional().or(z.literal('')),
      password: z.string().min(8, 'min_8').max(128),
      accountType: z.enum(['buyer', 'individual', 'merchant']).default('individual'),
      role: z.enum(['user', 'admin']).default('user'),
      city: cityKey.optional().or(z.literal('')),
      isVerified: z.boolean().optional(),
    }),
    req.body,
  );
  await assertCity(data.city);
  const phone = data.phone ? normalizePhone(data.phone) : null;
  if (data.phone && !phone) throw badRequest('validation_error', { phone: 'invalid_phone' });
  if (!phone && !data.email) throw badRequest('validation_error', { phone: 'required' });
  try {
    const { rows } = await query(
      `INSERT INTO users (name, phone, email, password_hash, account_type, role, city, is_verified, merchant_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, phone, email, account_type, role`,
      [data.name, phone, data.email || null, await bcrypt.hash(data.password, 12), data.accountType, data.role,
        data.city || null, Boolean(data.isVerified), data.accountType === 'merchant' ? 'approved' : null],
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict(String(err.constraint || err.detail).includes('phone') ? 'phone_taken' : 'email_taken');
    throw err;
  }
});

/** GET /admin/users/pick?q= – small list to choose a seller when posting for someone. */
router.get('/users/pick', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const { rows } = await query(
    `SELECT id, name, phone, account_type FROM users
     WHERE is_active AND ($1 = '' OR name ILIKE '%' || $1 || '%' OR phone LIKE '%' || $1 || '%')
     ORDER BY (account_type = 'buyer'), name LIMIT 20`,
    [q],
  );
  res.json({ items: rows });
});

// ---------- Upload an image (banner, pages) ----------

router.post('/uploads', upload.single('file'), async (req, res) => {
  if (!req.file) throw badRequest('validation_error', { file: 'required' });
  res.status(201).json({ url: await saveFile(req.file) });
});

// ---------- Custom pages ----------

const L = (max) => z.object({ ar: z.string().trim().max(max), fr: z.string().trim().max(max).default(''), en: z.string().trim().max(max).default('') });
const pageSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug').max(80),
  title: L(150).refine((v) => v.ar.length >= 2, { message: 'required', path: ['ar'] }),
  body: L(30000),
  coverUrl: z.string().trim().max(300).refine((v) => v === '' || /^\/uploads\/f\/\d+$/.test(v) || /^https:\/\//i.test(v), 'image').optional(),
  isPublished: z.boolean().default(true),
});

router.get('/pages', async (_req, res) => {
  const { rows } = await query('SELECT id, slug, title, body, cover_url, is_published, created_at, updated_at FROM pages ORDER BY id DESC');
  res.json({ items: rows });
});

async function savePage(req, res, id) {
  const data = parse(pageSchema, req.body);
  try {
    const { rows } = id
      ? await query(
        `UPDATE pages SET slug = $1, title = $2, body = $3, cover_url = $4, is_published = $5, updated_at = now() WHERE id = $6 RETURNING *`,
        [data.slug, data.title, data.body, data.coverUrl || null, data.isPublished, id],
      )
      : await query(
        'INSERT INTO pages (slug, title, body, cover_url, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [data.slug, data.title, data.body, data.coverUrl || null, data.isPublished],
      );
    if (!rows[0]) throw notFound('page_not_found');
    res.status(id ? 200 : 201).json({ page: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('slug_taken');
    throw err;
  }
}
router.post('/pages', (req, res) => savePage(req, res, null));
router.put('/pages/:id', (req, res) => savePage(req, res, parseInt(req.params.id, 10) || 0));
router.delete('/pages/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM pages WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  if (!rowCount) throw notFound('page_not_found');
  res.json({ ok: true });
});

// ---------- Banners (home page slider) ----------

const LB = (max) => z.object({ ar: z.string().trim().max(max).default(''), fr: z.string().trim().max(max).default(''), en: z.string().trim().max(max).default('') });
const bannerHref = z.string().trim().max(300).refine((v) => /^\/(?![/\\])/.test(v) || /^https:\/\//i.test(v), 'link');
const bannerImage = z.string().trim().max(300).refine((v) => v === '' || /^\/uploads\/f\/\d+$/.test(v) || /^https:\/\//i.test(v), 'image');
const bannerSchema = z.object({
  title: LB(120), subtitle: LB(200), cta: LB(40), link: bannerHref, imageUrl: bannerImage.default(''), isActive: z.boolean().default(true),
});

router.get('/banners', async (_req, res) => {
  const { rows } = await query('SELECT * FROM banners ORDER BY sort_order, id');
  res.json({ items: rows });
});

/** PUT /admin/banners { items: [...] } – replace the whole slider in one go (order = array order). */
router.put('/banners', async (req, res) => {
  const { items } = parse(z.object({ items: z.array(bannerSchema).max(10) }), req.body);
  const rows = await tx(async (client) => {
    await client.query('DELETE FROM banners');
    const out = [];
    for (const [i, b] of items.entries()) {
      const { rows: r } = await client.query(
        `INSERT INTO banners (title, subtitle, cta, link, image_url, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [b.title, b.subtitle, b.cta, b.link, b.imageUrl || null, b.isActive, (i + 1) * 10],
      );
      out.push(r[0]);
    }
    return out;
  });
  res.json({ items: rows });
});

// ---------- Cities / wilayas ----------

router.get('/cities', async (_req, res) => {
  const [cities, usage] = await Promise.all([
    getCities({ fresh: true }),
    query(`SELECT city, SUM(n)::int AS n FROM (
             SELECT city, COUNT(*) AS n FROM products GROUP BY city
             UNION ALL SELECT city, COUNT(*) FROM users WHERE city IS NOT NULL GROUP BY city
             UNION ALL SELECT city, COUNT(*) FROM stores WHERE city IS NOT NULL GROUP BY city) t GROUP BY city`),
  ]);
  const used = Object.fromEntries(usage.rows.map((u) => [u.city, u.n]));
  res.json({ items: cities.map((c) => ({ ...c, used: used[c.key] || 0 })) });
});

const citySchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug').max(40),
  nameAr: z.string().trim().min(2, 'min_2').max(80),
  nameFr: z.string().trim().max(80).optional(),
  nameEn: z.string().trim().max(80).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  lat: z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().min(-90).max(90).nullable()).default(null),
  lng: z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().min(-180).max(180).nullable()).default(null),
});

async function saveCity(req, res, id) {
  const d = parse(citySchema, req.body);
  try {
    const { rows } = id
      ? await query(
        `UPDATE cities SET name_ar = $1, name_fr = $2, name_en = $3, is_active = $4, sort_order = $5, lat = $7, lng = $8 WHERE id = $6 RETURNING *`,
        [d.nameAr, d.nameFr || d.nameAr, d.nameEn || d.nameFr || d.nameAr, d.isActive, d.sortOrder, id, d.lat, d.lng],
      )
      : await query(
        `INSERT INTO cities (key, name_ar, name_fr, name_en, is_active, sort_order, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [d.key, d.nameAr, d.nameFr || d.nameAr, d.nameEn || d.nameFr || d.nameAr, d.isActive, d.sortOrder, d.lat, d.lng],
      );
    if (!rows[0]) throw notFound('city_not_found');
    invalidateCities();
    res.status(id ? 200 : 201).json({ city: rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('city_exists');
    throw err;
  }
}
router.post('/cities', (req, res) => saveCity(req, res, null));
router.put('/cities/:id', (req, res) => saveCity(req, res, parseInt(req.params.id, 10) || 0));

/** DELETE /admin/cities/:id – only when nothing uses it (otherwise hide it instead). */
router.delete('/cities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const c = (await query('SELECT key FROM cities WHERE id = $1', [id])).rows[0];
  if (!c) throw notFound('city_not_found');
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM products WHERE city = $1) + (SELECT COUNT(*) FROM users WHERE city = $1) + (SELECT COUNT(*) FROM stores WHERE city = $1) + (SELECT COUNT(*) FROM couriers WHERE city = $1) AS n`,
    [c.key],
  );
  if (Number(rows[0].n) > 0) throw conflict('city_in_use');
  await query('DELETE FROM cities WHERE id = $1', [id]);
  invalidateCities();
  res.json({ ok: true });
});

// ---------- Delivery: orders and delivery partners ----------

/** GET /admin/orders?status=&q= – every delivery order (status changes go through POST /api/orders/:id/status). */
router.get('/orders', async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 30 });
  const params = [];
  const where = [];
  if (req.query.status === 'open') where.push("o.status NOT IN ('delivered', 'cancelled')");
  else if (['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'].includes(req.query.status)) {
    params.push(req.query.status); where.push(`o.status = $${params.length}`);
  }
  const q = String(req.query.q || '').trim().slice(0, 80);
  if (q) {
    params.push(`%${q}%`, q.replace(/^#/, ''));
    const n = params.length - 1;
    where.push(`(o.product_title ILIKE $${n} OR b.name ILIKE $${n} OR s.name ILIKE $${n} OR o.phone ILIKE $${n} OR o.id::text = $${n + 1})`);
  }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const from = `FROM orders o JOIN users b ON b.id = o.buyer_id JOIN users s ON s.id = o.seller_id
    LEFT JOIN couriers c ON c.id = o.courier_id LEFT JOIN users cu ON cu.id = c.user_id`;
  const [items, total, counts] = await Promise.all([
    query(`SELECT o.id, o.product_id, o.product_title, o.status, o.item_price, o.delivery_fee, o.total, o.distance_km, o.city, o.area, o.district,
             o.pickup_city, o.courier_id, o.created_at, o.updated_at, b.name AS buyer_name, s.name AS seller_name, cu.name AS courier_name
           ${from} ${w} ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS n ${from} ${w}`, params),
    query('SELECT status, COUNT(*) AS n FROM orders GROUP BY status'),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit, counts: Object.fromEntries(counts.rows.map((c) => [c.status, Number(c.n)])) });
});

/** PATCH /admin/orders/:id/assign { courierId | null } – give an open order to an approved courier. */
router.patch('/orders/:id/assign', async (req, res) => {
  const d = parse(z.object({ courierId: z.coerce.number().int().positive().nullable() }), req.body);
  const id = parseInt(req.params.id, 10) || 0;
  const result = await tx(async (client) => {
    const o = (await client.query('SELECT o.*, c.user_id AS courier_user_id FROM orders o LEFT JOIN couriers c ON c.id = o.courier_id WHERE o.id = $1 FOR UPDATE OF o', [id])).rows[0];
    if (!o) throw notFound('order_not_found');
    if (['picked_up', 'on_the_way', 'delivered', 'cancelled'].includes(o.status)) throw badRequest('cannot_reassign');
    let courier = null;
    if (d.courierId) {
      courier = (await client.query("SELECT c.id, c.user_id, u.name FROM couriers c JOIN users u ON u.id = c.user_id WHERE c.id = $1 AND c.status = 'approved' AND u.is_active", [d.courierId])).rows[0];
      if (!courier) throw badRequest('courier_not_available');
      if ([o.buyer_id, o.seller_id].includes(courier.user_id)) throw badRequest('courier_is_party');
    }
    await client.query('UPDATE orders SET courier_id = $1, updated_at = now() WHERE id = $2', [courier?.id ?? null, id]);
    await client.query('INSERT INTO order_events (order_id, status, actor_id, actor_role, note) VALUES ($1, $2, $3, $4, $5)',
      [id, courier ? 'courier_assigned' : 'courier_removed', req.user.id, 'admin', courier?.name ?? null]);
    const link = `/orders/${id}`;
    if (courier) {
      await notify(courier.user_id, 'order_assigned', { id, title: o.product_title }, link, client);
      for (const uid of [o.buyer_id, o.seller_id]) await notify(uid, 'order_courier', { id, title: o.product_title, name: courier.name }, link, client);
    }
    if (o.courier_user_id && o.courier_user_id !== courier?.user_id) await notify(o.courier_user_id, 'order_unassigned', { id, title: o.product_title }, '/courier', client);
    return { courierId: courier?.id ?? null };
  });
  res.json(result);
});

/** GET /admin/couriers?status= – delivery partner applications and partners. */
router.get('/couriers', async (req, res) => {
  const status = ['pending', 'approved', 'rejected', 'suspended', 'all'].includes(req.query.status) ? req.query.status : 'pending';
  const [items, counts] = await Promise.all([
    query(
      `SELECT c.id, c.user_id, c.status, c.phone, c.city, c.vehicle, c.note, c.admin_note, c.is_available, c.share_location, c.created_at, c.reviewed_at,
         u.name, u.email, u.avatar_url, u.is_active, rv.name AS reviewed_by_name,
         (SELECT COUNT(*) FROM orders o WHERE o.courier_id = c.id AND o.status = 'delivered') AS delivered,
         (SELECT COUNT(*) FROM orders o WHERE o.courier_id = c.id AND o.status NOT IN ('delivered', 'cancelled')) AS active,
         (SELECT ROUND(AVG(rating)::numeric, 1) FROM delivery_ratings r WHERE r.courier_id = c.id) AS rating
       FROM couriers c JOIN users u ON u.id = c.user_id LEFT JOIN users rv ON rv.id = c.reviewed_by
       ${status === 'all' ? '' : 'WHERE c.status = $1'}
       ORDER BY ${status === 'pending' ? 'c.created_at ASC' : 'c.created_at DESC'} LIMIT 200`,
      status === 'all' ? [] : [status],
    ),
    query('SELECT status, COUNT(*) AS n FROM couriers GROUP BY status'),
  ]);
  res.json({ items: items.rows, counts: Object.fromEntries(counts.rows.map((c) => [c.status, Number(c.n)])) });
});

/** PATCH /admin/couriers/:id { status: approved|rejected|suspended, note } */
router.patch('/couriers/:id', async (req, res) => {
  const d = parse(z.object({ status: z.enum(['approved', 'rejected', 'suspended']), note: z.string().trim().max(500).optional() }), req.body);
  if (d.status !== 'approved' && !d.note) throw badRequest('validation_error', { note: 'required' });
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query(
    `UPDATE couriers SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = now(),
       share_location = CASE WHEN $1 = 'approved' THEN share_location ELSE false END,
       last_lat = CASE WHEN $1 = 'approved' THEN last_lat ELSE NULL END,
       last_lng = CASE WHEN $1 = 'approved' THEN last_lng ELSE NULL END
     WHERE id = $4 RETURNING id, user_id, status`,
    [d.status, d.status === 'approved' ? null : d.note, req.user.id, id],
  );
  if (!rows[0]) throw notFound('courier_not_found');
  await notify(rows[0].user_id, `courier_${d.status}`, { reason: d.note || null }, d.status === 'approved' ? '/courier' : '/delivery/join');
  res.json({ courier: rows[0] });
});
