// What WhatsApp, Facebook and Google see: the React app is built in the browser, so the HTML
// they fetch was empty. These routes send the same app shell with the right <title>, description,
// Open Graph / Twitter tags, JSON-LD and a text version of the page, plus sitemap.xml and robots.txt.
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { config } from '../config.js';
import { query } from '../db.js';
import { getCities } from '../lib/cities.js';
import { getSettings } from '../lib/settings.js';

const router = Router();

// Same policy as vercel.json, so pages rendered here behave like the static ones.
export const HTML_CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'; media-src 'self' blob:; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests";

const DEFAULT_NAME = 'سوق شنقيط';
const DEFAULT_DESC = 'سوق شنقيط (Souk Chinguetti) – سوقك الموريتاني في مكان واحد. بيع واشترِ السيارات والهواتف والعقارات والأثاث وأكثر في كل مدن موريتانيا.';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };
const money = (n) => `${Number(n).toLocaleString('en-US')} MRU`;
const fileId = (url) => /^\/uploads\/f\/(\d+)$/.exec(url || '')?.[1];

/** https://host of this request (Vercel / proxies set x-forwarded-*). */
export function origin(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  const proto = String(req.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https')).split(',')[0].trim();
  return `${proto}://${host}`;
}

// ---------- The app shell (frontend/dist/app.html, built by Vite) ----------

let shellCache = null;
async function shell(req) {
  if (shellCache) return shellCache;
  for (const name of ['app.html', 'index.html']) {
    const file = path.join(config.frontendDist, name);
    if (fs.existsSync(file)) { shellCache = fs.readFileSync(file, 'utf8'); return shellCache; }
  }
  // Serverless bundle without the file: fetch the static copy from this same site.
  const res = await fetch(`${origin(req)}/app.html`);
  if (!res.ok) throw new Error(`app shell unavailable (${res.status})`);
  shellCache = await res.text();
  return shellCache;
}

/** Render the shell with these tags. `meta`: { title, description, image, url, type, jsonLd, body, noindex } */
async function render(req, res, meta, status = 200) {
  const html = await shell(req);
  const site = meta.site;
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.url)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:site_name" content="${esc(site)}" />`,
    `<meta property="og:type" content="${esc(meta.type || 'website')}" />`,
    `<meta property="og:title" content="${esc(meta.ogTitle || meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.url)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${esc(meta.ogTitle || meta.title)}" />`,
    '<meta property="og:locale" content="ar_AR" />',
    '<meta property="og:locale:alternate" content="fr_FR" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(meta.ogTitle || meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`,
    ...(meta.extra || []),
    // JSON-LD is data, not script: "<" is escaped so a title can never close the tag.
    ...(meta.jsonLd || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`),
  ].filter(Boolean).join('\n    ');
  const out = html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:[^>]*>\s*/g, '')
    .replace('</head>', `    ${tags}\n  </head>`)
    // A text version for crawlers that do not run JavaScript (React replaces nothing visible).
    .replace('<div id="root"></div>', `<div id="root"></div>${meta.body ? `\n    <noscript>${meta.body}</noscript>` : ''}`);
  res.status(status).set({
    'Content-Type': 'text/html; charset=utf-8',
    // Shared caches (Vercel's edge) keep it a few minutes; browsers always revalidate.
    'Cache-Control': status === 200 ? 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' : 'no-store',
    'Content-Security-Policy': HTML_CSP,
    'X-Frame-Options': 'DENY',
  }).send(out);
}

async function siteInfo(req) {
  const s = await getSettings();
  const base = origin(req);
  return {
    base,
    site: s.appearance?.siteName || DEFAULT_NAME,
    defaultImage: `${base}/og-image.jpg`,
  };
}

const imageUrl = (base, url) => {
  const id = fileId(url);
  if (id) return `${base}/og/img/${id}.jpg`; // resized to 1200×630, small enough for WhatsApp
  return /^https:\/\//i.test(url || '') ? url : null;
};

// ---------- Pages ----------

router.get('/', async (req, res) => {
  const { base, site, defaultImage } = await siteInfo(req);
  const title = `${site} – سوقك الموريتاني`;
  await render(req, res, {
    site, title, description: DEFAULT_DESC, image: defaultImage, url: `${base}/`,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site, url: `${base}/`, potentialAction: { '@type': 'SearchAction', target: `${base}/products?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      { '@context': 'https://schema.org', '@type': 'Organization', name: site, url: `${base}/`, logo: `${base}/icons/icon-512.png` },
    ],
    body: `<h1>${esc(title)}</h1><p>${esc(DEFAULT_DESC)}</p><p><a href="/products">الإعلانات</a> · <a href="/categories">التصنيفات</a> · <a href="/stores">المتاجر</a></p>`,
  });
});

router.get('/products/:id', async (req, res, next) => {
  if (!/^\d{1,10}$/.test(req.params.id)) return next();
  const { base, site, defaultImage } = await siteInfo(req);
  const id = parseInt(req.params.id, 10);
  const { rows } = await query(
    `SELECT p.id, p.title, p.description, p.price, p.old_price, p.city, p.area, p.condition, p.availability, p.status, p.updated_at, p.created_at,
       u.name AS seller_name, u.is_active, c.name_ar AS category_name, c.slug AS category_slug,
       (SELECT array_agg(url ORDER BY sort_order, id) FROM (SELECT url, sort_order, id FROM product_images WHERE product_id = p.id ORDER BY sort_order, id LIMIT 4) i) AS images
     FROM products p JOIN users u ON u.id = p.seller_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
    [id],
  );
  const p = rows[0];
  const url = `${base}/products/${id}`;
  // Pending, rejected or hidden listings are not described to anyone.
  if (!p || p.status !== 'approved' || !p.is_active) {
    return render(req, res, { site, title: `${site}`, description: DEFAULT_DESC, image: defaultImage, url, noindex: true }, 404);
  }
  const city = (await getCities()).find((c) => c.key === p.city)?.name_ar || p.city;
  const sold = p.availability === 'sold';
  const place = [city, p.area].filter(Boolean).join(' – ');
  const ogTitle = `${p.title} – ${money(p.price)}${sold ? ' (مُباع)' : ''}`;
  const description = clip(`${money(p.price)} · ${place}${p.category_name ? ` · ${p.category_name}` : ''} — ${p.description}`, 200);
  const images = (p.images || []).map((u) => imageUrl(base, u)).filter(Boolean);
  const fullImages = (p.images || []).map((u) => (fileId(u) ? `${base}${u}` : u)).filter(Boolean);
  await render(req, res, {
    site,
    title: `${ogTitle} | ${site}`,
    ogTitle,
    description,
    image: images[0] || defaultImage,
    url,
    type: 'product',
    extra: [
      `<meta property="product:price:amount" content="${esc(p.price)}" />`,
      '<meta property="product:price:currency" content="MRU" />',
      `<meta property="product:availability" content="${sold ? 'out of stock' : 'in stock'}" />`,
      `<meta property="product:condition" content="${p.condition === 'new' ? 'new' : 'used'}" />`,
    ],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.title,
      description: clip(p.description, 500),
      image: fullImages.length ? fullImages : [defaultImage],
      category: p.category_name || undefined,
      offers: {
        '@type': 'Offer',
        url,
        price: String(p.price),
        priceCurrency: 'MRU',
        availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        itemCondition: p.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        seller: { '@type': 'Person', name: p.seller_name },
        areaServed: city,
      },
    }, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site, item: `${base}/` },
        ...(p.category_slug ? [{ '@type': 'ListItem', position: 2, name: p.category_name, item: `${base}/products?category=${encodeURIComponent(p.category_slug)}` }] : []),
        { '@type': 'ListItem', position: p.category_slug ? 3 : 2, name: p.title, item: url },
      ],
    }],
    body: `<article><h1>${esc(p.title)}</h1><p><strong>${esc(money(p.price))}</strong>${sold ? ' – مُباع' : ''}</p>`
      + `<p>${esc(place)}${p.category_name ? ` · <a href="/products?category=${esc(encodeURIComponent(p.category_slug))}">${esc(p.category_name)}</a>` : ''}</p>`
      + `<p>${esc(clip(p.description, 2000))}</p>${fullImages.slice(0, 4).map((u) => `<img src="${esc(u)}" alt="${esc(p.title)}" />`).join('')}`
      + `<p>البائع: ${esc(p.seller_name)}</p></article>`,
  });
});

router.get('/stores/:slug', async (req, res) => {
  const { base, site, defaultImage } = await siteInfo(req);
  const { rows } = await query(
    `SELECT s.name, s.slug, s.description, s.logo_url, s.city, s.is_active, u.is_active AS owner_active,
       (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.status = 'approved' AND p.availability = 'available') AS live
     FROM stores s JOIN users u ON u.id = s.owner_id WHERE s.slug = $1`,
    [String(req.params.slug).slice(0, 120)],
  );
  const s = rows[0];
  const url = `${base}/stores/${encodeURIComponent(req.params.slug)}`;
  if (!s || !s.is_active || !s.owner_active) return render(req, res, { site, title: site, description: DEFAULT_DESC, image: defaultImage, url, noindex: true }, 404);
  const city = (await getCities()).find((c) => c.key === s.city)?.name_ar || '';
  const description = clip(s.description || `متجر ${s.name} على ${site}${city ? ` – ${city}` : ''}: ${s.live} إعلاناً متاحاً.`, 200);
  await render(req, res, {
    site, title: `${s.name} | ${site}`, ogTitle: s.name, description, image: imageUrl(base, s.logo_url) || defaultImage, url, type: 'profile',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Store', name: s.name, description, url, image: imageUrl(base, s.logo_url) || undefined, address: city ? { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'MR' } : undefined }],
    body: `<h1>${esc(s.name)}</h1><p>${esc(description)}</p>`,
  });
});

router.get('/users/:id', async (req, res, next) => {
  if (!/^\d{1,10}$/.test(req.params.id)) return next();
  const { base, site, defaultImage } = await siteInfo(req);
  const { rows } = await query(
    `SELECT u.name, u.bio, u.avatar_url, u.is_active, u.account_type,
       (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id AND p.status = 'approved' AND p.availability = 'available') AS live
     FROM users u WHERE u.id = $1`,
    [parseInt(req.params.id, 10)],
  );
  const u = rows[0];
  const url = `${base}/users/${req.params.id}`;
  if (!u || !u.is_active || u.account_type === 'buyer') return render(req, res, { site, title: site, description: DEFAULT_DESC, image: defaultImage, url, noindex: true }, 404);
  const description = clip(u.bio || `${u.name} على ${site}: ${u.live} إعلاناً متاحاً.`, 200);
  await render(req, res, {
    site, title: `${u.name} | ${site}`, ogTitle: u.name, description, image: imageUrl(base, u.avatar_url) || defaultImage, url, type: 'profile',
    body: `<h1>${esc(u.name)}</h1><p>${esc(description)}</p>`,
  });
});

router.get('/p/:slug', async (req, res) => {
  const { base, site, defaultImage } = await siteInfo(req);
  const { rows } = await query('SELECT title, body, cover_url, is_published FROM pages WHERE slug = $1', [String(req.params.slug).slice(0, 120)]);
  const pg = rows[0];
  const url = `${base}/p/${encodeURIComponent(req.params.slug)}`;
  const pick = (v) => (v && typeof v === 'object' ? v.ar || v.fr || v.en || '' : v || '');
  if (!pg || !pg.is_published) return render(req, res, { site, title: site, description: DEFAULT_DESC, image: defaultImage, url, noindex: true }, 404);
  const title = pick(pg.title);
  const text = pick(pg.body).replace(/[#*![\]()]/g, ' ');
  await render(req, res, {
    site, title: `${title} | ${site}`, ogTitle: title, description: clip(text, 200), image: imageUrl(base, pg.cover_url) || defaultImage, url, type: 'article',
    body: `<h1>${esc(title)}</h1><p>${esc(clip(text, 3000))}</p>`,
  });
});

// ---------- Share images: any public upload, as a 1200×630 JPEG ----------

router.get('/og/img/:file', async (req, res) => {
  const m = /^(\d{1,10})\.jpg$/.exec(req.params.file);
  if (!m) return res.status(404).end();
  const { rows } = await query('SELECT data FROM files WHERE id = $1 AND NOT is_private', [Number(m[1])]);
  if (!rows[0]) return res.status(404).end();
  const sharp = (await import('sharp')).default;
  const out = await sharp(rows[0].data, { failOn: 'none' })
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable', 'X-Content-Type-Options': 'nosniff' }).send(out);
});

// ---------- Sitemap and robots ----------

router.get('/sitemap.xml', async (req, res) => {
  const base = origin(req);
  const [products, stores, cats, pages] = await Promise.all([
    query(`SELECT p.id, p.updated_at FROM products p JOIN users u ON u.id = p.seller_id
           WHERE p.status = 'approved' AND u.is_active AND p.availability = 'available' ORDER BY p.updated_at DESC LIMIT 45000`),
    query('SELECT s.slug, s.updated_at FROM stores s JOIN users u ON u.id = s.owner_id WHERE s.is_active AND u.is_active'),
    query('SELECT slug FROM categories ORDER BY sort_order'),
    query('SELECT slug, updated_at FROM pages WHERE is_published'),
  ]);
  const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
  const u = (loc, lastmod, freq) => `<url><loc>${esc(base + loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${freq ? `<changefreq>${freq}</changefreq>` : ''}</url>`;
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    u('/', undefined, 'hourly'), u('/products', undefined, 'hourly'), u('/categories', undefined, 'weekly'), u('/stores', undefined, 'daily'),
    ...cats.rows.map((c) => u(`/products?category=${encodeURIComponent(c.slug)}`, undefined, 'daily')),
    ...products.rows.map((p) => u(`/products/${p.id}`, day(p.updated_at), 'weekly')),
    ...stores.rows.map((s) => u(`/stores/${encodeURIComponent(s.slug)}`, day(s.updated_at), 'weekly')),
    ...pages.rows.map((pg) => u(`/p/${encodeURIComponent(pg.slug)}`, day(pg.updated_at), 'monthly')),
    '</urlset>'].join('\n');
  res.set({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' }).send(xml);
});

router.get('/robots.txt', (req, res) => {
  const private_ = ['/admin', '/api/', '/messages', '/dashboard', '/profile', '/favorites', '/notifications', '/orders', '/checkout', '/courier', '/sell', '/login', '/register', '/forgot-password', '/reset-password'];
  res.type('text/plain').set('Cache-Control', 'public, max-age=0, s-maxage=86400').send(
    `User-agent: *\nAllow: /\n${private_.map((p) => `Disallow: ${p}`).join('\n')}\n\nSitemap: ${origin(req)}/sitemap.xml\n`,
  );
});

export default router;
