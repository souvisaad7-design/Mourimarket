import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db.js';
import { forbidden, unauthorized } from '../lib/http.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

async function loadUser(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized('invalid_token');
  }
  const { rows } = await query(
    'SELECT id, name, email, role, account_type, is_active, is_verified, avatar_url, social_banned_until, password_changed_at FROM users WHERE id = $1',
    [payload.sub],
  );
  const user = rows[0];
  if (!user) throw unauthorized('invalid_token');
  // A password change (or reset) ends every session opened before it.
  if (user.password_changed_at && payload.iat < Math.floor(new Date(user.password_changed_at).getTime() / 1000)) {
    throw unauthorized('session_expired');
  }
  delete user.password_changed_at;
  if (!user.is_active) throw forbidden('account_disabled');
  return user;
}

/** Attaches req.user when a valid token is present; never rejects anonymous requests. */
export async function optionalAuth(req, _res, next) {
  try {
    req.user = await loadUser(req);
    next();
  } catch {
    req.user = null;
    next();
  }
}

export async function requireAuth(req, _res, next) {
  try {
    const user = await loadUser(req);
    if (!user) throw unauthorized();
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(forbidden());
  next();
}
