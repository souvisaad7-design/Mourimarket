// Rate limits shared by every server instance. On Vercel each request may land on a different
// short-lived instance, so in-memory counters could be bypassed: the counters live in Postgres.
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';

/** express-rate-limit store backed by the `rate_limits` table (keys are hashed: no phone/email/IP stored). */
class PgStore {
  constructor(prefix) { this.prefix = prefix; this.localKeys = false; }

  init(options) { this.windowMs = options.windowMs; }

  key(k) { return crypto.createHash('sha256').update(`${this.prefix}:${k}`).digest('hex'); }

  async increment(k) {
    const { rows } = await query(
      `INSERT INTO rate_limits (key, hits, reset_at) VALUES ($1, 1, now() + ($2 || ' milliseconds')::interval)
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.hits + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at <= now() THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
       RETURNING hits, reset_at`,
      [this.key(k), String(this.windowMs)],
    );
    // Now and then, forget expired counters.
    if (Math.random() < 0.01) query("DELETE FROM rate_limits WHERE reset_at < now() - interval '1 hour'").catch(() => {});
    return { totalHits: rows[0].hits, resetTime: new Date(rows[0].reset_at) };
  }

  async decrement(k) { await query('UPDATE rate_limits SET hits = GREATEST(hits - 1, 0) WHERE key = $1', [this.key(k)]); }

  async resetKey(k) { await query('DELETE FROM rate_limits WHERE key = $1', [this.key(k)]); }
}

/**
 * limiter('login', { windowMs, limit, keyGenerator?, skip? }) – a rate limiter whose counters are shared.
 * Without keyGenerator the client's IP is used (Vercel's proxy sets it; `trust proxy` is on).
 */
export function limiter(name, { windowMs, limit, keyGenerator, skip, message = { error: 'too_many_requests' } }) {
  return rateLimit({
    windowMs,
    limit,
    keyGenerator,
    skip,
    message,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new PgStore(name),
    // IPv6 clients are grouped by /56 (the default); our own keys need no IP handling.
    validate: keyGenerator ? { keyGeneratorIpFallback: false } : true,
  });
}
