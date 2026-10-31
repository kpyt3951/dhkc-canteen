import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

createRoot(document.getElementById('root')!).render(<App />);

// Register Service Worker with Auto-Update Mechanism for installed PWAs
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates on startup
        registration.update().catch(() => {});

        // Re-check for updates every 60 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60000);

        // Check for updates when app is reopened / brought to foreground
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // Detect new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New update available, applying...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log('[PWA] SW registration:', err);
      });

    // Auto-reload cleanly when new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Controller changed, refreshing application to new version...');
        window.location.reload();
      }
    });
  });
}
