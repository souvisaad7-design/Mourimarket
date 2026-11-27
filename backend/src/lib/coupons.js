// Seller discount coupons on delivery orders. The discount comes off the item price (never the delivery fee).
import { badRequest } from './http.js';
import { moduleOn } from './settings.js';

export const normalizeCode = (code) => String(code || '').trim().toUpperCase().replace(/\s+/g, '');

/** Check a code for this seller and item price. Returns { coupon, discount } or throws a clear error. */
export async function checkCoupon(client, sellerId, code, itemPrice) {
  const c = normalizeCode(code);
  if (!c) return { coupon: null, discount: 0 };
  if (!(await moduleOn('pro'))) throw badRequest('coupon_invalid'); // coupons are part of Souk Pro
  const { rows } = await client.query('SELECT * FROM coupons WHERE seller_id = $1 AND code = $2', [sellerId, c]);
  const coupon = rows[0];
  if (!coupon || !coupon.is_active) throw badRequest('coupon_invalid');
  if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) throw badRequest('coupon_expired');
  if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) throw badRequest('coupon_used_up');
  if (itemPrice < Number(coupon.min_total)) throw badRequest('coupon_min_total', { min: Number(coupon.min_total) });
  const discount = coupon.kind === 'percent'
    ? Math.round((itemPrice * Number(coupon.value)) / 100)
    : Math.min(Number(coupon.value), itemPrice);
  return { coupon, discount };
}

/** Count one use, atomically (fails if the last use was just taken). */
export async function useCoupon(client, couponId) {
  const { rowCount } = await client.query(
    'UPDATE coupons SET uses = uses + 1 WHERE id = $1 AND is_active AND (max_uses IS NULL OR uses < max_uses)', [couponId],
  );
  if (!rowCount) throw badRequest('coupon_used_up');
}
