// Database side of Souk AI: everything the assistant shows comes from real, live listings,
// and price suggestions / recommendations are computed from the data (no AI cost).
import { query } from '../db.js';
import { PRODUCT_FROM, PRODUCT_SELECT } from '../routes/products.js';
import { buildSearch, escapeLike, normalize } from './search.js';

const LIVE = "p.status = 'approved' AND p.availability = 'available' AND u.is_active";

/** Words worth searching for, normalised like products.search_text (max 12). */
export function keywordTerms(keywords) {
  const words = normalize([].concat(keywords || []).join(' '))
    .split(/[\s,.;:!?()[\]"'«»،؛؟\-_/]+/)
    .map((w) => w.replace(/^(وال|بال|فال|كال|لل|ال)(?=\S{2,})/, ''))
    .filter((w) => w.length >= 2);
  return [...new Set(words)].slice(0, 12);
}

/**
 * Live listings matching any of the keywords, best matches first. Each result carries
 * `match` = how many of the words it contains, so callers can tell a strong match from a weak one.
 */
export async function findProducts({ keywords, category, city, minPrice, maxPrice, condition, limit = 8, excludeIds = [] }) {
  const terms = keywordTerms(keywords);
  const params = [];
  const push = (v) => { params.push(v); return `$${params.length}`; };
  const where = [LIVE];
  const parts = terms.map((t) => {
    const like = push(`%${escapeLike(t)}%`);
    return `(CASE WHEN p.search_text LIKE ${like} THEN 1 ELSE 0 END)`;
  });
  const titleParts = terms.map((t) => `(CASE WHEN mm_normalize(p.title) LIKE ${push(`%${escapeLike(t)}%`)} THEN 1 ELSE 0 END)`);
  const match = parts.length ? parts.join(' + ') : '0';
  if (parts.length) where.push(`(${match}) > 0`);
  if (category) where.push(`c.slug = ${push(category)}`);
  if (city) where.push(`p.city = ${push(city)}`);
  if (Number.isFinite(minPrice)) where.push(`p.price >= ${push(minPrice)}`);
  if (Number.isFinite(maxPrice)) where.push(`p.price <= ${push(maxPrice)}`);
  if (condition === 'new' || condition === 'used') where.push(`p.condition = ${push(condition)}`);
  if (excludeIds.length) where.push(`p.id <> ALL(${push(excludeIds)}::int[])`);
  if (!parts.length && !category) return [];
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, (${match})::int AS match, false AS is_favorite, NULL::float8 AS distance_km
     ${PRODUCT_FROM} WHERE ${where.join(' AND ')}
     ORDER BY (${match}) + 0.5 * (${titleParts.length ? titleParts.join(' + ') : '0'}) DESC,
       (p.featured_until IS NOT NULL AND p.featured_until > now()) DESC, COALESCE(p.bumped_at, p.created_at) DESC
     LIMIT ${Math.min(Math.max(limit, 1), 24)}`,
    params,
  );
  return rows;
}

/** Live listings by id (keeps the given order), e.g. the ones the assistant picked. */
export async function productsByIds(ids) {
  if (!ids.length) return [];
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, false AS is_favorite, NULL::float8 AS distance_km ${PRODUCT_FROM}
     WHERE ${LIVE} AND p.id = ANY($1::int[])`,
    [ids],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/**
 * Smart pricing: what similar listings (same category, similar words, same condition) ask,
 * over the last 12 months, live or sold. Falls back to the whole category when too few match.
 */
export async function priceStats({ categoryId, q, condition, excludeId }) {
  const run = async (withWords) => {
    const params = [categoryId];
    const push = (v) => { params.push(v); return `$${params.length}`; };
    const where = ["p.category_id = $1", "p.status = 'approved'", "p.created_at > now() - interval '365 days'", 'p.price > 0'];
    if (condition === 'new' || condition === 'used') where.push(`p.condition = ${push(condition)}`);
    if (excludeId) where.push(`p.id <> ${push(excludeId)}`);
    if (withWords) {
      const s = await buildSearch(q, push);
      if (!s) return null;
      where.push(s.where);
    }
    const { rows } = await query(
      `SELECT COUNT(*)::int AS n,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY p.price)::float8 AS median,
         percentile_cont(0.25) WITHIN GROUP (ORDER BY p.price)::float8 AS p25,
         percentile_cont(0.75) WITHIN GROUP (ORDER BY p.price)::float8 AS p75,
         MIN(p.price)::float8 AS min, MAX(p.price)::float8 AS max,
         COUNT(*) FILTER (WHERE p.availability = 'sold')::int AS sold
       FROM products p WHERE ${where.join(' AND ')}`,
      params,
    );
    return rows[0];
  };
  let basis = 'similar';
  let stats = q ? await run(true) : null;
  if (!stats || stats.n < 3) { basis = 'category'; stats = await run(false); }
  if (!stats || stats.n < 3) return { n: stats?.n || 0, basis: 'none' };
  const round = (v) => Math.round(v / 10) * 10;
  return {
    basis, n: stats.n, sold: stats.sold,
    median: round(stats.median), low: round(stats.p25), high: round(stats.p75), min: stats.min, max: stats.max,
    confidence: stats.n >= 15 ? 'high' : stats.n >= 6 ? 'medium' : 'low',
  };
}

/**
 * Smart recommendations from what this visitor looked at (ids kept on their own device and
 * sent with the request) and, when signed in and allowed, their favourites. Nothing is stored.
 */
export async function recommend({ user, seenIds = [], personalize = true, limit = 12 }) {
  const signalIds = [...seenIds];
  if (user && personalize) {
    const fav = await query('SELECT product_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [user.id]);
    signalIds.push(...fav.rows.map((r) => r.product_id));
  }
  const ids = [...new Set(signalIds)].slice(0, 40);
  const signals = ids.length
    ? (await query('SELECT id, category_id, price::float8 AS price, city FROM products WHERE id = ANY($1::int[])', [ids])).rows
    : [];
  const exclude = [...ids];
  if (!signals.length) {
    const { rows } = await query(
      `SELECT ${PRODUCT_SELECT}, false AS is_favorite, NULL::float8 AS distance_km ${PRODUCT_FROM}
       WHERE ${LIVE} ${user ? 'AND p.seller_id <> $1' : ''}
       ORDER BY (p.featured_until IS NOT NULL AND p.featured_until > now()) DESC, p.views DESC, p.created_at DESC LIMIT ${limit}`,
      user ? [user.id] : [],
    );
    return { basis: 'popular', items: rows };
  }
  // Interest profile: how often each category appears, the typical price looked at in it, the cities.
  const cats = new Map();
  const cities = new Map();
  for (const s of signals) {
    const c = cats.get(s.category_id) || { n: 0, prices: [] };
    c.n += 1; if (s.price > 0) c.prices.push(s.price);
    cats.set(s.category_id, c);
    if (s.city) cities.set(s.city, (cities.get(s.city) || 0) + 1);
  }
  const { rows } = await query(
    `SELECT ${PRODUCT_SELECT}, false AS is_favorite, NULL::float8 AS distance_km ${PRODUCT_FROM}
     WHERE ${LIVE} AND p.category_id = ANY($1::int[]) AND p.id <> ALL($2::int[]) ${user ? 'AND p.seller_id <> $3' : ''}
     ORDER BY COALESCE(p.bumped_at, p.created_at) DESC LIMIT 200`,
    user ? [[...cats.keys()], exclude, user.id] : [[...cats.keys()], exclude],
  );
  const total = signals.length;
  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const scored = rows.map((p) => {
    const c = cats.get(p.category_id);
    const ref = median(c.prices);
    const price = Number(p.price);
    const priceFit = ref && price > 0 ? Math.max(0, 1 - Math.abs(Math.log(price / ref)) / 1.5) : 0.3;
    const ageDays = (Date.now() - new Date(p.bumped_at || p.created_at).getTime()) / 86_400_000;
    const score = 3 * (c.n / total) + 1.5 * priceFit + (cities.has(p.city) ? 0.7 : 0)
      + Math.max(0, 0.6 - ageDays / 30) + (p.is_featured ? 0.3 : 0);
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Keep some variety: at most half of the list from one category.
  const perCat = new Map();
  const items = [];
  for (const { p } of scored) {
    const n = perCat.get(p.category_id) || 0;
    if (cats.size > 1 && n >= Math.ceil(limit / 2)) continue;
    perCat.set(p.category_id, n + 1);
    items.push(p);
    if (items.length >= limit) break;
  }
  return { basis: 'personal', items };
}
