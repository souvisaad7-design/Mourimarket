// Shared rules for Souk Social and Souk Live: who may see / post / comment, text moderation,
// and notifying followers.
import { query } from '../db.js';
import { HttpError, badRequest, forbidden } from './http.js';
import { pushToUser } from './push.js';
import { getSettings } from './settings.js';
import { normalize } from './search.js';
import { inBackground } from './ai.js';

/** Is either user blocking the other? */
export async function blockedBetween(a, b) {
  if (!a || !b) return false;
  const { rowCount } = await query(
    'SELECT 1 FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)',
    [a, b],
  );
  return rowCount > 0;
}

export async function follows(followerId, followeeId) {
  if (!followerId) return false;
  const { rowCount } = await query('SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2', [followerId, followeeId]);
  return rowCount > 0;
}

/** Can `viewer` see content by `authorId` with this visibility? */
export async function canSee(viewer, authorId, visibility) {
  if (viewer?.role === 'admin' || viewer?.id === authorId) return true;
  if (viewer && await blockedBetween(viewer.id, authorId)) return false;
  if (visibility === 'followers') return follows(viewer?.id, authorId);
  return true;
}

/** Social features switched on, and this user not banned from them. */
export async function assertSocialAllowed(user, { live = false } = {}) {
  const { community: social } = await getSettings();
  if (!social.enabled || (live && !social.liveEnabled)) throw new HttpError(503, live ? 'live_disabled' : 'social_disabled');
  if (user?.social_banned_until && new Date(user.social_banned_until) > new Date()) throw forbidden('social_banned');
}

/** Only verified merchants (or admins) can go live. */
export function assertCanHost(user) {
  if (user.role === 'admin') return;
  if (user.account_type !== 'merchant' || !user.is_verified) throw forbidden('live_verified_merchants_only');
}

// Words that are never allowed in public text (insults / slurs, Arabic, Hassaniya, French, English),
// compared after normalisation. Kept short on purpose: reports and moderators handle the rest.
// Single words must match a whole word (so «ميكانيكي» or «pédestre» are fine); phrases match anywhere.
const BANNED = ['ابن الكلب', 'يا حمار', 'قحبة', 'قحبه', 'شرموط', 'شرموطة', 'putain', 'salope', 'connard', 'enculé', 'fuck', 'fucking', 'bitch', 'nigger', 'pédé'];
const BANNED_N = BANNED.map(normalize);
const LINK = /(https?:\/\/|www\.|t\.me\/|wa\.me\/|bit\.ly)/i;

/** Reject offensive text; links are refused in comments (spam), allowed nowhere else either except our own site. */
export function checkText(text, { allowLinks = false } = {}) {
  const n = normalize(text);
  const words = new Set(n.split(/[^\p{L}\p{N}]+/u));
  if (BANNED_N.some((w) => (w.includes(' ') ? n.includes(w) : words.has(w)))) throw badRequest('inappropriate_text');
  if (!allowLinks && LINK.test(text) && !/souk-chinguetti/i.test(text)) throw badRequest('links_not_allowed');
}

/**
 * Notify every follower of `userId` (one SQL insert, any number of followers), and send push
 * notifications to the most recent 300 of them in the background.
 */
export async function notifyFollowers(userId, type, data, link) {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, data, link)
     SELECT f.follower_id, $2, $3, $4 FROM follows f
     JOIN users u ON u.id = f.follower_id AND u.is_active
     WHERE f.followee_id = $1
       AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.blocker_id = f.follower_id AND b.blocked_id = $1)
     RETURNING user_id`,
    [userId, type, data, link],
  );
  const ids = rows.map((r) => r.user_id).slice(0, 300);
  if (ids.length) {
    await inBackground((async () => {
      for (const id of ids) await pushToUser(id, type, data, link).catch(() => 0);
    })());
  }
  return rows.length;
}
