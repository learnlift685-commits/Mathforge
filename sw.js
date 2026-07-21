'use strict';
const CACHE = 'mathforge-nrw-v1.2.0';
const ASSETS = [
  './', './index.html', './styles.css', './app.js',
  './mathforge-data.js', './mathforge-v03-data.js', './mathforge-v05-data.js', './mathforge-v06-data.js',
  './mathforge-engine.js', './mathforge-v03-engine.js', './mathforge-v05-engine.js', './mathforge-v06-engine.js',
  './mathjax-tex-svg.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('Offline asset unavailable'))))
  );
});
