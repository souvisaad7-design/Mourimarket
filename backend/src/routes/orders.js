// Delivery orders (cash on delivery) and delivery partners (couriers).
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { assertCity, cityKey } from '../lib/cities.js';
import { FLOW, OPEN_STATUSES, quote } from '../lib/delivery.js';
import { badRequest, conflict, forbidden, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { normalizePhone } from '../lib/phone.js';
import { getSettings } from '../lib/settings.js';
import { onDelivered } from '../lib/pay.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { requireVerifiedPhone } from '../middleware/phone.js';

const router = Router();
router.use(['/orders', '/couriers'], requireAuth);
const writeLimiter = limiter('orders-write', { windowMs: 60 * 1000, limit: 40, keyGenerator: (req) => String(req.user.id) });
const quoteLimiter = limiter('orders-quote', { windowMs: 60 * 1000, limit: 60, keyGenerator: (req) => String(req.user.id) });

const emptyToNull = (v) => (v === '' || v === undefined || v === null ? null : v);
const coord = (min, max) => z.preprocess(emptyToNull, z.coerce.number().min(min).max(max).nullable()).default(null);
const destSchema = z.object({
  productId: z.coerce.number().int().positive(),
  city: cityKey,
  area: z.string().trim().max(80).optional().transform((v) => v || null),
  lat: coord(14, 28),
  lng: coord(-18, -4),
});

async function loadOrderable(productId, userId) {
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.city, p.lat, p.lng, p.seller_id, p.status, p.availability, u.is_active
     FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = $1`,
    [productId],
  );
  const p = rows[0];
  if (!p || p.status !== 'approved' || !p.is_active) throw notFound('product_not_found');
  if (p.availability !== 'available') throw badRequest('product_sold');
  if (p.seller_id === userId) throw badRequest('own_product');
  return p;
}

async function deliverySettings() {
  const d = (await getSettings()).delivery;
  if (!d.enabled) throw forbidden('delivery_disabled');
  return d;
}

/** POST /api/orders/quote – item price, delivery fee and total before confirming. */
router.post('/orders/quote', quoteLimiter, async (req, res) => {
  const d = parse(destSchema, req.body);
  await assertCity(d.city);
  const pricing = await deliverySettings();
  const product = await loadOrderable(d.productId, req.user.id);
  const q = await quote(pricing, product, d);
  res.json({ itemPrice: q.itemPrice, deliveryFee: q.deliveryFee, total: q.itemPrice + q.deliveryFee, distanceKm: q.distanceKm, interCity: q.interCity, deliverable: q.deliverable, maxKm: pricing.maxKm });
});

const orderSchema = destSchema.extend({
  district: z.string().trim().max(80).optional().transform((v) => v || null),
  address: z.string().trim().max(300).optional().transform((v) => v || null),
  phone: z.string().trim().min(1, 'required').max(30),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
  paymentMethod: z.enum(['cod', 'escrow']).default('cod'),
});

/** POST /api/orders – order with delivery, paid in cash on delivery. */
router.post('/orders', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const d = parse(orderSchema, req.body);
  await assertCity(d.city);
  const phone = normalizePhone(d.phone);
  if (!phone) throw badRequest('validation_error', { phone: 'invalid_phone' });
  const pricing = await deliverySettings();
  const product = await loadOrderable(d.productId, req.user.id);
  const q = await quote(pricing, product, d);
  if (!q.deliverable) throw badRequest('too_far');
  if (d.paymentMethod === 'escrow' && !pricing.escrow) throw badRequest('escrow_disabled');
  const order = await tx(async (client) => {
    let rows;
    try {
      ({ rows } = await client.query(
        `INSERT INTO orders (product_id, product_title, buyer_id, seller_id, item_price, delivery_fee, total, distance_km,
           city, area, district, address, phone, lat, lng, pickup_city, pickup_lat, pickup_lng, note, payment_method, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id, status, total, payment_method, payment_status`,
        [product.id, product.title, req.user.id, product.seller_id, q.itemPrice, q.deliveryFee, q.itemPrice + q.deliveryFee, q.distanceKm,
          d.city, d.area, d.district, d.address, phone, d.lat, d.lng, product.city, q.pickup?.lat ?? null, q.pickup?.lng ?? null, d.note,
          d.paymentMethod, d.paymentMethod === 'escrow' ? 'awaiting_payment' : null],
      ));
    } catch (err) {
      if (err.code === '23505') throw conflict('order_exists');
      throw err;
    }
    await client.query("INSERT INTO order_events (order_id, status, actor_id, actor_role) VALUES ($1, 'pending', $2, 'buyer')", [rows[0].id, req.user.id]);
    await notify(product.seller_id, 'order_new', { id: rows[0].id, title: product.title }, `/orders/${rows[0].id}`, client);
    return rows[0];
  });
  res.status(201).json({ order });
});

// ---------- Reading orders (what each person may see) ----------

async function courierOf(userId) {
  return (await query('SELECT * FROM couriers WHERE user_id = $1', [userId])).rows[0] || null;
}

/** Roles the user has on this order: buyer, seller, courier, admin. */
function rolesOn(order, user, courier) {
  const roles = [];
  if (order.buyer_id === user.id) roles.push('buyer');
  if (order.seller_id === user.id) roles.push('seller');
  if (courier && order.courier_id === courier.id) roles.push('courier');
  if (user.role === 'admin') roles.push('admin');
  return roles;
}

const ORDER_SELECT = `
  o.*, b.name AS buyer_name, s.name AS seller_name, s.phone AS seller_phone,
  cu.name AS courier_name, c.phone AS courier_phone, c.vehicle AS courier_vehicle, c.user_id AS courier_user_id,
  c.share_location AS courier_sharing, c.last_lat AS courier_lat, c.last_lng AS courier_lng, c.last_seen_at AS courier_seen_at,
  (SELECT ROUND(AVG(rating)::numeric, 1) FROM delivery_ratings r WHERE r.courier_id = o.courier_id) AS courier_rating,
  (SELECT url FROM product_images i WHERE i.product_id = o.product_id ORDER BY sort_order, id LIMIT 1) AS cover_url`;
const ORDER_FROM = `
  FROM orders o JOIN users b ON b.id = o.buyer_id JOIN users s ON s.id = o.seller_id
  LEFT JOIN couriers c ON c.id = o.courier_id LEFT JOIN users cu ON cu.id = c.user_id`;

/**
 * Remove what a role must not see. The delivery address, phone and pin are for the buyer,
 * the assigned courier and admins; the seller sees the city / moughataa / neighbourhood only.
 * The courier's live position is shown to the buyer and admins while the parcel is on its way,
 * and only if the courier agreed to share it.
 */
function shape(o, roles) {
  const full = roles.includes('buyer') || roles.includes('courier') || roles.includes('admin');
  const out = { ...o, my_roles: roles };
  if (!full) { delete out.address; delete out.phone; delete out.lat; delete out.lng; }
  // Payment proof is between the buyer and the admins.
  if (!roles.includes('buyer') && !roles.includes('admin')) { delete out.pay_ref; delete out.pay_receipt_file_id; }
  const tracking = ['picked_up', 'on_the_way'].includes(o.status) && o.courier_sharing && o.courier_lat != null
    && o.courier_seen_at && Date.now() - new Date(o.courier_seen_at).getTime() < 15 * 60 * 1000;
  out.courier_location = tracking && (roles.includes('buyer') || roles.includes('admin'))
    ? { lat: o.courier_lat, lng: o.courier_lng, at: o.courier_seen_at } : null;
  delete out.courier_lat; delete out.courier_lng;
  if (!roles.includes('admin') && !roles.includes('buyer') && !roles.includes('courier')) delete out.courier_phone;
  if (!o.courier_id) { delete out.courier_phone; }
  if (!roles.includes('seller') && !roles.includes('courier') && !roles.includes('admin')) delete out.seller_phone;
  return out;
}

/** GET /api/orders?as=buyer|seller|courier – my orders (history included). */
router.get('/orders', async (req, res) => {
  const as = ['buyer', 'seller', 'courier'].includes(req.query.as) ? req.query.as : 'buyer';
  const courier = await courierOf(req.user.id);
  if (as === 'courier' && !courier) return res.json({ items: [] });
  const where = as === 'buyer' ? 'o.buyer_id = $1' : as === 'seller' ? 'o.seller_id = $1' : 'o.courier_id = $1';
  const { rows } = await query(
    `SELECT ${ORDER_SELECT} ${ORDER_FROM} WHERE ${where} ORDER BY (o.status IN ('delivered', 'cancelled')), o.created_at DESC LIMIT 100`,
    [as === 'courier' ? courier.id : req.user.id],
  );
  res.json({ items: rows.map((o) => shape(o, rolesOn(o, req.user, courier))) });
});

/** GET /api/orders/:id – detail, timeline and rating, for the people involved. */
router.get('/orders/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query(`SELECT ${ORDER_SELECT} ${ORDER_FROM} WHERE o.id = $1`, [id]);
  const o = rows[0];
  if (!o) throw notFound('order_not_found');
  const courier = await courierOf(req.user.id);
  const roles = rolesOn(o, req.user, courier);
  if (!roles.length) throw notFound('order_not_found');
  const [events, rating] = await Promise.all([
    query(`SELECT e.status, e.actor_role, e.note, e.created_at FROM order_events e WHERE e.order_id = $1 ORDER BY e.id`, [id]),
    query('SELECT rating, comment, created_at FROM delivery_ratings WHERE order_id = $1', [id]),
  ]);
  const order = shape(o, roles);
  order.events = events.rows;
  order.rating = rating.rows[0] || null;
  order.next = Object.entries(FLOW[o.status] || {})
    .filter(([, who]) => who.some((r) => roles.includes(r)))
    .map(([status]) => status)
    .filter((s) => s !== 'picked_up' || o.courier_id)
    .filter((s) => s !== 'accepted' || o.payment_method !== 'escrow' || o.payment_status === 'held');
  order.can_rate = roles.includes('buyer') && o.status === 'delivered' && Boolean(o.courier_id) && !rating.rows[0];
  res.json({ order });
});

/** Tell the buyer, the seller and the courier (except whoever made the change). */
async function notifyParties(o, type, data, actorId, client) {
  const userIds = new Set([o.buyer_id, o.seller_id]);
  if (o.courier_user_id) userIds.add(o.courier_user_id);
  userIds.delete(actorId);
  for (const uid of userIds) await notify(uid, type, data, `/orders/${o.id}`, client);
}

/** POST /api/orders/:id/status { status, note } – move the order along (rules in lib/delivery.js). */
router.post('/orders/:id/status', writeLimiter, async (req, res) => {
  const d = parse(z.object({ status: z.enum(['accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled']), note: z.string().trim().max(300).optional() }), req.body);
  const id = parseInt(req.params.id, 10) || 0;
  const courier = await courierOf(req.user.id);
  const result = await tx(async (client) => {
    const o = (await client.query(
      `SELECT o.*, c.user_id AS courier_user_id FROM orders o LEFT JOIN couriers c ON c.id = o.courier_id WHERE o.id = $1 FOR UPDATE OF o`, [id],
    )).rows[0];
    if (!o) throw notFound('order_not_found');
    const roles = rolesOn(o, req.user, courier);
    if (!roles.length) throw notFound('order_not_found');
    const allowed = FLOW[o.status]?.[d.status];
    if (!allowed) throw badRequest('invalid_transition');
    const role = roles.find((r) => allowed.includes(r));
    if (!role) throw forbidden('not_allowed');
    if (d.status === 'picked_up' && !o.courier_id) throw badRequest('no_courier');
    if (d.status === 'accepted' && o.payment_method === 'escrow' && o.payment_status !== 'held') throw badRequest('payment_not_confirmed');
    if (d.status === 'cancelled' && role !== 'buyer' && !d.note) throw badRequest('validation_error', { note: 'required' });

    await client.query(
      `UPDATE orders SET status = $1, updated_at = now(),
         delivered_at = CASE WHEN $1 = 'delivered' THEN now() ELSE delivered_at END,
         cancel_reason = CASE WHEN $1 = 'cancelled' THEN $2 ELSE cancel_reason END,
         cancelled_by = CASE WHEN $1 = 'cancelled' THEN $3 ELSE cancelled_by END
       WHERE id = $4`,
      [d.status, d.note || null, role, id],
    );
    await client.query('INSERT INTO order_events (order_id, status, actor_id, actor_role, note) VALUES ($1, $2, $3, $4, $5)', [id, d.status, req.user.id, role, d.note || null]);
    if (d.status === 'cancelled' && ['submitted', 'held'].includes(o.payment_status)) {
      await client.query("UPDATE orders SET payment_status = 'refund_due', payment_updated_at = now() WHERE id = $1", [id]);
    }
    if (d.status === 'delivered') await onDelivered(client, o, o.courier_user_id, req.user.id);
    if (d.status === 'delivered' && o.product_id) {
      // A delivered order is a documented sale: the listing is sold to this buyer (unlocks the review).
      await client.query(`UPDATE products SET availability = 'sold', sold_to_id = $1, updated_at = now() WHERE id = $2 AND availability = 'available'`, [o.buyer_id, o.product_id]);
    }
    await notifyParties(o, 'order_status', { id, title: o.product_title, status: d.status }, req.user.id, client);
    if (d.status === 'accepted') {
      // Let available couriers of the pick-up city know there is a delivery to take.
      const { rows } = await client.query(
        `SELECT user_id FROM couriers WHERE status = 'approved' AND is_available AND city = $1 AND user_id <> ALL($2::int[]) LIMIT 50`,
        [o.pickup_city || o.city, [o.buyer_id, o.seller_id]],
      );
      for (const r of rows) await notify(r.user_id, 'order_available', { id, title: o.product_title }, '/courier', client);
    }
    return { status: d.status };
  });
  res.json(result);
});

/** POST /api/orders/:id/rate { rating, comment } – the buyer rates the delivery. */
router.post('/orders/:id/rate', writeLimiter, async (req, res) => {
  const d = parse(z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(500).optional() }), req.body);
  const id = parseInt(req.params.id, 10) || 0;
  const o = (await query('SELECT o.*, c.user_id AS courier_user_id FROM orders o LEFT JOIN couriers c ON c.id = o.courier_id WHERE o.id = $1', [id])).rows[0];
  if (!o || o.buyer_id !== req.user.id) throw notFound('order_not_found');
  if (o.status !== 'delivered' || !o.courier_id) throw badRequest('cannot_rate');
  try {
    await query('INSERT INTO delivery_ratings (order_id, courier_id, buyer_id, rating, comment) VALUES ($1, $2, $3, $4, $5)', [id, o.courier_id, req.user.id, d.rating, d.comment || null]);
  } catch (err) {
    if (err.code === '23505') throw conflict('already_rated');
    throw err;
  }
  if (o.courier_user_id) await notify(o.courier_user_id, 'delivery_rated', { id, rating: d.rating }, `/orders/${id}`);
  res.status(201).json({ ok: true });
});

// ---------- Delivery partners ----------

const VEHICLES = ['motorbike', 'car', 'bicycle', 'tricycle', 'foot'];

/** POST /api/couriers/apply – ask to become a delivery partner (reviewed by an admin). */
router.post('/couriers/apply', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const d = parse(z.object({
    phone: z.string().trim().min(1, 'required').max(30), city: cityKey, vehicle: z.enum(VEHICLES), note: z.string().trim().max(500).optional(),
  }), req.body);
  await assertCity(d.city);
  const phone = normalizePhone(d.phone);
  if (!phone) throw badRequest('validation_error', { phone: 'invalid_phone' });
  const existing = await courierOf(req.user.id);
  if (existing && existing.status !== 'rejected') throw conflict('already_applied');
  const { rows } = await query(
    `INSERT INTO couriers (user_id, phone, city, vehicle, note) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET status = 'pending', phone = EXCLUDED.phone, city = EXCLUDED.city, vehicle = EXCLUDED.vehicle,
       note = EXCLUDED.note, admin_note = NULL, reviewed_by = NULL, reviewed_at = NULL, created_at = now()
     RETURNING id, status`,
    [req.user.id, phone, d.city, d.vehicle, d.note || null],
  );
  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  for (const a of admins.rows) await notify(a.id, 'courier_application', { name: req.user.name }, '/admin/couriers');
  res.status(201).json({ courier: rows[0] });
});

/** GET /api/couriers/me – my partner profile, stats and rating. */
router.get('/couriers/me', async (req, res) => {
  const c = await courierOf(req.user.id);
  if (!c) return res.json({ courier: null });
  const stats = (await query(
    `SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE status IN ('accepted', 'preparing', 'picked_up', 'on_the_way')) AS active,
            COALESCE(SUM(delivery_fee) FILTER (WHERE status = 'delivered'), 0) AS earned,
            (SELECT ROUND(AVG(rating)::numeric, 1) FROM delivery_ratings WHERE courier_id = $1) AS rating,
            (SELECT COUNT(*) FROM delivery_ratings WHERE courier_id = $1) AS ratings
     FROM orders WHERE courier_id = $1`, [c.id],
  )).rows[0];
  const { last_lat: _a, last_lng: _b, ...safe } = c;
  res.json({ courier: { ...safe, stats } });
});

/** PATCH /api/couriers/me { isAvailable, shareLocation } – availability and consent to tracking. */
router.patch('/couriers/me', async (req, res) => {
  const d = parse(z.object({ isAvailable: z.boolean().optional(), shareLocation: z.boolean().optional() }), req.body);
  const c = await courierOf(req.user.id);
  if (!c || c.status !== 'approved') throw forbidden('not_a_courier');
  const { rows } = await query(
    `UPDATE couriers SET is_available = COALESCE($1, is_available), share_location = COALESCE($2, share_location),
       -- withdrawing consent also forgets the last position
       last_lat = CASE WHEN $2 = false THEN NULL ELSE last_lat END, last_lng = CASE WHEN $2 = false THEN NULL ELSE last_lng END
     WHERE id = $3 RETURNING is_available, share_location`,
    [d.isAvailable ?? null, d.shareLocation ?? null, c.id],
  );
  res.json({ courier: rows[0] });
});

/** POST /api/couriers/me/location { lat, lng } – live position while delivering (only with consent). */
router.post('/couriers/me/location', limiter('courier-location', { windowMs: 60 * 1000, limit: 20, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const d = parse(z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }), req.body);
  const c = await courierOf(req.user.id);
  if (!c || c.status !== 'approved') throw forbidden('not_a_courier');
  if (!c.share_location) throw forbidden('location_sharing_off');
  const active = (await query(`SELECT 1 FROM orders WHERE courier_id = $1 AND status IN ('picked_up', 'on_the_way') LIMIT 1`, [c.id])).rowCount;
  if (!active) return res.json({ ok: true, stored: false }); // nothing to track: the position is not kept
  await query('UPDATE couriers SET last_lat = $1, last_lng = $2, last_seen_at = now() WHERE id = $3', [d.lat, d.lng, c.id]);
  res.json({ ok: true, stored: true });
});

/** GET /api/couriers/available – deliveries waiting for a courier in my city (no customer details yet). */
router.get('/couriers/available', async (req, res) => {
  const c = await courierOf(req.user.id);
  if (!c || c.status !== 'approved') throw forbidden('not_a_courier');
  const { rows } = await query(
    `SELECT o.id, o.product_title, o.status, o.delivery_fee, o.total, o.distance_km, o.city, o.area, o.district, o.pickup_city, o.created_at,
            s.name AS seller_name
     FROM orders o JOIN users s ON s.id = o.seller_id
     WHERE o.courier_id IS NULL AND o.status IN ('accepted', 'preparing') AND COALESCE(o.pickup_city, o.city) = $1
       AND o.buyer_id <> $2 AND o.seller_id <> $2
     ORDER BY o.created_at LIMIT 50`,
    [c.city, req.user.id],
  );
  res.json({ items: rows });
});

/** POST /api/orders/:id/claim – an approved courier takes a delivery. */
router.post('/orders/:id/claim', writeLimiter, async (req, res) => {
  const c = await courierOf(req.user.id);
  if (!c || c.status !== 'approved') throw forbidden('not_a_courier');
  const id = parseInt(req.params.id, 10) || 0;
  const o = await tx(async (client) => {
    const { rows } = await client.query(
      `UPDATE orders SET courier_id = $1, updated_at = now()
       WHERE id = $2 AND courier_id IS NULL AND status IN ('accepted', 'preparing') AND buyer_id <> $3 AND seller_id <> $3
       RETURNING *`,
      [c.id, id, req.user.id],
    );
    if (!rows[0]) throw conflict('order_taken');
    await client.query("INSERT INTO order_events (order_id, status, actor_id, actor_role, note) VALUES ($1, 'courier_assigned', $2, 'courier', NULL)", [id, req.user.id]);
    await notifyParties({ ...rows[0], courier_user_id: req.user.id }, 'order_courier', { id, title: rows[0].product_title, name: req.user.name }, req.user.id, client);
    return rows[0];
  });
  res.json({ order: { id: o.id, status: o.status } });
});

export { VEHICLES };
export default router;
