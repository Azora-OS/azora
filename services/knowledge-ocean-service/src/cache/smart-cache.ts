import { createHash } from 'crypto';
import { gunzipSync } from 'zlib';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// SMART CACHE SYSTEM - On-Demand Decompression
// ============================================================================

interface CacheEntry {
    key: string;
    data: Buffer;
    size: number;
    lastAccessed: Date;
    accessCount: number;
    priority: number; // 1-10, higher = more important
    relatedKeys: string[]; // Related knowledge to preload
}

interface FocusArea {
    topic: string; // e.g., "React Hooks"
    subtopics: string[]; // e.g., ["useState", "useEffect", "useContext"]
    maxCacheSize: number; // MB to allocate for this focus
}

export class SmartKnowledgeCache {
    private cache = new Map<string, CacheEntry>();
    private maxCacheSize: number; // Total cache size in bytes
    private currentCacheSize = 0;
    private cacheDir: string;
    private compressedPackagePath: string;

    constructor(options: {
        maxCacheSizeMB: number;
        cacheDir: string;
        compressedPackagePath: string;
    }) {
        this.maxCacheSize = options.maxCacheSizeMB * 1024 * 1024;
        this.cacheDir = options.cacheDir;
        this.compressedPackagePath = options.compressedPackagePath;
    }

    /**
     * Set user's focus area and intelligently cache related knowledge
     */
    async setFocusArea(focus: FocusArea): Promise<{
        loaded: string[];
        cached: number;
        totalSize: number;
    }> {
        console.log(`🎯 Setting focus area: ${focus.topic}`);

        const loaded: string[] = [];
        let totalSize = 0;

        // 1. Load core knowledge for main topic
        const coreKey = this.generateKey(focus.topic, 'core');
        const coreData = await this.loadFromPackage(coreKey);

        if (coreData) {
            await this.addToCache(coreKey, coreData, 10, []); // Highest priority
            loaded.push(focus.topic);
            totalSize += coreData.length;
        }

        // 2. Load subtopics
        for (const subtopic of focus.subtopics) {
            const subtopicKey = this.generateKey(subtopic, 'detail');
            const subtopicData = await this.loadFromPackage(subtopicKey);

            if (subtopicData) {
                // Link to core topic for intelligent prefetching
                const relatedKeys = [coreKey];
                await this.addToCache(subtopicKey, subtopicData, 8, relatedKeys);
                loaded.push(subtopic);
                totalSize += subtopicData.length;
            }
        }

        // 3. Preload related knowledge (lower priority)
        const related = await this.findRelatedTopics(focus.topic);
        for (const relatedTopic of related.slice(0, 3)) { // Top 3 related
            const relatedKey = this.generateKey(relatedTopic, 'related');
            const relatedData = await this.loadFromPackage(relatedKey);

            if (relatedData && this.hasSpaceInCache(relatedData.length)) {
                await this.addToCache(relatedKey, relatedData, 5, [coreKey]);
                loaded.push(relatedTopic);
                totalSize += relatedData.length;
            }
        }

        return {
            loaded,
            cached: this.cache.size,
            totalSize
        };
    }

    /**
     * Get knowledge from cache or load on-demand
     */
    async get(topic: string, type: 'core' | 'detail' | 'example' = 'core'): Promise<Buffer | null> {
        const key = this.generateKey(topic, type);

        // Check cache first
        const cached = this.cache.get(key);
        if (cached) {
            // Update access stats
            cached.lastAccessed = new Date();
            cached.accessCount++;
            console.log(`✅ Cache HIT: ${topic} (${type})`);

            // Preload related knowledge in background
            this.preloadRelated(cached.relatedKeys);

            return cached.data;
        }

        console.log(`⚠️  Cache MISS: ${topic} (${type}) - Loading from package...`);

        // Load from compressed package
        const data = await this.loadFromPackage(key);
        if (data) {
            // Add to cache with medium priority
            await this.addToCache(key, data, 6, []);
            return data;
        }

        return null;
    }

    /**
     * Add data to cache with intelligent eviction
     */
    private async addToCache(
        key: string,
        data: Buffer,
        priority: number,
        relatedKeys: string[]
    ): Promise<void> {
        const size = data.length;

        // Check if we need to evict
        while (this.currentCacheSize + size > this.maxCacheSize) {
            await this.evictLeastValuable();
        }

        // Add to cache
        this.cache.set(key, {
            key,
            data,
            size,
            lastAccessed: new Date(),
            accessCount: 1,
            priority,
            relatedKeys
        });

        this.currentCacheSize += size;

        // Persist to disk cache for faster reload
        await this.persistToDisk(key, data);
    }

    /**
     * Evict least valuable cache entry
     * Value = (priority * 0.4) + (accessCount * 0.3) + (recency * 0.3)
     */
    private async evictLeastValuable(): Promise<void> {
        if (this.cache.size === 0) return;

        let lowestValue = Infinity;
        let evictKey: string | null = null;

        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            const recencyScore = 10 - Math.min(10, (now - entry.lastAccessed.getTime()) / (1000 * 60 * 60)); // Hours old
            const value = (entry.priority * 0.4) + (Math.min(entry.accessCount, 10) * 0.3) + (recencyScore * 0.3);

            if (value < lowestValue) {
                lowestValue = value;
                evictKey = key;
            }
        }

        if (evictKey) {
            const entry = this.cache.get(evictKey)!;
            this.cache.delete(evictKey);
            this.currentCacheSize -= entry.size;
            console.log(`🗑️  Evicted: ${evictKey} (value: ${lowestValue.toFixed(2)})`);
        }
    }

    /**
     * Preload related knowledge in background
     */
    private async preloadRelated(relatedKeys: string[]): Promise<void> {
        // Non-blocking background preload
        setImmediate(async () => {
            for (const relatedKey of relatedKeys) {
                if (!this.cache.has(relatedKey)) {
                    const data = await this.loadFromPackage(relatedKey);
                    if (data && this.hasSpaceInCache(data.length)) {
                        await this.addToCache(relatedKey, data, 4, []); // Low priority
                    }
                }
            }
        });
    }

    /**
     * Load specific chunk from compressed package without full decompression
     */
    private async loadFromPackage(key: string): Promise<Buffer | null> {
        try {
            // First check disk cache
            const diskCached = await this.loadFromDiskCache(key);
            if (diskCached) return diskCached;

            // Load from compressed package
            // In real implementation, this would use a chunk index to extract only needed data
            // For now, simulate selective extraction
            const chunkPath = path.join(this.compressedPackagePath, `${key}.gz`);

            try {
                const compressed = await fs.readFile(chunkPath);
                const decompressed = gunzipSync(compressed);
                return decompressed;
            } catch (err) {
                // Chunk doesn't exist
                return null;
            }
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    /**
     * Persist to disk cache for faster reload
     */
    private async persistToDisk(key: string, data: Buffer): Promise<void> {
        try {
            const diskPath = path.join(this.cacheDir, `${key}.cache`);
            await fs.mkdir(path.dirname(diskPath), { recursive: true });
            await fs.writeFile(diskPath, data);
        } catch (error) {
            // Non-critical error
            console.warn(`Failed to persist ${key} to disk:`, error);
        }
    }

    /**
     * Load from disk cache
     */
    private async loadFromDiskCache(key: string): Promise<Buffer | null> {
        try {
            const diskPath = path.join(this.cacheDir, `${key}.cache`);
            return await fs.readFile(diskPath);
        } catch {
            return null;
        }
    }

    /**
     * Find related topics using knowledge graph
     */
    private async findRelatedTopics(topic: string): Promise<string[]> {
        // In real implementation, this would query the knowledge graph
        // For now, use simple heuristics
        const relatedMap: Record<string, string[]> = {
            'React Hooks': ['useState', 'useEffect', 'useContext', 'Custom Hooks', 'React State'],
            'useState': ['React Hooks', 'useReducer', 'State Management'],
            'Next.js': ['React', 'SSR', 'Routing', 'API Routes'],
            'TypeScript': ['JavaScript', 'Type Safety', 'Interfaces', 'Generics']
        };

        return relatedMap[topic] || [];
    }

    /**
     * Check if there's space in cache
     */
    private hasSpaceInCache(requiredSize: number): boolean {
        return (this.currentCacheSize + requiredSize) <= this.maxCacheSize;
    }

    /**
     * Generate cache key
     */
    private generateKey(topic: string, type: string): string {
        return `${topic.toLowerCase().replace(/\s+/g, '-')}-${type}`;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            entries: this.cache.size,
            totalSize: this.currentCacheSize,
            maxSize: this.maxCacheSize,
            utilizationPercent: (this.currentCacheSize / this.maxCacheSize * 100).toFixed(1),
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * Calculate cache hit rate
     */
    private calculateHitRate(): number {
        let totalAccesses = 0;
        for (const entry of this.cache.values()) {
            totalAccesses += entry.accessCount;
        }
        return totalAccesses > 0 ? (this.cache.size / totalAccesses * 100) : 0;
    }

    /**
     * Clear cache
     */
    async clear(): Promise<void> {
        this.cache.clear();
        this.currentCacheSize = 0;

        // Clear disk cache
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                if (file.endsWith('.cache')) {
                    await fs.unlink(path.join(this.cacheDir, file));
                }
            }
        } catch (error) {
            console.warn('Failed to clear disk cache:', error);
        }
    }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

export async function demonstrateSmartCache() {
    const cache = new SmartKnowledgeCache({
        maxCacheSizeMB: 500, // Only 500MB cache (not 50GB!)
        cacheDir: 'C:\\Users\\Azora Sapiens\\Documents\\azora\\.knowledge-cache',
        compressedPackagePath: 'C:\\Users\\Azora Sapiens\\Documents\\azora\\knowledge-packages'
    });

    // User starts working on React Hooks
    console.log('\n🎯 User Focus: React Hooks\n');
    const result = await cache.setFocusArea({
        topic: 'React Hooks',
        subtopics: ['useState', 'useEffect', 'useContext'],
        maxCacheSize: 100 // 100MB for this focus
    });

    console.log(`\n📊 Loaded: ${result.loaded.join(', ')}`);
    console.log(`   Cached: ${result.cached} entries`);
    console.log(`   Size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // User requests specific knowledge
    const useStateKnowledge = await cache.get('useState', 'detail');
    console.log(`\n📖 Retrieved useState knowledge: ${useStateKnowledge ? 'Success' : 'Failed'}\n`);

    // Show cache stats
    const stats = cache.getStats();
    console.log('📈 Cache Statistics:');
    console.log(`   Entries: ${stats.entries}`);
    console.log(`   Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB / ${(stats.maxSize / 1024 / 1024).toFixed(0)} MB`);
    console.log(`   Utilization: ${stats.utilizationPercent}%`);
    console.log(`   Hit Rate: ${stats.hitRate.toFixed(1)}%\n`);
}
