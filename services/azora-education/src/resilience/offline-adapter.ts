export interface CachedData<T> {
    data: T;
    timestamp: string;
    expiresAt: string;
}

export interface OfflineQueue {
    id: string;
    operation: string;
    data: any;
    timestamp: string;
    retries: number;
}

export class OfflineAdapter<T> {
    private cache: Map<string, CachedData<T>>;
    private queue: OfflineQueue[];
    private isOnline: boolean;

    constructor() {
        this.cache = new Map();
        this.queue = [];
        this.isOnline = true;

        // Monitor online/offline status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());
        }
    }

    /**
     * Cache data for offline access
     */
    cacheData(key: string, data: T, ttlMinutes: number = 60): void {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMinutes * 60000);

        this.cache.set(key, {
            data,
            timestamp: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        });

        console.log(`💾 Cached: ${key} (expires in ${ttlMinutes}m)`);
    }

    /**
     * Get cached data
     */
    getCachedData(key: string): T | null {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        // Check if expired
        if (new Date() > new Date(cached.expiresAt)) {
            this.cache.delete(key);
            return null;
        }

        console.log(`📦 Retrieved from cache: ${key}`);
        return cached.data;
    }

    /**
     * Queue operation for later sync
     */
    queueOperation(operation: string, data: any): void {
        const queueItem: OfflineQueue = {
            id: `queue-${Date.now()}`,
            operation,
            data,
            timestamp: new Date().toISOString(),
            retries: 0
        };

        this.queue.push(queueItem);
        console.log(`📥 Queued operation: ${operation}`);
    }

    /**
     * Sync queued operations when online
     */
    async syncQueue(): Promise<void> {
        if (!this.isOnline || this.queue.length === 0) {
            return;
        }

        console.log(`🔄 Syncing ${this.queue.length} queued operations...`);

        const toSync = [...this.queue];
        this.queue = [];

        for (const item of toSync) {
            try {
                // Attempt to execute queued operation
                await this.executeQueuedOperation(item);
                console.log(`✅ Synced: ${item.operation}`);
            } catch (error) {
                // Re-queue if failed
                item.retries++;
                if (item.retries < 3) {
                    this.queue.push(item);
                    console.warn(`⚠️ Sync failed, re-queued: ${item.operation}`);
                } else {
                    console.error(`❌ Sync failed permanently: ${item.operation}`);
                }
            }
        }
    }

    /**
     * Execute a queued operation
     */
    private async executeQueuedOperation(item: OfflineQueue): Promise<void> {
        // In production, this would execute the actual operation
        // For now, we simulate
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Handle online event
     */
    private handleOnline(): void {
        console.log('🌐 Connection restored - syncing...');
        this.isOnline = true;
        this.syncQueue();
    }

    /**
     * Handle offline event
     */
    private handleOffline(): void {
        console.log('📴 Connection lost - entering offline mode');
        this.isOnline = false;
    }

    /**
     * Check if currently online
     */
    public checkOnlineStatus(): boolean {
        return this.isOnline;
    }

    /**
     * Get queue status
     */
    public getQueueStatus() {
        return {
            isOnline: this.isOnline,
            queuedOperations: this.queue.length,
            cachedItems: this.cache.size
        };
    }
}

export default OfflineAdapter;
