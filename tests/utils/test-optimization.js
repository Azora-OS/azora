/**
 * Test Optimization Utilities
 * Implements database transaction rollback, Redis pipeline operations, and caching
 */

const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

class TestOptimizer {
  constructor() {
    this.prisma = null;
    this.redis = null;
    this.transactionStack = [];
    this.mockCache = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize Prisma with transaction support
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/azora_test'
        }
      }
    });

    // Initialize Redis with pipeline support
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    await this.redis.connect();
    this.initialized = true;
  }

  /**
   * Start a database transaction for test isolation
   */
  async startTransaction() {
    if (!this.initialized) await this.initialize();
    
    const transaction = await this.prisma.$begin();
    this.transactionStack.push(transaction);
    return transaction;
  }

  /**
   * Rollback the current transaction
   */
  async rollbackTransaction() {
    if (this.transactionStack.length === 0) return;
    
    const transaction = this.transactionStack.pop();
    await transaction.$rollback();
  }

  /**
   * Execute Redis operations in pipeline for better performance
   */
  async executeRedisPipeline(operations) {
    if (!this.initialized) await this.initialize();
    
    const pipeline = this.redis.pipeline();
    
    operations.forEach(op => {
      pipeline[op.command](...op.args);
    });
    
    return await pipeline.exec();
  }

  /**
   * Cache mock responses to avoid repeated computation
   */
  cacheMockResponse(key, response) {
    this.mockCache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached mock response if still valid
   */
  getCachedMockResponse(key, maxAge = 300000) { // 5 minutes default
    const cached = this.mockCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      this.mockCache.delete(key);
      return null;
    }
    
    return cached.response;
  }

  /**
   * Batch database operations for better performance
   */
  async batchDatabaseOperations(operations) {
    if (!this.initialized) await this.initialize();
    
    const transaction = await this.startTransaction();
    
    try {
      const results = [];
      for (const op of operations) {
        const result = await transaction[op.model][op.operation](op.data);
        results.push(result);
      }
      
      await transaction.$commit();
      return results;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    // Rollback any pending transactions
    while (this.transactionStack.length > 0) {
      await this.rollbackTransaction();
    }
    
    // Clear mock cache
    this.mockCache.clear();
    
    // Close connections
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    
    if (this.redis) {
      await this.redis.disconnect();
    }
    
    this.initialized = false;
  }

  /**
   * Setup test environment with optimizations
   */
  async setupTestEnvironment() {
    await this.initialize();
    
    // Start fresh transaction for test isolation
    await this.startTransaction();
    
    // Clear Redis test data
    await this.redis.flushdb();
    
    // Setup test-specific optimizations
    await this.executeRedisPipeline([
      { command: 'set', args: ['test:session', 'active'] },
      { command: 'expire', args: ['test:session', 3600] }
    ]);
  }

  /**
   * Teardown test environment
   */
  async teardownTestEnvironment() {
    // Rollback database changes
    await this.rollbackTransaction();
    
    // Clear Redis test data
    if (this.redis && this.redis.status === 'ready') {
      await this.redis.flushdb();
    }
  }
}

// Singleton instance
const testOptimizer = new TestOptimizer();

// Jest setup helpers
const setupOptimizedTest = async () => {
  await testOptimizer.setupTestEnvironment();
};

const teardownOptimizedTest = async () => {
  await testOptimizer.teardownTestEnvironment();
};

// Global cleanup
const globalCleanup = async () => {
  await testOptimizer.cleanup();
};

module.exports = {
  TestOptimizer,
  testOptimizer,
  setupOptimizedTest,
  teardownOptimizedTest,
  globalCleanup
};