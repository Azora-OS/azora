/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 📦 INDEXEDDB WRAPPER
 * 
 * Local-first data storage for offline functionality
 */

const DB_NAME = 'AzoraOS';
const DB_VERSION = 1;

// Object stores
export const STORES = {
  SYNC_QUEUE: 'sync-queue',
  CACHE_DATA: 'cache-data',
  USER_DATA: 'user-data',
  BIBLE_CACHE: 'bible-cache',
  TERMINAL_HISTORY: 'terminal-history',
  SAPIENS_PROGRESS: 'sapiens-progress',
};

/**
 * Open IndexedDB connection
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });

          // Create indexes
          if (storeName === STORES.SYNC_QUEUE) {
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
          
          if (storeName === STORES.TERMINAL_HISTORY) {
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('command', 'command', { unique: false });
          }
        }
      });
    };
  });
}

/**
 * Add item to store
 */
export async function addItem(storeName: string, data: any): Promise<number> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add({
      ...data,
      timestamp: Date.now(),
    });

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get item from store
 */
export async function getItem(storeName: string, id: number): Promise<any> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from store
 */
export async function getAllItems(storeName: string): Promise<any[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update item in store
 */
export async function updateItem(storeName: string, data: any): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put({
      ...data,
      updatedAt: Date.now(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete item from store
 */
export async function deleteItem(storeName: string, id: number): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all items from store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue action for sync when online
 */
export async function queueSync(action: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<void> {
  await addItem(STORES.SYNC_QUEUE, action);
  
  // Register background sync if available
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-data');
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function addConnectionListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Cache Bible content offline
 */
export async function cacheBibleContent(book: string, content: any): Promise<void> {
  await addItem(STORES.BIBLE_CACHE, {
    book,
    content,
    cachedAt: Date.now(),
  });
}

/**
 * Get cached Bible content
 */
export async function getCachedBibleContent(book: string): Promise<any | null> {
  const allItems = await getAllItems(STORES.BIBLE_CACHE);
  const item = allItems.find((item) => item.book === book);
  return item?.content || null;
}

/**
 * Save terminal command to history
 */
export async function saveTerminalCommand(command: string, output: string): Promise<void> {
  await addItem(STORES.TERMINAL_HISTORY, {
    command,
    output,
    timestamp: Date.now(),
  });
}

/**
 * Get terminal history
 */
export async function getTerminalHistory(limit: number = 100): Promise<any[]> {
  const allItems = await getAllItems(STORES.TERMINAL_HISTORY);
  return allItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Save Sapiens learning progress
 */
export async function saveLearningProgress(courseId: string, progress: any): Promise<void> {
  await addItem(STORES.SAPIENS_PROGRESS, {
    courseId,
    progress,
    lastUpdated: Date.now(),
  });
}

/**
 * Get learning progress
 */
export async function getLearningProgress(courseId: string): Promise<any | null> {
  const allItems = await getAllItems(STORES.SAPIENS_PROGRESS);
  const item = allItems.find((item) => item.courseId === courseId);
  return item?.progress || null;
}

export default {
  openDB,
  addItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
  clearStore,
  queueSync,
  isOnline,
  addConnectionListener,
  cacheBibleContent,
  getCachedBibleContent,
  saveTerminalCommand,
  getTerminalHistory,
  saveLearningProgress,
  getLearningProgress,
};

