const CACHE_NAME = 'academia-flow-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        try {
          const url = new URL(req.url);
          if (req.method === 'GET' && url.origin === location.origin) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
        } catch {}
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
