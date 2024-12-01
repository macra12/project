// Function to update connection status
function updateConnectionStatus() {
  const statusText = document.getElementById('status-text');
  const statusIndicator = document.getElementById('status-indicator');

  if (navigator.onLine) {
      statusText.textContent = 'Online 🌐';
      statusIndicator.classList.remove('offline');
      statusIndicator.classList.add('online');
  } else {
      statusText.textContent = 'Offline 📴';
      statusIndicator.classList.remove('online');
      statusIndicator.classList.add('offline');
  }
}

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

// Add event listeners for online/offline events
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Initial status check
window.addEventListener('load', updateConnectionStatus);