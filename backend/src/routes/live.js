// Souk Live – free live video between browsers (WebRTC), with no paid media server.
//
// The host's phone sends the video to a few viewers only; each of those viewers can relay it to a
// few more, and so on (a relay tree). This keeps the host's upload small whatever the audience, and
// costs nothing: the video never passes through our server. Our API only introduces the peers to each
// other (offer / answer / ICE messages kept briefly in `live_signals`), counts viewers, carries the
// live chat and the pinned product, and repairs the tree when a relaying viewer leaves.
import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query, tx } from '../db.js';
import { badRequest, conflict, forbidden, notFound, parse, HttpError } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { limiter } from '../lib/rateLimit.js';
import { getSettings } from '../lib/settings.js';
import { assertCanHost, assertSocialAllowed, blockedBetween, canSee, checkText, notifyFollowers } from '../lib/social.js';
import { MAX_RECORDING_BYTES, VIDEO_TYPES, deleteVideo, ownVideoUrl, videoEnabled, videoUploadToken } from '../lib/video.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const FRESH = "interval '20 seconds'";
const commentLimit = limiter('live-comment', { windowMs: 60_000, limit: 20, keyGenerator: (req) => String(req.user.id) });
// Mobile networks put many people behind one IP: count per peer connection, not per IP, where we can.
const joinLimit = limiter('live-join', { windowMs: 60_000, limit: 200 });
const pollLimit = limiter('live-poll', {
  windowMs: 60_000, limit: 100,
  keyGenerator: (req) => String(req.query.peer || req.body?.from || req.ip),
});

/** STUN (free, public) and optional TURN (only if configured) for the browsers. */
function iceServers() {
  const servers = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
  if (process.env.TURN_URLS) {
    servers.push({ urls: process.env.TURN_URLS.split(','), username: process.env.TURN_USERNAME || '', credential: process.env.TURN_CREDENTIAL || '' });
  }
  return servers;
}

// A peer proves it owns its id with this token (the id alone is shared with its parent / children).
const peerToken = (id) => crypto.createHmac('sha256', config.jwtSecret).update(`live-peer:${id}`).digest('base64url');
function checkPeer(id, token) {
  const expected = peerToken(String(id || ''));
  if (typeof token !== 'string' || token.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    throw forbidden('bad_peer');
  }
}

const LIVE_SELECT = `
  l.id, l.host_id, l.title, l.description, l.status, l.visibility, l.scheduled_at, l.started_at, l.ended_at,
  l.record, l.recording_url, l.comments_enabled, l.peak_viewers, l.total_viewers, l.removed_reason, l.created_at,
  (l.host_seen_at > now() - interval '30 seconds') AS host_online,
  u.name AS host_name, u.avatar_url AS host_avatar, u.is_verified AS host_verified,
  s.name AS store_name, s.slug AS store_slug, s.logo_url AS store_logo,
  (SELECT COUNT(*)::int FROM live_peers pv WHERE pv.live_id = l.id AND pv.role = 'viewer' AND pv.last_seen > now() - ${FRESH}) AS viewers,
  (SELECT url FROM product_images i JOIN live_products lp ON lp.product_id = i.product_id
     WHERE lp.live_id = l.id ORDER BY lp.sort, i.sort_order, i.id LIMIT 1) AS cover_url`;
const LIVE_FROM = 'FROM live_streams l JOIN users u ON u.id = l.host_id LEFT JOIN stores s ON s.owner_id = l.host_id AND s.is_active';

async function liveProducts(liveId) {
  const { rows } = await query(
    `SELECT p.id, p.title, p.price, p.old_price, p.availability, p.status, lp.pinned_at,
       (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS cover_url
     FROM live_products lp JOIN products p ON p.id = lp.product_id
     WHERE lp.live_id = $1 AND p.status = 'approved' ORDER BY lp.sort, p.id`,
    [liveId],
  );
  return rows;
}

async function loadLive(id, viewer) {
  const { rows } = await query(`SELECT ${LIVE_SELECT} ${LIVE_FROM} WHERE l.id = $1`, [parseInt(id, 10) || 0]);
  const live = rows[0];
  if (!live) throw notFound('live_not_found');
  const isHost = viewer?.id === live.host_id;
  if (live.status === 'removed' && !isHost && viewer?.role !== 'admin') throw notFound('live_not_found');
  if (!(await canSee(viewer, live.host_id, live.visibility))) throw notFound('live_not_found');
  return live;
}

const isHostOf = (live, user) => user && (user.id === live.host_id);
const canModerate = (live, user) => user && (user.id === live.host_id || user.role === 'admin');

/** Lazy housekeeping: reminders 15 min before a scheduled live, end lives whose host vanished, drop old signals. */
async function housekeeping() {
  const due = await query(
    `UPDATE live_streams SET reminded_at = now()
     WHERE status = 'scheduled' AND reminded_at IS NULL AND scheduled_at BETWEEN now() AND now() + interval '15 minutes'
     RETURNING id, host_id, title`,
  );
  for (const l of due.rows) {
    const host = await query('SELECT name FROM users WHERE id = $1', [l.host_id]);
    await notifyFollowers(l.host_id, 'live_reminder', { name: host.rows[0]?.name || '', title: l.title }, `/live/${l.id}`);
  }
  await query(`UPDATE live_streams SET status = 'ended', ended_at = now()
               WHERE status = 'live' AND COALESCE(host_seen_at, started_at) < now() - interval '5 minutes'`);
  if (Math.random() < 0.05) {
    await query("DELETE FROM live_signals WHERE created_at < now() - interval '2 minutes'");
    await query("DELETE FROM live_peers WHERE last_seen < now() - interval '2 minutes'");
  }
}

// ---------- Lists and details ----------

router.use('/admin', (req, res, next) => admin(req, res, next));

router.get('/', optionalAuth, async (req, res) => {
  await housekeeping();
  const status = ['live', 'scheduled', 'ended'].includes(req.query.status) ? req.query.status : 'live';
  const host = parseInt(req.query.host, 10) || 0;
  const params = [status];
  const where = ['l.status = $1', 'u.is_active'];
  if (status === 'scheduled') where.push("l.scheduled_at > now() - interval '1 hour'");
  if (status === 'ended') where.push('l.recording_url IS NOT NULL');
  if (host) { params.push(host); where.push(`l.host_id = $${params.length}`); }
  if (req.user?.role !== 'admin') {
    if (req.user) {
      params.push(req.user.id);
      const me = `$${params.length}`;
      where.push(`(l.visibility = 'public' OR l.host_id = ${me} OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ${me} AND f.followee_id = l.host_id))`);
      where.push(`NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ${me} AND b.blocked_id = l.host_id) OR (b.blocker_id = l.host_id AND b.blocked_id = ${me}))`);
    } else where.push("l.visibility = 'public'");
  }
  const order = status === 'scheduled' ? 'l.scheduled_at ASC' : status === 'live' ? 'l.started_at DESC' : 'l.ended_at DESC';
  const { rows } = await query(`SELECT ${LIVE_SELECT} ${LIVE_FROM} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT 30`, params);
  res.json({ items: rows });
});

router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT ${LIVE_SELECT} ${LIVE_FROM} WHERE l.host_id = $1 ORDER BY l.created_at DESC LIMIT 50`, [req.user.id]);
  let canHost = true;
  try { assertCanHost(req.user); } catch { canHost = false; }
  res.json({ items: rows, canHost, recordingAvailable: videoEnabled() });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  const products = await liveProducts(live.id);
  const following = req.user ? (await query('SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2', [req.user.id, live.host_id])).rowCount > 0 : false;
  const muted = req.user ? (await query('SELECT 1 FROM live_mutes WHERE live_id = $1 AND user_id = $2', [live.id, req.user.id])).rowCount > 0 : false;
  res.json({ live, products, following, muted, isHost: isHostOf(live, req.user), canModerate: Boolean(canModerate(live, req.user)), iceServers: iceServers() });
});

// ---------- Create / edit (host) ----------

const liveSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(1000).default(''),
  scheduledAt: z.coerce.date().optional().nullable(),
  visibility: z.enum(['public', 'followers']).default('public'),
  record: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  productIds: z.array(z.coerce.number().int().positive()).max(20).default([]),
});

async function setProducts(client, liveId, userId, ids, isAdmin) {
  const unique = [...new Set(ids)];
  if (unique.length) {
    const { rows } = await client.query("SELECT id, seller_id FROM products WHERE id = ANY($1::int[]) AND status = 'approved'", [unique]);
    if (rows.length !== unique.length || (!isAdmin && rows.some((r) => r.seller_id !== userId))) {
      throw badRequest('validation_error', { productIds: 'own_live_products_only' });
    }
  }
  await client.query('DELETE FROM live_products WHERE live_id = $1 AND NOT (product_id = ANY($2::int[]))', [liveId, unique]);
  for (const [i, id] of unique.entries()) {
    await client.query(
      'INSERT INTO live_products (live_id, product_id, sort) VALUES ($1, $2, $3) ON CONFLICT (live_id, product_id) DO UPDATE SET sort = EXCLUDED.sort',
      [liveId, id, i],
    );
  }
}

router.post('/', requireAuth, async (req, res) => {
  await assertSocialAllowed(req.user, { live: true });
  assertCanHost(req.user);
  const data = parse(liveSchema, req.body);
  checkText(`${data.title} ${data.description}`);
  if (data.scheduledAt && (data.scheduledAt < new Date(Date.now() - 60_000) || data.scheduledAt > new Date(Date.now() + 60 * 86_400_000))) {
    throw badRequest('validation_error', { scheduledAt: 'invalid' });
  }
  const id = await tx(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO live_streams (host_id, title, description, scheduled_at, visibility, record, comments_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.user.id, data.title, data.description, data.scheduledAt || null, data.visibility, data.record, data.commentsEnabled],
    );
    await setProducts(client, rows[0].id, req.user.id, data.productIds, req.user.role === 'admin');
    return rows[0].id;
  });
  if (data.scheduledAt && data.scheduledAt > new Date(Date.now() + 5 * 60_000)) {
    await notifyFollowers(req.user.id, 'live_scheduled', { name: req.user.name, title: data.title, at: data.scheduledAt.toISOString() }, `/live/${id}`);
  }
  res.status(201).json({ live: await loadLive(id, req.user) });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!isHostOf(live, req.user)) throw forbidden();
  if (!['scheduled', 'live'].includes(live.status)) throw badRequest('live_closed');
  const data = parse(liveSchema.partial(), req.body);
  if (data.title !== undefined || data.description !== undefined) checkText(`${data.title || ''} ${data.description || ''}`);
  await tx(async (client) => {
    await client.query(
      `UPDATE live_streams SET title = COALESCE($2, title), description = COALESCE($3, description),
         scheduled_at = CASE WHEN $4::boolean THEN $5 ELSE scheduled_at END, visibility = COALESCE($6, visibility),
         record = COALESCE($7, record), comments_enabled = COALESCE($8, comments_enabled),
         reminded_at = CASE WHEN $4::boolean THEN NULL ELSE reminded_at END
       WHERE id = $1`,
      [live.id, data.title ?? null, data.description ?? null, data.scheduledAt !== undefined, data.scheduledAt ?? null,
        data.visibility ?? null, data.record ?? null, data.commentsEnabled ?? null],
    );
    if (data.productIds) await setProducts(client, live.id, req.user.id, data.productIds, req.user.role === 'admin');
  });
  res.json({ live: await loadLive(live.id, req.user), products: await liveProducts(live.id) });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!canModerate(live, req.user)) throw forbidden();
  if (live.status === 'live') throw badRequest('end_live_first');
  if (live.recording_url) deleteVideo(live.recording_url);
  await query('DELETE FROM live_streams WHERE id = $1', [live.id]);
  res.json({ ok: true });
});

// ---------- Going live / ending ----------

router.post('/:id/start', requireAuth, async (req, res) => {
  await assertSocialAllowed(req.user, { live: true });
  assertCanHost(req.user);
  const live = await loadLive(req.params.id, req.user);
  if (!isHostOf(live, req.user)) throw forbidden();
  if (!['scheduled', 'live'].includes(live.status)) throw badRequest('live_closed');
  const peerId = crypto.randomUUID();
  try {
    await tx(async (client) => {
      await client.query(
        "UPDATE live_streams SET status = 'live', started_at = COALESCE(started_at, now()), host_seen_at = now() WHERE id = $1",
        [live.id],
      );
      // A restart (page reload) replaces the old host peer; its viewers reconnect to the new one.
      await client.query("DELETE FROM live_peers WHERE live_id = $1 AND role = 'host'", [live.id]);
      await client.query("UPDATE live_peers SET parent_id = NULL WHERE live_id = $1", [live.id]);
      await client.query('INSERT INTO live_peers (id, live_id, user_id, role, depth, can_relay, connected) VALUES ($1, $2, $3, $4, 0, true, true)',
        [peerId, live.id, req.user.id, 'host']);
    });
  } catch (err) {
    if (err.code === '23505') throw conflict('already_live');
    throw err;
  }
  if (live.status === 'scheduled') {
    await notifyFollowers(req.user.id, 'live_started', { name: req.user.name, title: live.title }, `/live/${live.id}`);
  }
  res.json({ peerId, token: peerToken(peerId), iceServers: iceServers() });
});

router.post('/:id/end', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!canModerate(live, req.user)) throw forbidden();
  if (live.status !== 'live') throw badRequest('not_live');
  await query("UPDATE live_streams SET status = 'ended', ended_at = now() WHERE id = $1", [live.id]);
  await query('DELETE FROM live_peers WHERE live_id = $1', [live.id]);
  await query('DELETE FROM live_signals WHERE live_id = $1', [live.id]);
  res.json({ ok: true, record: live.record && videoEnabled() });
});

// ---------- Recording (made on the host's device, kept only if the host chose to) ----------

router.post('/:id/recording-token', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!isHostOf(live, req.user)) throw forbidden();
  if (!live.record) throw badRequest('recording_not_allowed');
  if (!videoEnabled()) throw new HttpError(503, 'video_disabled');
  const ext = String(req.body?.ext || '').toLowerCase();
  if (!VIDEO_TYPES[ext]) throw badRequest('invalid_file_type');
  res.json(await videoUploadToken(req.user.id, ext, { folder: 'recordings', maxBytes: MAX_RECORDING_BYTES }));
});

router.post('/:id/recording', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!isHostOf(live, req.user)) throw forbidden();
  if (!live.record) throw badRequest('recording_not_allowed');
  const { url } = parse(z.object({ url: z.string().trim().max(400) }), req.body);
  if (!ownVideoUrl(url, req.user.id, 'recordings')) throw badRequest('validation_error', { url: 'invalid' });
  if (live.recording_url && live.recording_url !== url) deleteVideo(live.recording_url);
  await query('UPDATE live_streams SET recording_url = $2 WHERE id = $1', [live.id, url]);
  res.json({ ok: true });
});

router.delete('/:id/recording', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!canModerate(live, req.user)) throw forbidden();
  if (live.recording_url) deleteVideo(live.recording_url);
  await query('UPDATE live_streams SET recording_url = NULL, record = false WHERE id = $1', [live.id]);
  res.json({ ok: true });
});

// ---------- Relay tree: join, signals, heartbeat ----------

/**
 * Pick who sends the video to `peerId`: the host if it has room, else the shallowest relaying viewer
 * with room (never the peer itself or one of its own descendants, which would make a loop).
 */
async function pickParent(client, liveId, peerId, social) {
  const { rows } = await client.query(
    `WITH RECURSIVE below AS (
       SELECT id FROM live_peers WHERE id = $2
       UNION SELECT c.id FROM live_peers c JOIN below b ON c.parent_id = b.id WHERE c.live_id = $1
     )
     SELECT p.id, p.depth, p.role,
       (SELECT COUNT(*) FROM live_peers k WHERE k.parent_id = p.id AND k.last_seen > now() - ${FRESH})::int AS kids
     FROM live_peers p
     WHERE p.live_id = $1 AND p.last_seen > now() - ${FRESH} AND p.id NOT IN (SELECT id FROM below)
       AND (p.role = 'host' OR (p.can_relay AND p.connected)) AND p.depth < $3
     ORDER BY p.depth, kids`,
    [liveId, peerId, social.maxDepth],
  );
  return rows.find((p) => p.kids < (p.role === 'host' ? social.hostFanout : social.relayFanout)) || null;
}

router.post('/:id/join', optionalAuth, joinLimit, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (live.status !== 'live') throw badRequest('not_live');
  if (!live.host_online) throw new HttpError(409, 'host_offline');
  const { canRelay } = parse(z.object({ canRelay: z.boolean().default(false) }), req.body || {});
  const { community: social } = await getSettings();
  const peerId = crypto.randomUUID();
  const parent = await tx(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock(918273, $1)', [live.id]);
    const p = await pickParent(client, live.id, peerId, social);
    if (!p) return null;
    await client.query(
      'INSERT INTO live_peers (id, live_id, user_id, role, parent_id, depth, can_relay) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [peerId, live.id, req.user?.id ?? null, 'viewer', p.id, p.depth + 1, canRelay && social.relayFanout > 0],
    );
    await client.query('UPDATE live_streams SET total_viewers = total_viewers + 1 WHERE id = $1', [live.id]);
    return p;
  });
  if (!parent) throw new HttpError(409, 'live_full');
  res.json({ peerId, token: peerToken(peerId), parentId: parent.id, iceServers: iceServers() });
});

router.post('/:id/signal', pollLimit, async (req, res) => {
  const data = parse(z.object({
    from: z.string().uuid(), token: z.string().max(100), to: z.string().uuid(),
    kind: z.enum(['offer', 'answer', 'ice', 'bye']), payload: z.record(z.string(), z.any()).default({}),
  }), req.body);
  checkPeer(data.from, data.token);
  if (JSON.stringify(data.payload).length > 20_000) throw badRequest('too_large');
  const liveId = parseInt(req.params.id, 10) || 0;
  // Only between a peer and its own parent or child.
  const { rowCount } = await query(
    `SELECT 1 FROM live_peers a JOIN live_peers b ON b.live_id = a.live_id
     WHERE a.id = $1 AND b.id = $2 AND a.live_id = $3 AND (a.parent_id = b.id OR b.parent_id = a.id)`,
    [data.from, data.to, liveId],
  );
  if (!rowCount) throw forbidden('not_linked');
  await query('INSERT INTO live_signals (live_id, to_peer, from_peer, kind, payload) VALUES ($1, $2, $3, $4, $5)',
    [liveId, data.to, data.from, data.kind, data.payload]);
  res.json({ ok: true });
});

/**
 * GET /live/:id/poll – heartbeat + everything a peer needs: signals for it, its children (to send the
 * video to), its current parent (changed when the old one left), viewers, new chat messages, pinned product.
 */
router.get('/:id/poll', pollLimit, async (req, res) => {
  const liveId = parseInt(req.params.id, 10) || 0;
  const peer = String(req.query.peer || '');
  const sinceSignal = parseInt(req.query.since, 10) || 0;
  const sinceComment = parseInt(req.query.comments, 10) || 0;
  let me = null;
  if (peer) {
    checkPeer(peer, req.query.token);
    const { rows } = await query(
      `UPDATE live_peers SET last_seen = now(), connected = connected OR $3::boolean WHERE id = $1 AND live_id = $2
       RETURNING id, role, parent_id, depth, can_relay`,
      [peer, liveId, req.query.connected === '1'],
    );
    me = rows[0] || null;
  }
  const { rows: lr } = await query(
    `SELECT status, comments_enabled, (host_seen_at > now() - interval '30 seconds') AS host_online,
       (SELECT COUNT(*)::int FROM live_peers pv WHERE pv.live_id = l.id AND pv.role = 'viewer' AND pv.last_seen > now() - ${FRESH}) AS viewers,
       (SELECT product_id FROM live_products lp WHERE lp.live_id = l.id AND lp.pinned_at IS NOT NULL ORDER BY pinned_at DESC LIMIT 1) AS pinned
     FROM live_streams l WHERE id = $1`,
    [liveId],
  );
  if (!lr[0]) throw notFound('live_not_found');
  const out = { status: lr[0].status, viewers: lr[0].viewers, hostOnline: lr[0].host_online, pinned: lr[0].pinned, commentsEnabled: lr[0].comments_enabled };
  if (me?.role === 'host') {
    await query('UPDATE live_streams SET host_seen_at = now(), peak_viewers = GREATEST(peak_viewers, $2) WHERE id = $1', [liveId, lr[0].viewers]);
    out.hostOnline = true;
  }
  if (me) {
    // Repair the tree: if my parent is gone, find me a new one.
    if (me.role === 'viewer' && lr[0].status === 'live') {
      const parentOk = me.parent_id && (await query(`SELECT 1 FROM live_peers WHERE id = $1 AND last_seen > now() - ${FRESH}`, [me.parent_id])).rowCount;
      if (!parentOk) {
        const { community: social } = await getSettings();
        const np = await tx(async (client) => {
          await client.query('SELECT pg_advisory_xact_lock(918273, $1)', [liveId]);
          const p = await pickParent(client, liveId, me.id, social);
          if (p) await client.query('UPDATE live_peers SET parent_id = $2, depth = $3, connected = false WHERE id = $1', [me.id, p.id, p.depth + 1]);
          return p;
        });
        me.parent_id = np?.id || null;
      }
    }
    out.parentId = me.parent_id;
    const kids = await query(`SELECT id FROM live_peers WHERE parent_id = $1 AND last_seen > now() - ${FRESH}`, [me.id]);
    out.children = kids.rows.map((k) => k.id);
    const sig = await query('SELECT id, from_peer, kind, payload FROM live_signals WHERE to_peer = $1 AND id > $2 ORDER BY id LIMIT 100', [me.id, sinceSignal]);
    out.signals = sig.rows;
    if (sig.rows.length) await query('DELETE FROM live_signals WHERE to_peer = $1 AND id <= $2', [me.id, sig.rows.at(-1).id]);
  }
  const com = await query(
    `SELECT c.id, c.body, c.user_id, c.created_at, u.name, u.avatar_url FROM live_comments c JOIN users u ON u.id = c.user_id
     WHERE c.live_id = $1 AND c.status = 'published' AND c.id > $2 ORDER BY c.id DESC LIMIT 50`,
    [liveId, sinceComment],
  );
  out.comments = com.rows.reverse();
  // Ids of comments removed recently, so open pages hide them too.
  const removed = await query("SELECT id FROM live_comments WHERE live_id = $1 AND status = 'removed' ORDER BY id DESC LIMIT 50", [liveId]);
  out.removedComments = removed.rows.map((r) => Number(r.id));
  res.json(out);
});

router.post('/:id/leave', async (req, res) => {
  const peer = String(req.body?.peer || '');
  checkPeer(peer, req.body?.token);
  await query('DELETE FROM live_peers WHERE id = $1 AND live_id = $2', [peer, parseInt(req.params.id, 10) || 0]);
  res.json({ ok: true });
});

// ---------- Live chat, products, moderation ----------

router.post('/:id/comments', requireAuth, commentLimit, async (req, res) => {
  await assertSocialAllowed(req.user);
  const live = await loadLive(req.params.id, req.user);
  if (live.status !== 'live') throw badRequest('not_live');
  if (!live.comments_enabled && !canModerate(live, req.user)) throw forbidden('comments_off');
  if ((await query('SELECT 1 FROM live_mutes WHERE live_id = $1 AND user_id = $2', [live.id, req.user.id])).rowCount) throw forbidden('muted');
  if (await blockedBetween(req.user.id, live.host_id)) throw forbidden('blocked');
  const { body } = parse(z.object({ body: z.string().trim().min(1).max(300) }), req.body);
  checkText(body);
  const { rows } = await query('INSERT INTO live_comments (live_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, body, user_id, created_at', [live.id, req.user.id, body]);
  res.status(201).json({ comment: { ...rows[0], name: req.user.name, avatar_url: req.user.avatar_url } });
});

router.delete('/:id/comments/:cid', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  const { rows } = await query('SELECT user_id FROM live_comments WHERE id = $1 AND live_id = $2', [parseInt(req.params.cid, 10) || 0, live.id]);
  if (!rows[0]) throw notFound();
  if (rows[0].user_id !== req.user.id && !canModerate(live, req.user)) throw forbidden();
  await query("UPDATE live_comments SET status = 'removed' WHERE id = $1", [parseInt(req.params.cid, 10)]);
  res.json({ ok: true });
});

router.post('/:id/mute/:userId', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!canModerate(live, req.user)) throw forbidden();
  const userId = parseInt(req.params.userId, 10) || 0;
  if (userId === live.host_id) throw badRequest('cannot_mute_host');
  await query('INSERT INTO live_mutes (live_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [live.id, userId]);
  await query("UPDATE live_comments SET status = 'removed' WHERE live_id = $1 AND user_id = $2", [live.id, userId]);
  res.json({ ok: true });
});

router.delete('/:id/mute/:userId', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!canModerate(live, req.user)) throw forbidden();
  await query('DELETE FROM live_mutes WHERE live_id = $1 AND user_id = $2', [live.id, parseInt(req.params.userId, 10) || 0]);
  res.json({ ok: true });
});

router.post('/:id/pin', requireAuth, async (req, res) => {
  const live = await loadLive(req.params.id, req.user);
  if (!isHostOf(live, req.user)) throw forbidden();
  const { productId } = parse(z.object({ productId: z.coerce.number().int().positive().nullable() }), req.body);
  await query('UPDATE live_products SET pinned_at = NULL WHERE live_id = $1', [live.id]);
  if (productId) {
    const { rowCount } = await query('UPDATE live_products SET pinned_at = now() WHERE live_id = $1 AND product_id = $2', [live.id, productId]);
    if (!rowCount) throw badRequest('validation_error', { productId: 'not_in_live' });
  }
  res.json({ ok: true });
});

// ---------- Admin ----------

const admin = Router();
admin.use(requireAuth, requireAdmin);

admin.get('/list', async (_req, res) => {
  const { rows } = await query(
    `SELECT ${LIVE_SELECT}, (SELECT COUNT(*)::int FROM content_reports r WHERE r.target_type = 'live' AND r.target_id = l.id AND r.status = 'open') AS reports
     ${LIVE_FROM} WHERE l.status IN ('live', 'scheduled') OR l.created_at > now() - interval '7 days'
     ORDER BY (l.status = 'live') DESC, l.created_at DESC LIMIT 100`,
  );
  res.json({ items: rows });
});

admin.post('/:id/stop', async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().trim().max(200).default('') }), req.body || {});
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query(
    "UPDATE live_streams SET status = 'removed', removed_reason = $2, ended_at = COALESCE(ended_at, now()) WHERE id = $1 RETURNING host_id",
    [id, reason || null],
  );
  if (!rows[0]) throw notFound();
  await query('DELETE FROM live_peers WHERE live_id = $1', [id]);
  await notify(rows[0].host_id, 'content_removed', { kind: 'live', reason }, null);
  res.json({ ok: true });
});

export default router;
