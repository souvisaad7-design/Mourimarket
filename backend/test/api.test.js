// End-to-end API tests. Run against a seeded database:  npm run db:reset && npm test
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { pool } from '../src/db.js';

process.env.NODE_ENV = 'test';
let server;
let base;

async function call(path, { method = 'GET', body, token, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(base + path, { method, headers, body: payload });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const login = async (email, password = 'Password123') => (await call('/api/auth/login', { method: 'POST', body: { email, password } })).data.token;

// 1x1 PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

before(async () => {
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(async () => { server.close(); await pool.end(); });

describe('MauriMarket API', () => {
  const email = `t${Date.now()}@test.mr`;
  const sellerPhone = `3${String(Date.now()).slice(-7)}`;
  let token; let adminToken; let buyerToken; let productId; let conversationId; let categoryId;

  it('registers, rejects duplicate email and weak password', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'Test Seller', phone: sellerPhone, email, password: 'secret123', accountType: 'merchant', city: 'nouakchott' } });
    assert.equal(r.status, 201);
    assert.ok(r.data.token);
    assert.equal(r.data.user.password_hash, undefined);
    token = r.data.token;
    const dup = await call('/api/auth/register', { method: 'POST', body: { name: 'Xy', phone: sellerPhone, password: 'secret123' } });
    assert.equal(dup.status, 409);
    assert.equal(dup.data.error, 'phone_taken');
    const weak = await call('/api/auth/register', { method: 'POST', body: { name: 'Ab', phone: '36999998', password: '123' } });
    assert.equal(weak.status, 400);
    assert.equal(weak.data.fields.password, 'min_8');
  });

  it('logs in and rejects wrong passwords', async () => {
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password: 'nope' } })).status, 401);
    assert.ok(await login(email, 'secret123'));
    adminToken = await login('admin@maurimarket.mr', 'Admin12345');
    buyerToken = await login('buyer@example.mr');
    assert.ok(adminToken && buyerToken);
  });

  it('blocks protected and admin routes', async () => {
    assert.equal((await call('/api/favorites')).status, 401);
    assert.equal((await call('/api/admin/stats', { token })).status, 403);
    assert.equal((await call('/api/admin/stats', { token: adminToken })).status, 200);
  });

  it('creates a listing with an image (pending until approved)', async () => {
    categoryId = (await call('/api/categories')).data.items[0].id;
    const missing = new FormData();
    missing.append('title', 'Test car'); missing.append('description', 'A very good test car'); missing.append('price', '500000');
    missing.append('categoryId', categoryId); missing.append('city', 'nouakchott');
    const r0 = await call('/api/products', { method: 'POST', token, form: missing });
    assert.equal(r0.data.fields.images, 'image_required');

    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'سيارة اختبار فريدة', description: 'A very good test car', price: '500000', categoryId, city: 'nouakchott', condition: 'used' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r = await call('/api/products', { method: 'POST', token, form: fd });
    assert.equal(r.status, 201);
    assert.equal(r.data.product.status, 'pending');
    productId = r.data.product.id;
    const detail = await call(`/api/products/${productId}`, { token });
    const img = await fetch(base + detail.data.product.images[0].url);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await img.arrayBuffer()), PNG, 'image stored and served from the database');

    const fake = new FormData();
    for (const [k, v] of Object.entries({ title: 'Fake image', description: 'Not really an image', price: '1', categoryId, city: 'nouakchott' })) fake.append(k, v);
    fake.append('images', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'x.png');
    const rf = await call('/api/products', { method: 'POST', token, form: fake });
    assert.equal(rf.status, 400);
    assert.equal(rf.data.error, 'invalid_image_type');
    assert.equal((await call(`/api/products/${productId}`)).status, 404, 'pending listing hidden from public');
    assert.equal((await call(`/api/products/${productId}`, { token })).status, 200, 'owner sees it');
  });

  it('lets the admin approve and notifies the seller', async () => {
    assert.equal((await call(`/api/admin/products/${productId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'rejected' } })).status, 400, 'reason required');
    assert.equal((await call(`/api/admin/products/${productId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'approved' } })).status, 200);
    const n = await call('/api/notifications', { token });
    assert.equal(n.data.items[0].type, 'product_approved');
  });

  it('searches and filters', async () => {
    const r = await call(`/api/products?q=${encodeURIComponent('فريدة')}`);
    assert.equal(r.data.total, 1);
    const p = await call('/api/products?minPrice=1000&maxPrice=2000&sort=price_asc');
    assert.ok(p.data.items.every((x) => x.price >= 1000 && x.price <= 2000));
    const prices = p.data.items.map((x) => x.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
    const c = await call('/api/products?city=nouadhibou');
    assert.ok(c.data.items.every((x) => x.city === 'nouadhibou'));
    assert.equal((await call('/api/products?sort=bogus')).status, 400);
  });

  it('handles favorites', async () => {
    assert.equal((await call(`/api/favorites/${productId}`, { method: 'POST', token: buyerToken })).status, 201);
    assert.equal((await call(`/api/favorites/${productId}`, { method: 'POST', token: buyerToken })).status, 201, 'idempotent');
    assert.ok((await call('/api/favorites', { token: buyerToken })).data.items.some((p) => p.id === productId));
    await call(`/api/favorites/${productId}`, { method: 'DELETE', token: buyerToken });
    assert.ok(!(await call('/api/favorites', { token: buyerToken })).data.items.some((p) => p.id === productId));
  });

  it('runs a conversation between buyer and seller', async () => {
    assert.equal((await call('/api/conversations', { method: 'POST', token, body: { productId, body: 'hi me' } })).status, 400, 'no self-messaging');
    const r = await call('/api/conversations', { method: 'POST', token: buyerToken, body: { productId, body: 'Is it available?' } });
    assert.equal(r.status, 201);
    conversationId = r.data.conversationId;
    assert.equal((await call('/api/notifications/summary', { token })).data.messages, 1);
    await call(`/api/conversations/${conversationId}/messages`, { method: 'POST', token, body: { body: 'Yes!' } });
    const thread = await call(`/api/conversations/${conversationId}`, { token: buyerToken });
    assert.equal(thread.data.messages.length, 2);
    const stranger = await login('sidi@example.mr');
    assert.equal((await call(`/api/conversations/${conversationId}`, { token: stranger })).status, 403);
  });

  it('only allows reviews after a documented sale', async () => {
    assert.equal((await call('/api/reviews', { method: 'POST', token: buyerToken, body: { productId, rating: 5 } })).status, 403);
    const stranger = await login('sidi@example.mr');
    assert.equal((await call(`/api/products/${productId}/availability`, { method: 'PATCH', token, body: { availability: 'sold', soldToId: 999999 } })).status, 400);
    const me = (await call('/api/auth/me', { token: buyerToken })).data.user;
    assert.equal((await call(`/api/products/${productId}/availability`, { method: 'PATCH', token: stranger, body: { availability: 'sold' } })).status, 403);
    assert.equal((await call(`/api/products/${productId}/availability`, { method: 'PATCH', token, body: { availability: 'sold', soldToId: me.id } })).status, 200);
    assert.equal((await call('/api/reviews', { method: 'POST', token: buyerToken, body: { productId, rating: 4, comment: 'ok' } })).status, 201);
    assert.equal((await call('/api/reviews', { method: 'POST', token: buyerToken, body: { productId, rating: 4 } })).status, 409);
  });

  it('accepts reports once and lists them for admins', async () => {
    assert.equal((await call('/api/reports', { method: 'POST', token: buyerToken, body: { productId, reason: 'duplicate' } })).status, 201);
    assert.equal((await call('/api/reports', { method: 'POST', token: buyerToken, body: { productId, reason: 'duplicate' } })).status, 409);
    const r = await call('/api/admin/reports', { token: adminToken });
    const report = r.data.items.find((x) => x.product_id === productId);
    assert.ok(report);
    assert.equal((await call(`/api/admin/reports/${report.id}`, { method: 'PATCH', token: adminToken, body: { status: 'resolved' } })).status, 200);
    const resolved = await call('/api/admin/reports?status=resolved', { token: adminToken });
    assert.ok(resolved.data.items.some((x) => x.id === report.id && x.resolved_at));
  });

  it('admin can manage categories and see stats', async () => {
    const c = await call('/api/admin/categories', { method: 'POST', token: adminToken, body: { slug: `t-${Date.now()}`, nameAr: 'تجربة', nameFr: 'Test', nameEn: 'Test' } });
    assert.equal(c.status, 201);
    assert.equal((await call(`/api/admin/categories/${c.data.category.id}`, { method: 'DELETE', token: adminToken })).status, 200);
    assert.equal((await call(`/api/admin/categories/${categoryId}`, { method: 'DELETE', token: adminToken })).status, 409, 'in use');
    const s = await call('/api/admin/stats', { token: adminToken });
    assert.equal(s.data.daily.length, 14);
  });

  it('creates a merchant store and links listings', async () => {
    const fd = new FormData();
    fd.append('name', 'Test Store'); fd.append('city', 'nouakchott');
    const r = await call('/api/stores/me', { method: 'PUT', token, form: fd });
    assert.equal(r.status, 200);
    const s = await call(`/api/stores/${r.data.store.slug}`);
    assert.equal(s.data.store.name, 'Test Store');
    const prods = await call(`/api/products?store=${r.data.store.slug}&availability=all`);
    assert.ok(prods.data.items.some((p) => p.id === productId));
    const buyerStore = new FormData(); buyerStore.append('name', 'Nope');
    assert.equal((await call('/api/stores/me', { method: 'PUT', token: buyerToken, form: buyerStore })).status, 403);
  });

  it('prevents editing someone else’s listing and deletes own', async () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'Hacked', description: 'hacked description', price: '1', categoryId, city: 'nouakchott' })) fd.append(k, v);
    assert.equal((await call(`/api/products/${productId}`, { method: 'PUT', token: buyerToken, form: fd })).status, 403);
    assert.equal((await call(`/api/products/${productId}`, { method: 'DELETE', token })).status, 200);
    assert.equal((await call(`/api/products/${productId}`, { token })).status, 404);
  });

  it('resets a password with a one-time token', async () => {
    const r = await call('/api/auth/forgot-password', { method: 'POST', body: { email } });
    const resetToken = new URL(r.data.devResetLink).searchParams.get('token');
    assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token: resetToken, password: 'newpass123' } })).status, 200);
    assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token: resetToken, password: 'again1234' } })).status, 400);
    assert.ok(await login(email, 'newpass123'));
  });

  it('disabled accounts cannot log in', async () => {
    const u = (await call('/api/auth/me', { token })).data.user;
    await call(`/api/admin/users/${u.id}`, { method: 'PATCH', token: adminToken, body: { isActive: false } });
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password: 'newpass123' } })).status, 403);
    assert.equal((await call('/api/auth/me', { token })).status, 403);
  });
});

describe('pasted credentials', () => {
  it('ignores invisible direction marks copied from Arabic text', async () => {
    const r = await call('/api/auth/login', { method: 'POST', body: { email: '‏buyer@example.mr‏', password: '⁧Password123⁩' } });
    assert.equal(r.status, 200);
  });
});

describe('v1.1: smart search, featured listings, verified sellers', () => {
  let adminToken;
  before(async () => { adminToken = await login('admin@maurimarket.mr', 'Admin12345'); });

  it('matches Arabic spelling variants and the definite article', async () => {
    // Seed title: «تويوتا هايلكس 2016 ديزل»; description mentions «سيارة»
    for (const q of ['تويوتا', 'التويوتا', 'سياره', 'السيارة', 'تويوطا هايلكس']) {
      const r = await call(`/api/products?q=${encodeURIComponent(q)}`);
      assert.ok(r.data.items.some((p) => p.title.startsWith('تويوتا')), `query «${q}» should find the Toyota`);
    }
  });

  it('ignores accents and case in French', async () => {
    const r = await call(`/api/products?q=${encodeURIComponent('REFRIGERATEUR lg')}`);
    assert.ok(r.data.items.some((p) => p.title.startsWith('Réfrigérateur')));
  });

  it('tolerates a typo', async () => {
    const r = await call(`/api/products?q=${encodeURIComponent('Mercedez')}`);
    assert.ok(r.data.items.some((p) => p.title.startsWith('Mercedes')));
  });

  it('suggests titles and categories while typing', async () => {
    const r = await call(`/api/products/suggest?q=${encodeURIComponent('الهوا')}`);
    assert.ok(r.data.categories.some((c) => c.slug === 'phones-electronics'));
    const t = await call(`/api/products/suggest?q=${encodeURIComponent('latit')}`);
    assert.ok(t.data.titles.length >= 1);
  });

  it('lists featured listings first and filters them', async () => {
    const all = await call('/api/products?limit=60');
    const flags = all.data.items.map((p) => p.is_featured);
    const firstNonFeatured = flags.indexOf(false);
    assert.ok(firstNonFeatured > 0 && flags.slice(firstNonFeatured).every((f) => !f), 'featured block comes first');
    const only = await call('/api/products?featured=1');
    assert.ok(only.data.total > 0 && only.data.items.every((p) => p.is_featured));
  });

  it('lets an admin feature and unfeature a listing, notifying the seller', async () => {
    const p = (await call('/api/products?sort=oldest&limit=1')).data.items[0];
    assert.equal((await call(`/api/admin/products/${p.id}/feature`, { method: 'PATCH', token: adminToken, body: { days: 7 } })).status, 200);
    assert.ok((await call(`/api/products/${p.id}`)).data.product.is_featured);
    assert.equal((await call(`/api/admin/products/${p.id}/feature`, { method: 'PATCH', token: adminToken, body: { days: 0 } })).status, 200);
    assert.equal((await call(`/api/products/${p.id}`)).data.product.is_featured, false);
    const buyer = await login('buyer@example.mr');
    assert.equal((await call(`/api/admin/products/${p.id}/feature`, { method: 'PATCH', token: buyer, body: { days: 7 } })).status, 403);
  });

  it('lets an admin verify a seller; the badge shows on profile and listings', async () => {
    const seller = (await call('/api/auth/me', { token: await login('sidi@example.mr') })).data.user;
    assert.equal((await call(`/api/users/${seller.id}`)).data.user.is_verified, false);
    await call(`/api/admin/users/${seller.id}`, { method: 'PATCH', token: adminToken, body: { isVerified: true } });
    assert.equal((await call(`/api/users/${seller.id}`)).data.user.is_verified, true);
    const listing = (await call(`/api/products?seller=${seller.id}`)).data.items[0];
    assert.equal(listing.seller_verified, true);
    const notes = await call('/api/notifications', { token: await login('sidi@example.mr') });
    assert.ok(notes.data.items.some((n) => n.type === 'account_verified'));
  });

  it('reports live listings per city', async () => {
    const r = await call('/api/stats/cities');
    assert.equal(r.data.items[0].city, 'nouakchott');
  });
});

describe('v1.2: special offers', () => {
  it('lists only discounted listings with deals=1', async () => {
    const r = await call('/api/products?deals=1');
    assert.ok(r.data.total >= 1);
    assert.ok(r.data.items.every((p) => p.old_price > p.price));
  });

  it('rejects an old price that is not higher than the price', async () => {
    const token = await login('mohamed@example.mr');
    const categoryId = (await call('/api/categories')).data.items[0].id;
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'Offer test', description: 'A discounted test item', price: '1000', oldPrice: '900', categoryId, city: 'nouakchott' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r = await call('/api/products', { method: 'POST', token, form: fd });
    assert.equal(r.status, 400);
    assert.equal(r.data.fields.oldPrice, 'old_price_higher');
    fd.set('oldPrice', '1500');
    const ok = await call('/api/products', { method: 'POST', token, form: fd });
    assert.equal(ok.status, 201);
  });
});

describe('v1.3: phone login, buyers vs sellers, admin password reset', () => {
  const digits = `4${String(Date.now()).slice(-7)}`;
  let buyerToken; let buyerId;

  it('registers a buyer with only a phone number (formats are normalised)', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'مشتري تجريبي', phone: `+222 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`, password: 'buyer1234' } });
    assert.equal(r.status, 201);
    assert.equal(r.data.user.account_type, 'buyer', 'buyer is the default');
    assert.equal(r.data.user.phone, `+222${digits}`);
    assert.equal(r.data.user.email, null);
    buyerToken = r.data.token; buyerId = r.data.user.id;
  });

  it('logs in with the phone number in any common format', async () => {
    for (const id of [digits, `+222${digits}`, `00222${digits}`, `222 ${digits}`, '‏' + digits]) {
      const r = await call('/api/auth/login', { method: 'POST', body: { identifier: id, password: 'buyer1234' } });
      assert.equal(r.status, 200, `login with «${id}»`);
    }
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { identifier: digits, password: 'wrong-pass' } })).status, 401);
    const arabicDigits = [...digits].map((d) => '٠١٢٣٤٥٦٧٨٩'[d]).join('');
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { identifier: arabicDigits, password: 'buyer1234' } })).status, 200, 'Arabic-Indic digits');
  });

  it('rejects invalid Mauritanian numbers', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'Bad', phone: '12345678', password: 'secret123' } });
    assert.equal(r.status, 400);
    assert.equal(r.data.fields.phone, 'invalid_phone');
  });

  it('blocks buyers from posting listings, allows it after switching to seller', async () => {
    const categoryId = (await call('/api/categories')).data.items[0].id;
    const fd = () => {
      const f = new FormData();
      for (const [k, v] of Object.entries({ title: 'Buyer item', description: 'Trying to sell as a buyer', price: '100', categoryId, city: 'nouakchott' })) f.append(k, v);
      f.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
      return f;
    };
    const blocked = await call('/api/products', { method: 'POST', token: buyerToken, form: fd() });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.data.error, 'sellers_only');
    const prof = new FormData();
    prof.append('name', 'مشتري تجريبي'); prof.append('phone', digits); prof.append('accountType', 'individual');
    const up = await call('/api/auth/me', { method: 'PUT', token: buyerToken, form: prof });
    assert.equal(up.status, 200);
    assert.equal(up.data.user.account_type, 'individual');
    assert.equal((await call('/api/products', { method: 'POST', token: buyerToken, form: fd() })).status, 201);
  });

  it('hides a buyer phone number on the public profile', async () => {
    const buyer = (await call('/api/auth/login', { method: 'POST', body: { identifier: '47000005', password: 'Password123' } })).data.user;
    assert.equal(buyer.account_type, 'buyer');
    assert.equal((await call(`/api/users/${buyer.id}`)).data.user.phone, null);
    const seller = (await call('/api/auth/login', { method: 'POST', body: { identifier: '36000001', password: 'Password123' } })).data.user;
    assert.equal((await call(`/api/users/${seller.id}`)).data.user.phone, '+22236000001');
  });

  it('returns profile-card stats on /auth/me', async () => {
    const token = (await call('/api/auth/login', { method: 'POST', body: { identifier: '36000001', password: 'Password123' } })).data.token;
    const me = (await call('/api/auth/me', { token })).data.user;
    for (const k of ['live_count', 'sold_count', 'favorites_count', 'reviews_count', 'is_verified']) assert.ok(k in me, k);
  });

  it('lets an admin set a temporary password for a phone-only account', async () => {
    const admin = await login('admin@maurimarket.mr', 'Admin12345');
    const r = await call(`/api/admin/users/${buyerId}/reset-password`, { method: 'POST', token: admin });
    assert.equal(r.status, 200);
    assert.ok(r.data.password.length >= 10);
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { identifier: digits, password: r.data.password } })).status, 200);
    const notAdmin = await call(`/api/admin/users/${buyerId}/reset-password`, { method: 'POST', token: buyerToken });
    assert.equal(notAdmin.status, 403);
  });
});

describe('admin: latest activity', () => {
  it('returns the 5 newest listings or new users, newest first', async () => {
    const admin = await login('admin@maurimarket.mr', 'Admin12345');
    const before = (await call('/api/admin/stats', { token: admin })).data.recent;
    assert.ok(Array.isArray(before) && before.length <= 5);
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'نشاط جديد', phone: `2${String(Date.now()).slice(-7)}`, password: 'activity1' } });
    assert.equal(r.status, 201);
    const recent = (await call('/api/admin/stats', { token: admin })).data.recent;
    assert.equal(recent.length, 5);
    assert.equal(recent[0].kind, 'user');
    assert.equal(recent[0].label, 'نشاط جديد');
    const times = recent.map((x) => new Date(x.created_at).getTime());
    assert.deepEqual(times, [...times].sort((a, b) => b - a), 'sorted newest first');
    assert.ok(recent.every((x) => ['listing', 'user'].includes(x.kind)));
  });
});

describe('verification & featuring requests', () => {
  const receipt = () => new Blob([PNG], { type: 'image/png' });
  const form = (fields, withReceipt = true) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, String(v));
    if (withReceipt) fd.append('receipt', receipt(), 'r.png');
    return fd;
  };
  let seller; let admin; let buyer; let productId; let verifyId; let featureId;

  before(async () => {
    seller = await login('mohamed@example.mr');
    admin = await login('admin@maurimarket.mr', 'Admin12345');
    buyer = await login('buyer@example.mr');
    const mine = (await call('/api/products/mine', { token: seller })).data.items;
    productId = mine.find((p) => p.status === 'approved' && p.availability === 'available').id;
  });

  it('exposes prices in /meta', async () => {
    const m = (await call('/api/meta')).data.upgrades;
    assert.ok(m.verifyPrice > 0 && m.featurePlans.length && m.paymentMethods.includes('bankily'));
  });

  it('validates requests: receipt required, buyers refused, plan checked', async () => {
    assert.equal((await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'verify', paymentMethod: 'bankily' }, false) })).data.fields.receipt, 'required');
    assert.equal((await call('/api/upgrade-requests', { method: 'POST', token: buyer, form: form({ kind: 'verify', paymentMethod: 'bankily' }) })).status, 403);
    const bad = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'feature', productId, days: 3, paymentMethod: 'bankily' }) });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.fields.days, 'invalid');
  });

  it('creates one pending request per account / listing, with a server-set price', async () => {
    const v = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'verify', paymentMethod: 'bankily', paymentRef: 'TX-1', amount: 1 }) });
    assert.equal(v.status, 201);
    assert.equal(v.data.request.amount, 500);
    verifyId = v.data.request.id;
    const dup = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'verify', paymentMethod: 'masrvi' }) });
    assert.equal(dup.status, 409);
    assert.equal(dup.data.error, 'request_pending');
    const f = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'feature', productId, days: 7, paymentMethod: 'sedad' }) });
    assert.equal(f.status, 201);
    assert.equal(f.data.request.amount, 200);
    featureId = f.data.request.id;
    const mine = (await call('/api/upgrade-requests', { token: seller })).data.items;
    assert.ok(mine.some((x) => x.id === verifyId) && mine.some((x) => x.id === featureId));
  });

  it('keeps receipts private: admin only, never on the public route', async () => {
    const list = (await call('/api/admin/upgrade-requests?status=pending', { token: admin })).data;
    assert.ok(list.items.some((x) => x.id === verifyId && x.has_receipt));
    assert.ok(list.counts.pending >= 2);
    const stats = (await call('/api/admin/stats', { token: admin })).data.totals;
    assert.ok(Number(stats.pending_upgrades) >= 2);
    const ok = await fetch(`${base}/api/admin/upgrade-requests/${verifyId}/receipt`, { headers: { Authorization: `Bearer ${admin}` } });
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('content-type'), 'image/png');
    assert.equal((await fetch(`${base}/api/admin/upgrade-requests/${verifyId}/receipt`, { headers: { Authorization: `Bearer ${seller}` } })).status, 403);
    const { rows } = await pool.query('SELECT receipt_file_id FROM upgrade_requests WHERE id = $1', [verifyId]);
    assert.equal((await fetch(`${base}/uploads/f/${rows[0].receipt_file_id}`)).status, 404);
  });

  it('approves verification and featuring, rejects with a reason', async () => {
    assert.equal((await call(`/api/admin/upgrade-requests/${verifyId}`, { method: 'PATCH', token: admin, body: { status: 'rejected' } })).status, 400);
    assert.equal((await call(`/api/admin/upgrade-requests/${verifyId}`, { method: 'PATCH', token: admin, body: { status: 'approved' } })).status, 200);
    assert.equal((await call(`/api/admin/upgrade-requests/${verifyId}`, { method: 'PATCH', token: admin, body: { status: 'approved' } })).status, 409);
    const me = (await call('/api/auth/me', { token: seller })).data.user;
    assert.equal(me.is_verified, true);
    const again = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'verify', paymentMethod: 'bankily' }) });
    assert.equal(again.data.error, 'already_verified');

    const prev = (await pool.query('SELECT GREATEST(featured_until, now()) AS t FROM products WHERE id = $1', [productId])).rows[0].t;
    const f = await call(`/api/admin/upgrade-requests/${featureId}`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(f.status, 200);
    const days = (new Date(f.data.featuredUntil) - new Date(prev)) / 86400000;
    assert.ok(days > 6.99 && days <= 7.01, `7 days added to any time left, got ${days}`);

    const f2 = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: form({ kind: 'feature', productId, days: 15, paymentMethod: 'other' }) });
    const rej = await call(`/api/admin/upgrade-requests/${f2.data.request.id}`, { method: 'PATCH', token: admin, body: { status: 'rejected', note: 'الإيصال غير واضح' } });
    assert.equal(rej.status, 200);
    const notes = (await call('/api/notifications', { token: seller })).data.items;
    assert.ok(notes.some((n) => n.type === 'upgrade_rejected_feature' && n.data.reason === 'الإيصال غير واضح'));
    assert.ok(notes.some((n) => n.type === 'account_verified'));
  });
});
