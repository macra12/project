const CACHE_NAME = 'offline-cache-v1';
const CACHE_URLS = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'images/dog.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cached static assets');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('Cache installation error:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }

        // Try network request
        return fetch(event.request)
          .then((networkResponse) => {
            // Only cache GET requests with successful responses
            if (
              event.request.method === 'GET' && 
              networkResponse.ok && 
              networkResponse.type === 'basic'
            ) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseCopy);
                })
                .catch((error) => {
                  console.error('Caching error:', error);
                });
            }

            return networkResponse;
          })
          .catch(() => {
            // Fallback for offline scenarios
            return new Response('Offline mode: Resource unavailable', { 
              status: 404, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});