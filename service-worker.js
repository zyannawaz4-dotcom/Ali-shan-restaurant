const cacheName = 'restaurant-sales-cache-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './tikka.jpg',
  './legpiece.jpg',
  './kabab.jpg',
  './kalagi.jpg',
  './nan.jpg',
  './roti.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install SW and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key)))
    )
  );
});

// Fetch from cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
