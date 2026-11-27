// Souk Pay: the money side of delivery orders.
// - Payment providers are pluggable. Two work today at no cost: cash on delivery and manual transfer with a
//   receipt (the "secure payment" flow). Bankily / Masrvi / Sedad gateways are declared but OFF: connecting
//   them needs a merchant contract and API keys from each provider. No card data ever goes through our servers.
// - When an order is delivered, its split is fixed: seller / courier / platform (commission 0 % by default).
// - Every real movement of money is recorded in pay_transfers (who gave how much to whom, how, and who confirmed).
import { query } from '../db.js';
import { getSettings } from './settings.js';

export const PROVIDERS = {
  cod: { kind: 'offline', label: { ar: 'الدفع نقداً عند الاستلام', fr: 'Paiement à la livraison', en: 'Cash on delivery' } },
  manual: { kind: 'manual', label: { ar: 'تحويل يدوي بإيصال (الدفع الآمن)', fr: 'Virement manuel avec reçu', en: 'Manual transfer with receipt' } },
  bankily: { kind: 'gateway', env: 'BANKILY_API_KEY', label: { ar: 'بنكيلي (ربط آلي)', fr: 'Bankily (automatique)', en: 'Bankily (automatic)' } },
  masrvi: { kind: 'gateway', env: 'MASRVI_API_KEY', label: { ar: 'مصرفي (ربط آلي)', fr: 'Masrvi (automatique)', en: 'Masrvi (automatic)' } },
  sedad: { kind: 'gateway', env: 'SEDAD_API_KEY', label: { ar: 'سداد (ربط آلي)', fr: 'Sedad (automatique)', en: 'Sedad (automatic)' } },
};

/** State of each provider, for the admin page. A gateway only becomes usable once someone writes its adapter. */
export async function providerStatus() {
  const s = await getSettings();
  return Object.entries(PROVIDERS).map(([key, p]) => {
    if (p.kind === 'offline') return { key, kind: p.kind, label: p.label, active: s.delivery.enabled };
    if (p.kind === 'manual') return { key, kind: p.kind, label: p.label, active: s.delivery.enabled && s.delivery.escrow };
    return { key, kind: p.kind, label: p.label, active: false, configured: Boolean(process.env[p.env]), reason: 'needs_contract' };
  });
}

/** A gateway adapter would verify the provider's signature here. None is connected: every call is refused. */
export function gatewayFor(key) {
  const p = PROVIDERS[key];
  if (!p || p.kind !== 'gateway') return null;
  return { key, enabled: false };
}

/** Split a delivered order: seller gets the item price − commission, courier the fee − delivery commission. */
export function split(order, pct, deliveryPct, hasCourier) {
  const item = Number(order.item_price);
  const fee = Number(order.delivery_fee);
  const commission = Math.round((item * pct) / 100);
  const feeCut = hasCourier ? Math.round((fee * deliveryPct) / 100) : 0;
  const courier = hasCourier ? fee - feeCut : 0;
  // Without a courier (an admin closed the order), the seller handled the delivery and keeps the fee.
  const seller = item - commission + (hasCourier ? 0 : fee);
  return { seller, courier, platform: commission + feeCut, total: item + fee };
}

/** Record a movement of money. */
export async function transfer(client, t) {
  const { rows } = await client.query(
    `INSERT INTO pay_transfers (order_id, from_account, from_user, to_account, to_user, amount, kind, method, ref, note, status, created_by, confirmed_by, confirmed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::varchar, $12, $13, CASE WHEN $11::varchar = 'confirmed' THEN now() END) RETURNING *`,
    [t.orderId ?? null, t.from, t.fromUser ?? null, t.to, t.toUser ?? null, t.amount, t.kind, t.method || 'cash', t.ref || null, t.note || null,
      t.status || 'confirmed', t.by ?? null, (t.status || 'confirmed') === 'confirmed' ? (t.by ?? null) : null],
  );
  return rows[0];
}

/**
 * Called when an order becomes delivered (inside its transaction): fix the split and, for cash on delivery,
 * record that the courier (or the seller) collected the cash from the buyer.
 */
export async function onDelivered(client, order, courierUserId, actorId) {
  const s = (await getSettings()).pay;
  const hasCourier = Boolean(courierUserId);
  const parts = split(order, s.commissionPct, s.deliveryCommissionPct, hasCourier);
  const inserted = await client.query(
    `INSERT INTO order_settlements (order_id, method, total, seller_id, seller_amount, courier_user_id, courier_amount, platform_amount, commission_pct, delivery_pct)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (order_id) DO NOTHING RETURNING order_id`,
    [order.id, order.payment_method === 'escrow' ? 'escrow' : 'cod', parts.total, order.seller_id, parts.seller, courierUserId || null,
      parts.courier, parts.platform, s.commissionPct, hasCourier ? s.deliveryCommissionPct : 0],
  );
  if (!inserted.rowCount || order.payment_method === 'escrow') return; // escrow money is already with the platform
  await transfer(client, {
    orderId: order.id, from: 'buyer', fromUser: order.buyer_id,
    to: hasCourier ? 'courier' : 'seller', toUser: hasCourier ? courierUserId : order.seller_id,
    amount: parts.total, kind: 'cod_collected', by: actorId,
  });
}

/** When an admin confirms a manual payment: the platform now holds the buyer's money. */
export async function onEscrowHeld(client, order, adminId) {
  await transfer(client, {
    orderId: order.id, from: 'buyer', fromUser: order.buyer_id, to: 'escrow', amount: Number(order.total),
    kind: 'escrow_in', method: order.pay_channel || 'other', ref: order.pay_ref, by: adminId,
  });
}

/** Paying out a secure-payment order: seller, courier and platform shares leave the escrow. */
export async function onEscrowReleased(client, order, adminId, ref) {
  const st = (await client.query('SELECT * FROM order_settlements WHERE order_id = $1', [order.id])).rows[0];
  if (!st) return null;
  const legs = [
    ['seller', st.seller_id, Number(st.seller_amount)],
    ['courier', st.courier_user_id, Number(st.courier_amount)],
    ['platform', null, Number(st.platform_amount)],
  ];
  for (const [to, user, amount] of legs) {
    if (amount > 0) await transfer(client, { orderId: order.id, from: 'escrow', to, toUser: user, amount, kind: 'payout', method: order.pay_channel || 'other', ref, by: adminId });
  }
  return st;
}

/** Refunding a secure-payment order: the whole amount goes back to the buyer, and any split is void. */
export async function onEscrowRefunded(client, order, adminId, ref) {
  await client.query('UPDATE order_settlements SET is_void = true WHERE order_id = $1', [order.id]);
  await transfer(client, {
    orderId: order.id, from: 'escrow', to: 'buyer', toUser: order.buyer_id, amount: Number(order.total),
    kind: 'refund', method: order.pay_channel || 'other', ref, by: adminId,
  });
}

/**
 * A user's position as seller and as courier.
 * seller.due = what they should get − what they received (from couriers, buyers, the escrow…)
 * courier.cash = cash they collected − what they handed over − their own share (what they must still hand over)
 */
export async function positionOf(userId) {
  const { rows } = await query(
    `SELECT
       COALESCE((SELECT SUM(seller_amount) FROM order_settlements WHERE seller_id = $1 AND NOT is_void), 0) AS seller_entitled,
       COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE to_account = 'seller' AND to_user = $1 AND status = 'confirmed'), 0) AS seller_in,
       COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE from_account = 'seller' AND from_user = $1 AND status = 'confirmed'), 0) AS seller_out,
       COALESCE((SELECT SUM(courier_amount) FROM order_settlements WHERE courier_user_id = $1 AND NOT is_void), 0) AS courier_entitled,
       COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE to_account = 'courier' AND to_user = $1 AND status = 'confirmed'), 0) AS courier_in,
       COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE from_account = 'courier' AND from_user = $1 AND status = 'confirmed'), 0) AS courier_out,
       COALESCE((SELECT SUM(amount) FROM pay_transfers WHERE from_account = 'courier' AND from_user = $1 AND status IN ('pending', 'disputed')), 0) AS courier_pending`,
    [userId],
  );
  const r = Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, Number(v)]));
  const sellerHeld = r.seller_in - r.seller_out;
  const courierHeld = r.courier_in - r.courier_out;
  return {
    seller: { entitled: r.seller_entitled, received: sellerHeld, due: r.seller_entitled - sellerHeld },
    courier: { earned: r.courier_entitled, cash: courierHeld - r.courier_entitled, pending: r.courier_pending },
  };
}
