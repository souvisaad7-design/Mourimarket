// Auctions (المزادات). A seller puts one of their listings up for bids for a few hours or days.
// - Bids only go up: the next bid is at least the current one + the step (or the start price).
// - A bid in the last minutes pushes the end back (anti-sniping), so nobody wins by bidding at the last second.
// - Auctions are closed lazily (when someone opens or bids on them, or lists auctions): no paid scheduler needed.
// - At the end, the site opens a chat between the seller and the top bidder. There is no payment through the
//   site: they meet and pay cash on hand-over, like any other sale. A hidden reserve price lets a seller
//   decline to sell below a minimum.
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { limiter } from '../lib/rateLimit.js';
import { getSettings } from '../lib/settings.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireVerifiedPhone } from '../middleware/phone.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';

const router = Router();
const MAX_ACTIVE_PER_SELLER = 10;
const MAX_JUMP = 10; // a bid above 10 × the minimum is almost always a typo (an extra zero)

const bidLimiter = limiter('auction-bid', { windowMs: 10 * 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) });
const createLimiter = limiter('auction-create', { windowMs: 60 * 60 * 1000, limit: 10, keyGenerator: (req) => String(req.user.id) });

/** Smallest bid accepted right now. */
const minBid = (a) => (a.current_bid ? Number(a.current_bid) + Number(a.min_increment) : Number(a.start_price));

/** Close one auction (row locked by the caller): pick the winner, open their chat with the seller, notify. */
async function finalize(client, a) {
  const hasBids = a.bid_count > 0 && a.current_bidder_id;
  const reserveMet = hasBids && (!a.reserve_price || Number(a.current_bid) >= Number(a.reserve_price));
  const { rows: prows } = await client.query('SELECT title FROM products WHERE id = $1', [a.product_id]);
  const title = prows[0]?.title || '';
  let conversationId = null;
  if (hasBids) {
    // The top bidder and the seller get a chat with an "auction result" card, even when the reserve
    // was not met (they may still agree on a price).
    const { rows } = await client.query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES ($1, $2, $3)
       ON CONFLICT (product_id, buyer_id, seller_id) DO UPDATE SET last_message_at = now() RETURNING id`,
      [a.product_id, a.current_bidder_id, a.seller_id],
    );
    conversationId = rows[0].id;
    await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body, kind, amount, offer_status) VALUES ($1, $2, '', 'auction', $3, $4)`,
      [conversationId, a.seller_id, a.current_bid, reserveMet ? 'accepted' : 'pending'],
    );
  }
  await client.query(
    `UPDATE auctions SET status = 'ended', ended_at = now(), winner_id = $2, reserve_met = $3, conversation_id = $4 WHERE id = $1`,
    [a.id, reserveMet ? a.current_bidder_id : null, hasBids ? reserveMet : null, conversationId],
  );
  const data = { title, amount: Number(a.current_bid || 0), auctionId: a.id, productId: a.product_id, conversationId };
  const chat = conversationId ? `/messages/${conversationId}` : `/products/${a.product_id}`;
  if (!hasBids) await notify(a.seller_id, 'auction_no_bids', data, `/products/${a.product_id}`, client);
  else if (reserveMet) {
    await notify(a.current_bidder_id, 'auction_won', data, chat, client);
    await notify(a.seller_id, 'auction_sold', data, chat, client);
  } else {
    await notify(a.current_bidder_id, 'auction_reserve_unmet', data, chat, client);
    await notify(a.seller_id, 'auction_reserve_unmet_seller', data, chat, client);
  }
  if (hasBids) {
    const { rows: others } = await client.query(
      'SELECT DISTINCT bidder_id FROM auction_bids WHERE auction_id = $1 AND bidder_id <> $2 LIMIT 100', [a.id, a.current_bidder_id],
    );
    for (const o of others) await notify(o.bidder_id, 'auction_lost', data, `/products/${a.product_id}`, client);
  }
}

/** Close one auction if its time is up. */
async function closeIfDue(id) {
  await tx(async (client) => {
    const { rows } = await client.query(
      "SELECT * FROM auctions WHERE id = $1 AND status = 'active' AND ends_at <= now() FOR UPDATE SKIP LOCKED", [id],
    );
    if (rows[0]) await finalize(client, rows[0]);
  });
}

let lastSweep = 0;
/** Close auctions whose time is up (at most every 15 s per server instance, a few at a time). */
export async function closeDueAuctions({ force = false } = {}) {
  if (!force && Date.now() - lastSweep < 15_000) return;
  lastSweep = Date.now();
  const { rows } = await query("SELECT id FROM auctions WHERE status = 'active' AND ends_at <= now() ORDER BY ends_at LIMIT 20");
  for (const r of rows) await closeIfDue(r.id);
}

/** Public view of an auction. The reserve amount stays secret (only the seller sees it). */
function view(a, user, bids = null) {
  const isSeller = user && user.id === a.seller_id;
  const out = {
    id: a.id, product_id: a.product_id, seller_id: a.seller_id, status: a.status,
    start_price: Number(a.start_price), min_increment: Number(a.min_increment),
    current_bid: a.current_bid === null ? null : Number(a.current_bid), bid_count: a.bid_count,
    min_bid: minBid(a), ends_at: a.ends_at, created_at: a.created_at, ended_at: a.ended_at,
    has_reserve: a.reserve_price !== null,
    reserve_reached: a.reserve_price === null || (a.current_bid !== null && Number(a.current_bid) >= Number(a.reserve_price)),
    reserve_met: a.reserve_met, cancel_reason: a.cancel_reason,
    is_seller: Boolean(isSeller),
    is_leading: Boolean(user && a.current_bidder_id === user.id),
    is_winner: Boolean(user && a.winner_id === user.id),
    // The chat opened at the end, for the two people in it.
    conversation_id: user && (isSeller || a.current_bidder_id === user.id) ? a.conversation_id : null,
  };
  if (isSeller) out.reserve_price = a.reserve_price === null ? null : Number(a.reserve_price);
  if (bids) out.bids = bids;
  return out;
}

/** Bid history: names are shortened for everyone but the seller (who needs to know who bids). */
async function loadBids(a, user) {
  const { rows } = await query(
    `SELECT b.id, b.amount, b.created_at, b.bidder_id, u.name FROM auction_bids b JOIN users u ON u.id = b.bidder_id
     WHERE b.auction_id = $1 ORDER BY b.amount DESC, b.id DESC LIMIT 30`, [a.id],
  );
  const isSeller = user && user.id === a.seller_id;
  return rows.map((b) => ({
    id: b.id, amount: Number(b.amount), created_at: b.created_at, is_me: Boolean(user && b.bidder_id === user.id),
    name: isSeller ? b.name : `${[...String(b.name || '?').trim()][0] || '?'}***`,
    bidder_id: isSeller ? b.bidder_id : undefined,
  }));
}

// ---------- Reading ----------

/** GET /api/auctions?status=active|ended&mine=1&bidding=1&category=&city= */
router.get('/auctions', optionalAuth, async (req, res) => {
  await closeDueAuctions();
  const { limit, offset, page } = pagination(req.query, { defaultLimit: 24 });
  const params = [];
  const where = ["p.status = 'approved'", 'u.is_active'];
  const add = (sql, v) => { params.push(v); where.push(sql.replaceAll('?', `$${params.length}`)); };
  const status = req.query.status === 'ended' ? 'ended' : 'active';
  add('a.status = ?', status);
  if (req.query.mine === '1' && req.user) add('a.seller_id = ?', req.user.id);
  if (req.query.bidding === '1' && req.user) add('EXISTS (SELECT 1 FROM auction_bids b WHERE b.auction_id = a.id AND b.bidder_id = ?)', req.user.id);
  if (typeof req.query.category === 'string' && req.query.category) add('c.slug = ?', req.query.category.slice(0, 60));
  if (typeof req.query.city === 'string' && req.query.city) add('p.city = ?', req.query.city.slice(0, 40));
  const from = `${PRODUCT_FROM} JOIN auctions a ON a.product_id = p.id`;
  const w = `WHERE ${where.join(' AND ')}`;
  const order = status === 'active' ? 'a.ends_at ASC' : 'a.ended_at DESC';
  const [items, total] = await Promise.all([
    query(`SELECT ${PRODUCT_SELECT}, a.id AS a_id ${from} ${w} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS n ${from} ${w}`, params),
  ]);
  res.json({ items: items.rows.map(({ a_id: _, ...p }) => p), total: Number(total.rows[0].n), page, limit });
});

async function loadAuction(id) {
  const { rows } = await query('SELECT * FROM auctions WHERE id = $1', [parseInt(id, 10) || 0]);
  if (!rows[0]) throw notFound('auction_not_found');
  return rows[0];
}

/** GET /api/auctions/:id */
router.get('/auctions/:id', optionalAuth, async (req, res) => {
  let a = await loadAuction(req.params.id);
  if (a.status === 'active' && new Date(a.ends_at) <= new Date()) { await closeIfDue(a.id); a = await loadAuction(a.id); }
  res.json({ auction: view(a, req.user, await loadBids(a, req.user)) });
});

/** GET /api/products/:id/auction – the listing's running auction, or its latest one (null if none). */
router.get('/products/:id/auction', optionalAuth, async (req, res) => {
  const pid = parseInt(req.params.id, 10) || 0;
  const find = () => query(
    "SELECT * FROM auctions WHERE product_id = $1 AND status <> 'cancelled' ORDER BY (status = 'active') DESC, id DESC LIMIT 1", [pid],
  );
  let a = (await find()).rows[0];
  if (a && a.status === 'active' && new Date(a.ends_at) <= new Date()) { await closeIfDue(a.id); a = (await find()).rows[0]; }
  // An ended auction is only worth showing for a few days.
  if (a && a.status === 'ended' && Date.now() - new Date(a.ended_at) > 7 * 86_400_000) a = null;
  res.json({ auction: a ? view(a, req.user, await loadBids(a, req.user)) : null });
});

// ---------- Selling ----------

/** POST /api/auctions { productId, startPrice, minIncrement?, reservePrice?, hours } */
router.post('/auctions', requireAuth, requireVerifiedPhone, createLimiter, async (req, res) => {
  const settings = (await getSettings()).auctions;
  if (!settings.enabled) throw forbidden('auctions_disabled');
  const d = parse(z.object({
    productId: z.coerce.number().int().positive(),
    startPrice: z.coerce.number().int().min(1).max(1e11),
    minIncrement: z.coerce.number().int().min(1).max(1e10).optional().nullable(),
    reservePrice: z.coerce.number().int().min(1).max(1e11).optional().nullable(),
    hours: z.coerce.number().int().min(1).max(24 * 30),
  }), req.body);
  if (d.hours < settings.minHours || d.hours > settings.maxDays * 24) throw badRequest('validation_error', { hours: 'out_of_range' });
  if (d.reservePrice && d.reservePrice < d.startPrice) throw badRequest('validation_error', { reservePrice: 'below_start' });
  const { rows: prows } = await query('SELECT id, seller_id, status, availability, title FROM products WHERE id = $1', [d.productId]);
  const p = prows[0];
  if (!p) throw notFound('product_not_found');
  if (p.seller_id !== req.user.id) throw forbidden();
  if (p.status !== 'approved') throw badRequest('product_not_approved');
  if (p.availability !== 'available') throw badRequest('product_sold');
  const { rows: cnt } = await query("SELECT COUNT(*)::int AS n FROM auctions WHERE seller_id = $1 AND status = 'active'", [req.user.id]);
  if (cnt[0].n >= MAX_ACTIVE_PER_SELLER) throw badRequest('too_many_auctions');
  // Default step: about 2 % of the start price, rounded to a nice number (at least 10 MRU).
  const step = d.minIncrement || Math.max(10, Number((d.startPrice * 0.02).toPrecision(1)));
  try {
    const { rows } = await query(
      `INSERT INTO auctions (product_id, seller_id, start_price, min_increment, reserve_price, ends_at)
       VALUES ($1, $2, $3, $4, $5, now() + ($6 || ' hours')::interval) RETURNING *`,
      [p.id, req.user.id, d.startPrice, step, d.reservePrice || null, String(d.hours)],
    );
    res.status(201).json({ auction: view(rows[0], req.user, []) });
  } catch (err) {
    if (err.code === '23505') throw conflict('auction_exists');
    throw err;
  }
});

/** POST /api/auctions/:id/cancel { reason? } – the seller (only before any bid) or an admin. */
router.post('/auctions/:id/cancel', requireAuth, async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().trim().max(200).optional() }), req.body || {});
  const isAdmin = req.user.role === 'admin';
  const a = await tx(async (client) => {
    const { rows } = await client.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [parseInt(req.params.id, 10) || 0]);
    const row = rows[0];
    if (!row) throw notFound('auction_not_found');
    if (!isAdmin && row.seller_id !== req.user.id) throw forbidden();
    if (row.status !== 'active') throw conflict('auction_closed');
    if (!isAdmin && row.bid_count > 0) throw conflict('auction_has_bids');
    const { rows: out } = await client.query(
      "UPDATE auctions SET status = 'cancelled', ended_at = now(), cancel_reason = $2 WHERE id = $1 RETURNING *", [row.id, reason || null],
    );
    const { rows: bidders } = await client.query('SELECT DISTINCT bidder_id FROM auction_bids WHERE auction_id = $1 LIMIT 100', [row.id]);
    const { rows: prows } = await client.query('SELECT title FROM products WHERE id = $1', [row.product_id]);
    for (const b of bidders) {
      await notify(b.bidder_id, 'auction_cancelled', { title: prows[0]?.title || '', productId: row.product_id }, `/products/${row.product_id}`, client);
    }
    if (isAdmin && row.seller_id !== req.user.id) {
      await notify(row.seller_id, 'auction_cancelled', { title: prows[0]?.title || '', productId: row.product_id, reason: reason || '' }, `/products/${row.product_id}`, client);
    }
    return out[0];
  });
  res.json({ auction: view(a, req.user) });
});

// ---------- Bidding ----------

/** POST /api/auctions/:id/bids { amount } */
router.post('/auctions/:id/bids', requireAuth, requireVerifiedPhone, bidLimiter, async (req, res) => {
  const { amount } = parse(z.object({ amount: z.coerce.number().int().min(1).max(1e12) }), req.body);
  const id = parseInt(req.params.id, 10) || 0;
  const settings = (await getSettings()).auctions;
  let ended = false;
  const result = await tx(async (client) => {
    const { rows } = await client.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [id]);
    const a = rows[0];
    if (!a) throw notFound('auction_not_found');
    if (a.status !== 'active') throw conflict('auction_closed');
    if (new Date(a.ends_at) <= new Date()) { ended = true; return null; }
    if (a.seller_id === req.user.id) throw forbidden('cannot_bid_own');
    const { rows: prows } = await client.query(
      'SELECT p.title, p.status, p.availability, u.is_active FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = $1', [a.product_id],
    );
    const p = prows[0];
    if (!p || p.status !== 'approved' || !p.is_active) throw conflict('auction_closed');
    if (p.availability !== 'available') throw conflict('product_sold');
    if (a.current_bidder_id === req.user.id) throw conflict('already_leading');
    const min = minBid(a);
    if (amount < min) throw badRequest('bid_too_low', { min });
    if (amount > min * MAX_JUMP) throw badRequest('bid_too_high', { max: min * MAX_JUMP });
    await client.query('INSERT INTO auction_bids (auction_id, bidder_id, amount) VALUES ($1, $2, $3)', [a.id, req.user.id, amount]);
    // Anti-sniping: a bid in the last minutes gives everyone a few more minutes to answer.
    const { rows: up } = await client.query(
      `UPDATE auctions SET current_bid = $2, current_bidder_id = $3, bid_count = bid_count + 1,
         ends_at = GREATEST(ends_at, now() + ($4 || ' minutes')::interval) WHERE id = $1 RETURNING *`,
      [a.id, amount, req.user.id, String(settings.extendMinutes)],
    );
    const data = { title: p.title, amount, auctionId: a.id, productId: a.product_id };
    if (a.current_bidder_id) await notify(a.current_bidder_id, 'auction_outbid', data, `/products/${a.product_id}`, client);
    await notify(a.seller_id, 'auction_bid', { ...data, from: req.user.name }, `/products/${a.product_id}`, client);
    return up[0];
  });
  if (ended) { await closeIfDue(id); throw conflict('auction_closed'); }
  res.status(201).json({ auction: view(result, req.user, await loadBids(result, req.user)) });
});

export default router;
