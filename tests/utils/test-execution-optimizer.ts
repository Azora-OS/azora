/**
 * Test Execution Optimizer
 * 
 * Provides optimizations for test execution including:
 * - Database transaction rollback for fast cleanup
 * - Redis pipeline operations for batch operations
 * - Mock response caching
 * - Test result caching
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getTestPrismaClient, beginTestTransaction, rollbackTestTransaction } from './database';
import { getTestRedisClient, batchDeleteTestKeys } from './redis';
import { mockRegistry } from '../mocks/base.mock';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * Database Transaction Manager
 * Uses transactions with rollback for fast test cleanup
 */
export class DatabaseTransactionManager {
  private transactionClient: PrismaClient | null = null;
  private isInTransaction = false;

  /**
   * Begin a transaction for test isolation
   */
  async beginTransaction(): Promise<PrismaClient> {
    if (this.isInTransaction) {
      throw new Error('Transaction already in progress');
    }

    // Use the utility function to begin transaction
    this.transactionClient = await beginTestTransaction();
    this.isInTransaction = true;
    
    return this.transactionClient;
  }

  /**
   * Rollback transaction (fast cleanup)
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.isInTransaction || !this.transactionClient) {
      return;
    }

    try {
      // Use the utility function to rollback
      await rollbackTestTransaction();
    } catch (error) {
      // Ignore rollback errors (transaction may already be rolled back)
      console.warn('Transaction rollback warning:', error);
    } finally {
      this.transactionClient = null;
      this.isInTransaction = false;
    }
  }

  /**
   * Check if currently in transaction
   */
  isActive(): boolean {
    return this.isInTransaction;
  }

  /**
   * Get current transaction client
   */
  getClient(): PrismaClient | null {
    return this.transactionClient;
  }
}

/**
 * Redis Pipeline Manager
 * Batches Redis operations for better performance
 */
export class RedisPipelineManager {
  private redis: Redis;
  private pipeline: ReturnType<Redis['pipeline']> | null = null;
  private operations: Array<{ method: string; args: any[] }> = [];

  constructor() {
    this.redis = getTestRedisClient();
  }

  /**
   * Start a new pipeline
   */
  startPipeline(): void {
    this.pipeline = this.redis.pipeline();
    this.operations = [];
  }

  /**
   * Add SET operation to pipeline
   */
  set(key: string, value: string, expirationSeconds?: number): void {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    if (expirationSeconds) {
      this.pipeline.setex(key, expirationSeconds, value);
      this.operations.push({ method: 'setex', args: [key, expirationSeconds, value] });
    } else {
      this.pipeline.set(key, value);
      this.operations.push({ method: 'set', args: [key, value] });
    }
  }

  /**
   * Add GET operation to pipeline
   */
  get(key: string): void {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    this.pipeline.get(key);
    this.operations.push({ method: 'get', args: [key] });
  }

  /**
   * Add DEL operation to pipeline
   */
  del(...keys: string[]): void {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    this.pipeline.del(...keys);
    this.operations.push({ method: 'del', args: keys });
  }

  /**
   * Add HSET operation to pipeline
   */
  hset(key: string, field: string, value: string): void {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    this.pipeline.hset(key, field, value);
    this.operations.push({ method: 'hset', args: [key, field, value] });
  }

  /**
   * Add HGET operation to pipeline
   */
  hget(key: string, field: string): void {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    this.pipeline.hget(key, field);
    this.operations.push({ method: 'hget', args: [key, field] });
  }

  /**
   * Execute all pipeline operations
   */
  async executePipeline(): Promise<any[]> {
    if (!this.pipeline) {
      throw new Error('Pipeline not started');
    }

    try {
      const results = await this.pipeline.exec();
      return results || [];
    } finally {
      this.pipeline = null;
      this.operations = [];
    }
  }

  /**
   * Get operation count in current pipeline
   */
  getOperationCount(): number {
    return this.operations.length;
  }

  /**
   * Batch delete keys matching pattern
   */
  async batchDeleteByPattern(pattern: string): Promise<number> {
    // Get all keys matching pattern (without prefix since client adds it)
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }

    // Remove prefix from keys before deleting
    const keysWithoutPrefix = keys.map(key => {
      const prefix = this.redis.options.keyPrefix || '';
      return key.startsWith(prefix) ? key.slice(prefix.length) : key;
    });

    // Use utility function for batch deletion
    await batchDeleteTestKeys(keysWithoutPrefix);

    return keys.length;
  }

  /**
   * Batch set multiple key-value pairs
   */
  async batchSet(entries: Array<{ key: string; value: string; ttl?: number }>): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    this.startPipeline();
    
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl);
    }

    await this.executePipeline();
  }

  /**
   * Batch get multiple keys
   */
  async batchGet(keys: string[]): Promise<Array<string | null>> {
    if (keys.length === 0) {
      return [];
    }

    this.startPipeline();
    
    for (const key of keys) {
      this.get(key);
    }

    const results = await this.executePipeline();
    return results.map(([err, value]) => (err ? null : value));
  }
}

/**
 * Mock Response Cache
 * Caches mock responses to avoid repeated computation
 */
export class MockResponseCache {
  private cache: Map<string, any> = new Map();
  private hits = 0;
  private misses = 0;

  /**
   * Generate cache key from method and arguments
   */
  private generateKey(mockName: string, method: string, args: any[]): string {
    const argsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(args))
      .digest('hex');
    return `${mockName}:${method}:${argsHash}`;
  }

  /**
   * Get cached response
   */
  get(mockName: string, method: string, args: any[]): any | undefined {
    const key = this.generateKey(mockName, method, args);
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      this.hits++;
      return cached;
    }

    this.misses++;
    return undefined;
  }

  /**
   * Set cached response
   */
  set(mockName: string, method: string, args: any[], response: any): void {
    const key = this.generateKey(mockName, method, args);
    this.cache.set(key, response);
  }

  /**
   * Check if response is cached
   */
  has(mockName: string, method: string, args: any[]): boolean {
    const key = this.generateKey(mockName, method, args);
    return this.cache.has(key);
  }

  /**
   * Clear all cached responses
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  /**
   * Clear cache for specific mock
   */
  clearMock(mockName: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${mockName}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
}

/**
 * Test Result Cache
 * Caches test results to skip unchanged tests
 */
export class TestResultCache {
  private cacheDir: string;
  private cache: Map<string, TestCacheEntry> = new Map();
  private enabled: boolean;

  constructor(cacheDir = '.test-cache') {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
    this.enabled = process.env.TEST_CACHE !== 'false';
  }

  /**
   * Initialize cache (load from disk)
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const cacheFile = path.join(this.cacheDir, 'test-results.json');
      
      try {
        const data = await fs.readFile(cacheFile, 'utf-8');
        const entries = JSON.parse(data);
        
        for (const [key, value] of Object.entries(entries)) {
          this.cache.set(key, value as TestCacheEntry);
        }
      } catch (error) {
        // Cache file doesn't exist or is invalid, start fresh
      }
    } catch (error) {
      console.warn('Failed to initialize test result cache:', error);
    }
  }

  /**
   * Save cache to disk
   */
  async save(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const cacheFile = path.join(this.cacheDir, 'test-results.json');
      const entries = Object.fromEntries(this.cache);
      await fs.writeFile(cacheFile, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.warn('Failed to save test result cache:', error);
    }
  }

  /**
   * Generate cache key for test file
   */
  private async generateFileKey(testFile: string): Promise<string> {
    try {
      const content = await fs.readFile(testFile, 'utf-8');
      const hash = crypto.createHash('md5').update(content).digest('hex');
      return `${testFile}:${hash}`;
    } catch (error) {
      // File doesn't exist or can't be read
      return `${testFile}:unknown`;
    }
  }

  /**
   * Check if test result is cached and valid
   */
  async isCached(testFile: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    const key = await this.generateFileKey(testFile);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if cache is still valid (within 24 hours)
    const age = Date.now() - entry.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return age < maxAge && entry.passed;
  }

  /**
   * Get cached test result
   */
  async getCachedResult(testFile: string): Promise<TestCacheEntry | undefined> {
    if (!this.enabled) {
      return undefined;
    }

    const key = await this.generateFileKey(testFile);
    return this.cache.get(key);
  }

  /**
   * Cache test result
   */
  async cacheResult(testFile: string, passed: boolean, duration: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const key = await this.generateFileKey(testFile);
    
    this.cache.set(key, {
      testFile,
      passed,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; enabled: boolean } {
    return {
      size: this.cache.size,
      enabled: this.enabled,
    };
  }

  /**
   * Invalidate cache for specific test file
   */
  async invalidate(testFile: string): Promise<void> {
    const key = await this.generateFileKey(testFile);
    this.cache.delete(key);
  }
}

/**
 * Test cache entry
 */
interface TestCacheEntry {
  testFile: string;
  passed: boolean;
  duration: number;
  timestamp: number;
}

/**
 * Test Execution Optimizer
 * Combines all optimization strategies
 */
export class TestExecutionOptimizer {
  private dbManager: DatabaseTransactionManager;
  private redisManager: RedisPipelineManager;
  private mockCache: MockResponseCache;
  private resultCache: TestResultCache;

  constructor() {
    this.dbManager = new DatabaseTransactionManager();
    this.redisManager = new RedisPipelineManager();
    this.mockCache = new MockResponseCache();
    this.resultCache = new TestResultCache();
  }

  /**
   * Initialize optimizer
   */
  async initialize(): Promise<void> {
    await this.resultCache.initialize();
  }

  /**
   * Setup optimized test environment
   */
  async setupTest(): Promise<void> {
    // Begin database transaction for fast rollback
    await this.dbManager.beginTransaction();

    // Clear mock cache for test isolation
    this.mockCache.clear();
  }

  /**
   * Cleanup after test with optimizations
   */
  async cleanupTest(): Promise<void> {
    // Rollback database transaction (fast cleanup)
    await this.dbManager.rollbackTransaction();

    // Batch delete Redis test keys
    await this.redisManager.batchDeleteByPattern('test:*');

    // Reset all mocks
    mockRegistry.resetAll();
  }

  /**
   * Get database transaction client
   */
  getDatabaseClient(): PrismaClient | null {
    return this.dbManager.getClient();
  }

  /**
   * Get Redis pipeline manager
   */
  getRedisPipeline(): RedisPipelineManager {
    return this.redisManager;
  }

  /**
   * Get mock response cache
   */
  getMockCache(): MockResponseCache {
    return this.mockCache;
  }

  /**
   * Get test result cache
   */
  getResultCache(): TestResultCache {
    return this.resultCache;
  }

  /**
   * Save all caches
   */
  async save(): Promise<void> {
    await this.resultCache.save();
  }

  /**
   * Get optimization statistics
   */
  getStats(): OptimizationStats {
    return {
      database: {
        transactionActive: this.dbManager.isActive(),
      },
      redis: {
        pipelineOperations: this.redisManager.getOperationCount(),
      },
      mockCache: this.mockCache.getStats(),
      resultCache: this.resultCache.getStats(),
    };
  }
}

/**
 * Optimization statistics
 */
interface OptimizationStats {
  database: {
    transactionActive: boolean;
  };
  redis: {
    pipelineOperations: number;
  };
  mockCache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  resultCache: {
    size: number;
    enabled: boolean;
  };
}

// Global optimizer instance
let globalOptimizer: TestExecutionOptimizer | null = null;

/**
 * Get or create global optimizer instance
 */
export function getTestOptimizer(): TestExecutionOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new TestExecutionOptimizer();
  }
  return globalOptimizer;
}

/**
 * Setup optimized test environment (use in beforeEach)
 */
export async function setupOptimizedTest(): Promise<void> {
  const optimizer = getTestOptimizer();
  await optimizer.setupTest();
}

/**
 * Cleanup optimized test environment (use in afterEach)
 */
export async function cleanupOptimizedTest(): Promise<void> {
  const optimizer = getTestOptimizer();
  await optimizer.cleanupTest();
}

/**
 * Initialize test optimizer (use in global setup)
 */
export async function initializeTestOptimizer(): Promise<void> {
  const optimizer = getTestOptimizer();
  await optimizer.initialize();
}

/**
 * Save test optimizer state (use in global teardown)
 */
export async function saveTestOptimizer(): Promise<void> {
  const optimizer = getTestOptimizer();
  await optimizer.save();
}
