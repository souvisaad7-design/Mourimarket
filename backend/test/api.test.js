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
  let token; let adminToken; let buyerToken; let productId; let conversationId; let categoryId;

  it('registers, rejects duplicate email and weak password', async () => {
    const r = await call('/api/auth/register', { method: 'POST', body: { name: 'Test Seller', email, password: 'secret123', accountType: 'merchant', city: 'nouakchott' } });
    assert.equal(r.status, 201);
    assert.ok(r.data.token);
    assert.equal(r.data.user.password_hash, undefined);
    token = r.data.token;
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Xy', email, password: 'secret123' } })).status, 409);
    const weak = await call('/api/auth/register', { method: 'POST', body: { name: 'Ab', email: 'w@test.mr', password: '123' } });
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
