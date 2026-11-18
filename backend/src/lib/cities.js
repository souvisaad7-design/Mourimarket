// Cities / wilayas are rows in the `cities` table (Admin → Cities), cached briefly.
import { z } from 'zod';
import { query } from '../db.js';
import { badRequest } from './http.js';

let cache = null;
let cachedAt = 0;

/** All cities (active and hidden), in display order. */
export async function getCities({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cachedAt < 10_000) return cache;
  const { rows } = await query('SELECT id, key, name_ar, name_fr, name_en, is_active, sort_order FROM cities ORDER BY sort_order, id');
  cache = rows;
  cachedAt = Date.now();
  return rows;
}

export const invalidateCities = () => { cache = null; };

/** The list sent to the browser: active cities as { key, ar, fr, en }. */
export const publicCities = async () => (await getCities())
  .filter((c) => c.is_active).map((c) => ({ key: c.key, ar: c.name_ar, fr: c.name_fr, en: c.name_en }));

export const cityKey = z.string().trim().regex(/^[a-z0-9-]{1,40}$/, 'required');

/** Rejects a city key that is not in the table (empty values are allowed). */
export async function assertCity(key, field = 'city') {
  if (!key) return;
  if (!(await getCities()).some((c) => c.key === key)) throw badRequest('validation_error', { [field]: 'invalid' });
}
