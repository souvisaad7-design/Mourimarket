import { query } from '../db.js';
import { notify } from './notify.js';

/** Let every active admin know a merchant account is waiting for review. */
export async function notifyMerchantRequest(user) {
  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  await Promise.all(admins.rows.map((a) => notify(a.id, 'merchant_request', { name: user.name }, '/admin/merchants')));
}
