import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { CITY_KEYS } from '../lib/constants.js';
import { badRequest, conflict, forbidden, parse, unauthorized } from '../lib/http.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';

const router = Router();

const USER_FIELDS = `id, name, email, phone, role, account_type, city, bio, avatar_url, created_at`;

const password = z.string().min(8, 'min_8').max(100);
const phone = z.string().trim().regex(/^\+?[0-9 ]{8,15}$/, 'invalid_phone');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'min_2').max(100),
  email: z.string().trim().toLowerCase().email('invalid_email'),
  phone: phone.optional().or(z.literal('')),
  password,
  accountType: z.enum(['individual', 'merchant']).default('individual'),
  city: z.enum(CITY_KEYS).optional(),
});

router.post('/register', async (req, res) => {
  const data = parse(registerSchema, req.body);
  const exists = await query('SELECT 1 FROM users WHERE email = $1', [data.email]);
  if (exists.rowCount) throw conflict('email_taken');
  const hash = await bcrypt.hash(data.password, 12);
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, account_type, city)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${USER_FIELDS}`,
    [data.name, data.email, data.phone || null, hash, data.accountType, data.city || null],
  );
  res.status(201).json({ user: rows[0], token: signToken(rows[0]) });
});

const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 12);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('invalid_email'),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const { email, password: pw } = parse(loginSchema, req.body);
  const { rows } = await query(`SELECT ${USER_FIELDS}, password_hash, is_active FROM users WHERE email = $1`, [email]);
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
       (SELECT row_to_json(s) FROM (SELECT id, name, slug FROM stores WHERE owner_id = users.id) s) AS store
     FROM users WHERE id = $1`,
    [req.user.id],
  );
  res.json({ user: rows[0] });
});

const profileSchema = z.object({
  name: z.string().trim().min(2, 'min_2').max(100),
  phone: phone.optional().or(z.literal('')),
  city: z.enum(CITY_KEYS).optional().or(z.literal('')),
  bio: z.string().trim().max(500).optional(),
  accountType: z.enum(['individual', 'merchant']).optional(),
});

router.put('/me', requireAuth, upload.single('avatar'), async (req, res) => {
  const data = parse(profileSchema, req.body);
  const old = await query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
  const avatar = req.file ? await saveFile(req.file) : null;
  const { rows } = await query(
    `UPDATE users SET name = $1, phone = $2, city = $3, bio = $4,
       account_type = COALESCE($5, account_type), avatar_url = COALESCE($6, avatar_url), updated_at = now()
     WHERE id = $7 RETURNING ${USER_FIELDS}`,
    [data.name, data.phone || null, data.city || null, data.bio || null, data.accountType || null, avatar, req.user.id],
  );
  if (avatar) removeUploads([old.rows[0]?.avatar_url]);
  res.json({ user: rows[0] });
});

router.put('/me/password', requireAuth, async (req, res) => {
  const data = parse(z.object({ currentPassword: z.string().min(1), newPassword: password }), req.body);
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

router.post('/forgot-password', async (req, res) => {
  const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email('invalid_email') }), req.body);
  const { rows } = await query('SELECT id FROM users WHERE email = $1 AND is_active', [email]);
  const response = { ok: true };
  if (rows[0]) {
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 hour')`,
      [rows[0].id, sha256(token)],
    );
    const link = `${config.corsOrigin}/reset-password?token=${token}`;
    // No mail provider is wired in v1: the link is logged. Plug an SMTP/SMS service in here.
    console.log(`[password-reset] ${email}: ${link}`);
    if (!config.isProd) response.devResetLink = link;
  }
  // Same answer whether or not the email exists, so accounts can't be enumerated.
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
