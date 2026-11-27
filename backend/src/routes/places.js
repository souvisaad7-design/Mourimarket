// Safe meeting places: public spots (malls, police stations, busy markets…) the admin lists per city,
// suggested in the chat so buyer and seller meet somewhere safe for the hand-over.
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { moduleOn } from '../lib/settings.js';
import { assertCity, cityKey } from '../lib/cities.js';
import { notFound, parse } from '../lib/http.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const FIELDS = 'id, city, name_ar, name_fr, address, kind, lat, lng, is_active, sort_order';

router.get('/meeting-places', async (req, res) => {
  if (!(await moduleOn('places'))) return res.json({ items: [] });
  const city = typeof req.query.city === 'string' ? req.query.city : '';
  const { rows } = await query(
    `SELECT ${FIELDS} FROM meeting_places WHERE is_active AND ($1 = '' OR city = $1) ORDER BY city, sort_order, id LIMIT 100`,
    [city],
  );
  res.json({ items: rows });
});

const placeSchema = z.object({
  city: cityKey,
  name_ar: z.string().trim().min(2).max(120),
  name_fr: z.string().trim().max(120).default(''),
  address: z.string().trim().max(200).default(''),
  kind: z.enum(['mall', 'police', 'station', 'market', 'bank', 'other']).default('other'),
  lat: z.coerce.number().min(14).max(28).nullable().optional(),
  lng: z.coerce.number().min(-18).max(-4).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(1000).default(0),
});

const admin = Router();
admin.use(requireAuth, requireAdmin);
admin.get('/meeting-places', async (_req, res) => {
  const { rows } = await query(`SELECT ${FIELDS} FROM meeting_places ORDER BY city, sort_order, id`);
  res.json({ items: rows });
});
admin.post('/meeting-places', async (req, res) => {
  const d = parse(placeSchema, req.body);
  await assertCity(d.city);
  const { rows } = await query(
    `INSERT INTO meeting_places (city, name_ar, name_fr, address, kind, lat, lng, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ${FIELDS}`,
    [d.city, d.name_ar, d.name_fr, d.address, d.kind, d.lat ?? null, d.lng ?? null, d.is_active, d.sort_order],
  );
  res.status(201).json({ place: rows[0] });
});
admin.put('/meeting-places/:id', async (req, res) => {
  const d = parse(placeSchema, req.body);
  await assertCity(d.city);
  const { rows } = await query(
    `UPDATE meeting_places SET city = $2, name_ar = $3, name_fr = $4, address = $5, kind = $6, lat = $7, lng = $8, is_active = $9, sort_order = $10
     WHERE id = $1 RETURNING ${FIELDS}`,
    [parseInt(req.params.id, 10) || 0, d.city, d.name_ar, d.name_fr, d.address, d.kind, d.lat ?? null, d.lng ?? null, d.is_active, d.sort_order],
  );
  if (!rows[0]) throw notFound();
  res.json({ place: rows[0] });
});
admin.delete('/meeting-places/:id', async (req, res) => {
  await query('DELETE FROM meeting_places WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  res.json({ ok: true });
});
// ---------- Weekly livestock markets ----------
const MKT = 'id, city, name_ar, name_fr, days, notes, is_active';
const marketSchema = z.object({
  city: cityKey,
  name_ar: z.string().trim().min(2).max(120),
  name_fr: z.string().trim().max(120).default(''),
  days: z.array(z.coerce.number().int().min(0).max(6)).max(7).default([]),
  notes: z.string().trim().max(200).default(''),
  is_active: z.boolean().default(true),
});

router.get('/livestock-markets', async (_req, res) => {
  if (!(await moduleOn('livestock'))) return res.json({ items: [] });
  const { rows } = await query(`SELECT ${MKT} FROM livestock_markets WHERE is_active ORDER BY city, id`);
  res.json({ items: rows });
});
admin.get('/livestock-markets', async (_req, res) => {
  const { rows } = await query(`SELECT ${MKT} FROM livestock_markets ORDER BY city, id`);
  res.json({ items: rows });
});
admin.post('/livestock-markets', async (req, res) => {
  const d = parse(marketSchema, req.body);
  await assertCity(d.city);
  const { rows } = await query(
    `INSERT INTO livestock_markets (city, name_ar, name_fr, days, notes, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${MKT}`,
    [d.city, d.name_ar, d.name_fr, [...new Set(d.days)].sort(), d.notes, d.is_active],
  );
  res.status(201).json({ market: rows[0] });
});
admin.put('/livestock-markets/:id', async (req, res) => {
  const d = parse(marketSchema, req.body);
  await assertCity(d.city);
  const { rows } = await query(
    `UPDATE livestock_markets SET city = $2, name_ar = $3, name_fr = $4, days = $5, notes = $6, is_active = $7 WHERE id = $1 RETURNING ${MKT}`,
    [parseInt(req.params.id, 10) || 0, d.city, d.name_ar, d.name_fr, [...new Set(d.days)].sort(), d.notes, d.is_active],
  );
  if (!rows[0]) throw notFound();
  res.json({ market: rows[0] });
});
admin.delete('/livestock-markets/:id', async (req, res) => {
  await query('DELETE FROM livestock_markets WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  res.json({ ok: true });
});

router.use('/admin', admin);

export default router;
