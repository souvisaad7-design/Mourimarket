// Souk Social: posts about real listings (photos / video), likes, comments, shares, follows,
// blocks and reports, with moderation by the admin.
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { badRequest, conflict, forbidden, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { limiter } from '../lib/rateLimit.js';
import { getSettings } from '../lib/settings.js';
import { assertSocialAllowed, blockedBetween, canSee, checkText, follows, notifyFollowers } from '../lib/social.js';
import { ownVideoUrl, deleteVideo } from '../lib/video.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { removeUploads, saveFile, upload } from '../middleware/upload.js';

const router = Router();
const perUser = (name, windowMs, limit) => limiter(name, { windowMs, limit, keyGenerator: (req) => String(req.user.id), skip: (req) => req.user?.role === 'admin' });
const postLimit = perUser('social-post', 24 * 3600_000, 20);
const commentLimit = perUser('social-comment', 10 * 60_000, 30);
const likeLimit = perUser('social-like', 3600_000, 300);
const followLimit = perUser('social-follow', 3600_000, 100);
const reportLimit = perUser('social-report', 3600_000, 20);
const shareLimit = limiter('social-share', { windowMs: 3600_000, limit: 60 });

// One post as shown in the feed: author, the linked listing and what the viewer did.
const POST_SELECT = (viewer) => `
  po.id, po.body, po.media, po.visibility, po.comments, po.status, po.like_count, po.comment_count, po.share_count,
  po.created_at, po.updated_at, po.author_id,
  u.name AS author_name, u.avatar_url AS author_avatar, u.is_verified AS author_verified, u.account_type AS author_type,
  s.name AS store_name, s.slug AS store_slug, s.logo_url AS store_logo,
  json_build_object('id', p.id, 'title', p.title, 'price', p.price, 'old_price', p.old_price, 'city', p.city,
    'availability', p.availability, 'status', p.status,
    'cover_url', (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort_order, id LIMIT 1)) AS product,
  ${viewer ? `EXISTS (SELECT 1 FROM post_likes l WHERE l.post_id = po.id AND l.user_id = ${Number(viewer.id)})` : 'false'} AS liked,
  ${viewer ? `EXISTS (SELECT 1 FROM follows f WHERE f.followee_id = po.author_id AND f.follower_id = ${Number(viewer.id)})` : 'false'} AS following`;
const POST_FROM = `
  FROM posts po JOIN users u ON u.id = po.author_id JOIN products p ON p.id = po.product_id
  LEFT JOIN stores s ON s.owner_id = po.author_id AND s.is_active`;

/** Posts this viewer may see: published, live listing, visibility, no blocks either way. */
function visibleWhere(viewer, params) {
  const where = ["po.status = 'published'", 'u.is_active', "p.status = 'approved'"];
  if (viewer?.role === 'admin') return where;
  if (viewer) {
    params.push(viewer.id);
    const me = `$${params.length}`;
    where.push(`(po.visibility = 'public' OR po.author_id = ${me} OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ${me} AND f.followee_id = po.author_id))`);
    where.push(`NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ${me} AND b.blocked_id = po.author_id) OR (b.blocker_id = po.author_id AND b.blocked_id = ${me}))`);
  } else {
    where.push("po.visibility = 'public'");
  }
  return where;
}

async function loadPost(id, viewer) {
  const { rows } = await query(`SELECT ${POST_SELECT(viewer)} ${POST_FROM} WHERE po.id = $1`, [parseInt(id, 10) || 0]);
  const post = rows[0];
  if (!post) throw notFound('post_not_found');
  const owner = viewer && (viewer.id === post.author_id || viewer.role === 'admin');
  if (post.status !== 'published' && !owner) throw notFound('post_not_found');
  if (!(await canSee(viewer, post.author_id, post.visibility))) throw notFound('post_not_found');
  return post;
}

// ---------- Feed ----------

router.get('/feed', optionalAuth, async (req, res) => {
  const tab = req.query.tab === 'following' && req.user ? 'following' : 'foryou';
  const before = parseInt(req.query.before, 10) || 0;
  const author = parseInt(req.query.author, 10) || 0;
  const product = parseInt(req.query.product, 10) || 0;
  const params = [];
  const where = visibleWhere(req.user, params);
  if (tab === 'following') { params.push(req.user.id); where.push(`(po.author_id = $${params.length} OR EXISTS (SELECT 1 FROM follows f2 WHERE f2.follower_id = $${params.length} AND f2.followee_id = po.author_id))`); }
  if (author) { params.push(author); where.push(`po.author_id = $${params.length}`); }
  if (product) { params.push(product); where.push(`po.product_id = $${params.length}`); }
  if (before) { params.push(before); where.push(`po.id < $${params.length}`); }
  const { rows } = await query(
    `SELECT ${POST_SELECT(req.user)} ${POST_FROM} WHERE ${where.join(' AND ')} ORDER BY po.id DESC LIMIT 15`,
    params,
  );
  res.json({ items: rows, next: rows.length === 15 ? rows.at(-1).id : null });
});

router.get('/posts/:id', optionalAuth, async (req, res) => {
  res.json({ post: await loadPost(req.params.id, req.user) });
});

// ---------- Create / edit / delete ----------

const postSchema = z.object({
  productId: z.coerce.number().int().positive(),
  body: z.string().trim().max(2000).default(''),
  videoUrl: z.string().trim().max(400).optional().or(z.literal('')),
  visibility: z.enum(['public', 'followers']).default('public'),
  comments: z.enum(['everyone', 'followers', 'off']).default('everyone'),
});

router.post('/posts', requireAuth, postLimit, upload.array('images', 6), async (req, res) => {
  await assertSocialAllowed(req.user);
  const data = parse(postSchema, req.body);
  const files = req.files || [];
  checkText(data.body, { allowLinks: false });
  // Every post points to a real, live listing of its author (admins may post about any listing).
  const { rows: prod } = await query("SELECT id, seller_id, status, title FROM products WHERE id = $1", [data.productId]);
  if (!prod[0] || prod[0].status !== 'approved') throw badRequest('validation_error', { productId: 'product_not_live' });
  if (prod[0].seller_id !== req.user.id && req.user.role !== 'admin') throw forbidden('not_your_product');
  if (data.videoUrl && !ownVideoUrl(data.videoUrl, req.user.id)) throw badRequest('validation_error', { videoUrl: 'invalid' });
  if (!files.length && !data.videoUrl && !data.body) throw badRequest('validation_error', { body: 'required' });
  const post = await tx(async (client) => {
    const media = [];
    for (const f of files) media.push({ type: 'image', url: await saveFile(f, client) });
    if (data.videoUrl) media.push({ type: 'video', url: data.videoUrl });
    const { rows } = await client.query(
      `INSERT INTO posts (author_id, product_id, body, media, visibility, comments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, data.productId, data.body, JSON.stringify(media), data.visibility, data.comments],
    );
    return rows[0];
  });
  await notifyFollowers(req.user.id, 'followed_post', { name: req.user.name, title: prod[0].title }, `/social/posts/${post.id}`);
  res.status(201).json({ post: await loadPost(post.id, req.user) });
});

router.patch('/posts/:id', requireAuth, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  if (post.author_id !== req.user.id) throw forbidden();
  const data = parse(postSchema.pick({ body: true, visibility: true, comments: true }).partial(), req.body);
  if (data.body !== undefined) checkText(data.body);
  await query(
    `UPDATE posts SET body = COALESCE($2, body), visibility = COALESCE($3, visibility), comments = COALESCE($4, comments), updated_at = now() WHERE id = $1`,
    [post.id, data.body ?? null, data.visibility ?? null, data.comments ?? null],
  );
  res.json({ post: await loadPost(post.id, req.user) });
});

router.delete('/posts/:id', requireAuth, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  if (post.author_id !== req.user.id && req.user.role !== 'admin') throw forbidden();
  await query('DELETE FROM posts WHERE id = $1', [post.id]);
  removeUploads(post.media.filter((m) => m.type === 'image').map((m) => m.url));
  post.media.filter((m) => m.type === 'video').forEach((m) => deleteVideo(m.url));
  res.json({ ok: true });
});

// ---------- Likes, shares ----------

router.post('/posts/:id/like', requireAuth, likeLimit, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  const { rowCount } = await query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [post.id, req.user.id]);
  if (rowCount) {
    await query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [post.id]);
    // One "liked your post" notification per post per hour, never for your own likes.
    if (post.author_id !== req.user.id) {
      const recent = await query(
        "SELECT 1 FROM notifications WHERE user_id = $1 AND type = 'post_like' AND link = $2 AND created_at > now() - interval '1 hour'",
        [post.author_id, `/social/posts/${post.id}`],
      );
      if (!recent.rowCount) await notify(post.author_id, 'post_like', { name: req.user.name }, `/social/posts/${post.id}`);
    }
  }
  res.json({ liked: true, like_count: post.like_count + rowCount });
});

router.delete('/posts/:id/like', requireAuth, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  const { rowCount } = await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [post.id, req.user.id]);
  if (rowCount) await query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1', [post.id]);
  res.json({ liked: false, like_count: Math.max(0, post.like_count - rowCount) });
});

router.post('/posts/:id/share', optionalAuth, shareLimit, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  await query('UPDATE posts SET share_count = share_count + 1 WHERE id = $1', [post.id]);
  res.json({ share_count: post.share_count + 1, path: `/social/posts/${post.id}` });
});

// ---------- Comments ----------

router.get('/posts/:id/comments', optionalAuth, async (req, res) => {
  const post = await loadPost(req.params.id, req.user);
  const { rows } = await query(
    `SELECT c.id, c.body, c.created_at, c.user_id, u.name, u.avatar_url, u.is_verified
     FROM post_comments c JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1 AND c.status = 'published' AND u.is_active
       ${req.user ? 'AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE b.blocker_id = $2 AND b.blocked_id = c.user_id)' : ''}
     ORDER BY c.id LIMIT 200`,
    req.user ? [post.id, req.user.id] : [post.id],
  );
  res.json({ items: rows });
});

router.post('/posts/:id/comments', requireAuth, commentLimit, async (req, res) => {
  await assertSocialAllowed(req.user);
  const post = await loadPost(req.params.id, req.user);
  const { body } = parse(z.object({ body: z.string().trim().min(1).max(1000) }), req.body);
  if (post.author_id !== req.user.id) {
    if (post.comments === 'off') throw forbidden('comments_off');
    if (post.comments === 'followers' && !(await follows(req.user.id, post.author_id))) throw forbidden('comments_followers_only');
  }
  checkText(body);
  const { rows } = await query(
    'INSERT INTO post_comments (post_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, body, created_at, user_id',
    [post.id, req.user.id, body],
  );
  await query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [post.id]);
  if (post.author_id !== req.user.id) await notify(post.author_id, 'post_comment', { name: req.user.name, text: body.slice(0, 80) }, `/social/posts/${post.id}`);
  res.status(201).json({ comment: { ...rows[0], name: req.user.name, avatar_url: req.user.avatar_url, is_verified: req.user.is_verified } });
});

router.delete('/comments/:id', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT c.id, c.user_id, c.post_id, p.author_id FROM post_comments c JOIN posts p ON p.id = c.post_id WHERE c.id = $1 AND c.status = \'published\'',
    [parseInt(req.params.id, 10) || 0],
  );
  const c = rows[0];
  if (!c) throw notFound();
  // The comment's writer, the post's author (moderates their own post) or an admin.
  if (![c.user_id, c.author_id].includes(req.user.id) && req.user.role !== 'admin') throw forbidden();
  await query("UPDATE post_comments SET status = 'removed' WHERE id = $1", [c.id]);
  await query('UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1', [c.post_id]);
  res.json({ ok: true });
});

// ---------- Follow / block ----------

router.get('/users/:id', optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const { rows } = await query(
    `SELECT u.id, u.name, u.avatar_url, u.is_verified, u.account_type,
       (SELECT COUNT(*)::int FROM follows WHERE followee_id = u.id) AS followers,
       (SELECT COUNT(*)::int FROM follows WHERE follower_id = u.id) AS following,
       (SELECT COUNT(*)::int FROM posts WHERE author_id = u.id AND status = 'published') AS posts
     FROM users u WHERE u.id = $1 AND u.is_active`,
    [id],
  );
  if (!rows[0]) throw notFound('user_not_found');
  const me = req.user;
  res.json({
    ...rows[0],
    followed_by_me: me ? await follows(me.id, id) : false,
    blocked_by_me: me ? (await query('SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2', [me.id, id])).rowCount > 0 : false,
  });
});

router.post('/follow/:id', requireAuth, followLimit, async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  if (id === req.user.id) throw badRequest('cannot_follow_self');
  const { rows } = await query('SELECT id FROM users WHERE id = $1 AND is_active', [id]);
  if (!rows[0]) throw notFound('user_not_found');
  if (await blockedBetween(req.user.id, id)) throw forbidden('blocked');
  const { rowCount } = await query('INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, id]);
  if (rowCount) await notify(id, 'new_follower', { name: req.user.name }, `/users/${req.user.id}`);
  res.json({ following: true });
});

router.delete('/follow/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2', [req.user.id, parseInt(req.params.id, 10) || 0]);
  res.json({ following: false });
});

/** Who I follow / who follows me (only for myself: lists are private). */
const followList = (list) => async (req, res) => {
  const mine = list === 'following' ? 'follower_id' : 'followee_id';
  const other = list === 'following' ? 'followee_id' : 'follower_id';
  const { rows } = await query(
    `SELECT u.id, u.name, u.avatar_url, u.is_verified, s.name AS store_name, s.slug AS store_slug
     FROM follows f JOIN users u ON u.id = f.${other} LEFT JOIN stores s ON s.owner_id = u.id AND s.is_active
     WHERE f.${mine} = $1 AND u.is_active ORDER BY f.created_at DESC LIMIT 500`,
    [req.user.id],
  );
  res.json({ items: rows });
};
router.get('/me/following', requireAuth, followList('following'));
router.get('/me/followers', requireAuth, followList('followers'));

router.post('/block/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  if (id === req.user.id) throw badRequest('cannot_block_self');
  const { rows } = await query('SELECT role FROM users WHERE id = $1', [id]);
  if (!rows[0]) throw notFound('user_not_found');
  if (rows[0].role === 'admin') throw badRequest('cannot_block_admin');
  await query('INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.user.id, id]);
  // Blocking also removes the follow in both directions.
  await query('DELETE FROM follows WHERE (follower_id = $1 AND followee_id = $2) OR (follower_id = $2 AND followee_id = $1)', [req.user.id, id]);
  res.json({ blocked: true });
});

router.delete('/block/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2', [req.user.id, parseInt(req.params.id, 10) || 0]);
  res.json({ blocked: false });
});

router.get('/me/blocks', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT u.id, u.name, u.avatar_url FROM user_blocks b JOIN users u ON u.id = b.blocked_id WHERE b.blocker_id = $1 ORDER BY b.created_at DESC',
    [req.user.id],
  );
  res.json({ items: rows });
});

// ---------- Reports (posts, comments, lives, live comments) ----------

const TARGET_SQL = {
  post: 'SELECT author_id AS owner FROM posts WHERE id = $1',
  comment: 'SELECT user_id AS owner FROM post_comments WHERE id = $1',
  live: 'SELECT host_id AS owner FROM live_streams WHERE id = $1',
  live_comment: 'SELECT user_id AS owner FROM live_comments WHERE id = $1',
};

router.post('/reports', requireAuth, reportLimit, async (req, res) => {
  const data = parse(z.object({
    targetType: z.enum(['post', 'comment', 'live', 'live_comment']),
    targetId: z.coerce.number().int().positive(),
    reason: z.enum(['scam', 'prohibited', 'offensive', 'nudity', 'violence', 'spam', 'other']),
    details: z.string().trim().max(500).optional(),
  }), req.body);
  const { rows } = await query(TARGET_SQL[data.targetType], [data.targetId]);
  if (!rows[0]) throw notFound();
  if (rows[0].owner === req.user.id) throw badRequest('cannot_report_own');
  try {
    await query(
      'INSERT INTO content_reports (reporter_id, target_type, target_id, reason, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, data.targetType, data.targetId, data.reason, data.details || null],
    );
  } catch (err) {
    if (err.code === '23505') throw conflict('already_reported');
    throw err;
  }
  // Many distinct reports hide a post until a moderator looks at it.
  if (data.targetType === 'post') {
    const { community: social } = await getSettings();
    const n = await query("SELECT COUNT(*)::int AS n FROM content_reports WHERE target_type = 'post' AND target_id = $1 AND status = 'open'", [data.targetId]);
    if (n.rows[0].n >= social.autoHideReports) await query("UPDATE posts SET status = 'hidden' WHERE id = $1 AND status = 'published'", [data.targetId]);
  }
  res.status(201).json({ ok: true });
});

// ---------- Admin moderation ----------

const admin = Router();
admin.use(requireAuth, requireAdmin);

admin.get('/reports', async (req, res) => {
  const status = ['open', 'resolved', 'dismissed'].includes(req.query.status) ? req.query.status : 'open';
  const { rows } = await query(
    `SELECT r.target_type, r.target_id, MIN(r.id) AS id, COUNT(*)::int AS reports,
       array_agg(DISTINCT r.reason) AS reasons, MAX(r.created_at) AS last_at,
       (array_agg(r.details ORDER BY r.id DESC) FILTER (WHERE r.details IS NOT NULL))[1] AS details,
       CASE r.target_type
         WHEN 'post' THEN (SELECT json_build_object('text', po.body, 'status', po.status, 'owner_id', po.author_id, 'owner', u.name, 'media', po.media, 'link', '/social/posts/' || po.id) FROM posts po JOIN users u ON u.id = po.author_id WHERE po.id = r.target_id)
         WHEN 'comment' THEN (SELECT json_build_object('text', c.body, 'status', c.status, 'owner_id', c.user_id, 'owner', u.name, 'link', '/social/posts/' || c.post_id) FROM post_comments c JOIN users u ON u.id = c.user_id WHERE c.id = r.target_id)
         WHEN 'live' THEN (SELECT json_build_object('text', l.title, 'status', l.status, 'owner_id', l.host_id, 'owner', u.name, 'link', '/live/' || l.id) FROM live_streams l JOIN users u ON u.id = l.host_id WHERE l.id = r.target_id)
         ELSE (SELECT json_build_object('text', c.body, 'status', c.status, 'owner_id', c.user_id, 'owner', u.name, 'link', '/live/' || c.live_id) FROM live_comments c JOIN users u ON u.id = c.user_id WHERE c.id = r.target_id)
       END AS target
     FROM content_reports r WHERE r.status = $1
     GROUP BY r.target_type, r.target_id ORDER BY COUNT(*) DESC, MAX(r.created_at) DESC LIMIT 100`,
    [status],
  );
  res.json({ items: rows });
});

admin.post('/reports/handle', async (req, res) => {
  const data = parse(z.object({
    targetType: z.enum(['post', 'comment', 'live', 'live_comment']),
    targetId: z.coerce.number().int().positive(),
    action: z.enum(['dismiss', 'remove', 'restore']),
    banDays: z.coerce.number().int().min(0).max(3650).default(0),
    reason: z.string().trim().max(200).optional(),
  }), req.body);
  const { rows } = await query(TARGET_SQL[data.targetType], [data.targetId]);
  if (!rows[0]) throw notFound();
  const owner = rows[0].owner;
  if (data.action === 'remove') {
    if (data.targetType === 'post') await query("UPDATE posts SET status = 'removed', removed_reason = $2 WHERE id = $1", [data.targetId, data.reason || null]);
    if (data.targetType === 'comment') {
      const c = await query("UPDATE post_comments SET status = 'removed' WHERE id = $1 AND status = 'published' RETURNING post_id", [data.targetId]);
      if (c.rows[0]) await query('UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1', [c.rows[0].post_id]);
    }
    if (data.targetType === 'live') await query("UPDATE live_streams SET status = 'removed', removed_reason = $2, ended_at = COALESCE(ended_at, now()) WHERE id = $1", [data.targetId, data.reason || null]);
    if (data.targetType === 'live_comment') await query("UPDATE live_comments SET status = 'removed' WHERE id = $1", [data.targetId]);
    await notify(owner, 'content_removed', { kind: data.targetType, reason: data.reason || '' }, null);
  }
  if (data.action === 'restore' && data.targetType === 'post') await query("UPDATE posts SET status = 'published' WHERE id = $1 AND status = 'hidden'", [data.targetId]);
  if (data.banDays > 0) {
    const target = await query('SELECT role FROM users WHERE id = $1', [owner]);
    if (target.rows[0]?.role !== 'admin') {
      await query("UPDATE users SET social_banned_until = now() + ($2 || ' days')::interval WHERE id = $1", [owner, String(data.banDays)]);
      await query("UPDATE live_streams SET status = 'removed', ended_at = now() WHERE host_id = $1 AND status = 'live'", [owner]);
    }
  }
  await query(
    `UPDATE content_reports SET status = $3, handled_by = $4, handled_at = now() WHERE target_type = $1 AND target_id = $2 AND status = 'open'`,
    [data.targetType, data.targetId, data.action === 'dismiss' || data.action === 'restore' ? 'dismissed' : 'resolved', req.user.id],
  );
  res.json({ ok: true });
});

admin.get('/overview', async (_req, res) => {
  const { rows } = await query(`SELECT
      (SELECT COUNT(*)::int FROM posts WHERE status = 'published') AS posts,
      (SELECT COUNT(*)::int FROM posts WHERE status = 'hidden') AS hidden_posts,
      (SELECT COUNT(*)::int FROM posts WHERE created_at > now() - interval '1 day') AS posts_today,
      (SELECT COUNT(*)::int FROM follows) AS follows,
      (SELECT COUNT(DISTINCT (target_type, target_id))::int FROM content_reports WHERE status = 'open') AS open_reports,
      (SELECT COUNT(*)::int FROM live_streams WHERE status = 'live') AS live_now,
      (SELECT COUNT(*)::int FROM live_streams WHERE status = 'scheduled' AND scheduled_at > now()) AS live_scheduled,
      (SELECT COUNT(*)::int FROM users WHERE social_banned_until > now()) AS banned`);
  res.json(rows[0]);
});

admin.post('/unban/:id', async (req, res) => {
  await query('UPDATE users SET social_banned_until = NULL WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  res.json({ ok: true });
});

router.use('/admin', admin);

export default router;
