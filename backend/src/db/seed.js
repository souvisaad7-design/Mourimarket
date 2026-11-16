// Seeds categories and the admin account, plus (outside production) demo users,
// stores and listings. Safe to run on every start: it does nothing if data exists.
// SEED_DEMO=true|false overrides whether demo data is created.
// Demo images are generated SVG placeholders stored in the `files` table.
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { pool } from '../db.js';
import { saveRaw } from '../middleware/upload.js';

const withDemo = process.env.SEED_DEMO ? process.env.SEED_DEMO === 'true' : !config.isProd;

const CATEGORIES = [
  ['vehicles', 'السيارات والمركبات', 'Véhicules', 'Vehicles', '🚗'],
  ['phones-electronics', 'الهواتف والإلكترونيات', 'Téléphones & Électronique', 'Phones & Electronics', '📱'],
  ['fashion', 'الملابس والأزياء', 'Mode & Vêtements', 'Fashion & Clothing', '👗'],
  ['real-estate', 'العقارات', 'Immobilier', 'Real Estate', '🏠'],
  ['home-furniture', 'الأثاث والمنزل', 'Maison & Meubles', 'Home & Furniture', '🛋️'],
  ['computers', 'الحواسيب ومعدات الإعلام الآلي', 'Informatique', 'Computers & IT', '💻'],
  ['tools-equipment', 'الأدوات والمعدات', 'Outils & Équipements', 'Tools & Equipment', '🛠️'],
  ['services', 'الخدمات', 'Services', 'Services', '💼'],
  ['other', 'منتجات أخرى', 'Autres', 'Other', '📦'],
];

const COLORS = ['#0f766e', '#b45309', '#7c3aed', '#be123c', '#1d4ed8', '#15803d', '#a16207', '#0e7490', '#4b5563'];

const PRODUCTS = [
  // [category, title, description, price, city, condition, sellerIndex]
  ['vehicles', 'تويوتا هايلكس 2016 ديزل', 'سيارة بحالة ممتازة، محرك ديزل 2.5، دفع رباعي، مكيف يعمل، أوراق كاملة. الممشى 180 ألف كلم.', 1150000, 'nouakchott', 'used', 1],
  ['vehicles', 'Mercedes C220 2012', 'Boîte automatique, climatisation, intérieur cuir. Très bon état, entretien régulier.', 720000, 'nouadhibou', 'used', 2],
  ['vehicles', 'دراجة نارية ياماها 125', 'دراجة نارية اقتصادية في استهلاك الوقود، مناسبة للتنقل داخل المدينة.', 85000, 'rosso', 'used', 3],
  ['phones-electronics', 'آيفون 14 برو 256 جيجا', 'هاتف نظيف جداً مع العلبة والشاحن الأصلي، البطارية 89٪.', 42000, 'nouakchott', 'used', 1],
  ['phones-electronics', 'Samsung Galaxy A54 neuf', 'Téléphone neuf sous emballage, garantie 12 mois en boutique.', 16500, 'nouakchott', 'new', 4],
  ['phones-electronics', 'تلفاز سامسونج 55 بوصة 4K', 'تلفاز ذكي بدقة 4K مع جهاز التحكم، استعمال خفيف لمدة سنة.', 23000, 'kiffa', 'used', 2],
  ['fashion', 'دراعة رجالية بزان فاخر', 'دراعة مطرزة يدوياً من قماش البزان الأصلي، مقاسات مختلفة متوفرة.', 6500, 'nouakchott', 'new', 4],
  ['fashion', 'ملحفة نسائية قطنية', 'ملاحف بألوان متعددة، قماش خفيف ومريح مناسب للصيف.', 1800, 'atar', 'new', 4],
  ['real-estate', 'منزل للبيع في تفرغ زينة', 'منزل من طابقين، 4 غرف نوم، صالونان، مطبخ وحمامان. مساحة 300 م².', 9500000, 'nouakchott', 'used', 3],
  ['real-estate', 'Appartement à louer – Ksar', 'Appartement 3 pièces meublé, proche des commodités. Prix par mois.', 25000, 'nouakchott', 'used', 2],
  ['home-furniture', 'صالون مغربي كامل', 'صالون مغربي من 7 قطع مع الطاولة، قماش جديد.', 38000, 'nouakchott', 'used', 1],
  ['home-furniture', 'Réfrigérateur LG 400L', 'Réfrigérateur double porte, fonctionne parfaitement.', 14000, 'kaedi', 'used', 3],
  ['computers', 'لابتوب ديل Latitude i7', 'معالج i7 الجيل الثامن، رام 16 جيجا، SSD 512. مناسب للعمل والبرمجة.', 21000, 'nouakchott', 'used', 4],
  ['computers', 'Imprimante HP LaserJet', 'Imprimante laser monochrome, idéale pour bureau. Toner neuf inclus.', 7500, 'nouadhibou', 'used', 2],
  ['tools-equipment', 'مولد كهربائي 5 كيلوواط', 'مولد كهربائي يعمل بالبنزين، مناسب للمنازل والمحلات.', 32000, 'zouerate', 'used', 3],
  ['tools-equipment', 'Perceuse Bosch professionnelle', 'Perceuse-visseuse sans fil avec 2 batteries et mallette.', 4800, 'nouakchott', 'new', 4],
  ['services', 'خدمة صيانة المكيفات', 'تركيب وصيانة جميع أنواع المكيفات في نواكشوط، خدمة سريعة وأسعار مناسبة.', 1500, 'nouakchott', 'new', 1],
  ['services', 'Cours particuliers de mathématiques', 'Professeur expérimenté, niveaux collège et lycée. Prix par séance.', 800, 'nouakchott', 'new', 2],
  ['other', 'خيمة تقليدية كبيرة', 'خيمة موريتانية تقليدية مناسبة للمناسبات والرحلات.', 45000, 'aleg', 'used', 3],
  ['other', 'Lot de livres scolaires', 'Livres du programme du lycée, bon état.', 1200, 'rosso', 'used', 1],
];

function escapeXml(s) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}

function placeholderSvg(icon, title, color, variant) {
  const shade = variant ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${color}"/>
  <circle cx="${variant ? 650 : 150}" cy="120" r="220" fill="${shade}"/>
  <circle cx="${variant ? 120 : 680}" cy="560" r="180" fill="rgba(255,255,255,0.08)"/>
  <text x="400" y="300" font-size="160" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="400" y="470" font-size="34" font-family="Tahoma, Arial, sans-serif" fill="#fff" text-anchor="middle">${escapeXml(title.slice(0, 34))}</text>
</svg>`;
}

async function main() {
  if (config.isProd && !process.env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_PASSWORD (and ADMIN_EMAIL) before seeding a production database.');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rowCount } = await client.query('SELECT 1 FROM categories LIMIT 1');
    if (rowCount) {
      console.log('Database already seeded – nothing to do.');
      await client.query('ROLLBACK');
      return;
    }

    const catIds = {};
    for (const [i, [slug, ar, fr, en, icon]] of CATEGORIES.entries()) {
      const { rows } = await client.query(
        'INSERT INTO categories (slug, name_ar, name_fr, name_en, icon, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [slug, ar, fr, en, icon, i],
      );
      catIds[slug] = { id: rows[0].id, icon, color: COLORS[i] };
    }

    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345', 12);
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@maurimarket.mr').toLowerCase();
    if (!withDemo) {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, city) VALUES ('مدير المنصة', $1, $2, 'admin', 'nouakchott')`,
        [adminEmail, adminHash],
      );
      await client.query('COMMIT');
      console.log(`Seed complete (categories + admin ${adminEmail}).`);
      return;
    }
    const hash = await bcrypt.hash('Password123', 12);
    const users = [
      ['مدير المنصة', adminEmail, '+222 22000000', adminHash, 'admin', 'individual', 'nouakchott'],
      ['محمد ولد أحمد', 'mohamed@example.mr', '+222 36000001', hash, 'user', 'individual', 'nouakchott'],
      ['Fatimetou Sidi', 'fatimetou@example.mr', '+222 46000002', hash, 'user', 'merchant', 'nouadhibou'],
      ['سيدي محمد', 'sidi@example.mr', '+222 26000003', hash, 'user', 'individual', 'rosso'],
      ['متجر الأمانة', 'amana@example.mr', '+222 37000004', hash, 'user', 'merchant', 'nouakchott'],
      ['Aminetou Mint Ali', 'buyer@example.mr', '+222 47000005', hash, 'user', 'individual', 'nouakchott'],
    ];
    const userIds = [];
    for (const u of users) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, account_type, city) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        u,
      );
      userIds.push(rows[0].id);
    }

    const storeIds = {};
    const stores = [
      [2, 'Fatimetou Auto & Tech', 'fatimetou-auto-tech', 'Vente de véhicules, électronique et location immobilière à Nouadhibou.', 'nouadhibou'],
      [4, 'متجر الأمانة', 'amana-store', 'متجر متخصص في الهواتف والأزياء التقليدية والأدوات. جودة وأمانة منذ 2015.', 'nouakchott'],
    ];
    for (const [ui, name, slug, desc, city] of stores) {
      const { rows } = await client.query(
        `INSERT INTO stores (owner_id, name, slug, description, phone, whatsapp, city) VALUES ($1,$2,$3,$4,$5,$5,$6) RETURNING id`,
        [userIds[ui], name, slug, desc, users[ui][2], city],
      );
      storeIds[ui] = rows[0].id;
    }

    const productIds = [];
    for (const [i, [cat, title, desc, price, city, condition, si]] of PRODUCTS.entries()) {
      const { rows } = await client.query(
        `INSERT INTO products (seller_id, category_id, store_id, title, description, price, city, condition, status, views, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'approved',$9, now() - ($10 || ' hours')::interval) RETURNING id`,
        [userIds[si], catIds[cat].id, storeIds[si] || null, title, desc, price, city, condition,
          Math.floor(Math.random() * 300), String(i * 7)],
      );
      productIds.push(rows[0].id);
      for (const v of [0, 1]) {
        const url = await saveRaw(Buffer.from(placeholderSvg(catIds[cat].icon, title, catIds[cat].color, v)), 'image/svg+xml', client);
        await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1,$2,$3)', [rows[0].id, url, v]);
      }
    }

    // A pending listing for the moderation queue.
    const { rows: pending } = await client.query(
      `INSERT INTO products (seller_id, category_id, title, description, price, city, condition, status)
       VALUES ($1, $2, 'هاتف هواوي P30 للبيع', 'هاتف بحالة جيدة مع الشاحن، الشاشة سليمة.', 9000, 'nouakchott', 'used', 'pending') RETURNING id`,
      [userIds[3], catIds['phones-electronics'].id],
    );
    const pendingUrl = await saveRaw(Buffer.from(placeholderSvg('📱', 'هاتف هواوي P30', COLORS[1], 0)), 'image/svg+xml', client);
    await client.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [pending[0].id, pendingUrl]);

    // A conversation, a documented sale and a verified review.
    const buyer = userIds[5];
    const soldProduct = productIds[3]; // iPhone, seller userIds[1]
    const { rows: cv } = await client.query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES ($1,$2,$3) RETURNING id`,
      [soldProduct, buyer, userIds[1]],
    );
    const msgs = [
      [buyer, 'السلام عليكم، هل الهاتف ما زال متوفراً؟'],
      [userIds[1], 'وعليكم السلام، نعم متوفر.'],
      [buyer, 'ممتاز، هل يمكن أن نلتقي في سوق كابيتال غداً؟'],
      [userIds[1], 'نعم، الساعة الخامسة مساءً.'],
    ];
    for (const [sender, body] of msgs) {
      await client.query('INSERT INTO messages (conversation_id, sender_id, body, read_at) VALUES ($1,$2,$3, now())', [cv[0].id, sender, body]);
    }
    await client.query(`UPDATE products SET availability = 'sold', sold_to_id = $1, sold_at = now() WHERE id = $2`, [buyer, soldProduct]);
    await client.query(
      'INSERT INTO reviews (product_id, reviewer_id, seller_id, rating, comment) VALUES ($1,$2,$3,5,$4)',
      [soldProduct, buyer, userIds[1], 'بائع صادق والهاتف كما في الوصف. أنصح بالتعامل معه.'],
    );

    // A few special offers (price before discount).
    await client.query(
      `UPDATE products SET old_price = ROUND(price * 1.18, -2) WHERE id = ANY($1::int[])`,
      [[productIds[1], productIds[4], productIds[10], productIds[12], productIds[15]]],
    );

    // Verified merchants and a few featured listings.
    await client.query('UPDATE users SET is_verified = true WHERE id = ANY($1::int[])', [[userIds[2], userIds[4]]]);
    await client.query(
      `UPDATE products SET featured_until = now() + interval '14 days' WHERE id = ANY($1::int[])`,
      [[productIds[0], productIds[4], productIds[8], productIds[12]]],
    );

    // An open report for the admin queue.
    await client.query(
      `INSERT INTO reports (reporter_id, product_id, reason, details) VALUES ($1, $2, 'duplicate', 'Annonce publiée deux fois.')`,
      [buyer, productIds[9]],
    );

    await client.query('COMMIT');
    console.log('Seed complete.');
    console.log(`  Admin:     ${adminEmail} / ${process.env.ADMIN_PASSWORD ? '(ADMIN_PASSWORD)' : 'Admin12345'}`);
    console.log('  Demo users (password "Password123"): mohamed@, fatimetou@ (merchant), sidi@, amana@ (merchant), buyer@ @example.mr');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
