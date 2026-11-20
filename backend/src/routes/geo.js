import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { AREAS } from '../lib/constants.js';
import { parse } from '../lib/http.js';
import { reverseGeocode } from '../lib/geo.js';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'too_many_requests' } });

/**
 * POST /api/geo/reverse { lat, lng, lang } – city, moughataa and neighbourhood of a position.
 * A POST, so the coordinates stay out of URLs and access logs; nothing is stored.
 */
router.post('/reverse', limiter, async (req, res) => {
  const d = parse(z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    lang: z.enum(['ar', 'fr', 'en']).default('ar'),
  }), req.body);
  res.set('Cache-Control', 'no-store');
  res.json(await reverseGeocode(d.lat, d.lng, d.lang));
});

/** GET /api/geo/areas – known moughataas per city (with their approximate centre), offered when choosing a place by hand. */
router.get('/areas', (_req, res) => {
  res.json({ areas: Object.fromEntries(Object.entries(AREAS).map(([k, list]) => [k, list.map(({ key, ar, fr, en, lat, lng }) => ({ key, ar, fr, en, lat, lng }))])) });
});

export default router;
