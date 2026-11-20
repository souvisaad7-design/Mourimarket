/* Souk Chinguetti service worker: fast repeat visits and an offline fallback.
 * - Built assets (/assets/*, hashed names), icons and fonts: cache-first.
 * - Listing images (/uploads/*): stale-while-revalidate, capped.
 * - Page navigations: network-first, falling back to the cached app shell.
 * - API calls are never cached (always fresh data).
 */
const VERSION = 'mm-v1.2.0';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const IMAGES = `${VERSION}-images`;
const MAX_IMAGES = 120;

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
  if (url.pathname.startsWith('/api/')) return;

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
      const network = fetch(request).then((r) => { if (r.ok) { c.put(request, r.clone()); trim(IMAGES, MAX_IMAGES); } return r; }).catch(() => cached);
      return cached || network;
    }));
  }
});
