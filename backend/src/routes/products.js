import { Router } from 'express';
import { limiter } from '../lib/rateLimit.js';
import { onApproved } from '../lib/alerts.js';
import { attrFilters, validateAttrs } from '../lib/attributes.js';
import { deleteVideo, ownVideoUrl, videoEnabled, videoUploadToken, VIDEO_TYPES } from '../lib/video.js';
import { requireVerifiedPhone } from '../middleware/phone.js';
import { z } from 'zod';
import { config } from '../config.js';
import { query, tx } from '../db.js';
import { MAX_IMAGES } from '../lib/constants.js';
import { assertCity, cityKey } from '../lib/cities.js';
import { badRequest, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';
import { getSettings } from '../lib/settings.js';
import { buildSearch, escapeLike, normalize } from '../lib/search.js';

const router = Router();

// Shared SELECT for product cards / detail.
export const PRODUCT_SELECT = `
  p.id, p.title, p.price, p.old_price, p.city, p.condition, p.status, p.availability, p.views,
  p.created_at, p.updated_at, p.category_id, p.seller_id, p.store_id, p.attrs, p.video_url,
  c.slug AS category_slug, c.name_ar AS category_name_ar, c.name_fr AS category_name_fr, c.name_en AS category_name_en,
  (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS cover_url,
  u.name AS seller_name, u.is_verified AS seller_verified, s.name AS store_name, s.slug AS store_slug,
  (p.featured_until IS NOT NULL AND p.featured_until > now()) AS is_featured, p.featured_until,
  p.area, p.district, p.loc_exact,
  -- Location for maps: the exact pin only if the seller allowed it, otherwise rounded to ~1 km;
  -- listings without a pin fall back to their city centre.
  CASE WHEN p.lat IS NULL THEN 'city' WHEN p.loc_exact THEN 'exact' ELSE 'approx' END AS loc_precision,
  CASE WHEN p.lat IS NULL THEN ct.lat WHEN p.loc_exact THEN p.lat ELSE round(p.lat::numeric, 2)::float8 END AS map_lat,
  CASE WHEN p.lat IS NULL THEN ct.lng WHEN p.loc_exact THEN p.lng ELSE round(p.lng::numeric, 2)::float8 END AS map_lng`;

export const PRODUCT_FROM = `
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN users u ON u.id = p.seller_id
  LEFT JOIN stores s ON s.id = p.store_id AND s.is_active
  LEFT JOIN cities ct ON ct.key = p.city`;

/**
 * SQL for the distance (km) between a visitor and a listing. Uses the real pin, or the city
 * centre when there is none. Rounded so it cannot be used to work out a hidden pin:
 * 0.1 km when the seller shows the exact place, otherwise 0.5 km (and never under 0.5 km).
 */
export function distanceSql(latParam, lngParam) {
  const raw = `mm_distance_km(${latParam}, ${lngParam}, COALESCE(p.lat, ct.lat), COALESCE(p.lng, ct.lng))`;
  return {
    raw,
    shown: `CASE WHEN ${raw} IS NULL THEN NULL WHEN p.loc_exact THEN round(${raw}::numeric, 1)::float8
                 ELSE GREATEST(0.5, round(${raw}::numeric * 2) / 2)::float8 END`,
  };
}

const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  city: cityKey.optional().or(z.literal('')),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(['new', 'used']).optional().or(z.literal('')),
  sort: z.enum(['relevance', 'newest', 'oldest', 'price_asc', 'price_desc', 'distance']).optional(),
  // The visitor's position (rounded by the browser) for distances and "near me".
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.5).max(2000).optional(),
  featured: z.enum(['1', 'true']).optional(),
  deals: z.enum(['1', 'true']).optional(),
  availability: z.enum(['available', 'sold', 'all']).default('available'),
  seller: z.coerce.number().int().positive().optional(),
  store: z.string().trim().max(120).optional(),
});

const FEATURED_FIRST = '(p.featured_until IS NOT NULL AND p.featured_until > now()) DESC';
const SORTS = {
  newest: `${FEATURED_FIRST}, p.created_at DESC, p.id DESC`,
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
  const push = (value) => {
    params.push(value);
    return `$${params.length}`;
  };
  const add = (sql, value) => where.push(sql.replace('?', push(value)));
  let scoreSql = null;
  if (f.q) {
    const search = await buildSearch(f.q, push);
    if (search) {
      where.push(search.where);
      scoreSql = search.score;
    }
  }
  if (f.featured) where.push('p.featured_until > now()');
  if (f.deals) where.push('p.old_price > p.price');
  if (f.category) { add('c.slug = ?', f.category); attrFilters(f.category, req.query, add); }
  if (f.city) add('p.city = ?', f.city);
  if (f.minPrice !== undefined) add('p.price >= ?', f.minPrice);
  if (f.maxPrice !== undefined) add('p.price <= ?', f.maxPrice);
  if (f.condition) add('p.condition = ?', f.condition);
  if (f.availability !== 'all') add('p.availability = ?', f.availability);
  if (f.seller) add('p.seller_id = ?', f.seller);
  if (f.store) add('s.slug = ?', f.store);

  // Distance from the visitor, the "near me" radius and sorting by distance.
  let distSelect = ', NULL::float8 AS distance_km';
  let dist = null;
  // The count query only takes the parameters its WHERE uses (the position only matters with a radius).
  let countParams = null;
  if (f.lat !== undefined && f.lng !== undefined) {
    const before = params.length;
    dist = distanceSql(push(f.lat), push(f.lng));
    distSelect = `, ${dist.shown} AS distance_km`;
    if (f.radius) where.push(`${dist.raw} <= ${push(f.radius)}`);
    else countParams = params.slice(0, before);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const favSql = req.user
    ? `, EXISTS (SELECT 1 FROM favorites fv WHERE fv.product_id = p.id AND fv.user_id = ${Number(req.user.id)}) AS is_favorite`
    : ', false AS is_favorite';

  const sort = f.sort || (scoreSql ? 'relevance' : 'newest');
  const orderBy = sort === 'distance' && dist
    ? `${dist.shown} ASC NULLS LAST, p.created_at DESC` // by the distance people see (no finer order leaks)
    : sort === 'relevance' && scoreSql
      ? `${FEATURED_FIRST}, (${scoreSql}) DESC, p.created_at DESC`
      : SORTS[sort === 'relevance' || sort === 'distance' ? 'newest' : sort];

  const [items, total] = await Promise.all([
    query(
      `SELECT ${PRODUCT_SELECT} ${favSql} ${distSelect} ${PRODUCT_FROM} ${whereSql}
       ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    query(`SELECT COUNT(*) AS n ${PRODUCT_FROM} ${whereSql}`, countParams || params),
  ]);
  res.json({ items: items.rows, total: total.rows[0].n, page, limit });
});

/** GET /api/products/suggest?q= – quick suggestions while typing (titles + categories). */
router.get('/suggest', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const norm = normalize(q).replace(/^(ال)(?=\S{2,})/, '');
  if (norm.length < 2) return res.json({ titles: [], categories: [] });
  const like = `%${escapeLike(norm)}%`;
  const [titles, categories] = await Promise.all([
    query(
      `SELECT p.id, p.title FROM products p JOIN users u ON u.id = p.seller_id
       WHERE p.status = 'approved' AND p.availability = 'available' AND u.is_active
         AND mm_normalize(p.title) LIKE $1
       ORDER BY (mm_normalize(p.title) LIKE $2) DESC, p.created_at DESC LIMIT 6`,
      [like, `${escapeLike(norm)}%`],
    ),
    query(
      `SELECT slug, name_ar, name_fr, name_en, icon FROM categories
       WHERE mm_normalize(name_ar) LIKE $1 OR mm_normalize(name_fr) LIKE $1 OR mm_normalize(name_en) LIKE $1
       ORDER BY sort_order LIMIT 3`,
      [like],
    ),
  ]);
  res.json({ titles: titles.rows, categories: categories.rows });
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
  const from = parse(z.object({ lat: z.coerce.number().min(-90).max(90).optional(), lng: z.coerce.number().min(-180).max(180).optional() }), req.query);
  const params = [id];
  const dist = from.lat !== undefined && from.lng !== undefined ? distanceSql('$2', '$3') : null;
  if (dist) params.push(from.lat, from.lng);
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, ${dist ? dist.shown : 'NULL::float8'} AS distance_km, p.lat AS pin_lat, p.lng AS pin_lng, p.description, p.rejection_reason, p.sold_to_id,
       u.phone AS seller_phone, u.city AS seller_city, u.created_at AS seller_since, u.avatar_url AS seller_avatar,
       u.account_type AS seller_account_type, u.is_active AS seller_active, (u.phone_verified_at IS NOT NULL) AS seller_phone_verified,
       s.logo_url AS store_logo,
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews r WHERE r.seller_id = p.seller_id) AS seller_rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.seller_id = p.seller_id) AS seller_reviews_count
     ${PRODUCT_FROM} WHERE p.id = $1`,
    params,
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
  if (!isOwner) {
    delete product.rejection_reason;
    // The exact pin is for the seller's own edit form (and admins) only.
    delete product.pin_lat;
    delete product.pin_lng;
  }
  delete product.seller_active;
  res.json({ product });
});

const productSchema = z.object({
  title: z.string().trim().min(3, 'min_3').max(140),
  description: z.string().trim().min(10, 'min_10').max(5000),
  price: z.coerce.number({ invalid_type_error: 'invalid_number' }).min(0, 'min_0').max(1e12),
  // Optional "price before discount"; must be higher than the current price.
  oldPrice: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || v === 'null' ? undefined : v),
    z.coerce.number({ invalid_type_error: 'invalid_number' }).min(0, 'min_0').max(1e12).optional(),
  ),
  categoryId: z.coerce.number().int().positive('required'),
  city: cityKey,
  condition: z.enum(['new', 'used']).default('used'),
  // Optional pin on the map (Mauritania and a margin around it), area and neighbourhood.
  lat: z.preprocess(emptyToNull, z.coerce.number().min(14).max(28, 'out_of_area').nullable()).default(null),
  lng: z.preprocess(emptyToNull, z.coerce.number().min(-18).max(-4, 'out_of_area').nullable()).default(null),
  area: z.string().trim().max(80).optional().transform((v) => v || null),
  district: z.string().trim().max(80).optional().transform((v) => v || null),
  locExact: z.preprocess((v) => v === true || v === 'true' || v === '1' || v === 'on', z.boolean()).default(false),
  videoUrl: z.string().trim().max(400).optional().transform((v) => v || null),
}).refine((d) => (d.lat === null) === (d.lng === null), { message: 'required', path: ['lat'] });

function emptyToNull(v) {
  return v === '' || v === undefined || v === null || v === 'null' ? null : v;
}

function checkOldPrice(data) {
  if (data.oldPrice !== undefined && data.oldPrice <= data.price) {
    throw badRequest('validation_error', { oldPrice: 'old_price_higher' });
  }
}

async function storeIdFor(userId, client) {
  const { rows } = await client.query(
    `SELECT s.id FROM stores s JOIN users u ON u.id = s.owner_id
     WHERE s.owner_id = $1 AND s.is_active AND u.account_type = 'merchant'`,
    [userId],
  );
  return rows[0]?.id || null;
}

async function assertCategory(id, client) {
  const { rows } = await client.query('SELECT slug FROM categories WHERE id = $1', [id]);
  if (!rows[0]) throw badRequest('validation_error', { categoryId: 'required' });
  return rows[0].slug;
}

/** POST /api/products/video-token { ext } – a one-time key to upload one short video straight to storage. */
router.post('/video-token', requireAuth, requireVerifiedPhone, limiter('video-token', { windowMs: 60 * 60 * 1000, limit: 15, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  if (!videoEnabled()) throw badRequest('video_disabled');
  const ext = String(req.body?.ext || '').toLowerCase();
  if (!VIDEO_TYPES[ext]) throw badRequest('invalid_file_type');
  res.json(await videoUploadToken(req.user.id, ext));
});

/** POST /api/products – create a listing (multipart, field "images"). */
// Anti-spam: at most 20 new listings per hour per account (admins are not limited).
const postLimiter = limiter('listings-post', { windowMs: 60 * 60 * 1000, limit: 20, keyGenerator: (req) => String(req.user.id), skip: (req) => req.user?.role === 'admin' });

router.post('/', requireAuth, requireVerifiedPhone, postLimiter, upload.array('images', MAX_IMAGES), async (req, res) => {
  // Buyers browse and message; only seller accounts can post listings.
  // An admin can post for anyone (sellerId) and the listing goes live at once.
  const isAdmin = req.user.role === 'admin';
  if (req.user.account_type === 'buyer' && !isAdmin) throw forbidden('sellers_only');
  let sellerId = req.user.id;
  if (isAdmin && req.body.sellerId) {
    sellerId = parseInt(req.body.sellerId, 10) || 0;
    if (!(await query('SELECT 1 FROM users WHERE id = $1', [sellerId])).rowCount) throw badRequest('validation_error', { sellerId: 'not_found' });
  }
  const files = req.files || [];
  const data = parse(productSchema, req.body);
  await assertCity(data.city);
    checkOldPrice(data);
  if (!files.length) throw badRequest('validation_error', { images: 'image_required' });
  const status = isAdmin || (await getSettings()).features.autoApprove ? 'approved' : 'pending';
  const product = await tx(async (client) => {
    const attrs = validateAttrs(await assertCategory(data.categoryId, client), req.body.attrs);
    if (data.videoUrl && !ownVideoUrl(data.videoUrl, req.user.id)) throw badRequest('validation_error', { videoUrl: 'invalid' });
    const storeId = await storeIdFor(sellerId, client);
    const { rows } = await client.query(
      `INSERT INTO products (seller_id, category_id, store_id, title, description, price, old_price, city, condition, status,
         lat, lng, area, district, loc_exact, attrs, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id, status, seller_id`,
      [sellerId, data.categoryId, storeId, data.title, data.description, data.price, data.oldPrice ?? null, data.city, data.condition, status,
        data.lat, data.lng, data.area, data.district, data.locExact, attrs, data.videoUrl],
    );
    for (const [i, file] of files.entries()) {
      await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)', [
        rows[0].id, await saveFile(file, client), i,
      ]);
    }
    return rows[0];
  });
  if (product.status === 'approved') await onApproved(product.id);
  res.status(201).json({ product });
});

/** PUT /api/products/:id – edit. Content edits send the listing back to review. */
router.put('/:id', requireAuth, upload.array('images', MAX_IMAGES), async (req, res) => {
  const files = req.files || [];
  const product = await loadProduct(req.params.id);
  assertOwner(product, req.user);
  const data = parse(productSchema, req.body);
  await assertCity(data.city);
    checkOldPrice(data);
  const removeIds = []
    .concat(req.body.removeImageIds || [])
    .map((v) => parseInt(v, 10))
    .filter(Boolean);

  const removed = await tx(async (client) => {
    const attrs = validateAttrs(await assertCategory(data.categoryId, client), req.body.attrs);
    if (data.videoUrl && data.videoUrl !== product.video_url && !ownVideoUrl(data.videoUrl, req.user.id)) throw badRequest('validation_error', { videoUrl: 'invalid' });
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
    const keepApproved = (await getSettings()).features.autoApprove || req.user.role === 'admin';
    await client.query(
      `UPDATE products SET title = $1, description = $2, price = $3, category_id = $4, city = $5, condition = $6,
         status = CASE WHEN $7 THEN status ELSE 'pending' END,
         rejection_reason = CASE WHEN $7 THEN rejection_reason ELSE NULL END,
         old_price = $9, lat = $10, lng = $11, area = $12, district = $13, loc_exact = $14, attrs = $15, video_url = $16,
         updated_at = now()
       WHERE id = $8`,
      [data.title, data.description, data.price, data.categoryId, data.city, data.condition, keepApproved, product.id, data.oldPrice ?? null,
        data.lat, data.lng, data.area, data.district, data.locExact, attrs, data.videoUrl],
    );
    return del.rows.map((r) => r.url);
  });
  removeUploads(removed);
  if (product.video_url && product.video_url !== data.videoUrl) deleteVideo(product.video_url);
  await onApproved(product.id); // no-op unless the edit kept the listing live
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
  deleteVideo(product.video_url);
  if (req.user.id !== product.seller_id) {
    await notify(product.seller_id, 'product_deleted', { title: product.title });
  }
  res.json({ ok: true });
});

export default router;
