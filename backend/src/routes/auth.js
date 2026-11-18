import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { notifyMerchantRequest } from '../lib/merchant.js';
import { getSettings } from '../lib/settings.js';
import { CITY_KEYS } from '../lib/constants.js';
import { badRequest, conflict, forbidden, parse, unauthorized } from '../lib/http.js';
import { normalizePhone } from '../lib/phone.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';

const router = Router();

const USER_FIELDS = `id, name, email, phone, role, account_type, merchant_status, merchant_note, city, bio, avatar_url, is_verified, created_at`;

// Text copied from RTL (Arabic) content often carries invisible direction marks
// (U+200E, U+200F, U+202A–U+202E, U+2066–U+2069, zero-width chars). Strip them
// from credentials so a pasted phone/password still works.
const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;
const clean = (v) => (typeof v === 'string' ? v.replace(INVISIBLE, '') : v);
const emptyToUndefined = (v) => (typeof v === 'string' && clean(v).trim() === '' ? undefined : v);
const optionalEmail = z.preprocess(
  (v) => emptyToUndefined(clean(v)),
  z.string().trim().toLowerCase().email('invalid_email').max(160).optional(),
);
const password = z.preprocess(clean, z.string().min(8, 'min_8').max(100));
/** Mauritanian mobile number, normalised to +222XXXXXXXX. */
const phoneField = z.preprocess(
  (v) => (typeof v === 'string' ? (normalizePhone(v) ?? `invalid:${v}`) : v),
  z.string({ required_error: 'required' }).regex(/^\+222[234]\d{7}$/, 'invalid_phone'),
);

export const ACCOUNT_TYPES = ['buyer', 'individual', 'merchant'];

const registerSchema = z.object({
  name: z.string().trim().min(2, 'min_2').max(100),
  phone: phoneField,
  email: optionalEmail,
  password,
  accountType: z.enum(ACCOUNT_TYPES).default('buyer'),
  city: z.enum(CITY_KEYS).optional(),
});

/** Map unique-index violations to friendly error codes. */
function uniqueConflict(err) {
  if (err.code !== '23505') return err;
  if (String(err.constraint || err.detail).includes('phone')) return conflict('phone_taken');
  if (String(err.constraint || err.detail).includes('email')) return conflict('email_taken');
  return err;
}

router.post('/register', async (req, res) => {
  if (!(await getSettings()).features.registration) throw forbidden('registration_closed');
  const data = parse(registerSchema, req.body);
  if ((await query('SELECT 1 FROM users WHERE phone = $1', [data.phone])).rowCount) throw conflict('phone_taken');
  if (data.email && (await query('SELECT 1 FROM users WHERE email = $1', [data.email])).rowCount) throw conflict('email_taken');
  const hash = await bcrypt.hash(data.password, 12);
  // A merchant account needs an admin's approval: until then it is an individual seller.
  const wantsMerchant = data.accountType === 'merchant';
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash, account_type, city, merchant_status, merchant_requested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${USER_FIELDS}`,
      [data.name, data.email ?? null, data.phone, hash, wantsMerchant ? 'individual' : data.accountType, data.city || null,
        wantsMerchant ? 'pending' : null, wantsMerchant ? new Date() : null],
    );
    if (wantsMerchant) await notifyMerchantRequest(rows[0]);
    res.status(201).json({ user: rows[0], token: signToken(rows[0]) });
  } catch (err) {
    throw uniqueConflict(err);
  }
});

const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 12);

/**
 * Users log in with their phone number. An email still works for accounts
 * that have one (e.g. the admin account created by the seed).
 */
function findByIdentifier(identifier) {
  const id = clean(String(identifier || '')).trim();
  if (id.includes('@')) {
    return query(`SELECT ${USER_FIELDS}, password_hash, is_active FROM users WHERE email = $1`, [id.toLowerCase()]);
  }
  const phone = normalizePhone(id);
  if (!phone) return { rows: [] };
  return query(`SELECT ${USER_FIELDS}, password_hash, is_active FROM users WHERE phone = $1`, [phone]);
}

const loginSchema = z.object({
  identifier: z.preprocess(clean, z.string().trim().min(1, 'required').max(160)),
  password: z.preprocess(clean, z.string().min(1, 'required')),
});

router.post('/login', async (req, res) => {
  const body = { ...req.body, identifier: req.body?.identifier ?? req.body?.phone ?? req.body?.email };
  const { identifier, password: pw } = parse(loginSchema, body);
  const { rows } = await findByIdentifier(identifier);
  const user = rows[0];
  // Compare even when the user is missing to keep timing similar.
  const ok = await bcrypt.compare(pw, user?.password_hash || DUMMY_HASH);
  if (!user || !ok) throw unauthorized('invalid_credentials');
  if (!user.is_active) throw forbidden('account_disabled');
  delete user.password_hash;
  delete user.is_active;
  res.json({ user, token: signToken(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT ${USER_FIELDS},
       (SELECT row_to_json(s) FROM (SELECT id, name, slug FROM stores WHERE owner_id = users.id) s) AS store,
       (SELECT COUNT(*) FROM products p WHERE p.seller_id = users.id AND p.status = 'approved' AND p.availability = 'available') AS live_count,
       (SELECT COUNT(*) FROM products p WHERE p.seller_id = users.id AND p.availability = 'sold') AS sold_count,
       (SELECT COUNT(*) FROM favorites f WHERE f.user_id = users.id) AS favorites_count,
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews r WHERE r.seller_id = users.id) AS rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.seller_id = users.id) AS reviews_count
     FROM users WHERE id = $1`,
    [req.user.id],
  );
  res.json({ user: rows[0] });
});

const profileSchema = z.object({
  name: z.string().trim().min(2, 'min_2').max(100),
  phone: z.preprocess(emptyToUndefined, phoneField.optional()),
  email: optionalEmail,
  city: z.enum(CITY_KEYS).optional().or(z.literal('')),
  bio: z.string().trim().max(500).optional(),
  accountType: z.enum(ACCOUNT_TYPES).optional(),
});

router.put('/me', requireAuth, upload.single('avatar'), async (req, res) => {
  const data = parse(profileSchema, req.body);
  const old = (await query('SELECT avatar_url, phone, email, account_type, merchant_status FROM users WHERE id = $1', [req.user.id])).rows[0];
  // Account type: asking for "merchant" files a request for an admin to review instead.
  let accountType = data.accountType || old.account_type;
  let merchantStatus = old.merchant_status;
  let newRequest = false;
  if (data.accountType === 'merchant' && old.account_type !== 'merchant') {
    accountType = old.account_type === 'buyer' ? 'individual' : old.account_type;
    newRequest = merchantStatus !== 'pending';
    merchantStatus = 'pending';
  } else if (data.accountType && data.accountType !== 'merchant') {
    // Choosing another type withdraws a pending request; leaving a merchant account ends it.
    if (merchantStatus === 'pending' || old.account_type === 'merchant') merchantStatus = null;
  }
  // Every account needs a way to log in: a phone number, or an email for older accounts.
  if (!data.phone && !data.email) throw badRequest('validation_error', { phone: 'required' });
  const avatar = req.file ? await saveFile(req.file) : null;
  try {
    const { rows } = await query(
      `UPDATE users SET name = $1, phone = $2, email = $3, city = $4, bio = $5,
         account_type = $6, avatar_url = COALESCE($7, avatar_url), merchant_status = $9,
         merchant_requested_at = CASE WHEN $10 THEN now() ELSE merchant_requested_at END,
         merchant_note = CASE WHEN $10 THEN NULL ELSE merchant_note END, updated_at = now()
       WHERE id = $8 RETURNING ${USER_FIELDS}`,
      [data.name, data.phone ?? null, data.email ?? null, data.city || null, data.bio || null,
        accountType, avatar, req.user.id, merchantStatus, newRequest],
    );
    if (newRequest) await notifyMerchantRequest(rows[0]);
    if (avatar) removeUploads([old?.avatar_url]);
    res.json({ user: rows[0] });
  } catch (err) {
    if (avatar) removeUploads([avatar]);
    throw uniqueConflict(err);
  }
});

router.put('/me/password', requireAuth, async (req, res) => {
  const data = parse(z.object({ currentPassword: z.preprocess(clean, z.string().min(1)), newPassword: password }), req.body);
  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!(await bcrypt.compare(data.currentPassword, rows[0].password_hash))) {
    throw badRequest('wrong_password');
  }
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
    await bcrypt.hash(data.newPassword, 12),
    req.user.id,
  ]);
  res.json({ ok: true });
});

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Password reset by email link, for accounts that have an email.
 * Phone-only accounts are reset by an admin (no SMS provider in this version).
 */
router.post('/forgot-password', async (req, res) => {
  const { identifier } = parse(
    z.object({ identifier: z.preprocess(clean, z.string().trim().min(1, 'required').max(160)) }),
    { identifier: req.body?.identifier ?? req.body?.email ?? req.body?.phone },
  );
  const { rows } = await findByIdentifier(identifier);
  const user = rows[0];
  const response = { ok: true };
  if (user?.is_active && user.email) {
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 hour')`,
      [user.id, sha256(token)],
    );
    const link = `${config.corsOrigin}/reset-password?token=${token}`;
    // No mail provider is wired in v1: the link is logged. Plug an SMTP/SMS service in here.
    console.log(`[password-reset] user ${user.id}: ${link}`);
    if (!config.isProd) response.devResetLink = link;
  }
  // Same answer whether or not the account exists, so accounts can't be enumerated.
  res.json(response);
});

router.post('/reset-password', async (req, res) => {
  const data = parse(z.object({ token: z.string().min(10), password }), req.body);
  const { rows } = await query(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [sha256(data.token)],
  );
  if (!rows[0]) throw badRequest('invalid_or_expired_token');
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
    await bcrypt.hash(data.password, 12),
    rows[0].user_id,
  ]);
  await query('UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [rows[0].user_id]);
  res.json({ ok: true });
});

export default router;
