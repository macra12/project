const CACHE_NAME = 'offline-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/dog.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation error:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Filter out unsupported request types and schemes
  if (
    event.request.url.startsWith('chrome-extension://') || // Skip chrome-extension:// requests
    event.request.method !== 'GET' ||                    // Only process GET requests
    !event.request.url.startsWith('http://') &&          // Only process HTTP URLs
    !event.request.url.startsWith('https://')            // Only process HTTPS URLs
  ) {
    return; // Don't process the request
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache if available
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response; // Don't cache non-basic responses (e.g., cross-origin)
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cache HTTP/HTTPS responses
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Caching error:', error);
              });

            return response; // Return the network response
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            // Return a fallback offline response if network request fails
            return new Response('Offline', {
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
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
});
