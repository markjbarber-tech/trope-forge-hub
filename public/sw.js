const CACHE_NAME = 'dnd-generator-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-256.png', 
  '/icon-512.png'
];

const DATA_URL = 'https://markjbarber-tech.github.io/DnD-Story-Generator/data.csv';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Special handling for CSV data - always try network first
  if (event.request.url === DATA_URL) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // For everything else, cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});