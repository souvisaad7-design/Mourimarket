// Store staff: what an employee may do for the store owner.
//   listings → add / edit the store's listings;  orders → handle the store's delivery orders;  manager → both.
// Staff never see or move the store's money (wallet, coupons, reports, payouts stay with the owner).
import { query } from '../db.js';
import { moduleOn } from './settings.js';

export const STAFF_ROLES = ['listings', 'orders', 'manager'];
const CAN = { listings: ['listings', 'manager'], orders: ['orders', 'manager'], manager: ['manager'] };

/** The store this user works for, or null: { store_id, owner_id, role, name, slug }. */
export async function staffOf(userId, client = { query }) {
  if (!(await moduleOn('pro'))) return null; // store staff is part of Souk Pro
  const { rows } = await client.query(
    `SELECT ss.store_id, ss.role, s.owner_id, s.name, s.slug FROM store_staff ss
     JOIN stores s ON s.id = ss.store_id JOIN users o ON o.id = s.owner_id
     WHERE ss.user_id = $1 AND s.is_active AND o.is_active`,
    [userId],
  );
  return rows[0] || null;
}

/** Does `staff` (from staffOf) allow `need` on the store of `ownerId`? */
export const staffAllows = (staff, ownerId, need) => Boolean(staff && staff.owner_id === ownerId && CAN[need].includes(staff.role));

export async function staffCan(userId, ownerId, need) {
  return staffAllows(await staffOf(userId), ownerId, need);
}
