const CACHE_NAME = 'offline-cache-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use cache.addAll with a filter to ignore unsupported requests
        return cache.addAll(
          CACHE_URLS.filter(url => {
            try {
              new URL(url, location.origin);
              return true;
            } catch {
              console.warn(`Skipping invalid URL: ${url}`);
              return false;
            }
          })
        );
      })
      .then(() => {
        console.log('Cache installation successful');
      })
      .catch((error) => {
        console.error('Cache installation error:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Filter out non-HTTP(S) requests
  if (!event.request.url.startsWith('http') && !event.request.url.startsWith('https')) {
    return;
  }

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
            // Only cache successful GET requests
            if (
              event.request.method === 'GET' && 
              networkResponse.status === 200 && 
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
            return new Response('Offline: Resource unavailable', { 
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