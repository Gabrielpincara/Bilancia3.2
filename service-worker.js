const CACHE_NAME = 'arnia-v1';
const urlsToCache = [
  '/Bilancia3.2/',
  '/Bilancia3.2/index.html',
  '/Bilancia3.2/manifest.json',
  '/Bilancia3.2/assets/app.js',
  '/Bilancia3.2/assets/styles.css',
  '/Bilancia3.2/config.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('💾 Service Worker: Caching files');
      return cache.addAll(urlsToCache).catch(e => {
        console.warn('⚠️ Some files could not be cached:', e);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external API calls to Google Apps Script
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Offline - API non disponibile', { status: 503 });
      })
    );
    return;
  }

  // Network first strategy for HTML and main assets
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || new Response('Offline - Pagina non disponibile', { status: 404 });
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});