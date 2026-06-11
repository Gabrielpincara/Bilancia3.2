// ============================================================
// SERVICE WORKER — Smart Hive Dashboard
// Versione: 1.0.0
// Strategia: Cache-first per asset statici,
//            Network-first per App Script / Google Sheets
// ============================================================

const CACHE_NAME = 'arnia-dashboard-v1.1'; // <-- Numero cambiato 11/06/26

// Asset statici da mettere in cache al momento dell'installazione
const PRECACHE_URLS = [
  './index.html',
  './manifest.json'
];

// Domini esterni da mettere in cache (CDN librerie)
const CDN_CACHE_NAME = 'smarthive-cdn-v1';
const CDN_HOSTS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Domini da NON mettere mai in cache (sempre rete)
const NETWORK_ONLY_HOSTS = [
  'script.google.com',
  'docs.google.com'
];

// ============================================================
// INSTALL — precache asset statici
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE — rimuove vecchie cache
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== CDN_CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — strategia per tipo di risorsa
// ============================================================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // App Script e Google Sheets → sempre rete, mai cache
  if (NETWORK_ONLY_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // CDN (Chart.js, Hammer, font) → cache-first, aggiorna in background
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(staleWhileRevalidate(event.request, CDN_CACHE_NAME));
    return;
  }

  // Asset locali (index.html, manifest) → cache-first con fallback rete
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

// ============================================================
// STRATEGIE
// ============================================================

// Cache-first: risponde dalla cache, cade sulla rete se assente
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline e non in cache: per index.html restituisce la versione cached
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale-while-revalidate: risponde dalla cache e aggiorna in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await networkFetch;
}
