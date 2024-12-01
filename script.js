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


// In script.js, update the service worker registration path
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')  // Use absolute path
      .then((registration) => {
        console.log('Service Worker registered successfully');
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        // Log the full error details
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      });
  }
}

// Event Listeners
window.addEventListener('load', () => {
  updateConnectionStatus();
  registerServiceWorker();
});

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);