// Alerts that bring people back: saved searches ("tell me about any Hilux in Nouakchott under 400,000")
// and price drops on listings in their favourites.
import { query } from '../db.js';
import { normalize, searchTerms, termAlternatives } from './search.js';
import { notify } from './notify.js';

/** Does this listing match the saved filters? (same rules as the search page) */
export function matches(p, f) {
  if (f.category && f.category !== p.category_slug) return false;
  if (f.city && f.city !== p.city) return false;
  if (f.condition && f.condition !== p.condition) return false;
  if (f.minPrice != null && Number(p.price) < Number(f.minPrice)) return false;
  if (f.maxPrice != null && Number(p.price) > Number(f.maxPrice)) return false;
  if (f.q) {
    const text = normalize(`${p.title} ${p.description} ${p.category_name || ''}`).replace(/(^|\s)(وال|بال|فال|كال|لل|ال)(?=\S{2,})/g, '$1');
    if (!searchTerms(f.q).every((term) => termAlternatives(term).some((w) => text.includes(w)))) return false;
  }
  return true;
}

/**
 * A listing just went live: tell the people whose saved searches match it. Runs once per listing
 * (products.alerted_at), so edits and re-approvals never send the alert again.
 */
export async function onListingLive(productId) {
  const { rows } = await query(
    `UPDATE products p SET alerted_at = now()
     FROM users u, categories c
     WHERE p.id = $1 AND p.alerted_at IS NULL AND p.status = 'approved' AND p.availability = 'available'
       AND u.id = p.seller_id AND u.is_active AND c.id = p.category_id
     RETURNING p.id, p.title, p.description, p.price, p.city, p.condition, p.seller_id, c.slug AS category_slug, c.name_ar AS category_name`,
    [productId],
  );
  const p = rows[0];
  if (!p) return 0;
  // Pre-filter in SQL on the cheap fields, then check the words.
  const { rows: searches } = await query(
    `SELECT s.id, s.user_id, s.name, s.filters FROM saved_searches s JOIN users u ON u.id = s.user_id
     WHERE s.is_active AND u.is_active AND s.user_id <> $1
       AND (s.filters->>'category' IS NULL OR s.filters->>'category' = $2)
       AND (s.filters->>'city' IS NULL OR s.filters->>'city' = $3)
       AND (s.filters->>'minPrice' IS NULL OR (s.filters->>'minPrice')::numeric <= $4)
       AND (s.filters->>'maxPrice' IS NULL OR (s.filters->>'maxPrice')::numeric >= $4)
     LIMIT 2000`,
    [p.seller_id, p.category_slug, p.city, p.price],
  );
  const notified = new Set();
  for (const s of searches) {
    if (notified.has(s.user_id) || !matches(p, s.filters)) continue;
    notified.add(s.user_id); // one alert per person, even if several of their searches match
    await notify(s.user_id, 'saved_search_match', { title: p.title, name: s.name, price: Number(p.price), id: p.id }, `/products/${p.id}`);
    await query('UPDATE saved_searches SET hits = hits + 1, last_hit_at = now() WHERE id = $1', [s.id]);
  }
  return notified.size;
}

/** The price went down: tell everyone who saved the listing in their favourites. */
export async function onPriceChange(productId, oldPrice, newPrice) {
  if (!(Number(newPrice) < Number(oldPrice))) return 0;
  const { rows } = await query(
    `SELECT f.user_id, p.title FROM favorites f JOIN products p ON p.id = f.product_id JOIN users u ON u.id = f.user_id
     WHERE f.product_id = $1 AND p.status = 'approved' AND p.availability = 'available' AND u.is_active AND f.user_id <> p.seller_id`,
    [productId],
  );
  for (const r of rows) {
    await notify(r.user_id, 'price_drop', { title: r.title, old: Number(oldPrice), price: Number(newPrice), id: productId }, `/products/${productId}`);
  }
  return rows.length;
}

/**
 * Call whenever a listing is (again) live: sends the saved-search alerts the first time,
 * and a price-drop alert if it now costs less than when buyers last saw it.
 */
export async function onApproved(productId) {
  try {
    const { rows } = await query(
      `UPDATE products p SET live_price = p.price FROM (SELECT id, live_price FROM products WHERE id = $1 FOR UPDATE) old
       WHERE p.id = old.id AND p.status = 'approved' RETURNING old.live_price AS before, p.price AS now`,
      [productId],
    );
    await onListingLive(productId);
    if (rows[0] && rows[0].before != null) await onPriceChange(productId, rows[0].before, rows[0].now);
  } catch (err) {
    console.error('alerts failed', err); // alerts never break publishing
  }
}
