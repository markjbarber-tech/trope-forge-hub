const CACHE_NAME = 'dnd-generator-v1';
// Ensure assets are cached relative to the app's scope (supports subpath hosting like GitHub Pages)
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '') + '/';
const STATIC_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icon-192.png`,
  `${BASE_PATH}icon-256.png`, 
  `${BASE_PATH}icon-512.png`
];

const DATA_URL = 'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/main/Data.csv';

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

// Fetch event - smarter strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML navigations: network-first to avoid serving stale index.html
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache the latest index.html for offline use
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(`${BASE_PATH}index.html`, resClone).catch(() => {});
          });
          return res;
        })
        .catch(() =>
          // Fallback to cached index.html if offline
          caches.match(`${BASE_PATH}index.html`)
        )
    );
    return;
  }

  // Special handling for CSV data - always try network first
  if (req.url === DATA_URL) {
    event.respondWith(
      fetch(req).catch(() => {
        // If network fails, try cache
        return caches.match(req);
      })
    );
    return;
  }

  // For everything else, cache first
  event.respondWith(
    caches.match(req).then((response) => {
      return response || fetch(req);
    })
  );
});