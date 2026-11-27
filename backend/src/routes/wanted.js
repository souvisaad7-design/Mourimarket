// "Wanted" ads: a buyer describes what they are looking for; sellers who have it answer in a conversation.
import { Router } from 'express';
import { requireModule } from '../lib/settings.js';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { assertCity, cityKey } from '../lib/cities.js';
import { badRequest, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { limiter } from '../lib/rateLimit.js';
import { escapeLike } from '../lib/search.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireVerifiedPhone } from '../middleware/phone.js';

const router = Router();

const SELECT = `w.id, w.user_id, w.title, w.description, w.city, w.budget, w.status, w.replies, w.created_at, w.expires_at,
  c.slug AS category_slug, c.name_ar AS category_name_ar, c.name_fr AS category_name_fr, c.name_en AS category_name_en, c.icon AS category_icon,
  u.name AS user_name, u.avatar_url AS user_avatar`;
const FROM = 'FROM wanted_ads w JOIN users u ON u.id = w.user_id LEFT JOIN categories c ON c.id = w.category_id';
const LIVE = "w.status = 'active' AND w.expires_at > now() AND u.is_active";

/** GET /api/wanted?category=&city=&q=&mine=1 – open requests (or mine, all states but hidden). */
router.get('/', optionalAuth, async (req, res) => {
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 24 });
  const params = [];
  const where = [];
  const add = (sql, v) => { params.push(v); where.push(sql.replace('?', `$${params.length}`)); };
  if (req.query.mine === '1' && req.user) { add('w.user_id = ?', req.user.id); where.push("w.status <> 'hidden'"); } else where.push(LIVE);
  if (typeof req.query.category === 'string' && req.query.category) add('c.slug = ?', req.query.category.slice(0, 60));
  if (typeof req.query.city === 'string' && req.query.city) add('w.city = ?', req.query.city.slice(0, 40));
  if (typeof req.query.q === 'string' && req.query.q.trim()) add("w.title ILIKE '%' || ? || '%'", escapeLike(req.query.q.trim().slice(0, 80)));
  const w = `WHERE ${where.join(' AND ')}`;
  const [items, total] = await Promise.all([
    query(`SELECT ${SELECT} ${FROM} ${w} ORDER BY w.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS n ${FROM} ${w}`, params),
  ]);
  res.json({ items: items.rows, total: Number(total.rows[0].n), page, limit });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const { rows } = await query(`SELECT ${SELECT}, u.is_active ${FROM} WHERE w.id = $1 AND w.status <> 'hidden'`, [parseInt(req.params.id, 10) || 0]);
  const ad = rows[0];
  const mine = req.user && (ad?.user_id === req.user.id || req.user.role === 'admin');
  if (!ad || (!mine && (ad.status !== 'active' || !ad.is_active || new Date(ad.expires_at) < new Date()))) throw notFound('wanted_not_found');
  delete ad.is_active;
  res.json({ wanted: ad });
});

const schema = z.object({
  title: z.string().trim().min(3, 'min_3').max(140),
  description: z.string().trim().max(2000).optional().transform((v) => v || null),
  categoryId: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().positive().optional()),
  city: z.preprocess((v) => v || undefined, cityKey.optional()),
  budget: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().min(0).max(1e12).optional()),
});

/** POST /api/wanted – publish a request (live at once, for 30 days). */
router.post('/', requireAuth, requireModule('wanted'), requireVerifiedPhone, limiter('wanted-post', { windowMs: 24 * 60 * 60 * 1000, limit: 10, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const d = parse(schema, req.body);
  if (d.city) await assertCity(d.city);
  if (d.categoryId && !(await query('SELECT 1 FROM categories WHERE id = $1', [d.categoryId])).rowCount) throw badRequest('validation_error', { categoryId: 'invalid' });
  const { rows } = await query(
    'INSERT INTO wanted_ads (user_id, title, description, category_id, city, budget) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [req.user.id, d.title, d.description, d.categoryId ?? null, d.city ?? null, d.budget ?? null],
  );
  res.status(201).json({ id: rows[0].id });
});

/** PATCH /api/wanted/:id { status: active | closed } – the author closes it ("found it") or renews it for 30 days. */
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(['active', 'closed']) }), req.body);
  const { rowCount } = await query(
    `UPDATE wanted_ads SET status = $1, expires_at = CASE WHEN $1 = 'active' THEN now() + interval '30 days' ELSE expires_at END
     WHERE id = $2 AND user_id = $3 AND status <> 'hidden'`,
    [status, parseInt(req.params.id, 10) || 0, req.user.id],
  );
  if (!rowCount) throw notFound('wanted_not_found');
  res.json({ ok: true });
});

/** DELETE /api/wanted/:id – by the author, or an admin (moderation). Kept hidden for existing conversations. */
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const ad = (await query('SELECT user_id FROM wanted_ads WHERE id = $1', [id])).rows[0];
  if (!ad) throw notFound('wanted_not_found');
  if (ad.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden();
  await query("UPDATE wanted_ads SET status = 'hidden' WHERE id = $1", [id]);
  res.json({ ok: true });
});

/** POST /api/wanted/:id/reply { body } – "I have it": opens a conversation with the person looking. */
router.post('/:id/reply', requireAuth, requireModule('wanted'), requireVerifiedPhone, limiter('wanted-reply', { windowMs: 60 * 1000, limit: 20, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const { body } = parse(z.object({ body: z.string().trim().min(1, 'required').max(2000) }), req.body);
  const ad = (await query(`SELECT w.* FROM wanted_ads w JOIN users u ON u.id = w.user_id WHERE w.id = $1 AND ${LIVE}`, [parseInt(req.params.id, 10) || 0])).rows[0];
  if (!ad) throw notFound('wanted_not_found');
  if (ad.user_id === req.user.id) throw badRequest('cannot_message_self');
  const conversationId = await tx(async (client) => {
    // The person looking is the buyer; whoever answers is the seller.
    const { rows } = await client.query(
      `INSERT INTO conversations (wanted_id, buyer_id, seller_id) VALUES ($1, $2, $3)
       ON CONFLICT (wanted_id, buyer_id, seller_id) WHERE wanted_id IS NOT NULL DO UPDATE SET last_message_at = now()
       RETURNING id, (xmax = 0) AS created`,
      [ad.id, ad.user_id, req.user.id],
    );
    await client.query('INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3)', [rows[0].id, req.user.id, body]);
    if (rows[0].created) await client.query('UPDATE wanted_ads SET replies = replies + 1 WHERE id = $1', [ad.id]);
    await notify(ad.user_id, 'wanted_reply', { from: req.user.name, title: ad.title, conversationId: rows[0].id }, `/messages/${rows[0].id}`, client);
    return rows[0].id;
  });
  res.status(201).json({ conversationId });
});

export default router;
