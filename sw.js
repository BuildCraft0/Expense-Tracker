// sw.js - Service Worker for PWA Cache support

const CACHE_NAME = 'EXPENSE_TRACKER_V2';
const APP_SHELL_ASSETS = [
  'index.html',
  'dashboard.html',
  'reports.html',
  'settings.html',
  'profile.html',
  'css/global.css',
  'css/components.css',
  'css/pages.css',
  'js/storage.js',
  'js/theme.js',
  'js/settings.js',
  'js/wallet.js',
  'js/budget.js',
  'js/transaction.js',
  'js/search.js',
  'js/filter.js',
  'js/chart.js',
  'js/export.js',
  'js/import.js',
  'js/app.js',
  'js/dashboard.js',
  'js/report.js',
  'manifest.json'
];

// Install Event
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Pre-caching core app assets');
      return cache.addAll(APP_SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('SW: Cleaning old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(e.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (isSameOrigin) {
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(e.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          const acceptHeader = e.request.headers.get('accept') || '';
          const isHtmlRequest = e.request.mode === 'navigate' || acceptHeader.includes('text/html');

          if (isHtmlRequest) {
            return caches.match('index.html');
          }
        })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request).then(networkResponse => {
        return networkResponse;
      });
    })
  );
});
