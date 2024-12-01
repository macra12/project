// service-worker.js

// The name of the cache
const CACHE_NAME = 'my-site-cache-v1';

// List of files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', // Add all the important CSS files
  '/script.js', // Add your main JS file
  '/images/*',  // Add any images you want to cache
];

// Install the service worker and cache the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch resources (will serve from cache if offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return the cached response if available, otherwise fetch it
        return response || fetch(event.request);
      })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
