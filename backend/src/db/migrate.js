import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../db.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

const TABLES = [
  'meeting_places',
  'live_signals', 'live_peers', 'live_mutes', 'live_comments', 'live_products', 'live_streams',
  'content_reports', 'user_blocks', 'follows', 'post_comments', 'post_likes', 'posts',
  'fraud_flags', 'ai_translations', 'ai_usage',
  'inspections',
  'product_views_daily',
  'wanted_ads',
  'saved_searches',
  'push_subscriptions', 'app_secrets',
  'rate_limits',
  'delivery_ratings', 'order_events', 'orders', 'couriers', 'banners', 'cities', 'pages', 'site_settings', 'upgrade_requests', 'notifications', 'reports', 'reviews', 'messages', 'conversations', 'favorites',
  'product_images', 'products', 'stores', 'categories', 'password_resets', 'users', 'files',
];

async function main() {
  if (process.argv.includes('--reset')) {
    await pool.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`);
    console.log('Dropped all tables');
  }
  const sql = await fs.readFile(path.join(dir, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Schema applied');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
