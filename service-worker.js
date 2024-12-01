const CACHE_NAME = 'offline-cache-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Attempting to cache resources');
        return cache.addAll(CACHE_URLS.map(url => new Request(url, { cache: 'no-cache' })));
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
  // Ignore chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Caching error:', error);
              });

            return response;
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