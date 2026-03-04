const CACHE_NAME = 'utt-v4';
const FONT_CACHE = 'utt-fonts-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './assets/favicon.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== FONT_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Stale-while-revalidate for Google Fonts
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetched = fetch(e.request).then(response => {
            cache.put(e.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Cache-first for app assets
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
