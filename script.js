// Network Status Management
function updateConnectionStatus() {
  const banner = document.getElementById('connection-banner');
  const statusIndicator = document.getElementById('status-indicator');
  const statusMessage = document.getElementById('status-message');
  const onlineContent = document.getElementById('online-content');
  const offlineContent = document.getElementById('offline-content');
  const networkType = document.getElementById('network-type');
  const effectiveType = document.getElementById('effective-type');

  if (navigator.onLine) {
    banner.textContent = 'You are Online';
    banner.className = 'online-mode';
    statusIndicator.style.backgroundColor = 'green';
    statusMessage.textContent = 'Connected to Internet';
    
    onlineContent.classList.remove('hidden');
    offlineContent.classList.add('hidden');
  } else {
    banner.textContent = 'You are Offline';
    banner.className = 'offline-mode';
    statusIndicator.style.backgroundColor = 'red';
    statusMessage.textContent = 'No Internet Connection';
    
    onlineContent.classList.add('hidden');
    offlineContent.classList.remove('hidden');
  }

  // Enhanced Network Information
  if (navigator.connection) {
    networkType.textContent = `Connection: ${navigator.connection.type || 'Unknown'}`;
    effectiveType.textContent = `Speed: ${navigator.connection.effectiveType || 'Unknown'}`;
  }
}

// Service Worker Registration with Error Handling
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully');
        
        // Optional: Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              console.log('Service Worker updated');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.warn('Service Workers not supported');
  }
}

// Event Listeners
window.addEventListener('load', () => {
  updateConnectionStatus();
  registerServiceWorker();
});

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);