// Register the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Optional: Add offline/online event listeners
window.addEventListener('online', () => {
  console.log('You are now online');
});

window.addEventListener('offline', () => {
  console.log('You are now offline');
});