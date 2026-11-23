// Subscribe this browser / phone to Web Push notifications.
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { parse } from '../lib/http.js';
import { pushToUser, vapidKeys } from '../lib/push.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/** GET /api/push/key – the public VAPID key the browser needs to subscribe. */
router.get('/key', async (_req, res) => {
  res.json({ publicKey: (await vapidKeys()).publicKey });
});

const subSchema = z.object({
  endpoint: z.string().url().max(800).refine((u) => u.startsWith('https://'), 'https'),
  keys: z.object({ p256dh: z.string().min(20).max(200), auth: z.string().min(8).max(100) }),
  lang: z.enum(['ar', 'fr', 'en']).default('ar'),
});

/** POST /api/push/subscribe – save (or move to this account) a device subscription. */
router.post('/subscribe', requireAuth, limiter('push-subscribe', { windowMs: 60 * 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const d = parse(subSchema, req.body);
  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, lang) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, lang = EXCLUDED.lang`,
    [req.user.id, d.endpoint, d.keys.p256dh, d.keys.auth, d.lang],
  );
  // At most 10 devices per account: drop the oldest.
  await query(`DELETE FROM push_subscriptions WHERE user_id = $1 AND id NOT IN (SELECT id FROM push_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10)`, [req.user.id]);
  res.status(201).json({ ok: true });
});

/** DELETE /api/push/subscribe { endpoint } – stop notifications on this device (also used at logout). */
router.delete('/subscribe', async (req, res) => {
  const { endpoint } = parse(z.object({ endpoint: z.string().max(800) }), req.body || {});
  await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
  res.json({ ok: true });
});

/** POST /api/push/test – send a test notification to my devices. */
router.post('/test', requireAuth, limiter('push-test', { windowMs: 60 * 1000, limit: 3, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const sent = await pushToUser(req.user.id, 'push_test', {}, '/notifications');
  res.json({ sent });
});

export default router;
