// Seller statistics: views per day, where visitors come from, reply rate and speed, best listings.
import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

export const VIEW_SOURCES = ['site', 'direct', 'whatsapp', 'facebook', 'google', 'instagram', 'tiktok', 'qr', 'other'];

/** Count one view of a listing, per day and source (called from the listing page, not by its owner). */
export async function recordView(productId, source) {
  const src = VIEW_SOURCES.includes(source) ? source : 'other';
  await query(
    `INSERT INTO product_views_daily (product_id, day, source, views) VALUES ($1, current_date, $2, 1)
     ON CONFLICT (product_id, day, source) DO UPDATE SET views = product_views_daily.views + 1`,
    [productId, src],
  );
}

/** GET /api/seller/stats?days=7|30|90 */
router.get('/seller/stats', requireAuth, async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  const me = req.user.id;
  const since = `current_date - ${days - 1}`; // a whitelisted number, not user text
  const [daily, sources, top, replies, totals] = await Promise.all([
    query(
      `SELECT to_char(d, 'YYYY-MM-DD') AS day, COALESCE(SUM(v.views), 0)::int AS views
       FROM generate_series(${since}, current_date, interval '1 day') d
       LEFT JOIN product_views_daily v ON v.day = d::date AND v.product_id IN (SELECT id FROM products WHERE seller_id = $1)
       GROUP BY d ORDER BY d`, [me]),
    query(
      `SELECT v.source, SUM(v.views)::int AS views FROM product_views_daily v JOIN products p ON p.id = v.product_id
       WHERE p.seller_id = $1 AND v.day >= ${since} GROUP BY v.source ORDER BY views DESC`, [me]),
    query(
      `SELECT p.id, p.title, p.status, p.availability, p.price,
         COALESCE((SELECT SUM(views) FROM product_views_daily v WHERE v.product_id = p.id AND v.day >= ${since}), 0)::int AS views,
         (SELECT COUNT(*) FROM favorites f WHERE f.product_id = p.id)::int AS favorites,
         (SELECT COUNT(*) FROM conversations cv WHERE cv.product_id = p.id AND cv.created_at >= ${since})::int AS chats
       FROM products p WHERE p.seller_id = $1 ORDER BY views DESC, p.created_at DESC LIMIT 5`, [me]),
    // Conversations buyers opened about my listings in the period: did I answer, and how fast?
    query(
      `WITH c AS (
         SELECT cv.id,
           (SELECT MIN(created_at) FROM messages m WHERE m.conversation_id = cv.id AND m.sender_id <> $1) AS asked,
           (SELECT MIN(created_at) FROM messages m WHERE m.conversation_id = cv.id AND m.sender_id = $1) AS answered
         FROM conversations cv WHERE cv.seller_id = $1 AND cv.created_at >= ${since})
       SELECT COUNT(*) FILTER (WHERE asked IS NOT NULL)::int AS received,
              COUNT(*) FILTER (WHERE asked IS NOT NULL AND answered > asked)::int AS answered,
              ROUND(EXTRACT(EPOCH FROM percentile_cont(0.5) WITHIN GROUP (ORDER BY answered - asked)
                FILTER (WHERE answered > asked)) / 60)::int AS median_minutes
       FROM c`, [me]),
    query(
      `SELECT (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND status = 'approved' AND availability = 'available')::int AS live,
              (SELECT COUNT(*) FROM favorites f JOIN products p ON p.id = f.product_id WHERE p.seller_id = $1)::int AS favorites,
              (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND availability = 'sold' AND sold_at >= ${since})::int AS sold`, [me]),
  ]);
  const r = replies.rows[0];
  res.json({
    days,
    daily: daily.rows,
    sources: sources.rows,
    top: top.rows,
    totals: {
      ...totals.rows[0],
      views: daily.rows.reduce((a, d) => a + d.views, 0),
      chats: r.received,
      replyRate: r.received ? Math.round((r.answered / r.received) * 100) : null,
      medianReplyMinutes: r.median_minutes,
    },
  });
});

export default router;
