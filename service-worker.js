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
        console.log('Attempting to cache resources');
        // Use URLs relative to the service worker's location
        return cache.addAll(CACHE_URLS.map(url => 
          new Request(url, { 
            mode: 'no-cors',  // Handle cross-origin requests
            cache: 'no-cache' 
          })
        ));
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting(); // Activate worker immediately
      })
      .catch((error) => {
        console.error('Cache installation error:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore non-http requests and chrome-extension URLs
  if (!event.request.url.startsWith('http') && !event.request.url.startsWith('https')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
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
              (networkResponse.type === 'basic' || networkResponse.type === 'cors')
            ) {
              const responseToCache = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.error('Caching error:', error);
                });
            }

            return networkResponse;
          })
          .catch(() => {
            // Offline fallback
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
    .then(() => {
      return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});