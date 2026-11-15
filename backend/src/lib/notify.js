import { query } from '../db.js';

/**
 * Create a notification. Text is rendered client-side from `type` + `data`
 * so it can be shown in Arabic, French or English.
 */
export async function notify(userId, type, data = {}, link = null, client = { query }) {
  await client.query(
    'INSERT INTO notifications (user_id, type, data, link) VALUES ($1, $2, $3, $4)',
    [userId, type, data, link],
  );
}
