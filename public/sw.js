const VERSION = 'v1';
const SHELL_CACHE = `currencyconv-shell-${VERSION}`;
const DATA_CACHE = `currencyconv-data-${VERSION}`;
const SHELL_URLS = ['/en', '/es', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.includes(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/rates')) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/en').then((cached) => cached || Response.error())),
    );
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}
