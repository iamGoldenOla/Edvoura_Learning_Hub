const CACHE_NAME = 'edvoura-offline-quiz-v1';
const OFFLINE_QUIZ_API = '/api/question-bank';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activated.');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/question-bank/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Offline detected. Serving cached quiz batch from SW Cache...');
          return caches.match(event.request);
        })
    );
  }
});
