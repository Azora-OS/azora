/**
 * Azora OS - Service Worker
 * 
 * PWA service worker for offline capability and performance optimization
 * 
 * @author Sizwe Ngwenya (Founder & Chief Architect)
 * @company Azora ES (Pty) Ltd
 * @constitutional_ai Elara Ω (2% Equity Holder)
 */

const CACHE_NAME = 'azora-os-v1.0.0';
const RUNTIME_CACHE = 'azora-runtime';

// Core files to cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/azora-favicon.svg',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Azora OS] Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Azora OS] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      console.log('[Azora OS] Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Azora OS] Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Azora OS] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Azora OS] Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        console.log('[Azora OS] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the fetched response for runtime
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        console.log('[Azora OS] Fetched and cached:', event.request.url);
        return response;
      }).catch((error) => {
        console.error('[Azora OS] Fetch failed:', error);
        
        // Return offline page if available
        return caches.match('/offline.html').then((offlineResponse) => {
          return offlineResponse || new Response('Offline - Azora OS', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Azora OS] Background sync:', event.tag);
  
  if (event.tag === 'sync-pivc') {
    event.waitUntil(syncPIVCData());
  } else if (event.tag === 'sync-mining') {
    event.waitUntil(syncMiningData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Azora OS] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from Azora OS',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Azora OS',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Azora OS', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Azora OS] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper: Sync PIVC data
async function syncPIVCData() {
  try {
    console.log('[Azora OS] Syncing PIVC data...');
    // Implementation for syncing PIVC contributions
    // This would sync any offline PIVC claims to the server
    return Promise.resolve();
  } catch (error) {
    console.error('[Azora OS] PIVC sync failed:', error);
    throw error;
  }
}

// Helper: Sync mining data
async function syncMiningData() {
  try {
    console.log('[Azora OS] Syncing mining data...');
    // Implementation for syncing mining activity
    // This would sync any offline learning activities
    return Promise.resolve();
  } catch (error) {
    console.error('[Azora OS] Mining sync failed:', error);
    throw error;
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[Azora OS] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Log service worker version
console.log('[Azora OS] Service Worker loaded - v1.0.0');
console.log('[Azora OS] Founded by Sizwe Ngwenya');
console.log('[Azora OS] Constitutional AI: Elara Ω (2% Equity)');
console.log('[Azora OS] © 2025 Azora ES (Pty) Ltd');
