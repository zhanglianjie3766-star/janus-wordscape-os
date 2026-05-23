import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

type TechLexGlobal = typeof globalThis & {
  __TECHLEX_IS_PRODUCTION__?: boolean;
};

const rootElement = document.getElementById('root');
const isProductionBuild = Boolean((globalThis as TechLexGlobal).__TECHLEX_IS_PRODUCTION__);

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && isProductionBuild) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // PWA support is optional; the app must keep working without service workers.
    });
  });
} else if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });

  if ('caches' in window) {
    void window.caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        void window.caches.delete(cacheName);
      });
    });
  }
}
