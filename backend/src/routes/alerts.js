// Saved searches: "tell me when a matching listing is published".
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { assertCity, cityKey } from '../lib/cities.js';
import { badRequest, conflict, notFound, parse } from '../lib/http.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use('/saved-searches', requireAuth);

const MAX_PER_USER = 20;
const money = z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().min(0).max(1e12).optional());
const filtersSchema = z.object({
  q: z.string().trim().max(100).optional().transform((v) => v || undefined),
  category: z.string().trim().max(60).regex(/^[a-z0-9-]*$/).optional().transform((v) => v || undefined),
  city: z.preprocess((v) => v || undefined, cityKey.optional()),
  minPrice: money,
  maxPrice: money,
  condition: z.preprocess((v) => v || undefined, z.enum(['new', 'used']).optional()),
}).refine((f) => f.minPrice == null || f.maxPrice == null || f.minPrice <= f.maxPrice, { message: 'min_max', path: ['maxPrice'] });

const clean = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined));
// Postgres reorders JSON keys: compare with sorted keys and numbers as numbers.
const canon = (f) => JSON.stringify(Object.keys(clean(f)).sort().map((k) => [k, ['minPrice', 'maxPrice'].includes(k) ? Number(f[k]) : f[k]]));

router.get('/saved-searches', async (req, res) => {
  const { rows } = await query('SELECT id, name, filters, is_active, hits, last_hit_at, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json({ items: rows });
});

router.post('/saved-searches', limiter('saved-search', { windowMs: 60 * 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const d = parse(z.object({ name: z.string().trim().min(1, 'required').max(120), filters: filtersSchema }), req.body);
  const filters = clean(d.filters);
  if (!Object.keys(filters).length) throw badRequest('validation_error', { filters: 'empty_search' });
  if (filters.city) await assertCity(filters.city);
  if (filters.category && !(await query('SELECT 1 FROM categories WHERE slug = $1', [filters.category])).rowCount) throw badRequest('validation_error', { category: 'invalid' });
  const { rows: existing } = await query('SELECT id, filters FROM saved_searches WHERE user_id = $1', [req.user.id]);
  const same = existing.find((s) => canon(s.filters) === canon(filters));
  if (same) {
    await query('UPDATE saved_searches SET is_active = true, name = $1 WHERE id = $2', [d.name, same.id]);
    return res.json({ id: same.id, existing: true });
  }
  if (existing.length >= MAX_PER_USER) throw conflict('too_many_saved_searches');
  const { rows } = await query('INSERT INTO saved_searches (user_id, name, filters) VALUES ($1, $2, $3) RETURNING id', [req.user.id, d.name, filters]);
  res.status(201).json({ id: rows[0].id });
});

router.patch('/saved-searches/:id', async (req, res) => {
  const d = parse(z.object({ isActive: z.boolean() }), req.body);
  const { rowCount } = await query('UPDATE saved_searches SET is_active = $1 WHERE id = $2 AND user_id = $3', [d.isActive, parseInt(req.params.id, 10) || 0, req.user.id]);
  if (!rowCount) throw notFound();
  res.json({ ok: true });
});

router.delete('/saved-searches/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [parseInt(req.params.id, 10) || 0, req.user.id]);
  if (!rowCount) throw notFound();
  res.json({ ok: true });
});

export default router;
