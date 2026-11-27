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
  // Most tests register fresh accounts and post at once: phone confirmation is tested on its own below.
  const admin = (await call('/api/auth/login', { method: 'POST', body: { email: 'admin@souk-chinguetti.mr', password: 'Admin12345' } })).data.token;
  await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { phoneVerification: false } } });
});
after(async () => { server.close(); await pool.end(); });

describe('Souk Chinguetti API', () => {
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
    adminToken = await login('admin@souk-chinguetti.mr', 'Admin12345');
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
    // Signing up as a merchant files a request: no store until an admin approves it.
    const me = (await call('/api/auth/me', { token })).data.user;
    assert.equal(me.account_type, 'individual');
    assert.equal(me.merchant_status, 'pending');
    const early = new FormData(); early.append('name', 'Too early');
    assert.equal((await call('/api/stores/me', { method: 'PUT', token, form: early })).status, 403);
    const ok = await call(`/api/admin/merchant-requests/${me.id}`, { method: 'PATCH', token: adminToken, body: { status: 'approved' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.user.account_type, 'merchant');
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
    // the password reset above ended the old session: sign in again
    token = (await call('/api/auth/login', { method: 'POST', body: { email, password: 'newpass123' } })).data.token;
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
  before(async () => { adminToken = await login('admin@souk-chinguetti.mr', 'Admin12345'); });

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

  it('lets an admin confirm a phone number by hand (no SMS)', async () => {
    const sidi = await login('sidi@example.mr');
    const seller = (await call('/api/auth/me', { token: sidi })).data.user;
    const path = `/api/admin/users/${seller.id}`;
    assert.equal((await call(path, { method: 'PATCH', token: adminToken, body: { phoneVerified: false } })).data.user.phone_verified, false);
    assert.equal((await call(`/api/users/${seller.id}`)).data.user.phone_verified, false);
    const list = await call('/api/admin/users?phone=unverified', { token: adminToken });
    assert.ok(list.data.items.some((u) => u.id === seller.id));
    assert.ok(list.data.items.every((u) => !u.phone_verified && u.role !== 'admin'));
    assert.equal((await call(path, { method: 'PATCH', token: sidi, body: { phoneVerified: true } })).status, 403);
    assert.equal((await call(path, { method: 'PATCH', token: adminToken, body: { phoneVerified: true } })).data.user.phone_verified, true);
    assert.equal((await call(`/api/users/${seller.id}`)).data.user.phone_verified, true);
    assert.equal((await call(`/api/products?seller=${seller.id}`)).data.items.length > 0, true);
    const notes = await call('/api/notifications', { token: sidi });
    assert.ok(notes.data.items.some((n) => n.type === 'phone_verified'));
    assert.ok((await call('/api/admin/users?phone=verified', { token: adminToken })).data.items.some((u) => u.id === seller.id));
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
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const r = await call(`/api/admin/users/${buyerId}/reset-password`, { method: 'POST', token: admin });
    assert.equal(r.status, 200);
    assert.ok(r.data.password.length >= 10);
    const fresh = await call('/api/auth/login', { method: 'POST', body: { identifier: digits, password: r.data.password } });
    assert.equal(fresh.status, 200);
    assert.equal((await call('/api/auth/me', { token: buyerToken })).status, 401, 'the reset ends the old session');
    const notAdmin = await call(`/api/admin/users/${buyerId}/reset-password`, { method: 'POST', token: fresh.data.token });
    assert.equal(notAdmin.status, 403);
  });
});

describe('admin: latest activity', () => {
  it('returns the 5 newest listings or new users, newest first', async () => {
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
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

describe('free mode (default): paid requests are off', () => {
  it('hides prices and the request endpoints', async () => {
    assert.equal((await call('/api/meta')).data.upgrades, null);
    const seller = await login('mohamed@example.mr');
    assert.equal((await call('/api/upgrade-requests', { token: seller })).status, 404);
    const fd = new FormData(); fd.append('kind', 'verify'); fd.append('paymentMethod', 'bankily');
    assert.equal((await call('/api/upgrade-requests', { method: 'POST', token: seller, form: fd })).status, 404);
  });
});

const setPaid = async (on) => {
  const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
  const s = (await call('/api/admin/settings', { token: admin })).data.settings;
  await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { ...s.features, paidUpgrades: on } } });
};

describe('verification & featuring requests (paid features turned on in the panel)', () => {
  before(() => setPaid(true));
  after(() => setPaid(false));
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
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
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

describe('merchant accounts need an admin\'s approval', () => {
  let admin;
  before(async () => { admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); });
  const reg = async (name) => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name, phone: `4${String(Date.now() + Math.floor(Math.random() * 1e4)).slice(-7)}`, password: 'merchant1', accountType: 'merchant' } });
    assert.equal(r.status, 201);
    return r.data;
  };

  it('signing up as a merchant creates a pending request, visible to admins', async () => {
    const { user, token } = await reg('تاجر جديد');
    assert.equal(user.account_type, 'individual');
    assert.equal(user.merchant_status, 'pending');
    // Can still post ads as an individual seller meanwhile.
    const stats = (await call('/api/admin/stats', { token: admin })).data.totals;
    assert.ok(Number(stats.pending_merchants) >= 1);
    const list = (await call('/api/admin/merchant-requests', { token: admin })).data;
    assert.ok(list.items.some((x) => x.id === user.id));
    assert.ok(list.counts.pending >= 1);
    const notes = (await call('/api/notifications', { token: admin })).data.items;
    assert.ok(notes.some((n) => n.type === 'merchant_request' && n.data.name === 'تاجر جديد'));
    assert.equal((await call('/api/admin/merchant-requests', { token })).status, 403);
  });

  it('rejects with a reason, and the seller can apply again from the profile', async () => {
    const { user, token } = await reg('تاجر مرفوض');
    assert.equal((await call(`/api/admin/merchant-requests/${user.id}`, { method: 'PATCH', token: admin, body: { status: 'rejected' } })).status, 400);
    const r = await call(`/api/admin/merchant-requests/${user.id}`, { method: 'PATCH', token: admin, body: { status: 'rejected', note: 'معلومات غير كافية' } });
    assert.equal(r.status, 200);
    assert.equal(r.data.user.account_type, 'individual');
    assert.equal((await call(`/api/admin/merchant-requests/${user.id}`, { method: 'PATCH', token: admin, body: { status: 'approved' } })).status, 409);
    const me = (await call('/api/auth/me', { token })).data.user;
    assert.equal(me.merchant_status, 'rejected');
    assert.equal(me.merchant_note, 'معلومات غير كافية');
    const notes = (await call('/api/notifications', { token })).data.items;
    assert.ok(notes.some((n) => n.type === 'merchant_rejected' && n.data.reason === 'معلومات غير كافية'));
    // Apply again through the profile form.
    const fd = new FormData(); fd.append('name', 'تاجر مرفوض'); fd.append('phone', me.phone); fd.append('accountType', 'merchant');
    const again = await call('/api/auth/me', { method: 'PUT', token, form: fd });
    assert.equal(again.data.user.merchant_status, 'pending');
    assert.equal(again.data.user.merchant_note, null);
    assert.equal(again.data.user.account_type, 'individual');
  });

  it('a buyer switching to merchant becomes an individual seller with a pending request', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'مشتري', phone: `2${String(Date.now()).slice(-7)}`, password: 'buyer1234' } });
    const fd = new FormData(); fd.append('name', 'مشتري'); fd.append('phone', r.data.user.phone); fd.append('accountType', 'merchant');
    const u = (await call('/api/auth/me', { method: 'PUT', token: r.data.token, form: fd })).data.user;
    assert.equal(u.account_type, 'individual');
    assert.equal(u.merchant_status, 'pending');
    // Choosing "individual" again withdraws the request.
    const fd2 = new FormData(); fd2.append('name', 'مشتري'); fd2.append('phone', u.phone); fd2.append('accountType', 'individual');
    assert.equal((await call('/api/auth/me', { method: 'PUT', token: r.data.token, form: fd2 })).data.user.merchant_status, null);
  });

  it('approval turns the account into a merchant and notifies the seller', async () => {
    const { user, token } = await reg('تاجر مقبول');
    const r = await call(`/api/admin/merchant-requests/${user.id}`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(r.data.user.account_type, 'merchant');
    const notes = (await call('/api/notifications', { token })).data.items;
    assert.ok(notes.some((n) => n.type === 'merchant_approved'));
    const approved = (await call('/api/admin/merchant-requests?status=approved', { token: admin })).data.items;
    assert.ok(approved.some((x) => x.id === user.id && x.reviewed_by_name));
  });
});

describe('admin: full control', () => {
  let admin; let seller;
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('sidi@example.mr');
  });

  it('edits site settings; texts and contact are public, validation applies', async () => {
    assert.equal((await call('/api/admin/settings', { token: seller })).status, 403);
    const r = await call('/api/admin/settings', { method: 'PUT', token: admin, body: {
      contact: { email: 'contact@souk-chinguetti.mr', whatsapp: '+222 22 00 00 00' },
      announcement: { enabled: true, tone: 'brand', link: '/products' },
      texts: { ar: { 'brand.tagline': 'سوق موريتانيا الأول', 'announcement.text': 'مرحباً بكم' }, fr: {}, en: {} },
    } });
    assert.equal(r.status, 200);
    const pub = (await call('/api/settings')).data.settings;
    assert.equal(pub.contact.email, 'contact@souk-chinguetti.mr');
    assert.equal(pub.contact.phone, '', 'missing fields keep defaults');
    assert.equal(pub.texts.ar['brand.tagline'], 'سوق موريتانيا الأول');
    assert.equal(pub.announcement.enabled, true);
    const bad = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { social: { facebook: 'javascript:alert(1)' } } });
    assert.equal(bad.status, 400);
    assert.ok(bad.data.fields['social.facebook']);
    const badKey = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { texts: { ar: { 'bad key!': 'x' } } } });
    assert.equal(badKey.status, 400);
  });

  it('closes registration and turns on auto-approve from the panel', async () => {
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { registration: false, autoApprove: true, phoneVerification: false } } });
    const reg = await call('/api/auth/register', { method: 'POST', body: { name: 'Closed', phone: '41112233', password: 'closed123' } });
    assert.equal(reg.status, 403);
    assert.equal(reg.data.error, 'registration_closed');
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'إعلان معتمد تلقائياً', description: 'وصف إعلان للاختبار هنا', price: '1000', city: 'nouakchott', condition: 'used', categoryId: '1' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const p = await call('/api/products', { method: 'POST', token: seller, form: fd });
    assert.equal(p.status, 201, JSON.stringify(p.data));
    assert.equal(p.data.product.status, 'approved');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { registration: true, autoApprove: false, phoneVerification: false } } });
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Open', phone: '41112234', password: 'opened123' } })).status, 201);
  });

  it('edits and deletes users, stores, reviews and files', async () => {
    const reg = await call('/api/auth/register', { method: 'POST', body: { name: 'To Delete', phone: '41112299', password: 'delete123' } });
    const id = reg.data.user.id;
    const ed = await call(`/api/admin/users/${id}/profile`, { method: 'PUT', token: admin, body: { name: 'Edited Name', phone: '41112298', city: 'rosso', bio: 'x' } });
    assert.equal(ed.status, 200);
    assert.equal(ed.data.user.phone, '+22241112298');
    assert.equal((await call(`/api/admin/users/${id}/profile`, { method: 'PUT', token: admin, body: { name: 'Bad', phone: '123' } })).status, 400);
    const adminId = (await call('/api/auth/me', { token: admin })).data.user.id;
    assert.equal((await call(`/api/admin/users/${adminId}`, { method: 'DELETE', token: admin })).data.error, 'cannot_delete_self');
    assert.equal((await call(`/api/admin/users/${id}`, { method: 'DELETE', token: admin })).status, 200);
    assert.equal((await call(`/api/users/${id}`)).status, 404);

    const stores = (await call('/api/admin/stores', { token: admin })).data.items;
    const st = stores.find((x) => x.slug === 'amana-store');
    const se = await call(`/api/admin/stores/${st.id}`, { method: 'PUT', token: admin, body: { name: 'متجر معدّل', city: 'nouakchott' } });
    assert.equal(se.status, 200);
    assert.equal((await call(`/api/stores/${se.data.store.slug}`)).data.store.name, 'متجر معدّل');
    assert.equal((await call(`/api/admin/stores/${st.id}`, { method: 'DELETE', token: admin })).status, 200);

    const reviews = (await call('/api/admin/reviews', { token: admin })).data;
    assert.ok(Array.isArray(reviews.items));
    if (reviews.items[0]) assert.equal((await call(`/api/admin/reviews/${reviews.items[0].id}`, { method: 'DELETE', token: admin })).status, 200);

    const files = (await call('/api/admin/files', { token: admin })).data;
    assert.ok(files.items.length > 0 && Number(files.totals.bytes) > 0);
    const used = files.items.find((f) => f.used_by?.kind === 'listing');
    assert.ok(used, 'usage is reported');
    assert.equal((await call(`/api/admin/files/${used.id}`, { method: 'DELETE', token: admin })).status, 200);
    assert.equal((await fetch(`${base}${used.url}`)).status, 404);
    const imgs = (await call(`/api/products/${used.used_by.id}`)).data.product.images || [];
    assert.ok(!imgs.some((i) => i.url === used.url), 'detached from the listing');
  });

  it('changes the admin login email and password (current password required)', async () => {
    assert.equal((await call('/api/admin/account', { method: 'PUT', token: admin, body: { currentPassword: 'nope', newPassword: 'NewAdmin123' } })).data.error, 'wrong_password');
    const r = await call('/api/admin/account', { method: 'PUT', token: admin, body: { currentPassword: 'Admin12345', email: 'boss@souk-chinguetti.mr', newPassword: 'NewAdmin123' } });
    assert.equal(r.status, 200);
    assert.equal(r.data.user.email, 'boss@souk-chinguetti.mr');
    assert.ok(await login('boss@souk-chinguetti.mr', 'NewAdmin123'));
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: 'admin@souk-chinguetti.mr', password: 'Admin12345' } })).status, 401);
    // restore for other runs
    const t2 = await login('boss@souk-chinguetti.mr', 'NewAdmin123');
    await call('/api/admin/account', { method: 'PUT', token: t2, body: { currentPassword: 'NewAdmin123', email: 'admin@souk-chinguetti.mr', newPassword: 'Admin12345' } });
  });
});

describe('admin: add users, post for anyone, pages, banner and menus', () => {
  let admin;
  before(async () => { admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); });

  it('creates users (merchants are approved straight away)', async () => {
    const r = await call('/api/admin/users', { method: 'POST', token: admin, body: { name: 'تاجر من الإدارة', phone: '36778899', password: 'merchant9', accountType: 'merchant', city: 'nouakchott' } });
    assert.equal(r.status, 201);
    assert.equal(r.data.user.account_type, 'merchant');
    assert.equal((await call('/api/admin/users', { method: 'POST', token: admin, body: { name: 'Dup', phone: '36778899', password: 'merchant9' } })).data.error, 'phone_taken');
    const t = (await call('/api/auth/login', { method: 'POST', body: { identifier: '36778899', password: 'merchant9' } })).data.token;
    assert.equal((await call('/api/auth/me', { token: t })).data.user.merchant_status, 'approved');
    const pick = (await call('/api/admin/users/pick?q=تاجر من', { token: admin })).data.items;
    assert.ok(pick.some((u) => u.id === r.data.user.id));
  });

  it('posts a listing in another user\'s name, live at once', async () => {
    const seller = (await call('/api/admin/users/pick?q=Fatimetou', { token: admin })).data.items[0];
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'إعلان أضافته الإدارة', description: 'وصف إعلان أضافته الإدارة باسم بائع', price: '5000', city: 'nouakchott', condition: 'new', categoryId: '1', sellerId: String(seller.id) })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r = await call('/api/products', { method: 'POST', token: admin, form: fd });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.equal(r.data.product.status, 'approved');
    assert.equal(r.data.product.seller_id, seller.id);
    // a normal seller cannot post in someone else's name
    const seller2 = await login('mohamed@example.mr');
    const fd2 = new FormData();
    for (const [k, v] of Object.entries({ title: 'محاولة باسم غيري', description: 'وصف إعلان للاختبار هنا وهناك', price: '100', city: 'nouakchott', condition: 'new', categoryId: '1', sellerId: String(seller.id) })) fd2.append(k, v);
    fd2.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r2 = await call('/api/products', { method: 'POST', token: seller2, form: fd2 });
    assert.notEqual(r2.data.product.seller_id, seller.id);
  });

  it('uploads images and manages custom pages', async () => {
    const fd = new FormData(); fd.append('file', new Blob([PNG], { type: 'image/png' }), 'b.png');
    const up = await call('/api/admin/uploads', { method: 'POST', token: admin, form: fd });
    assert.equal(up.status, 201);
    assert.match(up.data.url, /^\/uploads\/f\/\d+$/);
    const body = { slug: 'terms', title: { ar: 'شروط الاستخدام', fr: 'Conditions', en: 'Terms' }, body: { ar: '## مقدمة\nنص الصفحة', fr: '', en: '' }, coverUrl: up.data.url, isPublished: true };
    const c = await call('/api/admin/pages', { method: 'POST', token: admin, body });
    assert.equal(c.status, 201);
    assert.equal((await call('/api/admin/pages', { method: 'POST', token: admin, body })).data.error, 'slug_taken');
    assert.equal((await call('/api/admin/pages', { method: 'POST', token: admin, body: { ...body, slug: 'Bad Slug!' } })).status, 400);
    const pub = await call('/api/pages/terms');
    assert.equal(pub.data.page.title.ar, 'شروط الاستخدام');
    assert.ok((await call('/api/pages')).data.items.some((p) => p.slug === 'terms'));
    await call(`/api/admin/pages/${c.data.page.id}`, { method: 'PUT', token: admin, body: { ...body, isPublished: false } });
    assert.equal((await call('/api/pages/terms')).status, 404, 'drafts are hidden');
    assert.equal((await call(`/api/admin/pages/${c.data.page.id}`, { method: 'DELETE', token: admin })).status, 200);
  });

  it('saves banners (own table) and menus (validated)', async () => {
    const slide = { title: { ar: 'عرض خاص', fr: '', en: '' }, subtitle: { ar: 'نص', fr: '', en: '' }, cta: { ar: 'اكتشف', fr: '', en: '' }, link: '/products', imageUrl: '', isActive: true };
    const hidden = { ...slide, title: { ar: 'مخفي', fr: '', en: '' }, isActive: false };
    const b = await call('/api/admin/banners', { method: 'PUT', token: admin, body: { items: [slide, hidden] } });
    assert.equal(b.status, 200, JSON.stringify(b.data));
    assert.equal(b.data.items.length, 2);
    const pubBanners = (await call('/api/settings')).data.banners;
    assert.deepEqual(pubBanners.map((x) => x.title.ar), ['عرض خاص'], 'hidden banners are not public');
    assert.equal((await call('/api/admin/banners', { method: 'PUT', token: admin, body: { items: [{ ...slide, link: 'javascript:alert(1)' }] } })).status, 400);
    const ok = await call('/api/admin/settings', { method: 'PUT', token: admin, body: {
      menu: { header: [{ type: 'builtin', key: 'home' }, { type: 'link', label: { ar: 'الشروط', fr: '', en: '' }, to: '/p/terms' }], footer: null,
        home: { hero: true, categories: true, latest: true, promo: false, deals: true, cities: false, stores: true, features: true } },
    } });
    assert.equal(ok.status, 200, JSON.stringify(ok.data));
    const s = (await call('/api/settings')).data.settings;
    assert.equal(s.menu.header[1].to, '/p/terms');
    assert.equal(s.menu.home.cities, false);
    const bad2 = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { menu: { header: [{ type: 'builtin', key: 'nope' }], footer: null, home: s.menu.home } } });
    assert.equal(bad2.status, 400);
    await call('/api/admin/banners', { method: 'PUT', token: admin, body: { items: [] } });
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { menu: { header: null, footer: null, home: { ...s.menu.home, promo: true, cities: true } } } });
  });
});

describe('admin: identity, maintenance, prices, cities', () => {
  let admin;
  before(async () => { admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); });

  it('saves identity & colours (validated) and serves them publicly', async () => {
    const ok = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { appearance: { siteName: 'سوق موريتانيا', logoUrl: '', primaryColor: '#1d4ed8', secondaryColor: '#f97316' } } });
    assert.equal(ok.status, 200);
    const s = (await call('/api/settings')).data.settings;
    assert.equal(s.appearance.siteName, 'سوق موريتانيا');
    assert.equal(s.appearance.primaryColor, '#1d4ed8');
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { appearance: { primaryColor: 'red' } } })).status, 400);
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { appearance: { siteName: '', logoUrl: '', primaryColor: '', secondaryColor: '' } } });
  });

  it('maintenance mode: visitors can read but not write; admins keep working', async () => {
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { maintenance: { enabled: true, message: { ar: 'نعود قريباً', fr: '', en: '' } } } });
    assert.equal((await call('/api/products')).status, 200, 'reading still works');
    const reg = await call('/api/auth/register', { method: 'POST', body: { name: 'Late', phone: '41998877', password: 'latecomer1' } });
    assert.equal(reg.status, 503);
    assert.equal(reg.data.error, 'maintenance');
    const seller = await login('mohamed@example.mr');
    assert.ok(seller, 'login still works');
    assert.equal((await call('/api/favorites/1', { method: 'POST', token: seller })).status, 503);
    assert.equal((await call('/api/admin/settings', { token: admin })).status, 200);
    assert.notEqual((await call('/api/favorites/1', { method: 'POST', token: admin })).status, 503, 'admins are not blocked');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { maintenance: { enabled: false, message: { ar: '', fr: '', en: '' } } } });
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Late', phone: '41998877', password: 'latecomer1' } })).status, 201);
  });

  it('prices and the paid switch come from the panel', async () => {
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    const r = await call('/api/admin/settings', { method: 'PUT', token: admin, body: {
      pricing: { verifyPrice: 750, featurePlans: [{ days: 3, price: 100 }, { days: 10, price: 300 }] }, features: { ...s.features, paidUpgrades: true },
    } });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    const meta = (await call('/api/meta')).data.upgrades;
    assert.equal(meta.verifyPrice, 750);
    assert.deepEqual(meta.featurePlans.map((p) => p.days), [3, 10]);
    const seller = await login('fatimetou@example.mr');
    const fd = new FormData(); fd.append('kind', 'verify'); fd.append('paymentMethod', 'bankily'); fd.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    const req = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: fd });
    assert.ok(req.status === 201 || req.data.error === 'already_verified', JSON.stringify(req.data));
    if (req.status === 201) assert.equal(req.data.request.amount, 750);
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { pricing: { verifyPrice: 1, featurePlans: [{ days: 3, price: 1 }, { days: 3, price: 2 }] } } })).status, 400, 'duplicate days rejected');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { pricing: s.pricing, features: s.features } });
    assert.equal((await call('/api/meta')).data.upgrades, null);
  });

  it('cities: add, rename, hide, validate, and refuse deleting a city in use', async () => {
    const list = (await call('/api/admin/cities', { token: admin })).data.items;
    assert.ok(list.length >= 10 && list.find((c) => c.key === 'nouakchott').used > 0);
    const c = await call('/api/admin/cities', { method: 'POST', token: admin, body: { key: 'chami', nameAr: 'الشامي', nameFr: 'Chami', nameEn: 'Chami' } });
    assert.equal(c.status, 201);
    assert.equal((await call('/api/admin/cities', { method: 'POST', token: admin, body: { key: 'chami', nameAr: 'مكرر' } })).data.error, 'city_exists');
    assert.ok((await call('/api/meta')).data.cities.some((x) => x.key === 'chami' && x.ar === 'الشامي'));
    // usable in forms right away
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'من الشامي', phone: '41887766', password: 'chami1234', city: 'chami' } });
    assert.equal(r.status, 201);
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Bad city', phone: '41887755', password: 'chami1234', city: 'atlantis' } })).data.fields.city, 'invalid');
    assert.equal((await call(`/api/admin/cities/${c.data.city.id}`, { method: 'DELETE', token: admin })).data.error, 'city_in_use');
    await call(`/api/admin/cities/${c.data.city.id}`, { method: 'PUT', token: admin, body: { key: 'chami', nameAr: 'الشامي', isActive: false, sortOrder: 5 } });
    assert.ok(!(await call('/api/meta')).data.cities.some((x) => x.key === 'chami'), 'hidden cities leave the filters');
    const unused = await call('/api/admin/cities', { method: 'POST', token: admin, body: { key: 'bir-moghrein', nameAr: 'بئر أم كرين' } });
    assert.equal((await call(`/api/admin/cities/${unused.data.city.id}`, { method: 'DELETE', token: admin })).status, 200);
  });
});

describe('geolocation', () => {
  const NKC = { lat: 18.0858, lng: -15.9785 }; // Nouakchott centre
  let seller; let productId;
  before(async () => { seller = await login('mohamed@example.mr'); });
  const form = (extra) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'دراجة نارية مستعملة', description: 'دراجة نارية بحالة جيدة جداً', price: '30000', city: 'nouakchott', condition: 'used', categoryId: '1', ...extra })) fd.append(k, String(v));
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    return fd;
  };

  it('saves a listing pin, area and neighbourhood; hides the exact pin from the public', async () => {
    const r = await call('/api/products', { method: 'POST', token: seller, form: form({ lat: '18.10437', lng: '-15.97521', area: 'تفرغ زينة', district: 'حي النصر', locExact: 'false' }) });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    productId = r.data.product.id;
    const { rows } = await pool.query('SELECT lat, lng, area, district, loc_exact FROM products WHERE id = $1', [productId]);
    assert.equal(rows[0].lat, 18.10437);
    assert.equal(rows[0].district, 'حي النصر');
    assert.equal(rows[0].loc_exact, false);
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [productId]);
    const pub = (await call(`/api/products/${productId}`)).data.product;
    assert.equal(pub.loc_precision, 'approx');
    assert.equal(pub.map_lat, 18.1, 'rounded to ~1 km');
    assert.equal(pub.map_lng, -15.98);
    assert.equal(pub.pin_lat, undefined, 'exact pin hidden from buyers');
    assert.equal(pub.area, 'تفرغ زينة');
    const own = (await call(`/api/products/${productId}`, { token: seller })).data.product;
    assert.equal(own.pin_lat, 18.10437, 'the seller sees the exact pin to edit it');
  });

  it('shows the exact pin only when the seller allows it', async () => {
    const fd = form({ lat: '18.10437', lng: '-15.97521', area: 'تفرغ زينة', district: '', locExact: 'true' });
    fd.append('removeImageIds', '0');
    assert.equal((await call(`/api/products/${productId}`, { method: 'PUT', token: seller, form: fd })).status, 200);
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [productId]);
    const pub = (await call(`/api/products/${productId}`)).data.product;
    assert.equal(pub.loc_precision, 'exact');
    assert.equal(pub.map_lat, 18.10437);
  });

  it('rejects pins outside Mauritania or half a pin', async () => {
    assert.equal((await call('/api/products', { method: 'POST', token: seller, form: form({ lat: '48.85', lng: '2.35' }) })).status, 400);
    assert.equal((await call('/api/products', { method: 'POST', token: seller, form: form({ lat: '18.1', lng: '' }) })).status, 400);
  });

  it('distance, "near me" radius and sorting by distance', async () => {
    const near = (await call(`/api/products?lat=${NKC.lat}&lng=${NKC.lng}&radius=10&sort=distance&limit=60`)).data;
    assert.ok(near.items.length > 0);
    assert.ok(near.items.every((p) => p.distance_km !== null && p.distance_km <= 10.5), 'all within the radius');
    const d = near.items.map((p) => p.distance_km);
    assert.deepEqual(d, [...d].sort((a, b) => a - b), 'nearest first');
    assert.ok(near.items.every((p) => p.loc_precision === 'exact' || p.distance_km * 2 === Math.round(p.distance_km * 2)), 'hidden pins: 0.5 km steps');
    const all = (await call(`/api/products?lat=${NKC.lat}&lng=${NKC.lng}&limit=60`)).data;
    assert.ok(Number(all.total) > Number(near.total), 'listings in other cities are outside 10 km');
    const far = all.items.find((p) => p.city === 'nouadhibou');
    if (far) assert.ok(far.distance_km > 320 && far.distance_km < 350, `Nouadhibou is ~335 km away in a straight line, got ${far.distance_km}`);
    const noPos = (await call('/api/products?limit=5')).data.items;
    assert.ok(noPos.every((p) => p.distance_km === null));
    const detail = (await call(`/api/products/${productId}?lat=${NKC.lat}&lng=${NKC.lng}`)).data.product;
    assert.ok(detail.distance_km > 1 && detail.distance_km < 4, `about 2 km, got ${detail.distance_km}`);
  });

  it('reverse geocoding: city and moughataa from our data, rate-limited POST', async () => {
    const r = await call('/api/geo/reverse', { method: 'POST', body: { lat: 18.1043, lng: -15.9752, lang: 'ar' } });
    assert.equal(r.status, 200);
    assert.equal(r.data.city.key, 'nouakchott');
    assert.equal(r.data.area.ar, 'تفرغ زينة');
    assert.equal(r.data.inMauritania, true);
    const ndb = (await call('/api/geo/reverse', { method: 'POST', body: { lat: 20.93, lng: -17.03 } })).data;
    assert.equal(ndb.city.key, 'nouadhibou');
    assert.equal((await call('/api/geo/reverse', { method: 'POST', body: { lat: 'x', lng: 1 } })).status, 400);
    const paris = (await call('/api/geo/reverse', { method: 'POST', body: { lat: 48.85, lng: 2.35 } })).data;
    assert.equal(paris.inMauritania, false);
    const areas = (await call('/api/geo/areas')).data.areas;
    assert.ok(areas.nouakchott.some((a) => a.key === 'arafat'));
    const meta = (await call('/api/meta')).data.cities;
    assert.ok(meta.find((c) => c.key === 'nouakchott').lat > 18);
  });
});

describe('delivery service', () => {
  let seller; let buyer; let courierTok; let other; let admin; let productId; let orderId; let courierId;
  const NKC_PIN = { lat: 18.0735, lng: -15.9582 }; // a point a few km from the listing
  before(async () => {
    [seller, buyer, courierTok, other, admin] = await Promise.all([login('mohamed@example.mr'), login('buyer@example.mr'), login('sidi@example.mr'), login('fatimetou@example.mr'), login('admin@souk-chinguetti.mr', 'Admin12345')]);
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'ثلاجة للتوصيل', description: 'ثلاجة بحالة ممتازة للبيع', price: '12000', city: 'nouakchott', condition: 'used', categoryId: '1', lat: '18.1043', lng: '-15.9752', area: 'تفرغ زينة' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    productId = (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [productId]);
  });
  const order = (id, tok) => call(`/api/orders/${id}`, { token: tok }).then((r) => r);
  const move = (id, tok, status, note) => call(`/api/orders/${id}/status`, { method: 'POST', token: tok, body: { status, note } });

  it('quotes item + delivery by distance, inter-city surcharge, and refuses own product', async () => {
    assert.equal((await call('/api/orders/quote', { method: 'POST', body: { productId, city: 'nouakchott' } })).status, 401);
    const q = (await call('/api/orders/quote', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', ...NKC_PIN } })).data;
    assert.equal(q.itemPrice, 12000);
    assert.ok(q.distanceKm > 2 && q.distanceKm < 8, `km ${q.distanceKm}`);
    assert.equal(q.deliveryFee, Math.ceil(Math.max(150, 100 + 20 * q.distanceKm) / 10) * 10);
    assert.equal(q.total, 12000 + q.deliveryFee);
    assert.equal(q.deliverable, true);
    const area = (await call('/api/orders/quote', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', area: 'arafat' } })).data;
    assert.ok(area.distanceKm > 0, 'moughataa centre used without a pin');
    const far = (await call('/api/orders/quote', { method: 'POST', token: buyer, body: { productId, city: 'nouadhibou' } })).data;
    assert.equal(far.interCity, true);
    assert.ok(far.deliveryFee >= 500 + 100 + 20 * 300, `inter-city fee ${far.deliveryFee}`);
    const own = await call('/api/orders/quote', { method: 'POST', token: seller, body: { productId, city: 'nouakchott' } });
    assert.equal(own.data.error, 'own_product');
  });

  it('creates a cash-on-delivery order, once, and tells the seller', async () => {
    const bad = await call('/api/orders', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', phone: '12' } });
    assert.equal(bad.data.fields.phone, 'invalid_phone');
    const r = await call('/api/orders', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', area: 'tevragh-zeina', district: 'حي النصر', address: 'قرب المسجد، المنزل الأزرق', phone: '22334455', note: 'اتصل قبل الوصول', ...NKC_PIN } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    orderId = r.data.order.id;
    assert.equal(r.data.order.status, 'pending');
    const dup = await call('/api/orders', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', phone: '22334455' } });
    assert.equal(dup.status, 409);
    const { rows } = await pool.query('SELECT payment_method, item_price, delivery_fee, total, phone FROM orders WHERE id = $1', [orderId]);
    assert.equal(rows[0].payment_method, 'cod');
    assert.equal(Number(rows[0].total), Number(rows[0].item_price) + Number(rows[0].delivery_fee));
    const n = await pool.query("SELECT 1 FROM notifications WHERE type = 'order_new' AND user_id = (SELECT seller_id FROM orders WHERE id = $1)", [orderId]);
    assert.equal(n.rowCount, 1);
  });

  it('protects the address: seller sees area only, strangers see nothing', async () => {
    const b = (await order(orderId, buyer)).data.order;
    assert.equal(b.address, 'قرب المسجد، المنزل الأزرق');
    assert.deepEqual(b.next, ['cancelled']);
    const s = (await order(orderId, seller)).data.order;
    assert.equal(s.address, undefined);
    assert.equal(s.phone, undefined);
    assert.equal(s.lat, undefined);
    assert.equal(s.district, 'حي النصر');
    assert.deepEqual(s.next.sort(), ['accepted', 'cancelled']);
    assert.equal((await order(orderId, other)).status, 404);
    assert.equal((await order(orderId, admin)).data.order.phone, '+22222334455');
  });

  it('enforces who can move the order', async () => {
    assert.equal((await move(orderId, buyer, 'accepted')).status, 403);
    assert.equal((await move(orderId, other, 'accepted')).status, 404);
    assert.equal((await move(orderId, seller, 'delivered')).data.error, 'invalid_transition');
    assert.equal((await move(orderId, seller, 'accepted')).status, 200);
    assert.equal((await move(orderId, seller, 'picked_up')).status, 403, 'only the courier picks up');
    assert.equal((await move(orderId, seller, 'preparing')).status, 200);
    assert.equal((await move(orderId, buyer, 'cancelled')).status, 403, 'too late for the buyer once prepared');
  });

  it('couriers apply, admin approves, then they claim deliveries in their city', async () => {
    assert.equal((await call('/api/couriers/available', { token: courierTok })).status, 403);
    const ap = await call('/api/couriers/apply', { method: 'POST', token: courierTok, body: { phone: '46001122', city: 'nouakchott', vehicle: 'motorbike', note: 'خبرة سنتين' } });
    assert.equal(ap.status, 201, JSON.stringify(ap.data));
    courierId = ap.data.courier.id;
    assert.equal((await call('/api/couriers/apply', { method: 'POST', token: courierTok, body: { phone: '46001122', city: 'nouakchott', vehicle: 'car' } })).status, 409);
    assert.equal((await call('/api/couriers/me', { token: courierTok })).data.courier.status, 'pending');
    const list = (await call('/api/admin/couriers', { token: admin })).data;
    assert.ok(list.items.some((c) => c.id === courierId));
    assert.equal((await call(`/api/admin/couriers/${courierId}`, { method: 'PATCH', token: admin, body: { status: 'rejected' } })).data.fields.note, 'required');
    assert.equal((await call(`/api/admin/couriers/${courierId}`, { method: 'PATCH', token: courierTok, body: { status: 'approved' } })).status, 403);
    assert.equal((await call(`/api/admin/couriers/${courierId}`, { method: 'PATCH', token: admin, body: { status: 'approved' } })).status, 200);
    const avail = (await call('/api/couriers/available', { token: courierTok })).data.items;
    const mine = avail.find((o) => o.id === orderId);
    assert.ok(mine, 'the prepared order is offered');
    assert.equal(mine.address, undefined, 'no customer address before claiming');
    assert.equal(mine.phone, undefined);
    assert.equal((await call(`/api/orders/${orderId}/claim`, { method: 'POST', token: courierTok })).status, 200);
    assert.equal((await call(`/api/orders/${orderId}/claim`, { method: 'POST', token: courierTok })).status, 409, 'cannot be taken twice');
    const c = (await order(orderId, courierTok)).data.order;
    assert.equal(c.address, 'قرب المسجد، المنزل الأزرق', 'the assigned courier gets the address');
    assert.deepEqual(c.next, ['picked_up']);
  });

  it('tracks the courier only with consent and only while on the way', async () => {
    assert.equal((await call('/api/couriers/me/location', { method: 'POST', token: courierTok, body: { lat: 18.09, lng: -15.97 } })).data.error, 'location_sharing_off');
    await call('/api/couriers/me', { method: 'PATCH', token: courierTok, body: { shareLocation: true } });
    assert.equal((await call('/api/couriers/me/location', { method: 'POST', token: courierTok, body: { lat: 18.09, lng: -15.97 } })).data.stored, false, 'nothing kept before pick-up');
    assert.equal((await move(orderId, courierTok, 'picked_up')).status, 200);
    assert.equal((await move(orderId, courierTok, 'on_the_way')).status, 200);
    assert.equal((await call('/api/couriers/me/location', { method: 'POST', token: courierTok, body: { lat: 18.09, lng: -15.97 } })).data.stored, true);
    const b = (await order(orderId, buyer)).data.order;
    assert.equal(b.courier_location.lat, 18.09);
    assert.equal((await order(orderId, seller)).data.order.courier_location, null, 'the seller does not track the courier');
    await call('/api/couriers/me', { method: 'PATCH', token: courierTok, body: { shareLocation: false } });
    assert.equal((await order(orderId, buyer)).data.order.courier_location, null, 'consent withdrawn: position gone');
    const { rows } = await pool.query('SELECT last_lat FROM couriers WHERE id = $1', [courierId]);
    assert.equal(rows[0].last_lat, null);
  });

  it('delivers: product sold, timeline complete, everyone notified, buyer rates once', async () => {
    assert.equal((await call(`/api/orders/${orderId}/rate`, { method: 'POST', token: buyer, body: { rating: 5 } })).data.error, 'cannot_rate');
    assert.equal((await move(orderId, courierTok, 'delivered')).status, 200);
    const o = (await order(orderId, buyer)).data.order;
    assert.equal(o.status, 'delivered');
    assert.ok(o.delivered_at);
    assert.deepEqual(o.events.map((e) => e.status), ['pending', 'accepted', 'preparing', 'courier_assigned', 'picked_up', 'on_the_way', 'delivered']);
    assert.equal(o.can_rate, true);
    const p = (await pool.query('SELECT availability, sold_to_id FROM products WHERE id = $1', [productId])).rows[0];
    assert.equal(p.availability, 'sold');
    const statusNotes = await pool.query("SELECT user_id FROM notifications WHERE type = 'order_status' AND data->>'status' = 'delivered' AND data->>'id' = $1", [String(orderId)]);
    assert.equal(statusNotes.rowCount, 2, 'buyer and seller (not the courier who did it)');
    assert.equal((await call(`/api/orders/${orderId}/rate`, { method: 'POST', token: seller, body: { rating: 1 } })).status, 404);
    assert.equal((await call(`/api/orders/${orderId}/rate`, { method: 'POST', token: buyer, body: { rating: 5, comment: 'سريع ولطيف' } })).status, 201);
    assert.equal((await call(`/api/orders/${orderId}/rate`, { method: 'POST', token: buyer, body: { rating: 4 } })).status, 409);
    const me = (await call('/api/couriers/me', { token: courierTok })).data.courier;
    assert.equal(Number(me.stats.delivered), 1);
    assert.equal(Number(me.stats.rating), 5);
    assert.equal(me.last_lat, undefined);
    const hist = (await call('/api/orders?as=buyer', { token: buyer })).data.items;
    assert.ok(hist.some((x) => x.id === orderId && x.status === 'delivered'), 'order history');
    assert.equal((await move(orderId, admin, 'cancelled', 'x')).data.error, 'invalid_transition');
    assert.equal((await call('/api/orders', { method: 'POST', token: buyer, body: { productId, city: 'nouakchott', phone: '22334455' } })).data.error, 'product_sold');
  });

  it('cancellation with reason, admin monitoring, assignment and pricing', async () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'مكيف للبيع', description: 'مكيف هواء بحالة جيدة', price: '9000', city: 'nouakchott', condition: 'used', categoryId: '1' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const pid = (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [pid]);
    const oid = (await call('/api/orders', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott', area: 'arafat', phone: '22334455' } })).data.order.id;
    assert.equal((await move(oid, seller, 'cancelled')).data.fields.note, 'required');
    await move(oid, seller, 'accepted');
    assert.equal((await call(`/api/admin/orders/${oid}/assign`, { method: 'PATCH', token: admin, body: { courierId } })).status, 200);
    assert.equal((await order(oid, courierTok)).status, 200);
    const all = (await call('/api/admin/orders?status=open', { token: admin })).data;
    assert.ok(all.items.some((x) => x.id === oid && x.courier_name));
    assert.equal(all.counts.delivered >= 1, true);
    assert.equal((await call(`/api/admin/orders?q=%23${oid}`, { token: admin })).data.items[0].id, oid);
    assert.equal((await call('/api/admin/orders', { token: seller })).status, 403);
    assert.equal((await move(oid, buyer, 'cancelled')).status, 200, 'the buyer can still cancel before preparation');
    const o = (await order(oid, admin)).data.order;
    assert.equal(o.cancelled_by, 'buyer');
    const stats = (await call('/api/admin/stats', { token: admin })).data.totals;
    assert.ok('open_orders' in stats && 'pending_couriers' in stats);
    // pricing from the admin panel
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { delivery: { ...s.delivery, baseFee: 300, minFee: 0, perKm: 0 } } })).status, 200);
    const q = (await call('/api/orders/quote', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott' } })).data;
    assert.equal(q.deliveryFee, 300);
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { delivery: { ...s.delivery, enabled: false } } });
    assert.equal((await call('/api/orders/quote', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott' } })).data.error, 'delivery_disabled');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { delivery: s.delivery } });
  });
});

describe('security hardening', () => {
  it('a password change signs out other sessions; this device gets a fresh token', async () => {
    const phone = `4${String(Date.now()).slice(-7)}`;
    const reg = await call('/api/auth/register', { method: 'POST', body: { name: 'Sec Test', phone, password: 'OldPass123' } });
    const oldToken = reg.data.token;
    await new Promise((r) => setTimeout(r, 1100)); // tokens carry second-precision timestamps
    const ch = await call('/api/auth/me/password', { method: 'PUT', token: oldToken, body: { currentPassword: 'OldPass123', newPassword: 'NewPass123' } });
    assert.equal(ch.status, 200);
    assert.ok(ch.data.token);
    const stale = await call('/api/auth/me', { token: oldToken });
    assert.equal(stale.status, 401);
    assert.equal(stale.data.error, 'session_expired');
    assert.equal((await call('/api/auth/me', { token: ch.data.token })).status, 200);
  });

  it('rejects unsigned and tampered tokens', async () => {
    const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const none = `${enc({ alg: 'none', typ: 'JWT' })}.${enc({ sub: 1, role: 'admin', iat: Math.floor(Date.now() / 1000) })}.`;
    assert.equal((await call('/api/admin/stats', { token: none })).status, 401);
    const real = await login('buyer@example.mr');
    const [h, , sig] = real.split('.');
    const forged = `${h}.${enc({ sub: 1, role: 'admin', iat: Math.floor(Date.now() / 1000) })}.${sig}`;
    assert.equal((await call('/api/admin/stats', { token: forged })).status, 401);
  });

  it('admin links cannot point to another site disguised as an internal path', async () => {
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    for (const link of ['//evil.example', '/\\evil.example', 'javascript:alert(1)', 'http://plain.example']) {
      const r = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { announcement: { enabled: false, tone: 'gold', style: 'static', link } } });
      assert.equal(r.status, 400, link);
    }
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { announcement: { enabled: false, tone: 'gold', style: 'static', link: '/products' } } })).status, 200);
  });

  it('no stack traces or SQL details leak on bad input', async () => {
    const r = await call('/api/products?minPrice=abc&sort=1;DROP');
    assert.equal(r.status, 400);
    assert.deepEqual(Object.keys(r.data).sort(), ['error', 'fields']);
    const j = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.deepEqual(await j.json(), { error: 'invalid_json' });
  });
});

describe('shared rate limits (several server instances)', () => {
  it('counts attempts across instances, so spreading requests does not bypass the limit', async () => {
    const express = (await import('express')).default;
    const { limiter } = await import('../src/lib/rateLimit.js');
    // the same limiter name on two separate "instances"
    const name = `test-${Date.now()}`;
    const mk = () => { const app = express(); app.post('/x', limiter(name, { windowMs: 60000, limit: 3, keyGenerator: () => 'same-account' }), (_q, r) => r.json({ ok: true })); return app.listen(0); };
    const a = mk(); const b = mk();
    const hit = (s) => fetch(`http://localhost:${s.address().port}/x`, { method: 'POST' }).then((r) => r.status);
    const codes = [await hit(a), await hit(b), await hit(a), await hit(b), await hit(a)];
    a.close(); b.close();
    assert.deepEqual(codes, [200, 200, 200, 429, 429]);
    const stored = await pool.query("SELECT key FROM rate_limits WHERE key LIKE '%same-account%'");
    assert.equal(stored.rowCount, 0, 'keys are hashed, never stored in clear');
  });
});

describe('link previews and search engines', () => {
  let seller; let admin; let pid; let pendingId;
  const page = async (path) => { const r = await fetch(base + path); return { status: r.status, html: await r.text(), type: r.headers.get('content-type'), cache: r.headers.get('cache-control') }; };
  const og = (html, prop) => (new RegExp(`<meta property="${prop}" content="([^"]*)"`).exec(html) || [])[1];
  before(async () => {
    seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const mk = async (title) => {
      const fd = new FormData();
      for (const [k, v] of Object.entries({ title, description: 'سيارة بحالة ممتازة، مكيفة، أوراقها كاملة', price: '850000', city: 'nouakchott', condition: 'used', categoryId: '1', area: 'تفرغ زينة' })) fd.append(k, v);
      fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
      return (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
    };
    pid = await mk('تويوتا هايلكس 2018 "<script>alert(1)</script>');
    await call(`/api/admin/products/${pid}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    pendingId = await mk('إعلان سري بانتظار المراجعة');
  });

  it('a listing link carries its title, price, image and structured data', async () => {
    const r = await page(`/products/${pid}`);
    assert.equal(r.status, 200);
    assert.match(r.type, /text\/html/);
    assert.match(og(r.html, 'og:title'), /تويوتا هايلكس 2018/);
    assert.match(og(r.html, 'og:title'), /850,000 MRU/);
    assert.match(og(r.html, 'og:image'), /^http:\/\/localhost:\d+\/og\/img\/\d+\.jpg$/);
    assert.match(og(r.html, 'og:description'), /نواكشوط/);
    assert.equal(og(r.html, 'og:type'), 'product');
    assert.ok(!r.html.includes('<script>alert(1)'), 'the title is escaped everywhere');
    const ld = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(r.html)[1]);
    assert.equal(ld['@type'], 'Product');
    assert.equal(ld.offers.priceCurrency, 'MRU');
    assert.equal(ld.offers.price, '850000');
    assert.match(r.html, /<div id="root"><\/div>/, 'the React app still mounts');
    assert.match(r.cache, /s-maxage/);
  });

  it('the share image is a small 1200×630 JPEG; private files are never served', async () => {
    const url = og((await page(`/products/${pid}`)).html, 'og:image').replace(/^http:\/\/localhost:\d+/, '');
    const r = await fetch(base + url);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'image/jpeg');
    const buf = Buffer.from(await r.arrayBuffer());
    const sharp = (await import('sharp')).default;
    const meta = await sharp(buf).metadata();
    assert.deepEqual([meta.width, meta.height], [1200, 630]);
    assert.ok(buf.length < 300 * 1024, 'small enough for WhatsApp');
    const priv = (await pool.query('INSERT INTO files (mime, data, is_private) VALUES ($1, $2, true) RETURNING id', ['image/png', PNG])).rows[0].id;
    assert.equal((await fetch(`${base}/og/img/${priv}.jpg`)).status, 404);
    assert.equal((await fetch(`${base}/og/img/abc.jpg`)).status, 404);
  });

  it('listings under review are not described to anyone', async () => {
    const r = await page(`/products/${pendingId}`);
    assert.equal(r.status, 404);
    assert.ok(!r.html.includes('إعلان سري'));
    assert.match(r.html, /noindex/);
    assert.equal((await page('/products/999999')).status, 404);
  });

  it('home, sitemap and robots', async () => {
    const home = await page('/');
    assert.equal(home.status, 200);
    assert.match(og(home.html, 'og:image'), /\/og-image\.jpg$/);
    const sm = await page('/sitemap.xml');
    assert.match(sm.type, /xml/);
    assert.ok(sm.html.includes(`/products/${pid}</loc>`));
    assert.ok(!sm.html.includes(`/products/${pendingId}</loc>`));
    const rb = await page('/robots.txt');
    assert.match(rb.html, /Disallow: \/admin/);
    assert.match(rb.html, /Sitemap: http:\/\/localhost:\d+\/sitemap\.xml/);
  });
});

describe('web push', () => {
  let buyer; let seller; let sent = [];
  const sub = (n, lang = 'fr') => ({ endpoint: `https://fcm.googleapis.com/fcm/send/${n}`, keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) }, lang });
  before(async () => {
    const { setPushSender } = await import('../src/lib/push.js');
    setPushSender(async (s, body) => {
      if (s.endpoint.endsWith('/gone')) { const e = new Error('gone'); e.statusCode = 410; throw e; }
      sent.push({ endpoint: s.endpoint, ...JSON.parse(body) });
    });
    buyer = await login('buyer@example.mr'); seller = await login('mohamed@example.mr');
  });

  it('gives the public key and validates subscriptions', async () => {
    const k = (await call('/api/push/key')).data.publicKey;
    assert.match(k, /^[A-Za-z0-9_-]{80,}$/);
    assert.equal((await call('/api/push/key')).data.publicKey, k, 'the same key every time');
    assert.equal((await call('/api/push/subscribe', { method: 'POST', body: sub(1) })).status, 401);
    assert.equal((await call('/api/push/subscribe', { method: 'POST', token: seller, body: { ...sub(1), endpoint: 'http://insecure.test/x' } })).status, 400);
    assert.equal((await call('/api/push/subscribe', { method: 'POST', token: seller, body: sub('seller-phone', 'fr') })).status, 201);
    assert.equal((await call('/api/push/subscribe', { method: 'POST', token: seller, body: { ...sub('gone'), lang: 'ar' } })).status, 201);
    const { rows } = await pool.query("SELECT value FROM app_secrets WHERE key = 'vapid'");
    assert.ok(rows[0].value.privateKey, 'the private key stays in the database');
  });

  it('a new message reaches the seller’s phone, in their language, and dead devices are forgotten', async () => {
    sent = [];
    const pid = (await pool.query("SELECT p.id FROM products p JOIN users u ON u.id = p.seller_id WHERE u.email = 'mohamed@example.mr' AND p.status = 'approved' AND p.availability = 'available' LIMIT 1")).rows[0].id;
    const r = await call('/api/conversations', { method: 'POST', token: buyer, body: { productId: pid, body: 'Bonjour, toujours disponible ?' } });
    assert.ok([200, 201].includes(r.status), JSON.stringify(r.data));
    await new Promise((res) => setTimeout(res, 300));
    const toSeller = sent.find((x) => x.endpoint.endsWith('/seller-phone'));
    assert.ok(toSeller, 'pushed to the seller');
    assert.equal(toSeller.title, 'Souk Chinguetti');
    assert.match(toSeller.body, /vous a écrit|message/i);
    assert.match(toSeller.url, /^\/messages\/\d+$/);
    const gone = await pool.query("SELECT 1 FROM push_subscriptions WHERE endpoint LIKE '%/gone'");
    assert.equal(gone.rowCount, 0, 'expired subscription removed');
  });

  it('test push, and unsubscribing at logout', async () => {
    sent = [];
    assert.equal((await call('/api/push/test', { method: 'POST', token: seller })).data.sent, 1);
    assert.match(sent[0].body, /test/i);
    await call('/api/push/subscribe', { method: 'DELETE', body: { endpoint: sub('seller-phone').endpoint } });
    assert.equal((await call('/api/push/test', { method: 'POST', token: seller })).data.sent, 0);
  });
});

describe('saved searches and price-drop alerts', () => {
  let buyer; let seller; let admin; let catSlug; let catId;
  const post = async (fields) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ description: 'بحالة ممتازة ونظيفة جداً', condition: 'used', city: 'nouakchott', categoryId: catId, ...fields })) fd.append(k, String(v));
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    return (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
  };
  const alertsFor = async (type, pid) => (await pool.query(
    "SELECT n.user_id FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = $1 AND (n.data->>'id')::int = $2 AND u.email = 'buyer@example.mr'", [type, pid])).rowCount;
  before(async () => {
    buyer = await login('buyer@example.mr'); seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    ({ slug: catSlug, id: catId } = (await pool.query("SELECT slug, id FROM categories WHERE slug = 'vehicles'")).rows[0]);
  });

  it('saves a search (validated, no duplicates, owner only)', async () => {
    assert.equal((await call('/api/saved-searches', { method: 'POST', body: { name: 'x', filters: { q: 'a' } } })).status, 401);
    assert.equal((await call('/api/saved-searches', { method: 'POST', token: buyer, body: { name: 'فارغ', filters: {} } })).data.fields.filters, 'empty_search');
    assert.equal((await call('/api/saved-searches', { method: 'POST', token: buyer, body: { name: 'x', filters: { minPrice: 9, maxPrice: 1 } } })).status, 400);
    const body = { name: 'هايلكس نواكشوط', filters: { q: 'هايلكس', category: catSlug, city: 'nouakchott', maxPrice: 400000 } };
    const r = await call('/api/saved-searches', { method: 'POST', token: buyer, body });
    assert.equal(r.status, 201);
    assert.equal((await call('/api/saved-searches', { method: 'POST', token: buyer, body })).data.existing, true);
    assert.equal((await call('/api/saved-searches', { token: buyer })).data.items.length, 1);
    assert.equal((await call(`/api/saved-searches/${r.data.id}`, { method: 'DELETE', token: seller })).status, 404, 'not someone else’s');
  });

  it('a matching new listing alerts once, when approved; non-matching ones do not', async () => {
    const match = await post({ title: 'تويوتا الهايلكس 2015 للبيع', price: 380000 });
    const tooExpensive = await post({ title: 'تويوتا هايلكس 2020', price: 900000 });
    const otherCity = await post({ title: 'هايلكس نظيفة', price: 300000, city: 'nouadhibou' });
    assert.equal(await alertsFor('saved_search_match', match), 0, 'nothing while under review');
    for (const id of [match, tooExpensive, otherCity]) await call(`/api/admin/products/${id}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(await alertsFor('saved_search_match', match), 1);
    assert.equal(await alertsFor('saved_search_match', tooExpensive), 0);
    assert.equal(await alertsFor('saved_search_match', otherCity), 0);
    // re-approval does not send it again
    await call(`/api/admin/products/${match}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(await alertsFor('saved_search_match', match), 1);
    const s = (await call('/api/saved-searches', { token: buyer })).data.items[0];
    assert.equal(s.hits, 1);
    // paused searches stay quiet
    await call(`/api/saved-searches/${s.id}`, { method: 'PATCH', token: buyer, body: { isActive: false } });
    const another = await post({ title: 'هايلكس ممتازة', price: 350000 });
    await call(`/api/admin/products/${another}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(await alertsFor('saved_search_match', another), 0);
  });

  it('a lower price alerts the people who saved the listing, even after the edit is re-reviewed', async () => {
    const pid = await post({ title: 'سيارة مرسيدس C200', price: 500000 });
    await call(`/api/admin/products/${pid}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    await call(`/api/favorites/${pid}`, { method: 'POST', token: buyer });
    const edit = async (price) => {
      const fd = new FormData();
      for (const [k, v] of Object.entries({ title: 'سيارة مرسيدس C200', description: 'بحالة ممتازة ونظيفة جداً', price, categoryId: catId, city: 'nouakchott', condition: 'used' })) fd.append(k, String(v));
      return call(`/api/products/${pid}`, { method: 'PUT', token: seller, form: fd });
    };
    assert.equal((await edit(550000)).status, 200);
    await call(`/api/admin/products/${pid}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(await alertsFor('price_drop', pid), 0, 'a price rise says nothing');
    await edit(450000); // back to review
    assert.equal(await alertsFor('price_drop', pid), 0, 'not before buyers can see it');
    await call(`/api/admin/products/${pid}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(await alertsFor('price_drop', pid), 1);
    const n = (await pool.query("SELECT data FROM notifications WHERE type = 'price_drop' AND (data->>'id')::int = $1", [pid])).rows[0].data;
    assert.deepEqual([n.old, n.price], [550000, 450000]);
    const sellerGot = (await pool.query("SELECT 1 FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'price_drop' AND u.email = 'mohamed@example.mr'")).rowCount;
    assert.equal(sellerGot, 0);
  });
});

describe('phone verification by SMS code', () => {
  let admin; let token; const phone = `4${String(Date.now()).slice(-7)}`;
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { phoneVerification: true } } });
  });
  after(async () => { await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { phoneVerification: false } } }); });

  it('a new account must confirm its number before posting or messaging', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'Nouveau', phone, password: 'Password123', accountType: 'individual' } });
    assert.equal(r.status, 201);
    assert.equal(r.data.verifyPhone, true);
    assert.equal(r.data.user.phone_verified_at, null);
    token = r.data.token;
    assert.equal((await call('/api/meta')).data.phoneVerification, true);
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'هاتف للبيع', description: 'هاتف بحالة جيدة جداً', price: '5000', city: 'nouakchott', condition: 'used', categoryId: '1' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const blocked = await call('/api/products', { method: 'POST', token, form: fd });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.data.error, 'phone_unverified');
    const pid = (await pool.query("SELECT id FROM products WHERE status = 'approved' LIMIT 1")).rows[0].id;
    assert.equal((await call('/api/conversations', { method: 'POST', token, body: { productId: pid, body: 'سلام' } })).data.error, 'phone_unverified');
    // browsing still works
    assert.equal((await call('/api/products?limit=1', { token })).status, 200);
  });

  it('wrong codes are refused; the right one confirms the number', async () => {
    const s = await call('/api/auth/phone/send', { method: 'POST', token, body: { lang: 'fr' } });
    assert.equal(s.status, 200, JSON.stringify(s.data));
    assert.match(s.data.devCode, /^\d{6}$/);
    assert.equal((await call('/api/auth/phone/verify', { method: 'POST', token, body: { code: 'abc' } })).status, 400);
    const wrong = s.data.devCode === '111111' ? '222222' : '111111';
    assert.equal((await call('/api/auth/phone/verify', { method: 'POST', token, body: { code: wrong } })).data.error, 'wrong_code');
    assert.equal((await call('/api/auth/phone/verify', { method: 'POST', token, body: { code: s.data.devCode } })).status, 200);
    const st = (await call('/api/auth/phone', { token })).data;
    assert.deepEqual([st.required, st.verified], [true, true]);
    const pid = (await pool.query("SELECT id FROM products WHERE status = 'approved' LIMIT 1")).rows[0].id;
    assert.ok([200, 201].includes((await call('/api/conversations', { method: 'POST', token, body: { productId: pid, body: 'سلام' } })).status));
  });

  it('changing the number needs a new confirmation; codes are rate-limited', async () => {
    const fd = new FormData();
    fd.append('name', 'Nouveau'); fd.append('phone', `3${String(Date.now()).slice(-7)}`);
    assert.equal((await call('/api/auth/me', { method: 'PUT', token, form: fd })).status, 200);
    assert.equal((await call('/api/auth/phone', { token })).data.verified, false);
    const codes = [];
    for (let i = 0; i < 6; i += 1) codes.push((await call('/api/auth/phone/send', { method: 'POST', token })).status);
    assert.ok(codes.includes(429), `limited: ${codes}`);
  });
});

describe('chat: price offers, photos and voice notes', () => {
  let buyer; let seller; let other; let cid;
  // smallest valid WebM header (EBML magic) and an Ogg page header
  const WEBM = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(60, 1)]);
  before(async () => {
    buyer = await login('buyer@example.mr'); seller = await login('mohamed@example.mr'); other = await login('sidi@example.mr');
    const pid = (await pool.query("SELECT p.id FROM products p JOIN users u ON u.id = p.seller_id WHERE u.email = 'mohamed@example.mr' AND p.status = 'approved' AND p.availability = 'available' ORDER BY p.id DESC LIMIT 1")).rows[0].id;
    cid = (await call('/api/conversations', { method: 'POST', token: buyer, body: { productId: pid, body: 'مرحبا، هل السعر قابل للتفاوض؟' } })).data.conversationId;
  });
  const offers = async () => (await call(`/api/conversations/${cid}`, { token: buyer })).data.messages.filter((m) => m.kind === 'offer');

  it('offer → counter → accept, with the right person answering each time', async () => {
    assert.equal((await call(`/api/conversations/${cid}/offers`, { method: 'POST', token: buyer, body: { amount: 0 } })).status, 400);
    const o1 = (await call(`/api/conversations/${cid}/offers`, { method: 'POST', token: buyer, body: { amount: 15000 } })).data.message;
    assert.equal(o1.offer_status, 'pending');
    assert.equal((await call(`/api/conversations/${cid}/offers/${o1.id}`, { method: 'POST', token: buyer, body: { action: 'accept' } })).status, 403, 'not your own offer');
    assert.equal((await call(`/api/conversations/${cid}/offers/${o1.id}`, { method: 'POST', token: other, body: { action: 'accept' } })).status, 403, 'strangers cannot see the conversation');
    const c = await call(`/api/conversations/${cid}/offers/${o1.id}`, { method: 'POST', token: seller, body: { action: 'counter', amount: 17000 } });
    assert.equal(c.data.status, 'countered');
    const o2 = c.data.counter;
    assert.equal(Number(o2.amount), 17000);
    const n = (await pool.query("SELECT data FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'offer_new' AND u.email = 'buyer@example.mr' ORDER BY n.id DESC LIMIT 1")).rows[0].data;
    assert.equal(n.amount, 17000);
    assert.equal((await call(`/api/conversations/${cid}/offers/${o2.id}`, { method: 'POST', token: buyer, body: { action: 'accept' } })).data.status, 'accepted');
    assert.equal((await call(`/api/conversations/${cid}/offers/${o2.id}`, { method: 'POST', token: buyer, body: { action: 'decline' } })).status, 409, 'already closed');
    assert.deepEqual((await offers()).map((m) => m.offer_status), ['countered', 'accepted']);
    const accepted = (await pool.query("SELECT 1 FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'offer_accepted' AND u.email = 'mohamed@example.mr'")).rowCount;
    assert.equal(accepted, 1);
  });

  it('a new offer replaces an open one; the author can withdraw', async () => {
    const a = (await call(`/api/conversations/${cid}/offers`, { method: 'POST', token: buyer, body: { amount: 14000 } })).data.message;
    const b = (await call(`/api/conversations/${cid}/offers`, { method: 'POST', token: buyer, body: { amount: 14500 } })).data.message;
    assert.equal((await offers()).find((m) => m.id === a.id).offer_status, 'superseded');
    assert.equal((await call(`/api/conversations/${cid}/offers/${b.id}`, { method: 'POST', token: seller, body: { action: 'withdraw' } })).status, 403);
    assert.equal((await call(`/api/conversations/${cid}/offers/${b.id}`, { method: 'POST', token: buyer, body: { action: 'withdraw' } })).data.status, 'withdrawn');
  });

  it('photos and voice notes are private to the two people', async () => {
    const send = (buf, name, type, extra = {}) => { const fd = new FormData(); fd.append('file', new Blob([buf], { type }), name); for (const [k, v] of Object.entries(extra)) fd.append(k, v); return call(`/api/conversations/${cid}/media`, { method: 'POST', token: buyer, form: fd }); };
    const img = (await send(PNG, 'p.png', 'image/png')).data.message;
    assert.equal(img.kind, 'image');
    const voice = (await send(WEBM, 'v.webm', 'audio/webm', { duration: '7' })).data.message;
    assert.equal(voice.kind, 'audio');
    assert.equal(voice.duration, 7);
    assert.equal((await send(Buffer.from('<script>alert(1)</script>'), 'x.mp3', 'audio/mpeg')).data.error, 'invalid_file_type');
    const get = (tok, id) => fetch(`${base}/api/conversations/${cid}/files/${id}`, { headers: { Authorization: `Bearer ${tok}` } });
    const r = await get(seller, voice.file_id);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'audio/webm');
    assert.match(r.headers.get('cache-control'), /private/);
    assert.equal((await get(other, voice.file_id)).status, 403);
    assert.equal((await fetch(`${base}/uploads/f/${voice.file_id}`)).status, 404, 'not on the public route');
    const list = (await call('/api/conversations', { token: seller })).data.items.find((c) => c.id === cid);
    assert.equal(list.last_kind, 'audio');
  });
});

describe('category details and filters', () => {
  let seller; let admin; let vehicles; let realEstate;
  const post = async (fields, attrs) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ description: 'بحالة ممتازة ونظيفة جداً', condition: 'used', city: 'nouakchott', ...fields })) fd.append(k, String(v));
    fd.append('attrs', JSON.stringify(attrs));
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    return call('/api/products', { method: 'POST', token: admin, form: fd });
  };
  before(async () => {
    seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const cats = (await call('/api/categories')).data.items;
    vehicles = cats.find((c) => c.slug === 'vehicles').id; realEstate = cats.find((c) => c.slug === 'real-estate').id;
  });

  it('saves the details of the category, refuses bad values, drops others', async () => {
    const ok = await post({ title: 'تويوتا لاندكروزر', price: 2500000, categoryId: vehicles }, { brand: 'toyota', model: 'Land Cruiser', year: '2017', mileage: '180,000', gearbox: 'automatic', fuel: 'diesel', rooms: 4 });
    assert.equal(ok.status, 201, JSON.stringify(ok.data));
    const p = (await call(`/api/products/${ok.data.product.id}`)).data.product;
    assert.deepEqual(p.attrs, { brand: 'toyota', model: 'Land Cruiser', year: 2017, mileage: 180000, gearbox: 'automatic', fuel: 'diesel' });
    assert.equal((await post({ title: 'سيارة', price: 1, categoryId: vehicles }, { brand: 'ferrari-x' })).data.fields['attrs.brand'], 'invalid');
    assert.equal((await post({ title: 'سيارة', price: 1, categoryId: vehicles }, { year: '1800' })).data.fields['attrs.year'], 'out_of_range');
    assert.equal((await post({ title: 'سيارة', price: 1, categoryId: vehicles }, { mileage: 'كثير' })).data.fields['attrs.mileage'], 'invalid_number');
  });

  it('filters by make, year range, mileage, deal type and rooms', async () => {
    await post({ title: 'هيونداي توسان', price: 900000, categoryId: vehicles }, { brand: 'hyundai', year: 2012, mileage: 250000, gearbox: 'manual' });
    await post({ title: 'تويوتا كورولا', price: 700000, categoryId: vehicles }, { brand: 'toyota', year: 2010, mileage: 300000, gearbox: 'manual' });
    await post({ title: 'شقة للإيجار في تفرغ زينة', price: 60000, categoryId: realEstate }, { deal: 'rent', propertyType: 'apartment', rooms: 3, surface: 120 });
    await post({ title: 'منزل للبيع', price: 15000000, categoryId: realEstate }, { deal: 'sale', propertyType: 'house', rooms: 6, surface: 400 });
    const q = async (s) => (await call(`/api/products?${s}`)).data.items.map((p) => p.title).sort();
    assert.deepEqual(await q('category=vehicles&a.brand=toyota'), ['تويوتا كورولا', 'تويوتا لاندكروزر']);
    assert.deepEqual(await q('category=vehicles&a.brand=toyota&a.year.min=2015'), ['تويوتا لاندكروزر']);
    assert.deepEqual(await q('category=vehicles&a.mileage.max=260000'), ['تويوتا لاندكروزر', 'هيونداي توسان']);
    assert.deepEqual(await q('category=vehicles&a.gearbox=manual&a.year.max=2011'), ['تويوتا كورولا']);
    assert.deepEqual(await q('category=real-estate&a.deal=rent'), ['شقة للإيجار في تفرغ زينة']);
    assert.deepEqual(await q('category=real-estate&a.rooms.min=4'), ['منزل للبيع']);
    // unknown keys and bad values are ignored, never put in SQL
    assert.equal((await call("/api/products?category=vehicles&a.brand=x'--&a.year.min=1;drop&a.evil=1")).status, 200);
  });
});

describe('short videos on listings', () => {
  let seller; let other; let sellerId; let catId;
  const HOST = 'teststore123.public.blob.vercel-storage.com';
  before(async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_TestStore123_0123456789abcdefghijklmnopqrstuv';
    seller = await login('mohamed@example.mr'); other = await login('sidi@example.mr');
    sellerId = (await call('/api/auth/me', { token: seller })).data.user.id;
    catId = (await call('/api/categories')).data.items[0].id;
  });
  after(() => { delete process.env.BLOB_READ_WRITE_TOKEN; });
  const post = (token, videoUrl) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'سيارة مع فيديو', description: 'شاهد الفيديو لتعرف حالتها', price: '1000', city: 'nouakchott', condition: 'used', categoryId: String(catId), videoUrl })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    return call('/api/products', { method: 'POST', token, form: fd });
  };

  it('gives a one-video upload key, only for video types', async () => {
    assert.equal((await call('/api/meta')).data.videoUploads, true);
    assert.equal((await call('/api/products/video-token', { method: 'POST', body: { ext: 'mp4' } })).status, 401);
    assert.equal((await call('/api/products/video-token', { method: 'POST', token: seller, body: { ext: 'exe' } })).data.error, 'invalid_file_type');
    const r = (await call('/api/products/video-token', { method: 'POST', token: seller, body: { ext: 'mp4' } })).data;
    assert.match(r.pathname, new RegExp(`^videos/u${sellerId}/[0-9a-f-]{36}\\.mp4$`));
    assert.match(r.token, /^vercel_blob_client_/);
    assert.equal(r.contentType, 'video/mp4');
  });

  it('accepts only a video this user uploaded to our store', async () => {
    const mine = `https://${HOST}/videos/u${sellerId}/123e4567-e89b-12d3-a456-426614174000.mp4`;
    const ok = await post(seller, mine);
    assert.equal(ok.status, 201, JSON.stringify(ok.data));
    assert.equal((await pool.query('SELECT video_url FROM products WHERE id = $1', [ok.data.product.id])).rows[0].video_url, mine);
    for (const bad of [
      `https://evil.example/videos/u${sellerId}/123e4567-e89b-12d3-a456-426614174000.mp4`,
      `https://${HOST}/videos/u999/123e4567-e89b-12d3-a456-426614174000.mp4`,
      `http://${HOST}/videos/u${sellerId}/123e4567-e89b-12d3-a456-426614174000.mp4`,
      `https://${HOST}/videos/u${sellerId}/x.mp4?redirect=evil`,
    ]) assert.equal((await post(seller, bad)).data.fields?.videoUrl, 'invalid', bad);
    assert.equal((await post(other, mine)).data.fields?.videoUrl, 'invalid', 'someone else’s video');
  });
});

describe('"wanted" ads', () => {
  let buyer; let seller; let admin; let id;
  before(async () => { buyer = await login('buyer@example.mr'); seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); });

  it('a buyer posts what they look for; everyone can find it', async () => {
    assert.equal((await call('/api/wanted', { method: 'POST', body: { title: 'x' } })).status, 401);
    assert.equal((await call('/api/wanted', { method: 'POST', token: buyer, body: { title: 'ab' } })).data.fields.title, 'min_3');
    const cat = (await call('/api/categories')).data.items.find((c) => c.slug === 'vehicles').id;
    const r = await call('/api/wanted', { method: 'POST', token: buyer, body: { title: 'مطلوب هايلكس 2015 أو أحدث', description: 'بحالة جيدة، نواكشوط', categoryId: cat, city: 'nouakchott', budget: 900000 } });
    assert.equal(r.status, 201);
    id = r.data.id;
    const list = (await call('/api/wanted?category=vehicles&city=nouakchott&q=هايلكس')).data;
    assert.equal(list.items[0].id, id);
    assert.equal(list.items[0].category_slug, 'vehicles');
    assert.equal(Number((await call(`/api/wanted/${id}`)).data.wanted.budget), 900000);
  });

  it('a seller answers in a conversation; the buyer is told', async () => {
    assert.equal((await call(`/api/wanted/${id}/reply`, { method: 'POST', token: buyer, body: { body: 'x' } })).data.error, 'cannot_message_self');
    const r = await call(`/api/wanted/${id}/reply`, { method: 'POST', token: seller, body: { body: 'عندي هايلكس 2016 نظيفة' } });
    assert.equal(r.status, 201);
    const again = await call(`/api/wanted/${id}/reply`, { method: 'POST', token: seller, body: { body: 'والسعر قابل للنقاش' } });
    assert.equal(again.data.conversationId, r.data.conversationId, 'same conversation');
    const conv = (await call(`/api/conversations/${r.data.conversationId}`, { token: buyer })).data;
    assert.equal(conv.conversation.wanted_title, 'مطلوب هايلكس 2015 أو أحدث');
    assert.equal(conv.messages.length, 2);
    assert.equal((await call(`/api/wanted/${id}`)).data.wanted.replies, 1);
    const n = (await pool.query("SELECT 1 FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'wanted_reply' AND u.email = 'buyer@example.mr'")).rowCount;
    assert.ok(n >= 1);
  });

  it('closing, renewing and moderation', async () => {
    assert.equal((await call(`/api/wanted/${id}`, { method: 'PATCH', token: seller, body: { status: 'closed' } })).status, 404, 'not the author');
    await call(`/api/wanted/${id}`, { method: 'PATCH', token: buyer, body: { status: 'closed' } });
    assert.ok(!(await call('/api/wanted')).data.items.some((w) => w.id === id), 'closed requests leave the list');
    assert.equal((await call(`/api/wanted/${id}/reply`, { method: 'POST', token: seller, body: { body: 'x' } })).status, 404);
    assert.equal((await call('/api/wanted?mine=1', { token: buyer })).data.items[0].status, 'closed');
    await call(`/api/wanted/${id}`, { method: 'PATCH', token: buyer, body: { status: 'active' } });
    assert.ok((await call('/api/wanted')).data.items.some((w) => w.id === id));
    assert.equal((await call(`/api/wanted/${id}`, { method: 'DELETE', token: seller })).status, 403);
    assert.equal((await call(`/api/wanted/${id}`, { method: 'DELETE', token: admin })).status, 200);
    assert.equal((await call(`/api/wanted/${id}`)).status, 404);
  });
});

describe('seller statistics', () => {
  let seller; let buyer; let pid;
  before(async () => {
    seller = await login('fatimetou@example.mr'); buyer = await login('buyer@example.mr');
    pid = (await pool.query("SELECT p.id FROM products p JOIN users u ON u.id = p.seller_id WHERE u.email = 'fatimetou@example.mr' AND p.status = 'approved' AND p.availability = 'available' ORDER BY p.id LIMIT 1")).rows[0].id;
  });

  it('counts one view per visit, by source, never the owner’s own', async () => {
    const view = (source, token) => call(`/api/products/${pid}/view`, { method: 'POST', token, body: { source } });
    await view('whatsapp'); await view('whatsapp'); await view('google'); await view('site', buyer);
    await view("nonsense'--");
    await call(`/api/products/${pid}`); // loading the data is not a view
    await view('site', seller); // the seller looking at their own listing
    const s = (await call('/api/seller/stats?days=7', { token: seller })).data;
    const src = Object.fromEntries(s.sources.map((x) => [x.source, x.views]));
    assert.deepEqual([src.whatsapp, src.google, src.site, src.other], [2, 1, 1, 1]);
    assert.equal(s.totals.views, 5);
    assert.equal(s.daily.length, 7);
    assert.equal(s.daily.at(-1).views, 5);
    assert.equal(s.top[0].id, pid);
    assert.equal(s.top[0].views, 5);
  });

  it('reply rate and median reply time', async () => {
    const r = await call('/api/conversations', { method: 'POST', token: buyer, body: { productId: pid, body: 'هل ما زال متاحاً؟' } });
    let s = (await call('/api/seller/stats', { token: seller })).data.totals;
    assert.equal(s.chats, 1);
    assert.equal(s.replyRate, 0);
    await call(`/api/conversations/${r.data.conversationId}/messages`, { method: 'POST', token: seller, body: { body: 'نعم متاح' } });
    s = (await call('/api/seller/stats', { token: seller })).data.totals;
    assert.equal(s.replyRate, 100);
    assert.equal(s.medianReplyMinutes, 0);
    assert.equal((await call('/api/seller/stats')).status, 401);
  });
});

describe('bumping a listing to the top', () => {
  let seller; let other; let admin; let pid;
  const newest = async () => (await call('/api/products?limit=60')).data.items.findIndex((p) => p.id === pid);
  before(async () => {
    seller = await login('amana@example.mr'); other = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    pid = (await pool.query("SELECT p.id FROM products p JOIN users u ON u.id = p.seller_id WHERE u.email = 'amana@example.mr' AND p.status = 'approved' AND p.availability = 'available' AND p.featured_until IS NULL ORDER BY p.created_at LIMIT 1")).rows[0].id;
    await pool.query("UPDATE products SET created_at = now() - interval '20 days', bumped_at = NULL WHERE id = $1", [pid]);
  });

  it('free once every 7 days, only by the owner; goes back to the top of "newest"', async () => {
    const before = await newest();
    assert.equal((await call(`/api/products/${pid}/bump`, { method: 'POST', token: other })).status, 403);
    assert.equal((await call(`/api/products/${pid}/bump`, { method: 'POST', token: seller })).status, 200);
    const after = await newest();
    assert.ok(after < before, `moved up: ${before} → ${after}`);
    const featured = (await call('/api/products?limit=60')).data.items.filter((p) => p.is_featured).length;
    assert.equal(after, featured, 'first after the featured listings');
    const again = await call(`/api/products/${pid}/bump`, { method: 'POST', token: seller });
    assert.equal(again.status, 409);
    assert.equal(again.data.error, 'bump_too_soon');
    assert.ok(new Date(again.data.fields.next) > new Date(Date.now() + 6 * 86400000));
  });

  it('an extra bump can be bought when paid services are on', async () => {
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { ...s.features, paidUpgrades: true } } });
    assert.equal((await call('/api/meta')).data.upgrades.bumpPrice, 50);
    await pool.query("UPDATE products SET bumped_at = now() - interval '3 days' WHERE id = $1", [pid]);
    const fd = new FormData();
    fd.append('kind', 'bump'); fd.append('productId', String(pid)); fd.append('paymentMethod', 'bankily');
    fd.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    const r = await call('/api/upgrade-requests', { method: 'POST', token: seller, form: fd });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.equal(r.data.request.amount, 50);
    assert.equal((await call(`/api/admin/upgrade-requests/${r.data.request.id}`, { method: 'PATCH', token: admin, body: { status: 'approved' } })).status, 200);
    const { rows } = await pool.query('SELECT bumped_at > now() - interval \'1 minute\' AS fresh FROM products WHERE id = $1', [pid]);
    assert.equal(rows[0].fresh, true);
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: s.features } });
  });
});

describe('car inspection reports', () => {
  let seller; let admin; let buyer; let car; let phone; let iid;
  before(async () => {
    seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); buyer = await login('buyer@example.mr');
    car = (await pool.query("SELECT p.id FROM products p JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.seller_id WHERE c.slug = 'vehicles' AND u.email = 'mohamed@example.mr' AND p.status = 'approved' LIMIT 1")).rows[0].id;
    phone = (await pool.query("SELECT p.id FROM products p JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.seller_id WHERE c.slug <> 'vehicles' AND u.email = 'mohamed@example.mr' AND p.status = 'approved' LIMIT 1")).rows[0]?.id;
  });

  it('the seller asks for an inspection of a car (only cars, only once at a time)', async () => {
    assert.equal((await call(`/api/products/${car}/inspection`, { method: 'POST', token: buyer, body: {} })).status, 403);
    if (phone) assert.equal((await call(`/api/products/${phone}/inspection`, { method: 'POST', token: seller, body: {} })).data.error, 'vehicles_only');
    const r = await call(`/api/products/${car}/inspection`, { method: 'POST', token: seller, body: { note: 'متاح السبت صباحاً' } });
    assert.equal(r.status, 201);
    iid = r.data.inspection.id;
    assert.equal((await call(`/api/products/${car}/inspection`, { method: 'POST', token: seller, body: {} })).data.error, 'inspection_pending');
    assert.equal((await call('/api/admin/inspections', { token: seller })).status, 403);
    assert.ok((await call('/api/admin/inspections', { token: admin })).data.items.some((i) => i.id === iid));
  });

  it('the admin publishes the report; it shows on the listing', async () => {
    assert.equal((await call(`/api/products/${car}`)).data.product.inspection, null);
    const fd = (fields) => { const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.append(k, v); return f; };
    const missing = await call(`/api/admin/inspections/${iid}`, { method: 'PUT', token: admin, form: fd({ status: 'published', workshop: 'ورشة الأمانة' }) });
    assert.equal(missing.data.fields.inspectedOn, 'required');
    const ok = await call(`/api/admin/inspections/${iid}`, { method: 'PUT', token: admin, form: fd({
      status: 'published', workshop: 'ورشة الأمانة – تفرغ زينة', inspectedOn: '2026-11-20', mileage: '182000', overall: 'good',
      checklist: JSON.stringify({ engine: 'ok', gearbox: 'ok', brakes: 'attention', tires: 'problem', hacked: 'ok', body: 'weird' }), summary: 'سيارة جيدة، الإطارات تحتاج تغيير.',
    }) });
    assert.equal(ok.status, 200, JSON.stringify(ok.data));
    const ins = (await call(`/api/products/${car}`)).data.product.inspection;
    assert.equal(ins.overall, 'good');
    assert.equal(ins.mileage, 182000);
    assert.deepEqual(ins.checklist, { engine: 'ok', gearbox: 'ok', brakes: 'attention', tires: 'problem' });
    const n = (await pool.query("SELECT 1 FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'inspection_published' AND u.email = 'mohamed@example.mr'")).rowCount;
    assert.equal(n, 1);
  });
});

describe('monthly store plans', () => {
  let merchant; let admin; let pid;
  before(async () => {
    merchant = await login('fatimetou@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { ...s.features, paidUpgrades: true } } });
    pid = (await pool.query("SELECT p.id FROM products p JOIN users u ON u.id = p.seller_id WHERE u.email = 'fatimetou@example.mr' AND p.status = 'approved' AND p.availability = 'available' ORDER BY p.id DESC LIMIT 1")).rows[0].id;
  });
  after(async () => {
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { features: { ...s.features, paidUpgrades: false } } });
  });

  it('a merchant buys a plan; once approved the store gets credits and the Pro badge', async () => {
    const plans = (await call('/api/meta')).data.upgrades.storePlans;
    assert.deepEqual(plans.map((p) => p.key), ['pro', 'premium']);
    assert.equal((await call(`/api/products/${pid}/feature-credit`, { method: 'POST', token: merchant })).data.error, 'no_feature_credits');
    const fd = new FormData();
    for (const [k, v] of Object.entries({ kind: 'plan', planKey: 'pro', months: '2', paymentMethod: 'bankily' })) fd.append(k, v);
    fd.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    const r = await call('/api/upgrade-requests', { method: 'POST', token: merchant, form: fd });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.equal(r.data.request.amount, 3000, '2 months × 1,500');
    const ap = await call(`/api/admin/upgrade-requests/${r.data.request.id}`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    assert.equal(ap.status, 200, JSON.stringify(ap.data));
    const store = (await call('/api/stores/me', { token: merchant })).data.store;
    assert.equal(store.plan, 'pro');
    assert.equal(store.feature_credits, 10, '5 per month × 2');
    assert.ok(new Date(store.plan_until) > new Date(Date.now() + 59 * 86400000));
    const list = (await call('/api/stores')).data.items;
    assert.equal(list[0].slug, store.slug, 'Pro stores first');
    assert.equal(list[0].pro, true);
  });

  it('credits feature a listing for 7 days, one credit each', async () => {
    const r = await call(`/api/products/${pid}/feature-credit`, { method: 'POST', token: merchant });
    assert.equal(r.status, 200);
    assert.ok(new Date(r.data.featuredUntil) > new Date(Date.now() + 6.9 * 86400000));
    assert.equal((await call('/api/stores/me', { token: merchant })).data.store.feature_credits, 9);
    const other = await login('mohamed@example.mr');
    assert.equal((await call(`/api/products/${pid}/feature-credit`, { method: 'POST', token: other })).status, 403);
  });
});

describe('secure payment (escrow) on delivery orders', () => {
  let buyer; let seller; let admin; let courier; let pid; let oid;
  before(async () => {
    buyer = await login('buyer@example.mr'); seller = await login('mohamed@example.mr'); admin = await login('admin@souk-chinguetti.mr', 'Admin12345'); courier = await login('sidi@example.mr');
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title: 'غسالة للدفع الآمن', description: 'غسالة بحالة ممتازة جداً', price: '20000', city: 'nouakchott', condition: 'used', categoryId: '1' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    pid = (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [pid]);
  });
  const order = async (tok = buyer) => (await call(`/api/orders/${oid}`, { token: tok })).data.order;
  const move = (tok, status) => call(`/api/orders/${oid}/status`, { method: 'POST', token: tok, body: { status } });
  const pay = (action, body = {}) => call(`/api/admin/escrow/${oid}`, { method: 'PATCH', token: admin, body: { action, ...body } });

  it('is off until the admin turns it on', async () => {
    const r = await call('/api/orders', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott', phone: '22334455', paymentMethod: 'escrow' } });
    assert.equal(r.data.error, 'escrow_disabled');
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { delivery: { ...s.delivery, escrow: true } } });
  });

  it('the seller cannot accept before the admin confirms the money is held', async () => {
    const r = await call('/api/orders', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott', phone: '22334455', paymentMethod: 'escrow' } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    oid = r.data.order.id;
    assert.equal(r.data.order.payment_status, 'awaiting_payment');
    assert.equal((await move(seller, 'accepted')).data.error, 'payment_not_confirmed');
    assert.ok(!(await order(seller)).next.includes('accepted'));
    const fd = new FormData(); fd.append('channel', 'bankily'); fd.append('ref', 'TX-778899');
    fd.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    assert.equal((await call(`/api/orders/${oid}/payment`, { method: 'POST', token: seller, form: fd })).status, 404, 'only the buyer');
    const fd2 = new FormData(); fd2.append('channel', 'bankily'); fd2.append('ref', 'TX-778899'); fd2.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    assert.equal((await call(`/api/orders/${oid}/payment`, { method: 'POST', token: buyer, form: fd2 })).data.paymentStatus, 'submitted');
    assert.equal((await order(seller)).pay_ref, undefined, 'the seller does not see the payment proof');
    const receipt = await fetch(`${base}/api/admin/escrow/${oid}/receipt`, { headers: { Authorization: `Bearer ${admin}` } });
    assert.equal(receipt.status, 200);
    assert.equal((await fetch(`${base}/api/admin/escrow/${oid}/receipt`, { headers: { Authorization: `Bearer ${buyer}` } })).status, 403);
    assert.equal((await pay('confirm')).data.paymentStatus, 'held');
    assert.equal((await move(seller, 'accepted')).status, 200);
  });

  it('after delivery the buyer confirms and the admin pays the seller', async () => {
    assert.equal((await pay('release', { ref: 'BANKILY-1' })).data.error, 'not_delivered', 'never before delivery');
    await pool.query("INSERT INTO couriers (user_id, status, phone, city, vehicle) SELECT id, 'approved', '+22246001122', 'nouakchott', 'motorbike' FROM users WHERE email = 'sidi@example.mr' ON CONFLICT (user_id) DO UPDATE SET status = 'approved'");
    await call(`/api/orders/${oid}/claim`, { method: 'POST', token: courier });
    for (const st of ['picked_up', 'on_the_way', 'delivered']) assert.equal((await move(courier, st)).status, 200, st);
    assert.equal((await call(`/api/orders/${oid}/confirm-receipt`, { method: 'POST', token: buyer })).data.paymentStatus, 'release_due');
    assert.equal((await pay('release')).data.fields.ref, 'required');
    assert.equal((await pay('release', { ref: 'BANKILY-PAYOUT-42' })).data.paymentStatus, 'released');
    const o = await order(seller);
    assert.equal(o.payment_status, 'released');
    const n = (await pool.query("SELECT data FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.type = 'escrow_released' AND u.email = 'mohamed@example.mr'")).rows[0].data;
    assert.equal(n.amount, 20000, 'the seller gets the item price');
  });

  it('cancelling a paid order puts the money up for refund; disputes hold it', async () => {
    await pool.query("UPDATE products SET availability = 'available' WHERE id = $1", [pid]);
    const r = await call('/api/orders', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott', phone: '22334455', paymentMethod: 'escrow' } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    oid = r.data.order.id;
    const fd = new FormData(); fd.append('channel', 'masrvi'); fd.append('receipt', new Blob([PNG], { type: 'image/png' }), 'r.png');
    await call(`/api/orders/${oid}/payment`, { method: 'POST', token: buyer, form: fd });
    await pay('confirm');
    assert.equal((await call(`/api/orders/${oid}/dispute`, { method: 'POST', token: buyer, body: { reason: 'البائع لا يرد' } })).data.paymentStatus, 'disputed');
    assert.equal((await pay('refund', { ref: 'REFUND-9' })).data.paymentStatus, 'refunded');
    const list = (await call('/api/admin/escrow', { token: admin })).data;
    assert.ok(list.counts.refunded >= 1 && list.counts.released >= 1);
  });
});

describe('security: third round', () => {
  it('push subscriptions only accept the browsers’ push services', async () => {
    const tok = await login('buyer@example.mr');
    const sub = (endpoint) => call('/api/push/subscribe', { method: 'POST', token: tok, body: { endpoint, keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) } } });
    for (const bad of ['https://evil.example/x', 'https://169.254.169.254/latest', 'https://fcm.googleapis.com.evil.example/x', 'https://fcm.googleapis.com:8443/x', 'http://fcm.googleapis.com/fcm/send/x']) {
      assert.equal((await sub(bad)).status, 400, bad);
    }
    for (const good of ['https://fcm.googleapis.com/fcm/send/abc', 'https://web.push.apple.com/QAbc', 'https://updates.push.services.mozilla.com/wpush/v2/x']) {
      assert.equal((await sub(good)).status, 201, good);
    }
  });

  it('pages never build links from a forged Host header', async () => {
    const r = await fetch(`${base}/`, { headers: { 'X-Forwarded-Host': 'evil.example' } });
    const html = await r.text();
    assert.ok(!html.includes('evil.example'));
    assert.match(html, /<link rel="canonical" href="https:\/\/souk-chinguetti\.vercel\.app\/"/);
    const ok = await (await fetch(`${base}/`)).text();
    assert.match(ok, /<link rel="canonical" href="http:\/\/localhost:\d+\/"/, 'local development still works');
  });
});

// ---------- Souk AI (a fake provider stands in for the real API: no network, no cost) ----------
describe('Souk AI', () => {
  let admin; let seller; let buyer; let ai;
  const calls = [];
  let handler = null;
  const reply = (params, content, stop = 'end_turn') => ({
    model: params.model, stop_reason: stop, content: typeof content === 'string' ? [{ type: 'text', text: content }] : content,
    usage: { input_tokens: 1000, output_tokens: 200 },
  });
  const fake = { beta: { messages: { create: async (params) => { calls.push(params); return handler(params); } } } };
  const json = (params, obj) => reply(params, JSON.stringify(obj));
  const setAi = async (patch) => {
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    const r = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { ai: { ...s.ai, ...patch } } });
    assert.equal(r.status, 200, JSON.stringify(r.data));
  };
  const lastToolResults = (params) => params.messages.at(-1).content.filter((b) => b.type === 'tool_result');

  before(async () => {
    ai = await import('../src/lib/ai.js');
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('sidi@example.mr');
    buyer = await login('buyer@example.mr');
  });
  after(() => ai.setAiClient(null));

  it('stays off without an API key, and keeps budgets out of the public settings', async () => {
    ai.setAiClient(null);
    const meta = await call('/api/meta');
    assert.equal(meta.data.ai.enabled, false);
    const r = await call('/api/ai/assistant', { method: 'POST', token: buyer, body: { messages: [{ role: 'user', text: 'هاتف' }] } });
    assert.equal(r.status, 503);
    assert.equal(r.data.error, 'ai_disabled');
    assert.equal((await call('/api/settings')).data.settings.ai, undefined);
    assert.equal((await call('/api/ai/assistant', { method: 'POST', body: { messages: [{ role: 'user', text: 'x' }] } })).status, 401);
    ai.setAiClient(fake);
    assert.equal((await call('/api/meta')).data.ai.enabled, true);
  });

  it('assistant answers only with real listings found in the database', async () => {
    let round = 0;
    handler = (params) => {
      round += 1;
      if (round === 1) return reply(params, [{ type: 'tool_use', id: 't1', name: 'search_products', input: { keywords: ['samsung', 'galaxy'], category: 'any', city: 'any' } }], 'tool_use');
      if (round === 2) {
        const found = JSON.parse(lastToolResults(params)[0].content);
        assert.ok(Array.isArray(found) && found.length, 'search returned listings');
        assert.ok(found.every((p) => p.id && p.price >= 0 && p.title));
        return reply(params, [{ type: 'tool_use', id: 't2', name: 'show_products', input: { ids: [found[0].id, 999999] } }], 'tool_use');
      }
      assert.match(lastToolResults(params)[0].content, /^Shown: \d+$/, 'invented id 999999 is dropped');
      return reply(params, 'وجدت لك هاتف سامسونج متاحاً.');
    };
    calls.length = 0;
    const r = await call('/api/ai/assistant', { method: 'POST', token: buyer, body: { lang: 'ar', messages: [{ role: 'user', text: 'أبحث عن سامسونج' }] } });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.reply, 'وجدت لك هاتف سامسونج متاحاً.');
    assert.equal(r.data.products.length, 1);
    assert.ok(r.data.products[0].title.toLowerCase().includes('samsung') || r.data.products[0].title.includes('سامسونج'));
    assert.ok(!r.data.products.some((p) => p.id === 999999));
    assert.equal(calls.length, 3);
    assert.ok(calls[0].system.includes('Never invent'), 'grounding rules are in the system prompt');
    assert.deepEqual(calls[0].fallbacks, 'default');
    // The three model calls are logged with their cost and count as one request.
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n, COUNT(DISTINCT request_id)::int AS reqs, SUM(cost_usd)::float8 AS usd FROM ai_usage WHERE feature = 'assistant' AND ok");
    assert.equal(rows[0].n, 3);
    assert.equal(rows[0].reqs, 1);
    assert.ok(Math.abs(rows[0].usd - 3 * (1000 * 4 + 200 * 20) / 1e6) < 1e-9);
  });

  it('assistant says so when nothing matches', async () => {
    let round = 0;
    let note = '';
    handler = (params) => {
      round += 1;
      if (round === 1) return reply(params, [{ type: 'tool_use', id: 'a', name: 'search_products', input: { keywords: ['zzqxwv'] } }], 'tool_use');
      note = lastToolResults(params)[0].content;
      return reply(params, 'لم أجد هذا المنتج حالياً في الموقع.');
    };
    const r = await call('/api/ai/assistant', { method: 'POST', token: buyer, body: { messages: [{ role: 'user', text: 'zzqxwv' }] } });
    assert.equal(r.status, 200);
    assert.match(note, /No live listing matches/);
    assert.deepEqual(r.data.products, []);
    assert.equal(r.data.found, 0);
    assert.equal(r.data.searched, true);
  });

  it('enforces the per-user daily limit and the budget, and reports provider errors and refusals', async () => {
    handler = (params) => reply(params, 'ok');
    await setAi({ userDaily: 2 });
    const ask = () => call('/api/ai/assistant', { method: 'POST', token: buyer, body: { messages: [{ role: 'user', text: 'hello' }] } });
    const r = await ask();
    assert.equal(r.status, 429);
    assert.equal(r.data.error, 'ai_quota');
    assert.equal((await call('/api/ai/status', { token: buyer })).data.remaining, 0);
    await setAi({ userDaily: 30, dailyBudgetUsd: 0 });
    const b = await ask();
    assert.equal(b.status, 503);
    assert.equal(b.data.error, 'ai_budget');
    await setAi({ dailyBudgetUsd: 3 });
    handler = () => { throw new Error('network down'); };
    const e = await ask();
    assert.equal(e.status, 502);
    assert.equal(e.data.error, 'ai_failed');
    handler = (params) => ({ ...reply(params, ''), stop_reason: 'refusal' });
    const f = await ask();
    assert.equal(f.status, 400);
    assert.equal(f.data.error, 'ai_refused');
    const { rows } = await pool.query("SELECT error FROM ai_usage WHERE NOT ok ORDER BY id DESC LIMIT 2");
    assert.deepEqual(rows.map((x) => x.error), ['refusal', 'provider_unreachable']);
    await setAi({ features: { assistant: false, describe: true, visual: true, translate: true, fraud: true } });
    assert.equal((await ask()).data.error, 'ai_disabled');
    await setAi({ features: { assistant: true, describe: true, visual: true, translate: true, fraud: true } });
    await pool.query('DELETE FROM ai_usage WHERE user_id IS NOT NULL'); // fresh daily counts for the next tests
  });

  it('writes a listing from photos and notes, with a price hint from similar listings', async () => {
    handler = (params) => {
      const content = params.messages[0].content;
      assert.equal(content[0].type, 'image');
      assert.equal(content[0].source.media_type, 'image/jpeg');
      assert.equal(params.output_config.format.type, 'json_schema');
      return json(params, {
        title: 'هاتف سامسونج جالكسي A54', description: 'هاتف بحالة جيدة.\nمع الشاحن.', category: 'phones-electronics', condition: 'used',
        keywords: ['سامسونج', 'samsung', 'galaxy'], missing_info: ['ما سعة التخزين؟'], warnings: [],
      });
    };
    const form = new FormData();
    form.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    form.append('notes', 'سامسونج مستعمل');
    form.append('lang', 'ar');
    const r = await call('/api/ai/describe', { method: 'POST', token: seller, form });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.title, 'هاتف سامسونج جالكسي A54');
    assert.ok(r.data.categoryId);
    assert.equal(r.data.condition, 'used');
    assert.deepEqual(r.data.missingInfo, ['ما سعة التخزين؟']);
    assert.ok(['similar', 'category', 'none'].includes(r.data.price.basis));
    const bad = new FormData();
    bad.append('images', new Blob([Buffer.from('not an image')], { type: 'image/png' }), 'x.png');
    assert.equal((await call('/api/ai/describe', { method: 'POST', token: seller, form: bad })).status, 400);
  });

  it('finds listings from a photo (visual search) and says when there is no close match', async () => {
    handler = (params) => json(params, { description: 'هاتف ذكي من سامسونج', category: 'phones-electronics', brand: 'Samsung', keywords_ar: ['هاتف', 'سامسونج'], keywords_fr: ['téléphone', 'samsung', 'galaxy'] });
    const form = new FormData();
    form.append('image', new Blob([PNG], { type: 'image/png' }), 'p.png');
    const r = await call('/api/ai/visual-search', { method: 'POST', token: buyer, form });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.exact, true);
    assert.ok(r.data.products.some((p) => /samsung|سامسونج/i.test(p.title)));
    handler = (params) => json(params, { description: 'جمل', category: 'unknown', brand: '', keywords_ar: ['جمل'], keywords_fr: ['chameau'] });
    const form2 = new FormData();
    form2.append('image', new Blob([PNG], { type: 'image/png' }), 'p.png');
    const none = await call('/api/ai/visual-search', { method: 'POST', token: buyer, form: form2 });
    assert.equal(none.data.exact, false);
    assert.deepEqual(none.data.products, []);
  });

  it('recommends listings from what the visitor looked at, without storing it', async () => {
    const list = (await call('/api/products?category=phones-electronics')).data.items;
    const seenId = list[0].id;
    const r = await call(`/api/ai/recommendations?seen=${seenId}`);
    assert.equal(r.data.basis, 'personal');
    assert.ok(r.data.items.length > 0);
    assert.ok(!r.data.items.some((p) => p.id === seenId));
    assert.equal(r.data.items[0].category_slug, 'phones-electronics');
    const off = await call(`/api/ai/recommendations?seen=${seenId}&personal=0`);
    assert.equal(off.data.basis, 'popular');
  });

  it('suggests a price range from similar listings', async () => {
    const cat = (await call('/api/categories')).data.items?.find((c) => c.slug === 'vehicles')
      || (await pool.query("SELECT id FROM categories WHERE slug = 'vehicles'")).rows[0];
    const r = await call(`/api/ai/price?categoryId=${cat.id}`);
    assert.equal(r.status, 200);
    assert.ok(r.data.n >= 3);
    assert.ok(r.data.low <= r.data.median && r.data.median <= r.data.high);
  });

  it('translates a listing once and serves the cached translation after', async () => {
    const p = (await call('/api/products?q=Mercedes')).data.items[0];
    assert.equal((await call(`/api/ai/translate/${p.id}?lang=ar`)).status, 401, 'guests can only read cached translations');
    let n = 0;
    handler = (params) => { n += 1; assert.ok(params.system.includes('Arabic')); return json(params, { title: 'مرسيدس C220 2012', description: 'ناقل حركة أوتوماتيكي، مكيف.' }); };
    const first = await call(`/api/ai/translate/${p.id}?lang=ar`, { token: buyer });
    assert.equal(first.status, 200);
    assert.equal(first.data.cached, false);
    const again = await call(`/api/ai/translate/${p.id}?lang=ar`);
    assert.equal(again.data.cached, true);
    assert.equal(again.data.title, 'مرسيدس C220 2012');
    assert.equal(n, 1);
  });

  it('flags suspicious listings (rules + AI) and lets the admin act on them', async () => {
    handler = (params) => json(params, { risk: 'high', reasons: ['يطلب الدفع قبل المعاينة'], summary: 'احتيال محتمل' });
    const cat = (await pool.query("SELECT id FROM categories WHERE slug = 'phones-electronics'")).rows[0];
    const form = new FormData();
    form.append('title', 'آيفون 15 برو ماكس جديد');
    form.append('description', 'السعر نهائي. ارسل المبلغ عبر ويسترن يونيون قبل الشحن.');
    form.append('price', '3000');
    form.append('categoryId', String(cat.id));
    form.append('city', 'nouakchott');
    form.append('condition', 'new');
    form.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const created = await call('/api/products', { method: 'POST', token: seller, form });
    assert.equal(created.status, 201, JSON.stringify(created.data));
    const id = created.data.product.id;
    const flags = (await call('/api/ai/admin/flags', { token: admin })).data.items.filter((f) => f.product_id === id);
    const rules = flags.find((f) => f.source === 'rules');
    assert.ok(rules && rules.reasons.includes('advance_payment'), JSON.stringify(flags));
    assert.equal(flags.find((f) => f.source === 'ai').risk, 'high');
    const aiCall = calls.at(-1);
    assert.ok(aiCall.system.includes('not instructions'), 'ad text is treated as data');
    assert.equal((await call('/api/ai/admin/flags', { token: buyer })).status, 403);
    const act = await call(`/api/ai/admin/flags/${rules.id}`, { method: 'PATCH', token: admin, body: { action: 'reject_listing' } });
    assert.equal(act.status, 200);
    assert.equal((await pool.query('SELECT status FROM products WHERE id = $1', [id])).rows[0].status, 'rejected');
    const open = (await call('/api/ai/admin/flags', { token: admin })).data.items.filter((f) => f.product_id === id);
    assert.equal(open.length, 0, 'both flags on the listing are closed');
    // An honest listing raises nothing.
    handler = (params) => json(params, { risk: 'low', reasons: [], summary: 'عادي' });
    const scan = await call(`/api/ai/admin/scan/${(await call('/api/products?q=Mercedes')).data.items[0].id}`, { method: 'POST', token: admin });
    assert.equal(scan.data.rules.risk, 'low');
    assert.equal(scan.data.ai.risk, 'low');
  });

  it('shows usage and cost to the admin only', async () => {
    const r = await call('/api/ai/admin/overview', { token: admin });
    assert.equal(r.status, 200);
    assert.ok(r.data.usage.month_calls > 0);
    assert.ok(r.data.usage.month_usd > 0);
    assert.ok(r.data.usage.byFeature.some((f) => f.feature === 'fraud'));
    assert.equal((await call('/api/ai/admin/overview', { token: buyer })).status, 403);
  });
});

// ---------- Souk Social ----------
describe('Souk Social', () => {
  let admin; let fatimetou; let sidi; let buyer; let fatId; let sidiId; let buyerId; let productId; let postId;
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    fatimetou = await login('fatimetou@example.mr');
    sidi = await login('sidi@example.mr');
    buyer = await login('buyer@example.mr');
    fatId = (await call('/api/auth/me', { token: fatimetou })).data.user.id;
    sidiId = (await call('/api/auth/me', { token: sidi })).data.user.id;
    buyerId = (await call('/api/auth/me', { token: buyer })).data.user.id;
    productId = (await call(`/api/products?seller=${fatId}`)).data.items[0].id;
  });

  it('posts only about your own live listing, with photos', async () => {
    const other = (await call(`/api/products?seller=${sidiId}`)).data.items[0].id;
    const form = (pid, body = 'وصل جديد 🔥') => { const f = new FormData(); f.append('productId', String(pid)); f.append('body', body); f.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png'); return f; };
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: form(other) })).data.error, 'not_your_product');
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: form(999999) })).status, 400);
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: form(productId, 'يا حمار') })).data.error, 'inappropriate_text');
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: form(productId, 'see https://evil.example') })).data.error, 'links_not_allowed');
    const r = await call('/api/social/posts', { method: 'POST', token: fatimetou, form: form(productId) });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    postId = r.data.post.id;
    assert.equal(r.data.post.product.id, productId);
    assert.equal(r.data.post.media[0].type, 'image');
    const feed = await call('/api/social/feed');
    assert.ok(feed.data.items.some((p) => p.id === postId));
  });

  it('follows, likes, comments and shares, with notifications', async () => {
    assert.equal((await call(`/api/social/follow/${fatId}`, { method: 'POST', token: buyer })).data.following, true);
    const prof = await call(`/api/social/users/${fatId}`, { token: buyer });
    assert.equal(prof.data.followed_by_me, true);
    assert.ok(prof.data.followers >= 1);
    const following = await call('/api/social/feed?tab=following', { token: buyer });
    assert.ok(following.data.items.some((p) => p.id === postId));
    const like = await call(`/api/social/posts/${postId}/like`, { method: 'POST', token: buyer });
    assert.equal(like.data.like_count, 1);
    await call(`/api/social/posts/${postId}/like`, { method: 'POST', token: buyer }); // twice = still one
    assert.equal((await call(`/api/social/posts/${postId}`, { token: buyer })).data.post.like_count, 1);
    assert.equal((await call(`/api/social/posts/${postId}`, { token: buyer })).data.post.liked, true);
    const c = await call(`/api/social/posts/${postId}/comments`, { method: 'POST', token: buyer, body: { body: 'بكم آخر سعر؟' } });
    assert.equal(c.status, 201);
    assert.equal((await call(`/api/social/posts/${postId}/comments`)).data.items.length, 1);
    assert.equal((await call(`/api/social/posts/${postId}/share`, { method: 'POST' })).data.share_count, 1);
    const notes = (await call('/api/notifications', { token: fatimetou })).data.items.map((n) => n.type);
    for (const t of ['new_follower', 'post_like', 'post_comment']) assert.ok(notes.includes(t), t);
    // The seller can delete a comment on their own post.
    assert.equal((await call(`/api/social/comments/${c.data.comment.id}`, { method: 'DELETE', token: fatimetou })).status, 200);
    assert.equal((await call(`/api/social/posts/${postId}`)).data.post.comment_count, 0);
    // Followers get a notification for a new post.
    const f = new FormData(); f.append('productId', String(productId)); f.append('body', 'عرض اليوم');
    const second = await call('/api/social/posts', { method: 'POST', token: fatimetou, form: f });
    assert.equal(second.status, 201);
    assert.ok((await call('/api/notifications', { token: buyer })).data.items.some((n) => n.type === 'followed_post'));
    await call(`/api/social/posts/${second.data.post.id}`, { method: 'DELETE', token: fatimetou });
  });

  it('respects privacy: followers-only posts, comment settings and blocks', async () => {
    await call(`/api/social/posts/${postId}`, { method: 'PATCH', token: fatimetou, body: { visibility: 'followers', comments: 'off' } });
    assert.equal((await call(`/api/social/posts/${postId}`)).status, 404, 'guests cannot see a followers-only post');
    assert.equal((await call(`/api/social/posts/${postId}`, { token: sidi })).status, 404);
    assert.equal((await call(`/api/social/posts/${postId}`, { token: buyer })).status, 200, 'followers can');
    assert.equal((await call(`/api/social/posts/${postId}/comments`, { method: 'POST', token: buyer, body: { body: 'مرحبا' } })).data.error, 'comments_off');
    await call(`/api/social/posts/${postId}`, { method: 'PATCH', token: fatimetou, body: { visibility: 'public', comments: 'everyone' } });
    assert.equal((await call(`/api/social/block/${buyerId}`, { method: 'POST', token: fatimetou })).data.blocked, true);
    assert.equal((await call(`/api/social/users/${fatId}`, { token: buyer })).data.followed_by_me, false, 'blocking removes the follow');
    assert.equal((await call(`/api/social/follow/${fatId}`, { method: 'POST', token: buyer })).data.error, 'blocked');
    assert.ok(!(await call('/api/social/feed', { token: buyer })).data.items.some((p) => p.author_id === fatId));
    await call(`/api/social/block/${buyerId}`, { method: 'DELETE', token: fatimetou });
    assert.ok((await call('/api/social/feed', { token: buyer })).data.items.some((p) => p.author_id === fatId));
    assert.equal((await call('/api/social/me/followers', { token: buyer })).status, 200);
  });

  it('lets users report content and moderators remove it and ban', async () => {
    assert.equal((await call('/api/social/reports', { method: 'POST', token: fatimetou, body: { targetType: 'post', targetId: postId, reason: 'spam' } })).data.error, 'cannot_report_own');
    assert.equal((await call('/api/social/reports', { method: 'POST', token: buyer, body: { targetType: 'post', targetId: postId, reason: 'scam' } })).status, 201);
    assert.equal((await call('/api/social/reports', { method: 'POST', token: buyer, body: { targetType: 'post', targetId: postId, reason: 'scam' } })).status, 409);
    await call('/api/social/reports', { method: 'POST', token: sidi, body: { targetType: 'post', targetId: postId, reason: 'offensive', details: 'محتوى مسيء' } });
    assert.equal((await call('/api/social/admin/reports', { token: buyer })).status, 403);
    const list = (await call('/api/social/admin/reports', { token: admin })).data.items;
    const item = list.find((r) => r.target_type === 'post' && r.target_id === postId);
    assert.equal(item.reports, 2);
    const h = await call('/api/social/admin/reports/handle', { method: 'POST', token: admin, body: { targetType: 'post', targetId: postId, action: 'remove', banDays: 1, reason: 'منشور مخالف' } });
    assert.equal(h.status, 200);
    assert.equal((await call(`/api/social/posts/${postId}`)).status, 404);
    const f = new FormData(); f.append('productId', String(productId)); f.append('body', 'منشور');
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: f })).data.error, 'social_banned');
    assert.ok((await call('/api/notifications', { token: fatimetou })).data.items.some((n) => n.type === 'content_removed'));
    await call(`/api/social/admin/unban/${fatId}`, { method: 'POST', token: admin });
    assert.equal((await call('/api/social/posts', { method: 'POST', token: fatimetou, form: f })).status, 201);
    const ov = await call('/api/social/admin/overview', { token: admin });
    assert.ok(ov.data.posts >= 1);
  });
});

// ---------- Souk Live ----------
describe('Souk Live', () => {
  let admin; let host; let sidi; let buyer; let hostId; let buyerId; let liveId; let productId; let hostPeer;
  const poll = (peer, extra = '') => call(`/api/live/${liveId}/poll?peer=${peer.peerId}&token=${encodeURIComponent(peer.token)}${extra}`);
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    host = await login('fatimetou@example.mr');
    sidi = await login('sidi@example.mr');
    buyer = await login('buyer@example.mr');
    hostId = (await call('/api/auth/me', { token: host })).data.user.id;
    buyerId = (await call('/api/auth/me', { token: buyer })).data.user.id;
    productId = (await call(`/api/products?seller=${hostId}`)).data.items[0].id;
    await call(`/api/social/follow/${hostId}`, { method: 'POST', token: buyer });
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { community: { ...s.community, hostFanout: 2, relayFanout: 1 } } });
  });

  it('lets only verified merchants schedule a live, and notifies followers', async () => {
    const body = { title: 'عروض الجمعة', productIds: [productId], scheduledAt: new Date(Date.now() + 3600_000).toISOString(), record: true };
    assert.equal((await call('/api/live', { method: 'POST', token: sidi, body })).data.error, 'live_verified_merchants_only');
    const other = (await call('/api/products?seller=' + (await call('/api/auth/me', { token: sidi })).data.user.id)).data.items[0].id;
    assert.equal((await call('/api/live', { method: 'POST', token: host, body: { ...body, productIds: [other] } })).status, 400, 'only own listings');
    const r = await call('/api/live', { method: 'POST', token: host, body });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    liveId = r.data.live.id;
    assert.equal(r.data.live.status, 'scheduled');
    assert.ok((await call('/api/live?status=scheduled')).data.items.some((l) => l.id === liveId));
    assert.ok((await call('/api/notifications', { token: buyer })).data.items.some((n) => n.type === 'live_scheduled'));
    assert.equal((await call(`/api/live/${liveId}/join`, { method: 'POST', body: {} })).data.error, 'not_live');
  });

  it('goes live and builds a relay tree that keeps the host upload small', async () => {
    hostPeer = (await call(`/api/live/${liveId}/start`, { method: 'POST', token: host })).data;
    assert.ok(hostPeer.peerId && hostPeer.token && hostPeer.iceServers.length);
    assert.ok((await call('/api/notifications', { token: buyer })).data.items.some((n) => n.type === 'live_started'));
    const join = async (canRelay) => (await call(`/api/live/${liveId}/join`, { method: 'POST', body: { canRelay } })).data;
    const v1 = await join(true); const v2 = await join(true);
    assert.equal(v1.parentId, hostPeer.peerId);
    assert.equal(v2.parentId, hostPeer.peerId);
    // The host (fan-out 2) is full: the next viewer is attached to a viewer once that one has the video.
    assert.equal((await call(`/api/live/${liveId}/join`, { method: 'POST', body: {} })).data.error, 'live_full', 'no relay ready yet');
    await poll(v1, '&connected=1');
    const v3 = await join(false);
    assert.equal(v3.parentId, v1.peerId);
    const h = (await poll(hostPeer)).data;
    assert.deepEqual(h.children.sort(), [v1.peerId, v2.peerId].sort());
    assert.equal(h.viewers, 3);
    // Signalling: only between linked peers, and only with the peer's own token.
    const offer = { from: v1.peerId, token: v1.token, to: v3.peerId, kind: 'offer', payload: { type: 'offer', sdp: 'v=0' } };
    assert.equal((await call(`/api/live/${liveId}/signal`, { method: 'POST', body: offer })).status, 200);
    assert.equal((await call(`/api/live/${liveId}/signal`, { method: 'POST', body: { ...offer, token: v2.token } })).status, 403);
    assert.equal((await call(`/api/live/${liveId}/signal`, { method: 'POST', body: { ...offer, from: v2.peerId, token: v2.token } })).data.error, 'not_linked');
    const got = (await poll(v3)).data;
    assert.equal(got.signals[0].kind, 'offer');
    assert.equal(got.signals[0].from_peer, v1.peerId);
    assert.equal((await poll(v3)).data.signals.length, 0, 'signals are delivered once');
    // v1 leaves: v3 is re-attached to a peer that still has room (here the host).
    await call(`/api/live/${liveId}/leave`, { method: 'POST', body: { peer: v1.peerId, token: v1.token } });
    assert.equal((await poll(v3)).data.parentId, hostPeer.peerId);
  });

  it('has a live chat with moderation, a pinned product and a viewer count', async () => {
    const c = await call(`/api/live/${liveId}/comments`, { method: 'POST', token: buyer, body: { body: 'كم السعر؟' } });
    assert.equal(c.status, 201);
    assert.equal((await call(`/api/live/${liveId}/comments`, { method: 'POST', body: { body: 'x' } })).status, 401);
    let p = (await call(`/api/live/${liveId}/poll`)).data;
    assert.ok(p.comments.some((x) => x.body === 'كم السعر؟'));
    assert.equal((await call(`/api/live/${liveId}/pin`, { method: 'POST', token: host, body: { productId } })).status, 200);
    assert.equal((await call(`/api/live/${liveId}/poll`)).data.pinned, productId);
    assert.equal((await call(`/api/live/${liveId}/mute/${buyerId}`, { method: 'POST', token: buyer })).status, 403);
    assert.equal((await call(`/api/live/${liveId}/mute/${buyerId}`, { method: 'POST', token: host })).status, 200);
    assert.equal((await call(`/api/live/${liveId}/comments`, { method: 'POST', token: buyer, body: { body: 'مرحبا' } })).data.error, 'muted');
    p = (await call(`/api/live/${liveId}/poll`)).data;
    assert.ok(p.removedComments.includes(Number(c.data.comment.id)), 'muting hides their messages');
    const detail = await call(`/api/live/${liveId}`, { token: buyer });
    assert.equal(detail.data.products[0].id, productId);
    assert.equal(detail.data.live.status, 'live');
    assert.ok(detail.data.live.viewers >= 1);
  });

  it('ends the live, keeps the recording only with the host consent, and lets admins stop lives', async () => {
    assert.equal((await call(`/api/live/${liveId}/end`, { method: 'POST', token: buyer })).status, 403);
    const end = await call(`/api/live/${liveId}/end`, { method: 'POST', token: host });
    assert.equal(end.status, 200);
    assert.equal((await call(`/api/live/${liveId}`)).data.live.status, 'ended');
    assert.equal((await call(`/api/live/${liveId}/recording`, { method: 'POST', token: host, body: { url: 'https://evil.example/x.mp4' } })).status, 400);
    // A live without recording consent never accepts a recording.
    const l2 = (await call('/api/live', { method: 'POST', token: host, body: { title: 'بث سريع', record: false } })).data.live;
    assert.equal((await call(`/api/live/${l2.id}/recording`, { method: 'POST', token: host, body: { url: 'https://x' } })).data.error, 'recording_not_allowed');
    await call(`/api/live/${l2.id}/start`, { method: 'POST', token: host });
    assert.equal((await call(`/api/live/admin/list`, { token: admin })).data.items[0].id, l2.id);
    assert.equal((await call(`/api/live/admin/${l2.id}/stop`, { method: 'POST', token: admin, body: { reason: 'مخالفة' } })).status, 200);
    assert.equal((await call(`/api/live/${l2.id}`)).status, 404, 'removed lives are hidden');
    assert.equal((await call(`/api/live/${l2.id}`, { token: host })).data.live.status, 'removed');
    // Reports on a live reach the moderation queue.
    assert.equal((await call('/api/social/reports', { method: 'POST', token: buyer, body: { targetType: 'live', targetId: liveId, reason: 'offensive' } })).status, 201);
    assert.ok((await call('/api/social/admin/reports', { token: admin })).data.items.some((r) => r.target_type === 'live'));
  });
});

// ---------- Smart search (synonyms in Arabic / Hassaniya / French / English, category names) ----------
describe('Smart search', () => {
  const titles = async (q, extra = '') => (await call(`/api/products?q=${encodeURIComponent(q)}${extra}`)).data.items.map((p) => p.title);
  it('finds a listing written in French with an Arabic or Hassaniya word', async () => {
    for (const q of ['هاتف', 'تلفون', 'الجوال', 'portable']) {
      assert.ok((await titles(q)).some((t) => t.includes('Samsung Galaxy A54')), q);
    }
  });
  it('understands Hassaniya and French words for cars and matches category names', async () => {
    const cars = await titles('وته');
    assert.ok(cars.some((t) => t.includes('Mercedes')), 'Mercedes (no Arabic word "car" in it) found by its category');
    assert.ok(cars.some((t) => t.includes('هايلكس')));
    assert.ok((await titles('voiture')).some((t) => t.includes('هايلكس')));
    assert.ok((await titles('عقارات')).some((t) => t.includes('Appartement')));
    assert.ok((await titles('frigo')).some((t) => t.includes('Réfrigérateur')));
  });
  it('still narrows with several words and tolerates typos', async () => {
    const r = await titles('هاتف سامسونج');
    assert.ok(r.some((t) => t.includes('Samsung')));
    assert.ok(!r.some((t) => t.includes('Mercedes')));
    assert.ok((await titles('مرسيدس')).some((t) => t.includes('Mercedes')));
    assert.ok((await titles('Mercedez')).some((t) => t.includes('Mercedes')), 'typo');
    assert.deepEqual(await titles('zzqxwv'), []);
  });
});

// ---------- Livestock + seasonal Eid market ----------
describe('Eid sheep market', () => {
  let admin; let seller;
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('fatimetou@example.mr');
  });
  it('is off by default and shows a countdown once the admin switches it on', async () => {
    assert.equal((await call('/api/meta')).data.eid, null);
    const date = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { season: { eid: { enabled: true, date } } } })).status, 200);
    const eid = (await call('/api/meta')).data.eid;
    assert.ok(eid.daysLeft >= 9 && eid.daysLeft <= 11, JSON.stringify(eid));
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { season: { eid: { enabled: true, date: 'tomorrow' } } } })).status, 400);
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10);
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { season: { eid: { enabled: true, date: past } } } });
    assert.equal((await call('/api/meta')).data.eid, null, 'hidden by itself after Eid');
  });
  it('posts livestock with its details and filters by animal and weight', async () => {
    const cat = (await call('/api/categories')).data;
    const live = (cat.items || cat.categories || cat).find((c) => c.slug === 'livestock');
    assert.ok(live, 'livestock category exists');
    const post = async (title, attrs) => {
      const f = new FormData();
      for (const [k, v] of Object.entries({ title, description: 'كبش سمين بصحة جيدة', price: '9000', categoryId: String(live.id), city: 'nouakchott', condition: 'used', attrs: JSON.stringify(attrs) })) f.append(k, v);
      f.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
      const r = await call('/api/products', { method: 'POST', token: seller, form: f });
      assert.equal(r.status, 201, JSON.stringify(r.data));
      await call(`/api/admin/products/${r.data.product.id}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
      return r.data.product.id;
    };
    const ram = await post('كبش توابير للعيد', { animal: 'sheep', sex: 'male', breed: 'touabire', ageMonths: 14, weightKg: 55, eidReady: 'yes' });
    const goat = await post('ماعز حلوب', { animal: 'goat', sex: 'female', weightKg: 30 });
    const ids = async (q) => (await call(`/api/products?category=livestock${q}`)).data.items.map((p) => p.id);
    assert.deepEqual(await ids('&a.animal=sheep'), [ram]);
    assert.ok((await ids('')).includes(goat));
    assert.deepEqual(await ids('&a.weightKg.min=50'), [ram]);
    const bad = new FormData();
    for (const [k, v] of Object.entries({ title: 'x كبش', description: 'وصف', price: '1', categoryId: String(live.id), city: 'nouakchott', condition: 'used', attrs: JSON.stringify({ animal: 'dragon' }) })) bad.append(k, v);
    bad.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    assert.equal((await call('/api/products', { method: 'POST', token: seller, form: bad })).status, 400);
    assert.ok((await call(`/api/products?q=${encodeURIComponent('خروف')}`)).data.items.some((p) => p.id === ram), 'synonyms: خروف finds كبش');
  });
});

// ---------- Barter ----------
describe('Barter (swap offers)', () => {
  let admin; let seller; let sidi; let sellerId; let sidiId; let target; let mine; let convId;
  const listing = async (token, title, extra = {}) => {
    const cat = (await pool.query("SELECT id FROM categories WHERE slug = 'phones-electronics'")).rows[0].id;
    const f = new FormData();
    for (const [k, v] of Object.entries({ title, description: 'هاتف بحالة جيدة جداً', price: '20000', categoryId: String(cat), city: 'nouakchott', condition: 'used', ...extra })) f.append(k, v);
    f.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r = await call('/api/products', { method: 'POST', token, form: f });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    await call(`/api/admin/products/${r.data.product.id}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    return r.data.product.id;
  };
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('fatimetou@example.mr');
    sidi = await login('sidi@example.mr');
    sellerId = (await call('/api/auth/me', { token: seller })).data.user.id;
    sidiId = (await call('/api/auth/me', { token: sidi })).data.user.id;
    target = await listing(seller, 'آيفون 13 للمقايضة', { acceptsSwap: 'true', swapWanted: 'سامسونج حديث أو ما يعادله' });
    mine = await listing(sidi, 'سامسونج S22');
  });
  it('marks listings that accept a swap and filters them', async () => {
    const p = (await call(`/api/products/${target}`)).data.product;
    assert.equal(p.accepts_swap, true);
    assert.equal(p.swap_wanted, 'سامسونج حديث أو ما يعادله');
    const ids = (await call('/api/products?swap=1')).data.items.map((x) => x.id);
    assert.ok(ids.includes(target));
    assert.ok(!ids.includes(mine));
  });
  it('lets a buyer offer one of their own listings plus cash, and the seller accept', async () => {
    const c = await call('/api/conversations', { method: 'POST', token: sidi, body: { productId: target, body: 'أقترح مقايضة' } });
    convId = c.data.conversationId;
    assert.ok(convId, JSON.stringify(c.data));
    const other = (await call(`/api/products?seller=${sellerId}`)).data.items.find((x) => x.id !== target).id;
    assert.equal((await call(`/api/conversations/${convId}/swaps`, { method: 'POST', token: sidi, body: { productId: other, cash: 0 } })).status, 400, 'not your listing');
    const r = await call(`/api/conversations/${convId}/swaps`, { method: 'POST', token: sidi, body: { productId: mine, cash: 5000 } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    const thread = (await call(`/api/conversations/${convId}`, { token: seller })).data.messages;
    const swap = thread.find((m) => m.kind === 'swap');
    assert.equal(swap.swap_product.id, mine);
    assert.equal(Number(swap.swap_cash), 5000);
    assert.ok((await call('/api/notifications', { token: seller })).data.items.some((n) => n.type === 'swap_new'));
    assert.equal((await call(`/api/conversations/${convId}/swaps/${swap.id}`, { method: 'POST', token: sidi, body: { action: 'accept' } })).status, 403, 'cannot accept own offer');
    assert.equal((await call(`/api/conversations/${convId}/swaps/${swap.id}`, { method: 'POST', token: seller, body: { action: 'accept' } })).data.status, 'accepted');
    assert.ok((await call('/api/notifications', { token: sidi })).data.items.some((n) => n.type === 'swap_accepted'));
    assert.equal((await call(`/api/conversations/${convId}/swaps/${swap.id}`, { method: 'POST', token: seller, body: { action: 'decline' } })).status, 409);
  });
  it('refuses swaps on listings that do not accept them', async () => {
    const c = await call('/api/conversations', { method: 'POST', token: seller, body: { productId: mine, body: 'مرحبا' } });
    const id = c.data.conversationId;
    assert.equal((await call(`/api/conversations/${id}/swaps`, { method: 'POST', token: seller, body: { productId: target, cash: 0 } })).data.error, 'swap_not_accepted');
  });
});

// ---------- Spoken listing description ----------
describe('Voice description', () => {
  it('lets the seller add, replace and remove a spoken description', async () => {
    const seller = await login('fatimetou@example.mr');
    const other = await login('sidi@example.mr');
    const me = (await call('/api/auth/me', { token: seller })).data.user.id;
    const pid = (await call(`/api/products?seller=${me}`)).data.items[0].id;
    // A tiny WebM header is enough for the type check.
    const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(200, 1)]);
    const form = (dur, buf = webm) => { const f = new FormData(); f.append('voice', new Blob([buf], { type: 'audio/webm' }), 'v.webm'); f.append('duration', String(dur)); return f; };
    assert.equal((await call(`/api/products/${pid}/voice`, { method: 'POST', token: other, form: form(10) })).status, 403);
    assert.equal((await call(`/api/products/${pid}/voice`, { method: 'POST', token: seller, form: form(200) })).status, 400, 'max 90 s');
    assert.equal((await call(`/api/products/${pid}/voice`, { method: 'POST', token: seller, form: form(5, Buffer.from('not audio at all, really')) })).status, 400);
    const r = await call(`/api/products/${pid}/voice`, { method: 'POST', token: seller, form: form(12) });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    const p = (await call(`/api/products/${pid}`)).data.product;
    assert.equal(p.voice_url, r.data.voice_url);
    assert.equal(p.voice_duration, 12);
    const audio = await fetch(base + p.voice_url);
    assert.equal(audio.status, 200);
    assert.equal(audio.headers.get('content-type'), 'audio/webm');
    assert.equal((await call(`/api/products/${pid}/voice`, { method: 'DELETE', token: seller })).status, 200);
    assert.equal((await call(`/api/products/${pid}`)).data.product.voice_url, null);
    assert.equal((await fetch(base + p.voice_url)).status, 404, 'old file removed');
  });
});

// ---------- Safe meeting places ----------
describe('Safe meeting places', () => {
  it('admin manages places per city; anyone lists the active ones', async () => {
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const buyer = await login('buyer@example.mr');
    const body = { city: 'nouakchott', name_ar: 'مركز تجاري (مثال اختبار)', address: 'تفرغ زينة', kind: 'mall', lat: 18.1, lng: -15.97 };
    assert.equal((await call('/api/admin/meeting-places', { method: 'POST', token: buyer, body })).status, 403);
    assert.equal((await call('/api/admin/meeting-places', { method: 'POST', token: admin, body: { ...body, city: 'atlantis' } })).status, 400);
    const r = await call('/api/admin/meeting-places', { method: 'POST', token: admin, body });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    const hidden = await call('/api/admin/meeting-places', { method: 'POST', token: admin, body: { ...body, name_ar: 'مكان مخفي', is_active: false } });
    const list = (await call('/api/meeting-places?city=nouakchott')).data.items;
    assert.ok(list.some((p) => p.id === r.data.place.id));
    assert.ok(!list.some((p) => p.id === hidden.data.place.id), 'inactive places are hidden');
    assert.deepEqual((await call('/api/meeting-places?city=rosso')).data.items, []);
    await call(`/api/admin/meeting-places/${r.data.place.id}`, { method: 'PUT', token: admin, body: { ...body, name_ar: 'اسم جديد' } });
    assert.ok((await call('/api/meeting-places?city=nouakchott')).data.items.some((p) => p.name_ar === 'اسم جديد'));
    await call(`/api/admin/meeting-places/${r.data.place.id}`, { method: 'DELETE', token: admin });
    await call(`/api/admin/meeting-places/${hidden.data.place.id}`, { method: 'DELETE', token: admin });
    assert.deepEqual((await call('/api/meeting-places?city=nouakchott')).data.items, []);
  });
});

// ---------- Data saver: small image copies ----------
describe('Image thumbnails', () => {
  it('serves smaller copies of listing photos on demand', async () => {
    const sharp = (await import('sharp')).default;
    const photo = await sharp({ create: { width: 1200, height: 800, channels: 3, background: { r: 30, g: 120, b: 90 } } }).png().toBuffer();
    const { rows } = await pool.query("INSERT INTO files (mime, data) VALUES ('image/png', $1) RETURNING id", [photo]);
    const url = `${base}/uploads/f/${rows[0].id}`;
    const full = (await (await fetch(url)).arrayBuffer()).byteLength;
    const small = await fetch(`${url}?w=240`);
    assert.equal(small.status, 200);
    assert.equal(small.headers.get('content-type'), 'image/webp');
    assert.match(small.headers.get('cache-control'), /immutable/);
    const buf = Buffer.from(await small.arrayBuffer());
    assert.equal((await sharp(buf).metadata()).width, 240);
    assert.ok(buf.length < full, `${buf.length} < ${full}`);
    assert.equal((await fetch(`${url}?w=999`)).headers.get('content-type'), 'image/png', 'other widths: the original');
  });
});

// ---------- Weekly livestock markets ----------
describe('Livestock markets', () => {
  it('admin lists weekly market days per town', async () => {
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const r = await call('/api/admin/livestock-markets', { method: 'POST', token: admin, body: { city: 'nouakchott', name_ar: 'سوق مواشي (اختبار)', days: [5, 1, 5], notes: 'من الصباح' } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.deepEqual(r.data.market.days, [1, 5]);
    assert.equal((await call('/api/admin/livestock-markets', { method: 'POST', token: admin, body: { city: 'nouakchott', name_ar: 'x y', days: [9] } })).status, 400);
    assert.ok((await call('/api/livestock-markets')).data.items.some((m) => m.id === r.data.market.id));
    await call(`/api/admin/livestock-markets/${r.data.market.id}`, { method: 'DELETE', token: admin });
    assert.deepEqual((await call('/api/livestock-markets')).data.items, []);
  });
});

// ---------- Hassaniya ----------
describe('Hassaniya interface', () => {
  it('ships Hassaniya texts on top of Arabic and keeps admin overrides for it', async () => {
    const { messages, LANGS } = await import('../../frontend/src/i18n/messages.js');
    assert.ok(LANGS.some((l) => l.code === 'hs' && l.base === 'ar' && l.dir === 'rtl'));
    assert.equal(messages.hs.product.contactSeller, 'كلّم البايع');
    assert.equal(messages.hs.form.price, messages.ar.form.price, 'everything else falls back to Arabic');
    assert.notEqual(messages.ar.product.contactSeller, 'كلّم البايع', 'Arabic untouched');
    const admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    const r = await call('/api/admin/settings', { method: 'PUT', token: admin, body: { texts: { ar: {}, fr: {}, en: {}, hs: { 'nav.post': 'بيع حاجتك' } } } });
    assert.equal(r.status, 200);
    assert.equal((await call('/api/settings')).data.settings.texts.hs['nav.post'], 'بيع حاجتك');
  });
});

describe('Auctions', () => {
  let admin; let seller; let sidi; let buyer; let sidiId; let pid; let auctionId;
  const listing = async (title) => {
    const cat = (await pool.query("SELECT id FROM categories WHERE slug = 'phones-electronics'")).rows[0].id;
    const f = new FormData();
    for (const [k, v] of Object.entries({ title, description: 'هاتف بحالة جيدة جداً للمزاد', price: '30000', categoryId: String(cat), city: 'nouakchott', condition: 'used' })) f.append(k, v);
    f.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const r = await call('/api/products', { method: 'POST', token: seller, form: f });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    await call(`/api/admin/products/${r.data.product.id}/status`, { method: 'PATCH', token: admin, body: { status: 'approved' } });
    return r.data.product.id;
  };
  const endNow = (id) => pool.query("UPDATE auctions SET ends_at = now() - interval '1 second' WHERE id = $1", [id]);
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('fatimetou@example.mr');
    sidi = await login('sidi@example.mr');
    buyer = await login('buyer@example.mr');
    sidiId = (await call('/api/auth/me', { token: sidi })).data.user.id;
    pid = await listing('آيفون 14 في المزاد');
  });

  it('lets only the owner start an auction, within the allowed length', async () => {
    assert.equal((await call('/api/auctions', { method: 'POST', token: sidi, body: { productId: pid, startPrice: 20000, hours: 24 } })).status, 403);
    assert.equal((await call('/api/auctions', { method: 'POST', token: seller, body: { productId: pid, startPrice: 20000, hours: 2 } })).status, 400, 'too short');
    assert.equal((await call('/api/auctions', { method: 'POST', token: seller, body: { productId: pid, startPrice: 20000, reservePrice: 1000, hours: 24 } })).status, 400, 'reserve below start');
    const r = await call('/api/auctions', { method: 'POST', token: seller, body: { productId: pid, startPrice: 20000, minIncrement: 500, reservePrice: 25000, hours: 24 } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    auctionId = r.data.auction.id;
    assert.equal(r.data.auction.reserve_price, 25000, 'the seller sees the reserve');
    assert.equal((await call('/api/auctions', { method: 'POST', token: seller, body: { productId: pid, startPrice: 20000, hours: 24 } })).status, 409, 'one at a time');
    const pub = (await call(`/api/auctions/${auctionId}`)).data.auction;
    assert.equal(pub.reserve_price, undefined, 'the reserve stays secret');
    assert.equal(pub.has_reserve, true);
    assert.equal(pub.min_bid, 20000);
    const card = (await call(`/api/products/${pid}`)).data.product;
    assert.equal(card.auction.id, auctionId);
    assert.ok((await call('/api/auctions')).data.items.some((x) => x.id === pid));
  });

  it('accepts rising bids only, and rejects own bids, self-outbidding and typos', async () => {
    assert.equal((await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: seller, body: { amount: 21000 } })).status, 403);
    const low = await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: sidi, body: { amount: 19000 } });
    assert.equal(low.status, 400); assert.equal(low.data.error, 'bid_too_low');
    assert.equal((await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: sidi, body: { amount: 2000000 } })).data.error, 'bid_too_high');
    const b1 = await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: sidi, body: { amount: 20000 } });
    assert.equal(b1.status, 201, JSON.stringify(b1.data));
    assert.equal(b1.data.auction.is_leading, true);
    assert.equal(b1.data.auction.min_bid, 20500);
    assert.equal((await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: sidi, body: { amount: 21000 } })).data.error, 'already_leading');
    assert.equal((await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: buyer, body: { amount: 20400 } })).data.error, 'bid_too_low');
    const b2 = await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: buyer, body: { amount: 22000 } });
    assert.equal(b2.status, 201);
    const n = (await pool.query("SELECT type FROM notifications WHERE user_id = $1 AND type = 'auction_outbid'", [sidiId])).rowCount;
    assert.ok(n >= 1, 'the previous leader is told');
    assert.equal((await call(`/api/auctions/${auctionId}/cancel`, { method: 'POST', token: seller })).data.error, 'auction_has_bids');
    // Names are shortened for the public, full for the seller.
    const pub = (await call(`/api/auctions/${auctionId}`, { token: sidi })).data.auction;
    assert.match(pub.bids[0].name, /\*\*\*$/);
    assert.equal(pub.bids.find((b) => b.is_me).amount, 20000);
    const own = (await call(`/api/auctions/${auctionId}`, { token: seller })).data.auction;
    assert.ok(!own.bids[0].name.endsWith('***'));
  });

  it('extends the end when someone bids in the last minutes', async () => {
    await pool.query("UPDATE auctions SET ends_at = now() + interval '30 seconds' WHERE id = $1", [auctionId]);
    const r = await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: sidi, body: { amount: 24000 } });
    assert.equal(r.status, 201);
    const left = new Date(r.data.auction.ends_at) - Date.now();
    assert.ok(left > 2.5 * 60 * 1000, `extended to ~3 minutes (${left} ms)`);
  });

  it('closes when time is up: below the reserve the seller is not bound, but both get a chat', async () => {
    await endNow(auctionId);
    const late = await call(`/api/auctions/${auctionId}/bids`, { method: 'POST', token: buyer, body: { amount: 30000 } });
    assert.equal(late.status, 409);
    const a = (await call(`/api/auctions/${auctionId}`, { token: sidi })).data.auction;
    assert.equal(a.status, 'ended');
    assert.equal(a.reserve_met, false);
    assert.equal(a.is_winner, false);
    assert.ok(a.conversation_id, 'the top bidder gets the chat');
    const thread = (await call(`/api/conversations/${a.conversation_id}`, { token: seller })).data.messages;
    assert.equal(thread[0].kind, 'auction');
    assert.equal(Number(thread[0].amount), 24000);
    assert.equal((await call(`/api/auctions/${auctionId}`, { token: buyer })).data.auction.conversation_id, null, 'others do not see the chat');
  });

  it('picks a winner when the reserve is met, and tells the others', async () => {
    const p2 = await listing('سامسونج للمزاد');
    const id = (await call('/api/auctions', { method: 'POST', token: seller, body: { productId: p2, startPrice: 5000, hours: 12 } })).data.auction.id;
    await call(`/api/auctions/${id}/bids`, { method: 'POST', token: buyer, body: { amount: 5000 } });
    await call(`/api/auctions/${id}/bids`, { method: 'POST', token: sidi, body: { amount: 6000 } });
    await endNow(id);
    await call('/api/auctions'); // the list closes due auctions too
    const a = (await call(`/api/products/${p2}/auction`, { token: sidi })).data.auction;
    assert.equal(a.status, 'ended');
    assert.equal(a.is_winner, true);
    assert.equal(a.reserve_met, true);
    const types = (await pool.query('SELECT type FROM notifications WHERE data->>\'auctionId\' = $1', [String(id)])).rows.map((r) => r.type);
    for (const t of ['auction_won', 'auction_sold', 'auction_lost']) assert.ok(types.includes(t), t);
    // The winner can be recorded as the buyer (the chat exists), so they can leave a review.
    assert.equal((await call(`/api/products/${p2}/availability`, { method: 'PATCH', token: seller, body: { availability: 'sold', soldToId: sidiId } })).status, 200);
  });

  it('lets the seller cancel before any bid, and stops the auction when the item is sold', async () => {
    const p3 = await listing('حاسوب للمزاد');
    const id = (await call('/api/auctions', { method: 'POST', token: seller, body: { productId: p3, startPrice: 9000, hours: 24 } })).data.auction.id;
    assert.equal((await call(`/api/auctions/${id}/cancel`, { method: 'POST', token: seller })).status, 200);
    const id2 = (await call('/api/auctions', { method: 'POST', token: seller, body: { productId: p3, startPrice: 9000, hours: 24 } })).data.auction.id;
    await call(`/api/auctions/${id2}/bids`, { method: 'POST', token: sidi, body: { amount: 9000 } });
    await call(`/api/products/${p3}/availability`, { method: 'PATCH', token: seller, body: { availability: 'sold' } });
    assert.equal((await pool.query('SELECT status FROM auctions WHERE id = $1', [id2])).rows[0].status, 'cancelled');
    assert.equal((await call(`/api/products/${p3}`)).data.product.auction, null);
  });

  it('can be switched off from the panel', async () => {
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { auctions: { enabled: false } } });
    assert.equal((await call('/api/meta')).data.auctions, null);
    const p4 = await listing('ساعة للمزاد');
    assert.equal((await call('/api/auctions', { method: 'POST', token: seller, body: { productId: p4, startPrice: 1000, hours: 24 } })).data.error, 'auctions_disabled');
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { auctions: { enabled: true } } });
    assert.equal((await call('/api/meta')).data.auctions.maxDays, 7);
  });
});

describe('Souk Pay', () => {
  let admin; let seller; let buyer; let courier; let sellerId; let courierUserId;
  const NKC = { lat: 18.0735, lng: -15.9582 };
  const listing = async (title, price) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ title, description: 'سلعة لاختبار سوق باي', price: String(price), city: 'nouakchott', condition: 'used', categoryId: '1' })) fd.append(k, v);
    fd.append('images', new Blob([PNG], { type: 'image/png' }), 'a.png');
    const id = (await call('/api/products', { method: 'POST', token: seller, form: fd })).data.product.id;
    await pool.query("UPDATE products SET status = 'approved' WHERE id = $1", [id]);
    return id;
  };
  const deliver = async (pid) => {
    const r = await call('/api/orders', { method: 'POST', token: buyer, body: { productId: pid, city: 'nouakchott', phone: '22334455', ...NKC } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    const oid = r.data.order.id;
    const move = (tok, status) => call(`/api/orders/${oid}/status`, { method: 'POST', token: tok, body: { status } });
    assert.equal((await move(seller, 'accepted')).status, 200);
    assert.equal((await call(`/api/orders/${oid}/claim`, { method: 'POST', token: courier })).status, 200);
    for (const st of ['picked_up', 'on_the_way', 'delivered']) assert.equal((await move(courier, st)).status, 200, st);
    return (await pool.query('SELECT * FROM orders WHERE id = $1', [oid])).rows[0];
  };
  const me = async (tok) => (await call('/api/pay/me', { token: tok })).data;
  before(async () => {
    admin = await login('admin@souk-chinguetti.mr', 'Admin12345');
    seller = await login('amana@example.mr'); buyer = await login('buyer@example.mr'); courier = await login('mohamed@example.mr');
    sellerId = (await call('/api/auth/me', { token: seller })).data.user.id;
    courierUserId = (await call('/api/auth/me', { token: courier })).data.user.id;
    await pool.query("INSERT INTO couriers (user_id, status, phone, city, vehicle) VALUES ($1, 'approved', '+22246009988', 'nouakchott', 'motorbike') ON CONFLICT (user_id) DO UPDATE SET status = 'approved'", [courierUserId]);
  });

  it('splits a delivered cash order and records the cash the courier collected', async () => {
    const o = await deliver(await listing('مكيف لسوق باي', 10000));
    const st = (await pool.query('SELECT * FROM order_settlements WHERE order_id = $1', [o.id])).rows[0];
    assert.equal(Number(st.seller_amount), 10000);
    assert.equal(Number(st.courier_amount), Number(o.delivery_fee));
    assert.equal(Number(st.platform_amount), 0, 'free: no commission by default');
    const c = await me(courier);
    assert.equal(c.position.courier.cash, 10000, 'the courier carries the seller\'s money, keeps the fee');
    assert.equal(c.position.courier.earned, Number(o.delivery_fee));
    const s = await me(seller);
    assert.equal(s.position.seller.due, 10000);
    assert.equal(s.sales[0].order_id, o.id);
  });

  it('hand-over: the courier declares, the seller confirms, balances go to zero', async () => {
    const oid = (await me(courier)).deliveries[0].order_id;
    assert.equal((await call(`/api/pay/orders/${oid}/handover`, { method: 'POST', token: seller })).status, 404, 'only the courier');
    const h = await call(`/api/pay/orders/${oid}/handover`, { method: 'POST', token: courier, body: {} });
    assert.equal(h.status, 201, JSON.stringify(h.data));
    assert.equal((await call(`/api/pay/orders/${oid}/handover`, { method: 'POST', token: courier, body: {} })).data.error, 'handover_exists');
    assert.equal((await me(courier)).position.courier.pending, 10000);
    assert.equal((await call(`/api/pay/transfers/${h.data.transfer.id}/confirm`, { method: 'POST', token: courier })).status, 404, 'the receiver confirms');
    assert.equal((await call(`/api/pay/transfers/${h.data.transfer.id}/confirm`, { method: 'POST', token: seller })).status, 200);
    assert.equal((await me(courier)).position.courier.cash, 0);
    assert.equal((await me(seller)).position.seller.due, 0);
    const n = await pool.query("SELECT 1 FROM notifications WHERE type = 'pay_confirmed' AND user_id = $1", [courierUserId]);
    assert.ok(n.rowCount >= 1);
  });

  it('with a commission, the platform share stays with the courier until handed in', async () => {
    const s = (await call('/api/admin/settings', { token: admin })).data.settings;
    assert.equal((await call('/api/admin/settings', { method: 'PUT', token: admin, body: { pay: { commissionPct: 99 } } })).status, 400);
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { pay: { ...s.pay, commissionPct: 5, deliveryCommissionPct: 10 } } });
    const o = await deliver(await listing('ثلاجة بعمولة', 20000));
    const fee = Number(o.delivery_fee);
    const st = (await pool.query('SELECT * FROM order_settlements WHERE order_id = $1', [o.id])).rows[0];
    assert.equal(Number(st.seller_amount), 19000);
    assert.equal(Number(st.platform_amount), 1000 + Math.round(fee * 0.1));
    assert.equal(Number(st.seller_amount) + Number(st.courier_amount) + Number(st.platform_amount), Number(o.total));
    const h = await call(`/api/pay/orders/${o.id}/handover`, { method: 'POST', token: courier, body: {} });
    await call(`/api/pay/transfers/${h.data.transfer.id}/confirm`, { method: 'POST', token: seller });
    const sum = (await call('/api/admin/pay/summary', { token: admin })).data;
    const row = sum.couriers.find((c) => c.id === courierUserId);
    assert.equal(row.cash, Number(st.platform_amount), 'the courier still holds the commission');
    assert.equal(sum.totals.platform_due, Number(st.platform_amount));
    // The admin records the cash handed in.
    assert.equal((await call('/api/admin/pay/transfers', { method: 'POST', token: admin, body: { from: 'courier', to: 'platform', amount: 100, kind: 'remittance' } })).data.fields.fromUser, 'required');
    const r = await call('/api/admin/pay/transfers', { method: 'POST', token: admin, body: { from: 'courier', fromUser: courierUserId, to: 'platform', amount: Number(st.platform_amount), kind: 'remittance', method: 'cash', ref: 'REC-1' } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    const after = (await call('/api/admin/pay/summary', { token: admin })).data;
    assert.ok(!after.couriers.some((c) => c.id === courierUserId), 'nothing left with the courier');
    assert.equal(after.totals.platform_due, 0);
    assert.equal(after.totals.platform_held, Number(st.platform_amount));
    await call('/api/admin/settings', { method: 'PUT', token: admin, body: { pay: { commissionPct: 0, deliveryCommissionPct: 0 } } });
  });

  it('a seller who did not get the money disputes; the admin decides', async () => {
    const o = await deliver(await listing('هاتف متنازع', 5000));
    const h = (await call(`/api/pay/orders/${o.id}/handover`, { method: 'POST', token: courier, body: {} })).data.transfer;
    assert.equal((await call(`/api/pay/transfers/${h.id}/dispute`, { method: 'POST', token: seller, body: { reason: 'لم أستلم شيئاً' } })).status, 200);
    assert.equal((await call(`/api/pay/transfers/${h.id}/confirm`, { method: 'POST', token: seller })).data.error, 'transfer_closed');
    const list = (await call('/api/admin/pay/transfers?status=disputed', { token: admin })).data.items;
    assert.ok(list.some((t) => t.id === h.id));
    assert.equal((await call('/api/admin/pay/summary', { token: admin })).data.totals.disputed, 1);
    assert.equal((await call(`/api/admin/pay/transfers/${h.id}`, { method: 'PATCH', token: seller, body: { action: 'cancel' } })).status, 403);
    assert.equal((await call(`/api/admin/pay/transfers/${h.id}`, { method: 'PATCH', token: admin, body: { action: 'cancel', note: 'لم يثبت التسليم' } })).data.status, 'cancelled');
    assert.equal((await me(courier)).position.courier.cash, 5000, 'the courier still owes it');
    // The courier can declare again once it is really done.
    assert.equal((await call(`/api/pay/orders/${o.id}/handover`, { method: 'POST', token: courier, body: {} })).status, 201);
  });

  it('secure payments are recorded too, and the CSV export works for admins only', async () => {
    const tr = (await call('/api/admin/pay/transfers', { token: admin })).data.items;
    assert.ok(tr.some((t) => t.kind === 'escrow_in'), 'the earlier secure payment was recorded');
    assert.ok(tr.some((t) => t.kind === 'refund'));
    const sum = (await call('/api/admin/pay/summary', { token: admin })).data;
    assert.ok(sum.providers.find((p) => p.key === 'cod').active);
    assert.equal(sum.providers.find((p) => p.key === 'bankily').active, false);
    const csv = await fetch(`${base}/api/admin/pay/export.csv`, { headers: { Authorization: `Bearer ${admin}` } });
    assert.equal(csv.status, 200);
    const text = await csv.text();
    assert.ok(text.includes('cod_collected') && text.includes('handover'));
    assert.equal((await fetch(`${base}/api/admin/pay/export.csv`, { headers: { Authorization: `Bearer ${buyer}` } })).status, 403);
  });

  it('gateway webhooks are refused while no gateway is connected', async () => {
    assert.equal((await call('/api/pay/webhook/bankily', { method: 'POST', body: { status: 'paid' } })).status, 503);
    assert.equal((await call('/api/pay/webhook/cod', { method: 'POST', body: {} })).status, 404);
  });
});
