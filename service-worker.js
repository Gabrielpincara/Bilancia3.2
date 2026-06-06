const CACHE_NAME = 'arnia-cache-v1';
const urlsToCache = [
  './index.html',
  './styles.css',
  './app.js',
  './config.json',
  './manifest.json'
];

// Installazione e caching iniziale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercettazione fetch - Strategia: Cache First, poi Network
self.addEventListener('fetch', event => {
  // Ignora le chiamate a Google Script e CDN esterne, caching solo file locali
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Trovato in cache
        }
        return fetch(event.request); // Non in cache, vai in rete
      }
    )
  );
});

// Pulizia vecchie cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
