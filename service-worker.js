const CACHE_NAME = 'arnia-control-cache-v1';
const ASSETS_TO_CACHE = [
  '/Bilancia3.2/',
  '/Bilancia3.2/index.html',
  '/Bilancia3.2/manifest.json'
];

// Installazione e salvataggio degli asset principali locali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercettazione delle richieste (Risolve il blocco dei grafici e di Google Sheets)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Escludi completamente i blocchi per i dati dello script di Google e fogli di calcolo
  if (url.includes('://google.com') || url.includes('://google.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Per tutto il resto (Librerie CDN dei grafici incluse) usa la strategia "Network First"
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se la richiesta va a buon fine, salvane una copia in cache per l'offline
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se internet non è disponibile, recupera l'asset dalla cache
        return caches.match(event.request);
      })
  );
});
