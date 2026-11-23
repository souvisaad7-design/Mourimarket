// Web Push: a notification on the phone / computer even when the site is closed.
// The VAPID key pair is generated once by the server and kept in the database (app_secrets).
import webpush from 'web-push';
import { query } from '../db.js';
import { messages } from '../../../frontend/src/i18n/messages.js';

let vapid = null;
export async function vapidKeys() {
  if (vapid) return vapid;
  const { rows } = await query("SELECT value FROM app_secrets WHERE key = 'vapid'");
  if (rows[0]) vapid = rows[0].value;
  else {
    const k = webpush.generateVAPIDKeys();
    // Two instances may race: the first insert wins and everyone uses it.
    await query("INSERT INTO app_secrets (key, value) VALUES ('vapid', $1) ON CONFLICT (key) DO NOTHING", [k]);
    vapid = (await query("SELECT value FROM app_secrets WHERE key = 'vapid'")).rows[0].value;
  }
  return vapid;
}

// Tests replace the sender (no network).
let sender = (sub, body, opts) => webpush.sendNotification(sub, body, opts);
export function setPushSender(fn) { sender = fn; }

const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

/** The notification's text in the subscriber's language, from the site's own translations. */
export function pushText(type, data = {}, lang = 'ar') {
  const m = messages[lang] || messages.ar;
  const site = m.brand?.name || messages.ar.brand.name;
  const vars = { ...data };
  if (type === 'order_status' && data.status) vars.status = m.delivery?.status?.[data.status] || data.status;
  const tpl = m.notifications?.types?.[type] || messages.ar.notifications?.types?.[type];
  const body = tpl ? fill(tpl, vars).replace(/\{site\}/g, site) : (m.notifications?.title || 'Notification');
  return { title: site, body };
}

/** Send to every device of this user; forget devices the push service no longer knows. */
export async function pushToUser(userId, type, data, link) {
  const { rows } = await query('SELECT id, endpoint, p256dh, auth, lang FROM push_subscriptions WHERE user_id = $1', [userId]);
  if (!rows.length) return 0;
  const keys = await vapidKeys();
  const opts = { vapidDetails: { subject: 'mailto:support@souk-chinguetti.mr', publicKey: keys.publicKey, privateKey: keys.privateKey }, TTL: 24 * 3600, timeout: 5000, urgency: type === 'new_message' || type === 'seller_reply' ? 'high' : 'normal' };
  let sent = 0;
  await Promise.all(rows.map(async (s) => {
    const { title, body } = pushText(type, data, s.lang);
    const payload = JSON.stringify({ title, body, url: link || '/notifications', tag: data?.conversationId ? `c${data.conversationId}` : data?.id ? `${type}-${data.id}` : type });
    try {
      await sender({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, opts);
      sent += 1;
      query('UPDATE push_subscriptions SET last_ok_at = now() WHERE id = $1', [s.id]).catch(() => {});
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) await query('DELETE FROM push_subscriptions WHERE id = $1', [s.id]).catch(() => {});
    }
  }));
  return sent;
}
