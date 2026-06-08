const CACHE_NAME = 'arnia-app-cache-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) {
    return fetch(e.request);
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
