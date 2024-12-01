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
  // Filter out unsupported request types
  if (
    event.request.url.startsWith('chrome-extension://') || 
    event.request.url.includes('extension') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (
              !response || 
              response.status !== 200 || 
              response.type !== 'basic'
            ) {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            // Open cache and add response
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Ensure we're not caching problematic requests
                if (
                  event.request.url.startsWith('http') || 
                  event.request.url.startsWith('https')
                ) {
                  cache.put(event.request, responseToCache);
                }
              })
              .catch((error) => {
                console.error('Caching error:', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            // Optionally return a fallback response
            return new Response('Offline', {
              status: 404,
              headers: { 'Content-Type': 'text/plain' }
            });
          })
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