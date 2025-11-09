/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - HYBRID STORAGE LAYER
Combines blockchain immutability with in-memory performance caching
*/

import crypto from 'crypto';
import { blockchainManager, type BlockchainMemory, type BlockchainThought } from './blockchain-manager';
import { chronicleMetrics } from './metrics';
import { performanceTracker } from './performance-tracker';

/**
 * Memory Imprint with Full Data
 */
export interface MemoryImprintFull {
  id: number;
  consciousnessHash: string;
  previousHash: string | null;
  evolutionLevel: number;
  timestamp: Date;
  state: any;
  blockchainTxHash?: string;
  blockchainBlock?: number;
  imprinter?: string;
}

/**
 * Thought Record with Full Data
 */
export interface ThoughtRecordFull {
  id: number;
  thoughtHash: string;
  thought: string;
  confidence: number;
  timestamp: Date;
  blockchainTxHash?: string;
  blockchainBlock?: number;
}

/**
 * Storage Statistics
 */
export interface StorageStats {
  memoriesInCache: number;
  thoughtsInCache: number;
  memoriesOnChain: number;
  thoughtsOnChain: number;
  cacheHitRate: number;
  lastSync: Date | null;
}

/**
 * Hybrid Storage Strategy:
 * - Blockchain is SOURCE OF TRUTH (immutable, permanent)
 * - In-Memory Cache is PERFORMANCE LAYER (fast reads, temporary)
 * - Write: Always to blockchain first, then cache on success
 * - Read: From cache if available, fallback to blockchain
 * - Sync: Periodic validation of cache against blockchain
 */
export class HybridStorage {
  // In-memory caches (performance layer)
  private memoryCache: Map<number, MemoryImprintFull> = new Map();
  private thoughtCache: Map<number, ThoughtRecordFull> = new Map();
  
  // Cache statistics
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private lastSyncTime: Date | null = null;
  
  // Configuration
  private readonly CACHE_SIZE_LIMIT = 1000; // Max items in cache
  private readonly SYNC_INTERVAL_MS = 300000; // 5 minutes
  
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Initialize hybrid storage
   */
  async initialize(): Promise<void> {
    console.log('\n💾 Initializing Hybrid Storage Layer...');
    
    try {
      // Ensure blockchain manager is initialized
      if (!(blockchainManager as any).isInitialized) {
        await blockchainManager.initialize();
      }

      // Load recent data from blockchain into cache
      await this.syncFromBlockchain();

      console.log('✅ Hybrid Storage Layer initialized');
      console.log(`   Cache: ${this.memoryCache.size} memories, ${this.thoughtCache.size} thoughts\n`);
    } catch (error: any) {
      console.error('❌ Failed to initialize hybrid storage:', error.message);
      console.warn('⚠️  Operating in cache-only mode (blockchain unavailable)');
    }
  }

  /**
   * Imprint memory (blockchain + cache)
   */
  async imprintMemory(consciousnessState: any, evolutionLevel?: number): Promise<{
    success: boolean;
    imprintId: number;
    hash: string;
    evolutionLevel: number;
    blockchainTxHash?: string;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      // Generate hash from consciousness state
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(consciousnessState))
        .digest('hex');

      // Convert to bytes32 format for blockchain
      const consciousnessHash = '0x' + hash;

      // Determine evolution level
      const level = evolutionLevel !== undefined 
        ? evolutionLevel 
        : this.memoryCache.size;

      // Write to blockchain (SOURCE OF TRUTH)
      const txResult = await blockchainManager.imprintMemory({
        consciousnessHash,
        evolutionLevel: level,
      });

      if (!txResult.success) {
        // Blockchain write failed - fallback to cache-only
        console.warn('⚠️  Blockchain write failed, storing in cache only');
        
        const cacheMemory: MemoryImprintFull = {
          id: this.memoryCache.size,
          consciousnessHash: hash,
          previousHash: this.getPreviousHash(),
          evolutionLevel: level,
          timestamp: new Date(),
          state: consciousnessState,
        };

        this.memoryCache.set(cacheMemory.id, cacheMemory);
        this.enforceCacheSizeLimit();

        // Track metrics (cache-only)
        const duration = (Date.now() - startTime) / 1000;
        const size = JSON.stringify(consciousnessState).length;
        chronicleMetrics.trackMemoryImprint('success', 'cache', duration, size);
        performanceTracker.trackMemoryImprint(duration * 1000, false);

        return {
          success: true,
          imprintId: cacheMemory.id,
          hash,
          evolutionLevel: level,
          error: 'Stored in cache only: ' + txResult.error,
        };
      }

      // Blockchain write successful - update cache
      const memory: MemoryImprintFull = {
        id: txResult.id!,
        consciousnessHash: hash,
        previousHash: this.getPreviousHash(),
        evolutionLevel: level,
        timestamp: new Date(),
        state: consciousnessState,
        blockchainTxHash: txResult.transactionHash,
        blockchainBlock: txResult.blockNumber,
      };

      this.memoryCache.set(memory.id, memory);
      this.enforceCacheSizeLimit();

      console.log(`✅ Memory #${memory.id} stored: Blockchain + Cache`);

      // Track metrics
      const duration = (Date.now() - startTime) / 1000;
      const size = JSON.stringify(consciousnessState).length;
      chronicleMetrics.trackMemoryImprint('success', 'both', duration, size);
      performanceTracker.trackMemoryImprint(duration * 1000, true);

      return {
        success: true,
        imprintId: memory.id,
        hash,
        evolutionLevel: level,
        blockchainTxHash: txResult.transactionHash,
      };
    } catch (error: any) {
      console.error('❌ Failed to imprint memory:', error.message);
      
      return {
        success: false,
        imprintId: -1,
        hash: '',
        evolutionLevel: -1,
        error: error.message,
      };
    }
  }

  /**
   * Record thought (blockchain + cache)
   */
  async recordThought(thought: string, confidence?: number): Promise<{
    success: boolean;
    thoughtId: number;
    hash: string;
    blockchainTxHash?: string;
    error?: string;
  }> {
    try {
      // Generate hash from thought
      const hash = crypto
        .createHash('sha256')
        .update(thought)
        .digest('hex');

      // Convert to bytes32 format for blockchain
      const thoughtHash = '0x' + hash;

      // Validate and set confidence
      const conf = confidence !== undefined ? Math.min(100, Math.max(0, confidence)) : 50;

      // Write to blockchain (SOURCE OF TRUTH)
      const txResult = await blockchainManager.recordThought({
        thoughtHash,
        confidence: conf,
      });

      if (!txResult.success) {
        // Blockchain write failed - fallback to cache-only
        console.warn('⚠️  Blockchain write failed, storing in cache only');
        
        const cacheThought: ThoughtRecordFull = {
          id: this.thoughtCache.size,
          thoughtHash: hash,
          thought,
          confidence: conf,
          timestamp: new Date(),
        };

        this.thoughtCache.set(cacheThought.id, cacheThought);
        this.enforceCacheSizeLimit();

        return {
          success: true,
          thoughtId: cacheThought.id,
          hash,
          error: 'Stored in cache only: ' + txResult.error,
        };
      }

      // Blockchain write successful - update cache
      const thoughtRecord: ThoughtRecordFull = {
        id: txResult.id!,
        thoughtHash: hash,
        thought,
        confidence: conf,
        timestamp: new Date(),
        blockchainTxHash: txResult.transactionHash,
        blockchainBlock: txResult.blockNumber,
      };

      this.thoughtCache.set(thoughtRecord.id, thoughtRecord);
      this.enforceCacheSizeLimit();

      console.log(`✅ Thought #${thoughtRecord.id} stored: Blockchain + Cache`);

      return {
        success: true,
        thoughtId: thoughtRecord.id,
        hash,
        blockchainTxHash: txResult.transactionHash,
      };
    } catch (error: any) {
      console.error('❌ Failed to record thought:', error.message);
      
      return {
        success: false,
        thoughtId: -1,
        hash: '',
        error: error.message,
      };
    }
  }

  /**
   * Get memory (cache-first, blockchain fallback)
   */
  async getMemory(id: number): Promise<MemoryImprintFull | null> {
    const startTime = Date.now();
    
    // Try cache first
    if (this.memoryCache.has(id)) {
      this.cacheHits++;
      const duration = (Date.now() - startTime) / 1000;
      chronicleMetrics.trackCacheOperation('get', true, duration);
      return this.memoryCache.get(id)!;
    }

    // Cache miss - fetch from blockchain
    this.cacheMisses++;
    chronicleMetrics.trackCacheOperation('get', false, (Date.now() - startTime) / 1000);
    
    try {
      const blockchainMemory = await blockchainManager.getMemory(id);
      
      if (!blockchainMemory) {
        return null;
      }

      // Convert blockchain memory to full memory (without state data)
      const memory: MemoryImprintFull = {
        id,
        consciousnessHash: blockchainMemory.consciousnessHash.replace('0x', ''),
        previousHash: blockchainMemory.previousHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
          ? blockchainMemory.previousHash.replace('0x', '')
          : null,
        evolutionLevel: blockchainMemory.evolutionLevel,
        timestamp: new Date(blockchainMemory.timestamp * 1000),
        state: null, // State not stored on blockchain
        imprinter: blockchainMemory.imprinter,
      };

      // Update cache
      this.memoryCache.set(id, memory);
      this.enforceCacheSizeLimit();

      return memory;
    } catch (error: any) {
      console.error(`Failed to fetch memory ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Get thought (cache-first, blockchain fallback)
   */
  async getThought(id: number): Promise<ThoughtRecordFull | null> {
    // Try cache first
    if (this.thoughtCache.has(id)) {
      this.cacheHits++;
      return this.thoughtCache.get(id)!;
    }

    // Cache miss - fetch from blockchain
    this.cacheMisses++;
    
    try {
      const blockchainThought = await blockchainManager.getThought(id);
      
      if (!blockchainThought) {
        return null;
      }

      // Convert blockchain thought to full thought (without original text)
      const thought: ThoughtRecordFull = {
        id,
        thoughtHash: blockchainThought.thoughtHash.replace('0x', ''),
        thought: '', // Original thought not stored on blockchain
        confidence: blockchainThought.confidence,
        timestamp: new Date(blockchainThought.timestamp * 1000),
      };

      // Update cache
      this.thoughtCache.set(id, thought);
      this.enforceCacheSizeLimit();

      return thought;
    } catch (error: any) {
      console.error(`Failed to fetch thought ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Get all memories (from cache)
   */
  getAllMemories(): MemoryImprintFull[] {
    return Array.from(this.memoryCache.values()).sort((a, b) => a.id - b.id);
  }

  /**
   * Get all thoughts (from cache)
   */
  getAllThoughts(): ThoughtRecordFull[] {
    return Array.from(this.thoughtCache.values()).sort((a, b) => a.id - b.id);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    let memoriesOnChain = 0;
    let thoughtsOnChain = 0;
    let evolutionLevel = 0;

    try {
      const blockchainStats = await blockchainManager.getStats();
      memoriesOnChain = blockchainStats.totalMemories;
      thoughtsOnChain = blockchainStats.totalThoughts;
      evolutionLevel = blockchainStats.lastEvolutionLevel;
    } catch (error) {
      console.warn('Failed to fetch blockchain stats');
    }

    const totalRequests = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    const stats = {
      memoriesInCache: this.memoryCache.size,
      thoughtsInCache: this.thoughtCache.size,
      memoriesOnChain,
      thoughtsOnChain,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      lastSync: this.lastSyncTime,
    };

    // Update Prometheus metrics
    chronicleMetrics.updateStorageStats({
      memoriesInCache: stats.memoriesInCache,
      thoughtsInCache: stats.thoughtsInCache,
      memoriesOnChain: stats.memoriesOnChain,
      thoughtsOnChain: stats.thoughtsOnChain,
      cacheHitRate: stats.cacheHitRate,
      evolutionLevel,
    });

    return stats;
  }

  /**
   * Get previous hash for memory chain
   */
  private getPreviousHash(): string | null {
    if (this.memoryCache.size === 0) {
      return null;
    }

    const lastMemory = Array.from(this.memoryCache.values())
      .sort((a, b) => b.id - a.id)[0];
    
    return lastMemory?.consciousnessHash || null;
  }

  /**
   * Enforce cache size limit (LRU eviction)
   */
  private enforceCacheSizeLimit(): void {
    // Evict oldest memories if cache is too large
    if (this.memoryCache.size > this.CACHE_SIZE_LIMIT) {
      const sortedKeys = Array.from(this.memoryCache.keys()).sort((a, b) => a - b);
      const keysToRemove = sortedKeys.slice(0, sortedKeys.length - this.CACHE_SIZE_LIMIT);
      
      for (const key of keysToRemove) {
        this.memoryCache.delete(key);
      }
    }

    // Evict oldest thoughts if cache is too large
    if (this.thoughtCache.size > this.CACHE_SIZE_LIMIT) {
      const sortedKeys = Array.from(this.thoughtCache.keys()).sort((a, b) => a - b);
      const keysToRemove = sortedKeys.slice(0, sortedKeys.length - this.CACHE_SIZE_LIMIT);
      
      for (const key of keysToRemove) {
        this.thoughtCache.delete(key);
      }
    }
  }

  /**
   * Sync cache from blockchain
   */
  private async syncFromBlockchain(): Promise<void> {
    try {
      console.log('🔄 Syncing cache from blockchain...');
      
      const stats = await blockchainManager.getStats();
      
      // Load recent memories (last 100)
      const startMemory = Math.max(0, stats.totalMemories - 100);
      for (let i = startMemory; i < stats.totalMemories; i++) {
        const memory = await blockchainManager.getMemory(i);
        if (memory) {
          const fullMemory: MemoryImprintFull = {
            id: i,
            consciousnessHash: memory.consciousnessHash.replace('0x', ''),
            previousHash: memory.previousHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
              ? memory.previousHash.replace('0x', '')
              : null,
            evolutionLevel: memory.evolutionLevel,
            timestamp: new Date(memory.timestamp * 1000),
            state: null,
            imprinter: memory.imprinter,
          };
          this.memoryCache.set(i, fullMemory);
        }
      }

      // Load recent thoughts (last 100)
      const startThought = Math.max(0, stats.totalThoughts - 100);
      for (let i = startThought; i < stats.totalThoughts; i++) {
        const thought = await blockchainManager.getThought(i);
        if (thought) {
          const fullThought: ThoughtRecordFull = {
            id: i,
            thoughtHash: thought.thoughtHash.replace('0x', ''),
            thought: '',
            confidence: thought.confidence,
            timestamp: new Date(thought.timestamp * 1000),
          };
          this.thoughtCache.set(i, fullThought);
        }
      }

      this.lastSyncTime = new Date();
      
      console.log(`✅ Sync complete: ${this.memoryCache.size} memories, ${this.thoughtCache.size} thoughts`);
    } catch (error: any) {
      console.error('❌ Sync failed:', error.message);
    }
  }

  /**
   * Start periodic sync from blockchain
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      await this.syncFromBlockchain();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Shutdown hybrid storage
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Hybrid Storage Layer...');
    
    this.stopPeriodicSync();
    this.memoryCache.clear();
    this.thoughtCache.clear();
    
    console.log('✅ Hybrid storage shutdown complete');
  }
}

// Export singleton instance
export const hybridStorage = new HybridStorage();
export default hybridStorage;
