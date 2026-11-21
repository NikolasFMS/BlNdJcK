// Изолированный Service Worker для «Блайнд Джек» (GitHub Pages safe)
// Удаляет ТОЛЬКО собственные устаревшие кеши с префиксом CACHE_PREFIX и никогда не трогает другие приложения на том же домене.
const CACHE_PREFIX = 'vanilka-blindjack-cache-';
const CACHE_NAME = `${CACHE_PREFIX}v8`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './cards.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/pwa-192x192.png',
  './icons/pwa-512x512.png',
  './icons/pwa-maskable-512x512.png',
  './icons/apple-touch-icon.png',
];

function isCoreAsset(urlPath) {
  return (
    urlPath.endsWith('/') ||
    urlPath.endsWith('.html') ||
    urlPath.endsWith('.js') ||
    urlPath.endsWith('.css') ||
    urlPath.endsWith('.webmanifest')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_ASSETS.map((asset) =>
          fetch(new Request(asset, { cache: 'reload' }))
            .then((res) => {
              if (res && res.ok) {
                return cache.put(asset, res);
              }
            })
            .catch(() => cache.add(asset))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Перехватываем только запросы внутри scope именно этого приложения
  if (!req.url.startsWith(self.registration.scope)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  const pathname = new URL(req.url).pathname;

  // Для HTML/JS/CSS/manifest: сначала сеть (чтобы обновления на GitHub Pages подхватывались сразу),
  // а при офлайне — мгновенный возврат из локального кеша.
  if (isCoreAsset(pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Для иконок и графики: сначала кеш, затем сеть
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
