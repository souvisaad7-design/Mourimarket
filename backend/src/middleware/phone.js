import { query } from '../db.js';
import { forbidden } from '../lib/http.js';
import { getSettings } from '../lib/settings.js';
import { smsProvider } from '../lib/sms.js';

/** Is phone verification required right now? (switch on in the panel and an SMS provider configured) */
export async function phoneVerificationOn() {
  return Boolean(smsProvider) && (await getSettings()).features.phoneVerification !== false;
}

/**
 * Posting, messaging and ordering need a confirmed phone number (first line of defence against
 * fake accounts). Admins are exempt.
 */
export async function requireVerifiedPhone(req, _res, next) {
  try {
    if (!req.user || req.user.role === 'admin' || !(await phoneVerificationOn())) return next();
    const { rows } = await query('SELECT phone, phone_verified_at FROM users WHERE id = $1', [req.user.id]);
    if (rows[0]?.phone && rows[0].phone_verified_at) return next();
    return next(forbidden('phone_unverified'));
  } catch (err) { return next(err); }
}
