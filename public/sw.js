const CACHE_NAME = 'vanjarijodi-cache-v2026-09-08-01';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for Navigation (HTML) & Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API, dev routes, hot updates, external schemes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('/node_modules/') ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  // For HTML navigation requests, ALWAYS fetch from network first to ensure latest version
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // For static assets, try network then fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push Notification Event Listener (Mobile Chrome / PWA / Android)
self.addEventListener('push', (event) => {
  let data = {
    title: 'वंजारी जोडी मॅट्रिमोनी',
    body: 'नवीन विवाह जुळवणी व संदेश सूचना!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: 'vanjari-jodi-notification'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      try {
        data.body = event.data.text() || data.body;
      } catch (err) {}
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'vanjari-jodi-alert',
    renotify: true,
    data: {
      url: data.url || '/'
    },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler: Focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

