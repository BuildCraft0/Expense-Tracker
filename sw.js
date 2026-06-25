// sw.js - Service Worker for PWA Cache support

const CACHE_NAME = 'EXPENSE_TRACKER_PRO_V1';
const ASSETS_TO_CACHE = [
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
      return cache.addAll(ASSETS_TO_CACHE);
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
  // Respond from Cache, fallback to network
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // Offline backup - if request is for HTML return index.html
        if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});
