const CACHE_NAME = 'techlex-os-cache-v0.1.3';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './avatars/default-user-avatar.svg'];

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isCacheableRequest(request) {
  if (request.method !== 'GET' || !isSameOrigin(request)) {
    return false;
  }

  if (request.cache === 'no-store' || request.cache === 'reload') {
    return false;
  }

  return true;
}

function putIfCacheable(request, response) {
  if (!isCacheableRequest(request) || !response || !response.ok) {
    return;
  }

  caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          putIfCacheable(event.request, response);
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        putIfCacheable(event.request, response);
        return response;
      });
    })
  );
});
