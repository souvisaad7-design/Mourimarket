// Authenticated user features: favorites, messaging, notifications, reviews, reports.
import { Router } from 'express';
import { limiter } from '../lib/rateLimit.js';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { PAYMENT_METHODS, REPORT_REASONS } from '../lib/constants.js';
import { getSettings, paidUpgradesEnabled } from '../lib/settings.js';
import { badRequest, conflict, forbidden, notFound, pagination, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { requireAuth } from '../middleware/auth.js';
import { requireVerifiedPhone } from '../middleware/phone.js';
import { chatUpload, saveChatMedia, savePrivateFile, sendFile, upload } from '../middleware/upload.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from './products.js';

const router = Router();
router.use(requireAuth);

// Light anti-spam on anything that writes user-generated text.
const writeLimiter = limiter('account-write', { windowMs: 60 * 1000, limit: 30, keyGenerator: (req) => String(req.user.id) });

// ---------- Favorites ----------

router.get('/favorites', async (req, res) => {
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, true AS is_favorite ${PRODUCT_FROM}
     JOIN favorites f ON f.product_id = p.id
     WHERE f.user_id = $1 AND p.status = 'approved' ORDER BY f.created_at DESC`,
    [req.user.id],
  );
  res.json({ items: rows });
});

router.post('/favorites/:productId', async (req, res) => {
  const id = parseInt(req.params.productId, 10) || 0;
  const { rowCount } = await query(`SELECT 1 FROM products WHERE id = $1 AND status = 'approved'`, [id]);
  if (!rowCount) throw notFound('product_not_found');
  await query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, id]);
  res.status(201).json({ ok: true });
});

router.delete('/favorites/:productId', async (req, res) => {
  await query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [
    req.user.id, parseInt(req.params.productId, 10) || 0,
  ]);
  res.json({ ok: true });
});

// ---------- Conversations & messages ----------

const CONVERSATION_SELECT = `
  cv.id, cv.product_id, cv.wanted_id, cv.buyer_id, cv.seller_id, cv.last_message_at, wa.title AS wanted_title,
  p.title AS product_title, p.price AS product_price, p.availability AS product_availability, p.accepts_swap AS product_accepts_swap, p.swap_wanted AS product_swap_wanted,
  (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS product_cover,
  CASE WHEN cv.buyer_id = $1 THEN cv.seller_id ELSE cv.buyer_id END AS other_id,
  CASE WHEN cv.buyer_id = $1 THEN us.name ELSE ub.name END AS other_name,
  (SELECT body FROM messages m WHERE m.conversation_id = cv.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_message,
  (SELECT kind FROM messages m WHERE m.conversation_id = cv.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_kind,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = cv.id AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread`;

const CONVERSATION_FROM = `
  FROM conversations cv
  LEFT JOIN products p ON p.id = cv.product_id
  LEFT JOIN wanted_ads wa ON wa.id = cv.wanted_id
  JOIN users ub ON ub.id = cv.buyer_id
  JOIN users us ON us.id = cv.seller_id`;

router.get('/conversations', async (req, res) => {
  const { rows } = await query(
    `SELECT ${CONVERSATION_SELECT} ${CONVERSATION_FROM}
     WHERE cv.buyer_id = $1 OR cv.seller_id = $1 ORDER BY cv.last_message_at DESC`,
    [req.user.id],
  );
  res.json({ items: rows });
});

const messageBody = z.string().trim().min(1, 'required').max(2000, 'too_long');

/** POST /api/conversations – start (or reuse) a conversation about a product with a first message. */
router.post('/conversations', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const data = parse(z.object({ productId: z.coerce.number().int().positive(), body: messageBody }), req.body);
  const { rows: prows } = await query(
    `SELECT p.id, p.seller_id, p.title FROM products p JOIN users u ON u.id = p.seller_id
     WHERE p.id = $1 AND p.status = 'approved' AND u.is_active`,
    [data.productId],
  );
  const product = prows[0];
  if (!product) throw notFound('product_not_found');
  if (product.seller_id === req.user.id) throw badRequest('cannot_message_self');

  const conversationId = await tx(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES ($1, $2, $3)
       ON CONFLICT (product_id, buyer_id, seller_id) DO UPDATE SET last_message_at = now()
       RETURNING id`,
      [product.id, req.user.id, product.seller_id],
    );
    const id = rows[0].id;
    await client.query('INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3)', [
      id, req.user.id, data.body,
    ]);
    await notify(product.seller_id, 'new_message',
      { from: req.user.name, title: product.title, conversationId: id }, `/messages/${id}`, client);
    return id;
  });
  res.status(201).json({ conversationId });
});

async function loadConversation(id, userId) {
  const { rows } = await query(
    `SELECT ${CONVERSATION_SELECT} ${CONVERSATION_FROM} WHERE cv.id = $2`,
    [userId, parseInt(id, 10) || 0],
  );
  const cv = rows[0];
  if (!cv) throw notFound('conversation_not_found');
  if (cv.buyer_id !== userId && cv.seller_id !== userId) throw forbidden();
  return cv;
}

router.get('/conversations/:id', async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { rows } = await query(
    `SELECT m.id, m.sender_id, m.body, m.kind, m.amount, m.offer_status, m.file_id, m.duration, m.read_at, m.created_at, m.swap_cash,
       CASE WHEN m.swap_product_id IS NOT NULL THEN (SELECT json_build_object('id', sp.id, 'title', sp.title, 'price', sp.price, 'availability', sp.availability,
         'cover_url', (SELECT url FROM product_images i WHERE i.product_id = sp.id ORDER BY sort_order, id LIMIT 1)) FROM products sp WHERE sp.id = m.swap_product_id) END AS swap_product
     FROM messages m WHERE m.conversation_id = $1 ORDER BY m.created_at, m.id`,
    [conversation.id],
  );
  await query(
    'UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL',
    [conversation.id, req.user.id],
  );
  // Reading the thread also clears its message notifications.
  await query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND type IN ('new_message','seller_reply')
     AND data->>'conversationId' = $2`,
    [req.user.id, String(conversation.id)],
  );
  res.json({ conversation, messages: rows });
});

router.post('/conversations/:id/messages', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { body } = parse(z.object({ body: messageBody }), req.body);
  const { rows } = await query(
    'INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING id, sender_id, body, read_at, created_at',
    [conversation.id, req.user.id, body],
  );
  await query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
  const isSeller = req.user.id === conversation.seller_id;
  await notify(conversation.other_id, isSeller ? 'seller_reply' : 'new_message',
    { from: req.user.name, title: conversation.product_title, conversationId: conversation.id },
    `/messages/${conversation.id}`);
  res.status(201).json({ message: rows[0] });
});

// ---------- Price offers ("make an offer", accept / decline / counter) ----------

const MSG_FIELDS = 'id, sender_id, body, kind, amount, offer_status, file_id, duration, read_at, created_at';
const amountSchema = z.coerce.number().int().min(1, 'min_1').max(1e12);


async function placeOffer(conversation, userId, userName, amount, client = { query }) {
  // Only one open offer at a time: a new one replaces the previous.
  await client.query("UPDATE messages SET offer_status = 'superseded' WHERE conversation_id = $1 AND kind = 'offer' AND offer_status = 'pending'", [conversation.id]);
  const { rows } = await client.query(
    `INSERT INTO messages (conversation_id, sender_id, body, kind, amount, offer_status) VALUES ($1, $2, '', 'offer', $3, 'pending') RETURNING ${MSG_FIELDS}`,
    [conversation.id, userId, amount],
  );
  await client.query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
  await notify(conversation.other_id, 'offer_new', { from: userName, title: conversation.product_title, amount, conversationId: conversation.id }, `/messages/${conversation.id}`, client);
  return rows[0];
}

/** POST /api/conversations/:id/offers { amount } – propose a price. */
router.post('/conversations/:id/offers', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { amount } = parse(z.object({ amount: amountSchema }), req.body);
  if (!conversation.product_id || conversation.product_availability !== 'available') throw badRequest('product_sold');
  const message = await tx((client) => placeOffer(conversation, req.user.id, req.user.name, amount, client));
  res.status(201).json({ message });
});

/** POST /api/conversations/:id/offers/:messageId { action: accept | decline | counter | withdraw, amount? } */
router.post('/conversations/:id/offers/:messageId', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const d = parse(z.object({ action: z.enum(['accept', 'decline', 'counter', 'withdraw']), amount: amountSchema.optional() }), req.body);
  const result = await tx(async (client) => {
    const offer = (await client.query(
      "SELECT * FROM messages WHERE id = $1 AND conversation_id = $2 AND kind = 'offer' FOR UPDATE", [parseInt(req.params.messageId, 10) || 0, conversation.id],
    )).rows[0];
    if (!offer) throw notFound('offer_not_found');
    if (offer.offer_status !== 'pending') throw conflict('offer_closed');
    const mine = offer.sender_id === req.user.id;
    if (d.action === 'withdraw' ? !mine : mine) throw forbidden('not_allowed'); // you answer the other person's offer
    const status = { accept: 'accepted', decline: 'declined', counter: 'countered', withdraw: 'withdrawn' }[d.action];
    await client.query('UPDATE messages SET offer_status = $1 WHERE id = $2', [status, offer.id]);
    let counter = null;
    if (d.action === 'counter') {
      if (!d.amount) throw badRequest('validation_error', { amount: 'required' });
      counter = await placeOffer(conversation, req.user.id, req.user.name, d.amount, client);
    } else if (d.action !== 'withdraw') {
      await client.query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
      await notify(offer.sender_id, `offer_${status}`, { from: req.user.name, title: conversation.product_title, amount: Number(offer.amount), conversationId: conversation.id }, `/messages/${conversation.id}`, client);
    }
    return { status, counter };
  });
  res.json(result);
});

// ---------- Barter: swap one of your listings (plus or minus some cash) for this one ----------

/** POST /api/conversations/:id/swaps { productId, cash } – cash > 0: I add money; < 0: I ask for money. */
router.post('/conversations/:id/swaps', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const d = parse(z.object({ productId: z.coerce.number().int().positive(), cash: z.coerce.number().int().min(-1e12).max(1e12).default(0) }), req.body);
  if (!conversation.product_id || conversation.product_availability !== 'available') throw badRequest('product_sold');
  if (!conversation.product_accepts_swap) throw badRequest('swap_not_accepted');
  const own = await query("SELECT id, title FROM products WHERE id = $1 AND seller_id = $2 AND status = 'approved' AND availability = 'available'", [d.productId, req.user.id]);
  if (!own.rows[0]) throw badRequest('validation_error', { productId: 'own_live_products_only' });
  if (d.productId === conversation.product_id) throw badRequest('validation_error', { productId: 'invalid' });
  const message = await tx(async (client) => {
    // One open swap offer at a time in a conversation.
    await client.query("UPDATE messages SET offer_status = 'superseded' WHERE conversation_id = $1 AND kind = 'swap' AND offer_status = 'pending'", [conversation.id]);
    const { rows } = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body, kind, offer_status, swap_product_id, swap_cash)
       VALUES ($1, $2, '', 'swap', 'pending', $3, $4) RETURNING id`,
      [conversation.id, req.user.id, d.productId, d.cash],
    );
    await client.query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
    await notify(conversation.other_id, 'swap_new', { from: req.user.name, title: conversation.product_title, offered: own.rows[0].title, conversationId: conversation.id }, `/messages/${conversation.id}`, client);
    return rows[0];
  });
  res.status(201).json({ message });
});

/** POST /api/conversations/:id/swaps/:messageId { action: accept | decline | withdraw } */
router.post('/conversations/:id/swaps/:messageId', requireVerifiedPhone, writeLimiter, async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const { action } = parse(z.object({ action: z.enum(['accept', 'decline', 'withdraw']) }), req.body);
  const status = await tx(async (client) => {
    const swap = (await client.query(
      "SELECT * FROM messages WHERE id = $1 AND conversation_id = $2 AND kind = 'swap' FOR UPDATE", [parseInt(req.params.messageId, 10) || 0, conversation.id],
    )).rows[0];
    if (!swap) throw notFound('offer_not_found');
    if (swap.offer_status !== 'pending') throw conflict('offer_closed');
    const mine = swap.sender_id === req.user.id;
    if (action === 'withdraw' ? !mine : mine) throw forbidden('not_allowed');
    const st = { accept: 'accepted', decline: 'declined', withdraw: 'withdrawn' }[action];
    await client.query('UPDATE messages SET offer_status = $1 WHERE id = $2', [st, swap.id]);
    if (action !== 'withdraw') {
      await client.query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
      await notify(swap.sender_id, `swap_${st}`, { from: req.user.name, title: conversation.product_title, conversationId: conversation.id }, `/messages/${conversation.id}`, client);
    }
    return st;
  });
  res.json({ status });
});

// ---------- Photos and voice notes ----------

/** POST /api/conversations/:id/media (multipart "file", optional "duration" in seconds) */
router.post('/conversations/:id/media', requireVerifiedPhone, writeLimiter, chatUpload.single('file'), async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  if (!req.file) throw badRequest('validation_error', { file: 'required' });
  const duration = Math.min(600, Math.max(0, parseInt(req.body?.duration, 10) || 0)) || null;
  const message = await tx(async (client) => {
    const file = await saveChatMedia(req.file, client);
    const { rows } = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body, kind, file_id, duration) VALUES ($1, $2, '', $3, $4, $5) RETURNING ${MSG_FIELDS}`,
      [conversation.id, req.user.id, file.kind, file.id, file.kind === 'audio' ? duration : null],
    );
    await client.query('UPDATE conversations SET last_message_at = now() WHERE id = $1', [conversation.id]);
    return rows[0];
  });
  const isSeller = req.user.id === conversation.seller_id;
  await notify(conversation.other_id, isSeller ? 'seller_reply' : 'new_message',
    { from: req.user.name, title: conversation.product_title, conversationId: conversation.id }, `/messages/${conversation.id}`);
  res.status(201).json({ message });
});

/** GET /api/conversations/:id/files/:fileId – a photo / voice note, for the two people in the conversation only. */
router.get('/conversations/:id/files/:fileId', async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user.id);
  const fileId = parseInt(req.params.fileId, 10) || 0;
  const ok = (await query('SELECT 1 FROM messages WHERE conversation_id = $1 AND file_id = $2', [conversation.id, fileId])).rowCount;
  if (!ok) throw notFound();
  return sendFile(res, fileId, { isPrivate: true });
});

// ---------- Notifications ----------

router.get('/notifications', async (req, res) => {
  const { limit, offset } = pagination(req.query, { defaultLimit: 30 });
  const { rows } = await query(
    `SELECT id, type, data, link, is_read, created_at FROM notifications
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [req.user.id],
  );
  res.json({ items: rows });
});

/** Badge counts for the header, polled by the client. */
router.get('/notifications/summary', async (req, res) => {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND NOT is_read) AS notifications,
            (SELECT COUNT(*) FROM messages m JOIN conversations cv ON cv.id = m.conversation_id
             WHERE (cv.buyer_id = $1 OR cv.seller_id = $1) AND m.sender_id <> $1 AND m.read_at IS NULL) AS messages`,
    [req.user.id],
  );
  res.json(rows[0]);
});

router.post('/notifications/read-all', async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE user_id = $1 AND NOT is_read', [req.user.id]);
  res.json({ ok: true });
});

router.patch('/notifications/:id/read', async (req, res) => {
  await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [
    parseInt(req.params.id, 10) || 0, req.user.id,
  ]);
  res.json({ ok: true });
});

// ---------- Reviews (only for documented sales) ----------

router.post('/reviews', writeLimiter, async (req, res) => {
  const data = parse(
    z.object({
      productId: z.coerce.number().int().positive(),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  const { rows } = await query('SELECT id, seller_id, sold_to_id, title FROM products WHERE id = $1', [data.productId]);
  const product = rows[0];
  if (!product) throw notFound('product_not_found');
  if (product.sold_to_id !== req.user.id) throw forbidden('review_requires_sale');
  try {
    await query(
      'INSERT INTO reviews (product_id, reviewer_id, seller_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
      [product.id, req.user.id, product.seller_id, data.rating, data.comment || null],
    );
  } catch (err) {
    if (err.code === '23505') throw conflict('already_reviewed');
    throw err;
  }
  await notify(product.seller_id, 'new_review', { rating: data.rating, title: product.title }, `/users/${product.seller_id}`);
  res.status(201).json({ ok: true });
});

// ---------- Reports ----------

router.post('/reports', writeLimiter, async (req, res) => {
  const data = parse(
    z.object({
      productId: z.coerce.number().int().positive(),
      reason: z.enum(REPORT_REASONS),
      details: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  const { rowCount } = await query('SELECT 1 FROM products WHERE id = $1', [data.productId]);
  if (!rowCount) throw notFound('product_not_found');
  const dup = await query(
    `SELECT 1 FROM reports WHERE reporter_id = $1 AND product_id = $2 AND status = 'open'`,
    [req.user.id, data.productId],
  );
  if (dup.rowCount) throw conflict('already_reported');
  await query('INSERT INTO reports (reporter_id, product_id, reason, details) VALUES ($1, $2, $3, $4)', [
    req.user.id, data.productId, data.reason, data.details || null,
  ]);
  res.status(201).json({ ok: true });
});

export default router;

// ---------- Verification & featuring requests ----------

// The site is free unless PAID_UPGRADES=true: the request endpoints then do not exist.
router.use('/upgrade-requests', async (_req, _res, next) => ((await paidUpgradesEnabled()) ? next() : next(notFound())));

/** GET /api/upgrade-requests – the signed-in user's own requests. */
router.get('/upgrade-requests', async (req, res) => {
  const { rows } = await query(
    `SELECT r.id, r.kind, r.product_id, p.title AS product_title, r.days, r.amount, r.payment_method,
       r.status, r.admin_note, r.created_at, r.reviewed_at
     FROM upgrade_requests r LEFT JOIN products p ON p.id = r.product_id
     WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
    [req.user.id],
  );
  res.json({ items: rows });
});

const upgradeSchema = z.object({
  kind: z.enum(['verify', 'feature', 'bump', 'plan']),
  planKey: z.string().max(20).optional(),
  months: z.coerce.number().int().min(1).max(12).optional(),
  productId: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().positive().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentRef: z.string().trim().max(80).optional().transform((v) => v || null),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

/**
 * POST /api/upgrade-requests (multipart, field "receipt") – ask to have the account
 * verified or a listing featured, with a photo of the payment receipt.
 * The price is set by the server, never by the client.
 */
router.post('/upgrade-requests', writeLimiter, upload.single('receipt'), async (req, res) => {
  const data = parse(upgradeSchema, req.body);
  if (!req.file) throw badRequest('validation_error', { receipt: 'required' });
  const me = (await query('SELECT account_type, is_verified FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!me || me.account_type === 'buyer') throw forbidden('sellers_only');

  let amount;
  let product = null;
  let plan = null;
  if (data.kind === 'verify') {
    if (me.is_verified) throw conflict('already_verified');
    amount = (await getSettings()).pricing.verifyPrice;
  } else if (data.kind === 'plan') {
    if (me.account_type !== 'merchant') throw forbidden('merchants_only');
    plan = (await getSettings()).pricing.storePlans.find((x) => x.key === data.planKey);
    if (!plan) throw badRequest('validation_error', { planKey: 'invalid' });
    if (!data.months) throw badRequest('validation_error', { months: 'required' });
    amount = plan.price * data.months;
  } else {
    const pricing = (await getSettings()).pricing;
    const plan = data.kind === 'bump' ? { price: pricing.bumpPrice } : pricing.featurePlans.find((x) => x.days === data.days);
    if (!plan) throw badRequest('validation_error', { days: 'invalid' });
    if (!data.productId) throw badRequest('validation_error', { productId: 'required' });
    product = (await query('SELECT id, title, seller_id, status, availability FROM products WHERE id = $1', [data.productId])).rows[0];
    if (!product || product.seller_id !== req.user.id) throw notFound('product_not_found');
    if (product.status !== 'approved' || product.availability !== 'available') throw badRequest('product_not_featurable');
    amount = plan.price;
  }

  const request = await tx(async (client) => {
    const fileId = await savePrivateFile(req.file, client);
    try {
      const { rows } = await client.query(
        `INSERT INTO upgrade_requests (user_id, kind, product_id, days, amount, payment_method, payment_ref, note, receipt_file_id, plan_key, months)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, kind, product_id, days, amount, status, created_at, plan_key, months`,
        [req.user.id, data.kind, product?.id ?? null, data.kind === 'feature' ? data.days : null, amount,
          data.paymentMethod, data.paymentRef, data.note, fileId, plan?.key ?? null, plan ? data.months : null],
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') throw conflict('request_pending');
      throw err;
    }
  });

  // Let the admins know there is something to review.
  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
  await Promise.all(admins.rows.map((a) => notify(a.id, `upgrade_request_${data.kind}`, {
    name: req.user.name, title: product?.title || plan?.name?.ar || null,
  }, '/admin/requests')));

  res.status(201).json({ request });
});
