/* Souk Chinguetti service worker: fast repeat visits and an offline fallback.
 * - Built assets (/assets/*, hashed names), icons and fonts: cache-first.
 * - Listing images (/uploads/*): cache-first (a file never changes), capped: no re-download.
 * - Page navigations: network-first, falling back to the cached app shell.
 * - API: always from the network; listing pages and favourites are also kept so they can be read
 *   offline (network-first, cache only when there is no connection). Cleared at sign-out.
 */
const VERSION = 'mm-v1.4.0';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const IMAGES = `${VERSION}-images`;
const MAX_IMAGES = 250;
const API = `${VERSION}-api`;
const MAX_API = 80;
// Read-only API answers worth keeping for offline reading.
const OFFLINE_API = [/^\/api\/products\/\d+$/, /^\/api\/favorites$/, /^\/api\/meta$/, /^\/api\/settings$/, /^\/api\/categories$/];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/manifest.webmanifest', '/favicon.png', '/logo-mark.png', '/logo-mark-green.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Google Fonts: cache-first.
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    event.respondWith(caches.open(STATIC).then(async (c) => (await c.match(request)) || fetch(request).then((r) => { c.put(request, r.clone()); return r; })));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    if (!OFFLINE_API.some((re) => re.test(url.pathname)) || url.search) return;
    event.respondWith(fetch(request).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(API).then((c) => c.put(request, copy).then(() => trim(API, MAX_API))); }
      return r;
    }).catch(async () => (await caches.match(request)) || Response.error()));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((r) => { const copy = r.clone(); caches.open(SHELL).then((c) => c.put('/', copy)); return r; })
        .catch(() => caches.match('/')),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.open(STATIC).then(async (c) => (await c.match(request)) || fetch(request).then((r) => { if (r.ok) c.put(request, r.clone()); return r; })));
    return;
  }

  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(caches.open(IMAGES).then(async (c) => {
      const cached = await c.match(request);
      if (cached) return cached; // files never change: no need to download again
      return fetch(request).then((r) => { if (r.ok) { c.put(request, r.clone()); trim(IMAGES, MAX_IMAGES); } return r; });
    }));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'clear-user-cache') event.waitUntil(caches.delete(API));
});

// ---------- Web Push: show the notification, open the right page when tapped ----------
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  const title = data.title || 'سوق شنقيط';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag,
    renotify: Boolean(data.tag),
    data: { url: data.url || '/notifications' },
    dir: 'auto',
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin);
  if (target.origin !== self.location.origin) return; // only pages of this site
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = wins.find((w) => new URL(w.url).origin === self.location.origin);
    if (open) { await open.focus(); return open.navigate(target.href).catch(() => self.clients.openWindow(target.href)); }
    return self.clients.openWindow(target.href);
  })());
});
