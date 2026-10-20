import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { isChunkLoadError, reloadForNewVersion } from './lib/lazyWithRetry';

// Global handler for Vite chunk preload failures across all routes and devices
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[MenuMaps] Intercepted vite:preloadError event:', event);
    reloadForNewVersion('vite_preload_error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event?.reason)) {
      console.warn('[MenuMaps] Intercepted unhandled chunk rejection:', event.reason);
      reloadForNewVersion('unhandled_chunk_rejection');
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
