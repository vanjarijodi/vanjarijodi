const CACHE_NAME = 'vanjarijodi-cache-v2026-11-05-lockscreen-push';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/sounds/notification.mp3',
  '/sounds/notification.wav',
  '/vanjari-jodi-official-logo.png',
  '/vanjari-jodi-official-logo.webp',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png'
];

// Track active user ID & seen notification IDs inside Service Worker for lock-screen background delivery
let swCurrentUserId = null;
const swDeliveredNotifIds = new Set();
let swPollInterval = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Show High-Priority Lock-Screen Notification on Android / PWA / Chrome
async function displayLockScreenNotification(rawPayload) {
  const title = rawPayload.title || rawPayload.titleMr || '🔔 वंजारी जोडी मॅट्रिमोनी';
  const body = rawPayload.body || rawPayload.messageMr || rawPayload.message || 'नवीन विवाह जुळवणी व संदेश सूचना!';
  const notifId = rawPayload.id || rawPayload.tag || `vj-push-${Date.now()}`;

  if (rawPayload.id && swDeliveredNotifIds.has(rawPayload.id)) {
    return;
  }
  if (rawPayload.id) {
    swDeliveredNotifIds.add(rawPayload.id);
  }

  const options = {
    body: body,
    icon: rawPayload.icon || '/icon-192.png',
    badge: rawPayload.badge || '/icon-192.png',
    image: rawPayload.image || undefined,
    tag: rawPayload.tag || notifId,
    renotify: true,             // Wakes locked screen & vibrates even if same tag exists
    requireInteraction: true,   // Keeps notification visible on lock screen until user taps
    silent: false,              // Ensures OS notification ringtone/sound plays when phone is locked
    vibrate: [300, 100, 300, 100, 400],
    timestamp: Date.now(),
    data: {
      url: rawPayload.url || rawPayload.actionUrl || '/',
      id: notifId,
      type: rawPayload.type || 'system'
    },
    actions: [
      { action: 'open', title: '👉 उघडा (Open)' },
      { action: 'dismiss', title: 'बंद करा' }
    ]
  };

  // Broadcast to any open/background client windows so they can also play custom chime
  const broadcastPromise = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION_RECEIVED',
          data: {
            id: notifId,
            title,
            body,
            icon: options.icon,
            url: options.data.url,
            type: options.data.type
          }
        });
      });
    })
    .catch(() => {});

  const showPromise = self.registration.showNotification(title, options);
  return Promise.all([showPromise, broadcastPromise]);
}

// Poll server queue from inside Service Worker (strictly isolated per logged-in user)
async function checkServerPendingNotifications() {
  if (!swCurrentUserId) return;
  const activePollUser = swCurrentUserId;
  try {
    const resp = await fetch(`/api/notifications/poll?userId=${encodeURIComponent(activePollUser)}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!resp.ok) return;
    const data = await resp.json();
    // Abort if user logged out or switched while request was in flight
    if (swCurrentUserId !== activePollUser) return;
    if (data && Array.isArray(data.notifications)) {
      for (const item of data.notifications) {
        if (!item || !item.id || swDeliveredNotifIds.has(item.id)) continue;
        // Strict recipient verification: only show if broadcast or exact active user
        const isBroadcast = item.userId === 'all' || item.userId === 'broadcast';
        const isExactUser = item.userId === activePollUser && (!item.recipientId || item.recipientId === activePollUser);
        if (!isBroadcast && !isExactUser) continue;

        await displayLockScreenNotification({
          id: item.id,
          title: item.titleMr || item.title,
          body: item.messageMr || item.message || item.body,
          icon: '/icon-192.png',
          tag: item.id,
          url: item.actionUrl || '/',
          type: item.type || 'system'
        });
      }
    }
  } catch (e) {
    // Ignore transient network errors when offline
  }
}

function startSwBackgroundMonitor() {
  if (swPollInterval) clearInterval(swPollInterval);
  if (!swCurrentUserId) return;
  swPollInterval = setInterval(() => {
    checkServerPendingNotifications();
  }, 12000);
}

// Listen for messages from Client App (Register User ID, Trigger Lock-Screen Notification, Seed Seen IDs)
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'REGISTER_SW_USER') {
    const nextUserId = msg.userId || null;
    if (swCurrentUserId !== nextUserId) {
      swDeliveredNotifIds.clear();
    }
    swCurrentUserId = nextUserId;
    if (!swCurrentUserId) {
      if (swPollInterval) {
        clearInterval(swPollInterval);
        swPollInterval = null;
      }
      return;
    }
    if (Array.isArray(msg.seenIds)) {
      msg.seenIds.forEach((id) => swDeliveredNotifIds.add(id));
    }
    startSwBackgroundMonitor();
    event.waitUntil(checkServerPendingNotifications());
  } else if (msg.type === 'SHOW_LOCKSCREEN_NOTIFICATION') {
    event.waitUntil(displayLockScreenNotification(msg.payload || {}));
  } else if (msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Standard Web Push & Firebase Cloud Messaging (FCM) Push Event Listener (Wakes Locked Phone!)
self.addEventListener('push', (event) => {
  let payload = {
    title: '🔔 वंजारी जोडी मॅट्रिमोनी',
    body: 'नवीन विवाह जुळवणी व संदेश सूचना!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: `vanjari-jodi-push-${Date.now()}`
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      // Support both FCM format ({ notification: { title, body }, data: {...} }) and flat JSON format
      const notifBlock = parsed.notification || {};
      const dataBlock = parsed.data || {};
      payload = {
        ...payload,
        ...dataBlock,
        ...notifBlock,
        ...parsed,
        title: notifBlock.title || dataBlock.title || parsed.title || payload.title,
        body: notifBlock.body || dataBlock.body || parsed.body || payload.body,
        icon: notifBlock.icon || dataBlock.icon || parsed.icon || '/icon-192.png',
        url: dataBlock.url || dataBlock.actionUrl || parsed.url || '/',
        tag: dataBlock.id || parsed.id || parsed.tag || payload.tag,
        id: dataBlock.id || parsed.id || undefined
      };
    } catch (e) {
      try {
        payload.body = event.data.text() || payload.body;
      } catch (err) {}
    }
  }

  event.waitUntil(displayLockScreenNotification(payload));
});

// Background Sync & Periodic Sync (wakes Service Worker when phone is locked on Android)
self.addEventListener('sync', (event) => {
  if (event.tag === 'vanjari-jodi-notif-sync') {
    event.waitUntil(checkServerPendingNotifications());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'vanjari-jodi-periodic-notif') {
    event.waitUntil(checkServerPendingNotifications());
  }
});

// Notification Click Handler: Wake screen & focus/open Vanjari Jodi App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            url: targetUrl,
            data: event.notification.data
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Network-First for Navigation & Stale-While-Revalidate for Static Assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never cache API, dev routes, hot updates, or external schemes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/src/') ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match('/'));
      })
    );
    return;
  }
});
