/**
 * 🌐 AZORA OS - SERVICE WORKER
 * 
 * Offline-first architecture to serve the 4 billion without reliable internet
 * 
 * "Go into all the world and preach the gospel to all creation." - Mark 16:15
 */

const CACHE_NAME = 'azora-os-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/kingdom',
  '/terminal',
  '/bible',
  '/temple',
  '/sapiens',
  '/_next/static/css',
  '/_next/static/chunks',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS.map(url => {
        return new Request(url, { cache: 'reload' });
      }));
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        
        // Return cache but update in background
        event.waitUntil(
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          }).catch(() => {
            // Network failed, cache is already being served
          })
        );
        
        return cachedResponse;
      }

      // Not in cache, try network
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        console.log('[Service Worker] Fetched and cached:', request.url);
        return response;
      }).catch(() => {
        // Network failed, return offline page
        if (request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        
        // For other resources, just fail
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});

// Background sync for data
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Syncing:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync offline data when connection restored
      syncOfflineData()
    );
  }
});

// Push notifications (future)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Azora OS';
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});

// Helper: Sync offline data
async function syncOfflineData() {
  try {
    // Open IndexedDB
    const db = await openDB();
    
    // Get pending sync items
    const tx = db.transaction(['sync-queue'], 'readonly');
    const store = tx.objectStore('sync-queue');
    const items = await store.getAll();
    
    // Sync each item
    for (const item of items) {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      
      // Remove from queue on success
      const deleteTx = db.transaction(['sync-queue'], 'readwrite');
      const deleteStore = deleteTx.objectStore('sync-queue');
      await deleteStore.delete(item.id);
    }
    
    console.log('[Service Worker] Sync complete');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Helper: Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AzoraOS', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('cache-data')) {
        db.createObjectStore('cache-data', { keyPath: 'key' });
      }
    };
  });
}

console.log('[Service Worker] Loaded and ready to serve offline! 🙏');
