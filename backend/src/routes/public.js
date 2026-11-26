// Read-only public endpoints: categories, cities, seller profiles, stores.
import { Router } from 'express';
import { phoneVerificationOn } from '../middleware/phone.js';
import { videoEnabled } from '../lib/video.js';
import { z } from 'zod';
import { query } from '../db.js';
import { PAYMENT_METHODS, REPORT_REASONS } from '../lib/constants.js';
import { assertCity, cityKey, publicCities } from '../lib/cities.js';
import { conflict, forbidden, notFound, parse, slugify } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';
import { getSettings } from '../lib/settings.js';
import { aiStatus } from '../lib/ai.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';

const router = Router();

router.get('/meta', async (_req, res) => {
  const [cities, settings] = await Promise.all([publicCities(), getSettings()]);
  const { pricing, features } = settings;
  res.json({
    cities, reportReasons: REPORT_REASONS, currency: 'MRU',
    phoneVerification: await phoneVerificationOn(),
    videoUploads: videoEnabled(),
    ai: await aiStatus(),
    // Eid sheep market: shown from the admin switch until the day after Eid.
    eid: (() => {
      const e = settings.season.eid;
      if (!e.enabled) return null;
      const days = e.date ? Math.ceil((new Date(`${e.date}T00:00:00Z`) - Date.now()) / 86_400_000) : null;
      return days !== null && days < -1 ? null : { date: e.date || null, daysLeft: days };
    })(),
    freeBumpDays: pricing.freeBumpDays,
    upgrades: features.paidUpgrades ? { verifyPrice: pricing.verifyPrice, bumpPrice: pricing.bumpPrice, storePlans: pricing.storePlans, featurePlans: pricing.featurePlans, paymentMethods: PAYMENT_METHODS } : null,
  });
});

/** GET /api/settings – site texts, contact details and switches the admin edits. */
router.get('/settings', async (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  const [settings, banners] = await Promise.all([
    getSettings(),
    query('SELECT id, title, subtitle, cta, link, image_url FROM banners WHERE is_active ORDER BY sort_order, id'),
  ]);
  const { ai: _ai, ...publicSettings } = settings; // AI budgets and limits stay private
  res.json({ settings: publicSettings, banners: banners.rows });
});

/** GET /api/pages – published custom pages (for menus and the footer). */
router.get('/pages', async (_req, res) => {
  const { rows } = await query('SELECT id, slug, title FROM pages WHERE is_published ORDER BY id');
  res.json({ items: rows });
});

router.get('/pages/:slug', async (req, res) => {
  const { rows } = await query('SELECT id, slug, title, body, cover_url, updated_at FROM pages WHERE slug = $1 AND is_published', [req.params.slug]);
  if (!rows[0]) throw notFound('page_not_found');
  res.json({ page: rows[0] });
});

router.get('/categories', async (_req, res) => {
  const { rows } = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id
                  AND p.status = 'approved' AND p.availability = 'available') AS product_count
     FROM categories c ORDER BY sort_order, id`,
  );
  res.json({ items: rows });
});

router.get('/stats/public', async (_req, res) => {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM products WHERE status = 'approved' AND availability = 'available') AS products,
            (SELECT COUNT(*) FROM users WHERE is_active) AS users,
            (SELECT COUNT(*) FROM stores WHERE is_active) AS stores`,
  );
  res.json(rows[0]);
});

/** Number of live listings per city, for the homepage. */
router.get('/stats/cities', async (_req, res) => {
  const { rows } = await query(
    `SELECT p.city, COUNT(*) AS n FROM products p JOIN users u ON u.id = p.seller_id
     WHERE p.status = 'approved' AND p.availability = 'available' AND u.is_active
     GROUP BY p.city ORDER BY n DESC LIMIT 8`,
  );
  res.json({ items: rows });
});

/** Public seller profile with active listings and reviews. */
router.get('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { rows } = await query(
    `SELECT u.id, u.name, u.city, u.bio, u.avatar_url, u.account_type, u.created_at, u.phone, u.is_verified, (u.phone_verified_at IS NOT NULL) AS phone_verified,
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE seller_id = u.id) AS rating,
       (SELECT COUNT(*) FROM reviews WHERE seller_id = u.id) AS reviews_count,
       (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND availability = 'sold') AS sold_count,
       (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = 'approved' AND availability = 'available') AS live_count,
       (SELECT row_to_json(s) FROM (SELECT id, name, slug, logo_url FROM stores WHERE owner_id = u.id AND is_active) s) AS store
     FROM users u WHERE u.id = $1 AND u.is_active`,
    [id || 0],
  );
  if (!rows[0]) throw notFound('user_not_found');
  if (rows[0].account_type === 'buyer') rows[0].phone = null;
  const [products, reviews] = await Promise.all([
    query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM}
       WHERE p.seller_id = $1 AND p.status = 'approved' ORDER BY p.availability, p.created_at DESC LIMIT 60`,
      [id],
    ),
    query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name, p.title AS product_title
       FROM reviews r JOIN users u ON u.id = r.reviewer_id JOIN products p ON p.id = r.product_id
       WHERE r.seller_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
      [id],
    ),
  ]);
  res.json({ user: rows[0], products: products.rows, reviews: reviews.rows });
});

// ---------- Stores ----------

router.get('/stores', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const { rows } = await query(
    `SELECT s.id, s.name, s.slug, s.logo_url, s.description, s.city, s.created_at, u.is_verified AS verified,
       (s.plan IS NOT NULL AND s.plan_until > now()) AS pro,
       (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.status = 'approved' AND p.availability = 'available') AS product_count
     FROM stores s JOIN users u ON u.id = s.owner_id
     WHERE s.is_active AND u.is_active AND u.account_type = 'merchant' AND ($1 = '' OR s.name ILIKE '%' || $1 || '%')
     ORDER BY (s.plan IS NOT NULL AND s.plan_until > now()) DESC, product_count DESC, s.created_at DESC`,
    [q],
  );
  res.json({ items: rows });
});

const STORE_FIELDS = 'id, owner_id, name, slug, logo_url, description, phone, whatsapp, email, city, is_active, created_at, plan, plan_until, feature_credits';

router.get('/stores/me', requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT ${STORE_FIELDS} FROM stores WHERE owner_id = $1`, [req.user.id]);
  res.json({ store: rows[0] || null });
});

const storeSchema = z.object({
  name: z.string().trim().min(2, 'min_2').max(100),
  description: z.string().trim().max(2000).optional(),
  phone: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  email: z.string().trim().email('invalid_email').optional().or(z.literal('')),
  city: cityKey.optional().or(z.literal('')),
});

/** PUT /api/stores/me – create or update the merchant's store (multipart, optional "logo"). */
router.put('/stores/me', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    if (req.user.account_type !== 'merchant') throw forbidden('merchant_only');
    const data = parse(storeSchema, req.body);
    await assertCity(data.city);
    const existing = (await query('SELECT id, slug, logo_url FROM stores WHERE owner_id = $1', [req.user.id])).rows[0];
    const logo = req.file ? await saveFile(req.file) : null;
    let store;
    if (existing) {
      store = (
        await query(
          `UPDATE stores SET name = $1, description = $2, phone = $3, whatsapp = $4, email = $5, city = $6,
             logo_url = COALESCE($7, logo_url), updated_at = now() WHERE id = $8 RETURNING ${STORE_FIELDS}`,
          [data.name, data.description || null, data.phone || null, data.whatsapp || null, data.email || null,
            data.city || null, logo, existing.id],
        )
      ).rows[0];
      if (logo) removeUploads([existing.logo_url]);
    } else {
      let slug = slugify(data.name);
      if ((await query('SELECT 1 FROM stores WHERE slug = $1', [slug])).rowCount) slug = `${slug}-${req.user.id}`;
      store = (
        await query(
          `INSERT INTO stores (owner_id, name, slug, description, phone, whatsapp, email, city, logo_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ${STORE_FIELDS}`,
          [req.user.id, data.name, slug, data.description || null, data.phone || null, data.whatsapp || null,
            data.email || null, data.city || null, logo],
        )
      ).rows[0];
      // Attach the merchant's existing listings to the new store.
      await query('UPDATE products SET store_id = $1 WHERE seller_id = $2', [store.id, req.user.id]);
    }
    res.json({ store });
  } catch (err) {
    if (err.code === '23505') throw conflict('store_exists');
    throw err;
  }
});

router.get('/stores/:slug', async (req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.owner_id, s.name, s.slug, s.logo_url, s.description, s.phone, s.whatsapp, s.email, s.city, s.created_at, (s.plan IS NOT NULL AND s.plan_until > now()) AS pro,
       u.name AS owner_name, u.is_verified AS verified,
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE seller_id = s.owner_id) AS rating,
       (SELECT COUNT(*) FROM reviews WHERE seller_id = s.owner_id) AS reviews_count
     FROM stores s JOIN users u ON u.id = s.owner_id
     WHERE s.slug = $1 AND s.is_active AND u.is_active`,
    [req.params.slug],
  );
  if (!rows[0]) throw notFound('store_not_found');
  res.json({ store: rows[0] });
});

export default router;
