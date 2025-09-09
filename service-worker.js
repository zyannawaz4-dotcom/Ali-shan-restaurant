// service-worker.js
const CACHE_NAME = 'restaurant-cache-v2';
const RUNTIME_CACHE = 'restaurant-runtime-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './tikka.jpg',
  './legpiece.jpg',
  './kabab.jpg',
  './kalagi.jpg',
  './nan.jpg',
  './roti.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './service-worker.js'
];

// Install: pre-cache all app assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const req = event.request;

  // For page navigations → network first, fallback to index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => res)
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For other assets → cache first, fallback to network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(networkRes => {
          if (!networkRes || networkRes.status !== 200) return networkRes;
          return caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // Fallback for images if offline
          if (req.destination === 'image') {
            return caches.match('./icons/icon-192.png');
          }
        });
    })
  );
});
