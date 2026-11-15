import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query, tx } from '../db.js';
import { CITY_KEYS, MAX_IMAGES } from '../lib/constants.js';
import { badRequest, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';

const router = Router();

// Shared SELECT for product cards / detail.
export const PRODUCT_SELECT = `
  p.id, p.title, p.price, p.city, p.condition, p.status, p.availability, p.views,
  p.created_at, p.updated_at, p.category_id, p.seller_id, p.store_id,
  c.slug AS category_slug, c.name_ar AS category_name_ar, c.name_fr AS category_name_fr, c.name_en AS category_name_en,
  (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS cover_url,
  u.name AS seller_name, s.name AS store_name, s.slug AS store_slug`;

export const PRODUCT_FROM = `
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN users u ON u.id = p.seller_id
  LEFT JOIN stores s ON s.id = p.store_id AND s.is_active`;

const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  city: z.enum(CITY_KEYS).optional().or(z.literal('')),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(['new', 'used']).optional().or(z.literal('')),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
  availability: z.enum(['available', 'sold', 'all']).default('available'),
  seller: z.coerce.number().int().positive().optional(),
  store: z.string().trim().max(120).optional(),
});

const SORTS = {
  newest: 'p.created_at DESC, p.id DESC',
  oldest: 'p.created_at ASC, p.id ASC',
  price_asc: 'p.price ASC, p.id DESC',
  price_desc: 'p.price DESC, p.id DESC',
};

/** GET /api/products – public search with filters, sort and pagination. */
router.get('/', optionalAuth, async (req, res) => {
  const f = parse(listSchema, req.query);
  const { page, limit, offset } = pagination(req.query);
  const where = [`p.status = 'approved'`, 'u.is_active'];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replace('?', `$${params.length}`));
  };
  if (f.q) {
    const escaped = f.q.replace(/[\\%_]/g, (m) => `\\${m}`);
    add(`(p.title ILIKE ? OR p.description ILIKE $${params.length + 1})`, `%${escaped}%`);
  }
  if (f.category) add('c.slug = ?', f.category);
  if (f.city) add('p.city = ?', f.city);
  if (f.minPrice !== undefined) add('p.price >= ?', f.minPrice);
  if (f.maxPrice !== undefined) add('p.price <= ?', f.maxPrice);
  if (f.condition) add('p.condition = ?', f.condition);
  if (f.availability !== 'all') add('p.availability = ?', f.availability);
  if (f.seller) add('p.seller_id = ?', f.seller);
  if (f.store) add('s.slug = ?', f.store);

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const favSql = req.user
    ? `, EXISTS (SELECT 1 FROM favorites fv WHERE fv.product_id = p.id AND fv.user_id = ${Number(req.user.id)}) AS is_favorite`
    : ', false AS is_favorite';

  const [items, total] = await Promise.all([
    query(
      `SELECT ${PRODUCT_SELECT} ${favSql} ${PRODUCT_FROM} ${whereSql}
       ORDER BY ${SORTS[f.sort]} LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    query(`SELECT COUNT(*) AS n ${PRODUCT_FROM} ${whereSql}`, params),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit });
});

/** GET /api/products/mine – the seller's own listings in every status. */
router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, p.rejection_reason, p.sold_to_id,
       (SELECT COUNT(*) FROM favorites fv WHERE fv.product_id = p.id) AS favorites_count,
       (SELECT COUNT(*) FROM conversations cv WHERE cv.product_id = p.id) AS conversations_count
     ${PRODUCT_FROM} WHERE p.seller_id = $1 ORDER BY p.created_at DESC`,
    [req.user.id],
  );
  res.json({ items: rows });
});

async function loadProduct(id) {
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
  if (!rows[0]) throw notFound('product_not_found');
  return rows[0];
}

function assertOwner(product, user) {
  if (product.seller_id !== user.id && user.role !== 'admin') throw forbidden();
}

/** GET /api/products/:id – detail. Unapproved listings are visible to their owner and admins only. */
router.get('/:id', optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) throw notFound('product_not_found');
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, p.description, p.rejection_reason, p.sold_to_id,
       u.phone AS seller_phone, u.city AS seller_city, u.created_at AS seller_since, u.avatar_url AS seller_avatar,
       u.account_type AS seller_account_type, u.is_active AS seller_active,
       s.logo_url AS store_logo,
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews r WHERE r.seller_id = p.seller_id) AS seller_rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.seller_id = p.seller_id) AS seller_reviews_count
     ${PRODUCT_FROM} WHERE p.id = $1`,
    [id],
  );
  const product = rows[0];
  if (!product) throw notFound('product_not_found');
  const isOwner = req.user && (req.user.id === product.seller_id || req.user.role === 'admin');
  if ((product.status !== 'approved' || !product.seller_active) && !isOwner) throw notFound('product_not_found');

  const [images, fav, review] = await Promise.all([
    query('SELECT id, url FROM product_images WHERE product_id = $1 ORDER BY sort_order, id', [id]),
    req.user
      ? query('SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2', [req.user.id, id])
      : { rowCount: 0 },
    query('SELECT id, rating, comment, created_at FROM reviews WHERE product_id = $1', [id]),
  ]);
  if (!isOwner) await query('UPDATE products SET views = views + 1 WHERE id = $1', [id]);

  product.images = images.rows;
  product.is_favorite = fav.rowCount > 0;
  product.review = review.rows[0] || null;
  product.can_review = Boolean(req.user && product.sold_to_id === req.user.id && !review.rows[0]);
  if (!isOwner) delete product.rejection_reason;
  delete product.seller_active;
  res.json({ product });
});

const productSchema = z.object({
  title: z.string().trim().min(3, 'min_3').max(140),
  description: z.string().trim().min(10, 'min_10').max(5000),
  price: z.coerce.number({ invalid_type_error: 'invalid_number' }).min(0, 'min_0').max(1e12),
  categoryId: z.coerce.number().int().positive('required'),
  city: z.enum(CITY_KEYS, { errorMap: () => ({ message: 'required' }) }),
  condition: z.enum(['new', 'used']).default('used'),
});

async function storeIdFor(userId, client) {
  const { rows } = await client.query(
    `SELECT s.id FROM stores s JOIN users u ON u.id = s.owner_id
     WHERE s.owner_id = $1 AND s.is_active AND u.account_type = 'merchant'`,
    [userId],
  );
  return rows[0]?.id || null;
}

async function assertCategory(id, client) {
  const { rowCount } = await client.query('SELECT 1 FROM categories WHERE id = $1', [id]);
  if (!rowCount) throw badRequest('validation_error', { categoryId: 'required' });
}

/** POST /api/products – create a listing (multipart, field "images"). */
router.post('/', requireAuth, upload.array('images', MAX_IMAGES), async (req, res) => {
  const files = req.files || [];
  const data = parse(productSchema, req.body);
  if (!files.length) throw badRequest('validation_error', { images: 'image_required' });
  const status = config.autoApprove ? 'approved' : 'pending';
  const product = await tx(async (client) => {
    await assertCategory(data.categoryId, client);
    const storeId = await storeIdFor(req.user.id, client);
    const { rows } = await client.query(
      `INSERT INTO products (seller_id, category_id, store_id, title, description, price, city, condition, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, status`,
      [req.user.id, data.categoryId, storeId, data.title, data.description, data.price, data.city, data.condition, status],
    );
    for (const [i, file] of files.entries()) {
      await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)', [
        rows[0].id, await saveFile(file, client), i,
      ]);
    }
    return rows[0];
  });
  res.status(201).json({ product });
});

/** PUT /api/products/:id – edit. Content edits send the listing back to review. */
router.put('/:id', requireAuth, upload.array('images', MAX_IMAGES), async (req, res) => {
  const files = req.files || [];
  const product = await loadProduct(req.params.id);
  assertOwner(product, req.user);
  const data = parse(productSchema, req.body);
  const removeIds = []
    .concat(req.body.removeImageIds || [])
    .map((v) => parseInt(v, 10))
    .filter(Boolean);

  const removed = await tx(async (client) => {
    await assertCategory(data.categoryId, client);
    const del = await client.query(
      'DELETE FROM product_images WHERE product_id = $1 AND id = ANY($2::int[]) RETURNING url',
      [product.id, removeIds],
    );
    const { rows } = await client.query(
      'SELECT COUNT(*) AS n, COALESCE(MAX(sort_order), -1) AS max FROM product_images WHERE product_id = $1',
      [product.id],
    );
    if (rows[0].n + files.length === 0) throw badRequest('validation_error', { images: 'image_required' });
    if (rows[0].n + files.length > MAX_IMAGES) throw badRequest('validation_error', { images: 'too_many_images' });
    for (const [i, file] of files.entries()) {
      await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)', [
        product.id, await saveFile(file, client), rows[0].max + 1 + i,
      ]);
    }
    const keepApproved = config.autoApprove || req.user.role === 'admin';
    await client.query(
      `UPDATE products SET title = $1, description = $2, price = $3, category_id = $4, city = $5, condition = $6,
         status = CASE WHEN $7 THEN status ELSE 'pending' END,
         rejection_reason = CASE WHEN $7 THEN rejection_reason ELSE NULL END,
         updated_at = now()
       WHERE id = $8`,
      [data.title, data.description, data.price, data.categoryId, data.city, data.condition, keepApproved, product.id],
    );
    return del.rows.map((r) => r.url);
  });
  removeUploads(removed);
  res.json({ ok: true });
});

/**
 * PATCH /api/products/:id/availability – mark available / sold.
 * soldToId documents the sale and unlocks a review from that buyer.
 */
router.patch('/:id/availability', requireAuth, async (req, res) => {
  const product = await loadProduct(req.params.id);
  assertOwner(product, req.user);
  const data = parse(
    z.object({
      availability: z.enum(['available', 'sold']),
      soldToId: z.coerce.number().int().positive().optional().nullable(),
    }),
    req.body,
  );
  let soldTo = null;
  if (data.availability === 'sold' && data.soldToId) {
    // Only someone who contacted the seller about this listing can be recorded as the buyer.
    const { rowCount } = await query(
      'SELECT 1 FROM conversations WHERE product_id = $1 AND buyer_id = $2 AND seller_id = $3',
      [product.id, data.soldToId, product.seller_id],
    );
    if (!rowCount) throw badRequest('buyer_not_in_conversations');
    soldTo = data.soldToId;
  }
  await query(
    `UPDATE products SET availability = $1::text, sold_to_id = $2,
       sold_at = CASE WHEN $1::text = 'sold' THEN now() ELSE NULL END, updated_at = now() WHERE id = $3`,
    [data.availability, soldTo, product.id],
  );
  if (soldTo) {
    await notify(soldTo, 'sale_recorded', { productId: product.id, title: product.title }, `/products/${product.id}`);
  }
  res.json({ ok: true });
});

/** GET /api/products/:id/buyers – people who messaged about this listing (to record a sale). */
router.get('/:id/buyers', requireAuth, async (req, res) => {
  const product = await loadProduct(req.params.id);
  assertOwner(product, req.user);
  const { rows } = await query(
    `SELECT u.id, u.name FROM conversations cv JOIN users u ON u.id = cv.buyer_id
     WHERE cv.product_id = $1 ORDER BY cv.last_message_at DESC`,
    [product.id],
  );
  res.json({ items: rows });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const product = await loadProduct(req.params.id);
  assertOwner(product, req.user);
  const { rows } = await query('SELECT url FROM product_images WHERE product_id = $1', [product.id]);
  await query('DELETE FROM products WHERE id = $1', [product.id]);
  removeUploads(rows.map((r) => r.url));
  if (req.user.id !== product.seller_id) {
    await notify(product.seller_id, 'product_deleted', { title: product.title });
  }
  res.json({ ok: true });
});

export default router;
