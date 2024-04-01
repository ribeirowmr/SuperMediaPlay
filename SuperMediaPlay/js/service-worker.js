const CACHE_NAME = 'audio-recorder-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/script.js',
  '/css/style.css',
  '/images/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});