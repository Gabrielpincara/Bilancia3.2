const CACHE_NAME = 'arnia-app-v1';
const BASE_PATH = '/Bilancia3.2/';

// Installazione: precarica la pagina principale
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                BASE_PATH,
                BASE_PATH + 'index.html',
                BASE_PATH + 'manifest.json'
            ]);
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

// Intercetta il traffico: Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
    // Gestiamo solo le richieste di navigazione (pagine)
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                // Prova a scaricare la versione più recente dal network
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                // Se non c'è rete, carica dalla cache
                const cachedResponse = await caches.match(BASE_PATH + 'index.html');
                return cachedResponse;
            }
        })());
    }
});
