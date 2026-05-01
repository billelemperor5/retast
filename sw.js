const CACHE_NAME = 'labo-nedjma-pwa-v20';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo.png',
  './assets/favicon_circle.png',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/apple-touch-icon.png'
  // NOTE: style.css, mobile.css and script.js intentionally excluded —
  // they use ?v= cache busting so browser always fetches fresh
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Always bypass cache for versioned files (style.css?v=, script.js?v=)
  // and for Firebase/CDN resources — let browser handle them directly
  if (
    url.search.includes('v=') ||
    url.hostname !== self.location.hostname ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for static assets (images, icons, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
