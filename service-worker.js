const CACHE_NAME = 'arnia-app-v2';
const BASE_PATH = '/Bilancia3.2/';

const PRECACHE_URLS = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'manifest.json'
];

const CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
    'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js',
    'https://cdn.jsdelivr.net/npm/luxon@3.4.4/build/global/luxon.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.3.1/dist/chartjs-adapter-luxon.umd.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap'
];

// Installazione: precarica risorse locali e CDN
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Precarica le URL locali (must succeed)
            const localPromise = cache.addAll(PRECACHE_URLS);
            // Precarica le CDN (best effort - non blocca se fallisce)
            const cdnPromise = Promise.allSettled(
                CDN_URLS.map(url => 
                    cache.add(url).catch(err => {
                        console.warn('SW: Impossibile precaricare CDN:', url, err);
                    })
                )
            );
            return Promise.all([localPromise, cdnPromise]);
        })
    );
    self.skipWaiting();
});

// Pulizia vecchie cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// Strategia: Cache First per statiche, Network First per API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Navigazione (pagine HTML): Network First
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                const cachedResponse = await caches.match(BASE_PATH + 'index.html');
                return cachedResponse;
            }
        })());
        return;
    }
    
    // Risorse CDN e statiche: Cache First, poi Network
    if (url.hostname === 'cdn.jsdelivr.net' || 
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.pathname.startsWith(BASE_PATH)) {
        
        event.respondWith((async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
            
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            } catch (error) {
                return new Response('Offline', { status: 503 });
            }
        })());
        return;
    }
    
    // Tutto il resto (API Google Apps Script, ecc.): solo Network, no cache
    // Lascia passare senza intercettare
});
