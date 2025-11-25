import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from './api';

export interface SyncOperation {
  id: string;
  type: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = 'sync_queue';
const MAX_RETRIES = 3;

export class OfflineSyncService {
  private static syncInProgress = false;

  /**
   * Queue an operation for offline sync
   */
  static async queueOperation(
    type: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data: any
  ): Promise<void> {
    const operation: SyncOperation = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    const queue = await this.getQueue();
    queue.push(operation);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Get the current sync queue
   */
  static async getQueue(): Promise<SyncOperation[]> {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  /**
   * Sync all queued operations when connection is restored
   */
  static async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
      const queue = await this.getQueue();

      for (const operation of queue) {
        try {
          await this.executeOperation(operation);
          success++;
          await this.removeFromQueue(operation.id);
        } catch (error) {
          operation.retries++;
          if (operation.retries >= MAX_RETRIES) {
            failed++;
            await this.removeFromQueue(operation.id);
          } else {
            await this.updateQueue(operation);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return { success, failed };
  }

  /**
   * Execute a single sync operation
   */
  private static async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'POST':
        await api.post(operation.endpoint, operation.data);
        break;
      case 'PUT':
        await api.put(operation.endpoint, operation.data);
        break;
      case 'DELETE':
        await api.delete(operation.endpoint);
        break;
    }
  }

  /**
   * Remove operation from queue
   */
  private static async removeFromQueue(operationId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((op) => op.id !== operationId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  }

  /**
   * Update operation in queue
   */
  private static async updateQueue(operation: SyncOperation): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex((op) => op.id === operation.id);
    if (index !== -1) {
      queue[index] = operation;
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  }

  /**
   * Get pending operations count
   */
  static async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Clear all pending operations
   */
  static async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }
}

/**
 * Hook to monitor network connectivity and trigger sync
 */
export async function setupNetworkListener(onSyncComplete?: (result: any) => void) {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      OfflineSyncService.syncAll().then((result) => {
        if (onSyncComplete) {
          onSyncComplete(result);
        }
      });
    }
  });

  return unsubscribe;
}
