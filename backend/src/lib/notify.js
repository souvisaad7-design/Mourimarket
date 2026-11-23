import { query } from '../db.js';
import { waitUntil } from '@vercel/functions';
import { pushToUser } from './push.js';

// Pushes waiting to be sent (see flushPushes): a notification created inside a transaction is only
// pushed once the request is answered, and a failing push never breaks the request.
const pending = new Set();

/**
 * Create a notification. Text is rendered client-side from `type` + `data`
 * so it can be shown in Arabic, French or English. It is also pushed to the user's devices.
 */
export async function notify(userId, type, data = {}, link = null, client = { query }) {
  await client.query(
    'INSERT INTO notifications (user_id, type, data, link) VALUES ($1, $2, $3, $4)',
    [userId, type, data, link],
  );
  const p = pushToUser(userId, type, data, link).catch(() => 0).finally(() => pending.delete(p));
  pending.add(p);
  // On Vercel, keep the function alive until the push is delivered (no-op elsewhere).
  try { waitUntil(p); } catch { /* not on Vercel */ }
}

/** Wait for pushes still in flight (serverless functions are frozen once the response is sent). */
export async function flushPushes() {
  if (pending.size) await Promise.allSettled([...pending]);
}
