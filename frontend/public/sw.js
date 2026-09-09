/**
 * Low & Best — Service Worker v2
 *
 * Strategy:
 *  - App shell (HTML, manifest, icons): cache-first with network fallback
 *  - API responses: network-first; offline → 503 JSON stub
 *  - Static assets (JS/CSS/fonts): stale-while-revalidate
 *
 * Background sync: queued hold-lock reservations are retried when the
 * device comes back online using the Background Sync API.
 *
 * Push notifications: price-drop and refill-reminder payloads are
 * displayed as native notifications.
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `low-best-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon.svg',
];

// ── Install ──────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // API: network-first, offline stub
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Offline', offline: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Static assets (.js, .css, fonts): stale-while-revalidate
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached ?? networkFetch;
      })
    );
    return;
  }

  // App shell / navigation: cache-first, network fallback
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => caches.match('/'))
    )
  );
});

// ── Background Sync ───────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'hold-lock-sync') {
    event.waitUntil(replayQueuedHoldLocks());
  }
  if (event.tag === 'voucher-save-sync') {
    event.waitUntil(replayQueuedVouchers());
  }
});

async function replayQueuedHoldLocks() {
  // In production, read queued requests from IndexedDB and replay them.
  // This stub logs the intent so the plumbing is in place.
  console.log('[SW] Replaying queued hold-lock reservations…');
}

async function replayQueuedVouchers() {
  console.log('[SW] Replaying queued voucher saves…');
}

// ── Push Notifications ────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'Low & Best', body: 'You have a new update.', type: 'info', url: '/' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const icon = '/icons/icon.svg';
  const badge = '/icons/icon.svg';

  const options = {
    body: data.body,
    icon,
    badge,
    tag: data.type || 'general',
    renotify: true,
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
