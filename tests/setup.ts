import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { loadTestEnv } from './utils/env';
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  disconnectTestDatabase,
  getTestPrismaClient 
} from './utils/database';
import { 
  setupTestRedis, 
  cleanupTestRedis, 
  disconnectTestRedis,
  getTestRedisClient 
} from './utils/redis';
import {
  initializeTestOptimizer,
  saveTestOptimizer,
  setupOptimizedTest,
  cleanupOptimizedTest,
} from './utils/test-execution-optimizer';

// Load test environment variables
loadTestEnv();

let prisma: PrismaClient;
let redis: Redis;
let useOptimizations = process.env.USE_TEST_OPTIMIZATIONS !== 'false';

// Global setup
beforeAll(async () => {
  try {
    // Database setup
    prisma = await setupTestDatabase();
    
    // Redis setup
    redis = await setupTestRedis();
    
    // Initialize test optimizer
    if (useOptimizations) {
      await initializeTestOptimizer();
      console.log('Test optimizations enabled');
    }
    
    // Global test timeout
    const timeout = parseInt(process.env.TEST_TIMEOUT || '30000', 10);
    jest.setTimeout(timeout);
    
    // Make available globally
    (global as any).prisma = prisma;
    (global as any).redis = redis;
    
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }
});

// Global teardown
afterAll(async () => {
  try {
    // Save test optimizer state
    if (useOptimizations) {
      await saveTestOptimizer();
      console.log('Test optimization state saved');
    }
    
    await disconnectTestDatabase();
    await disconnectTestRedis();
    console.log('Test environment teardown complete');
  } catch (error) {
    console.error('Error during test teardown:', error);
  }
});

// Setup before each test
beforeEach(async () => {
  try {
    if (useOptimizations) {
      // Use optimized setup (begin transaction)
      await setupOptimizedTest();
    }
  } catch (error) {
    console.error('Error during test setup:', error);
    // Don't throw to avoid breaking test execution
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    if (useOptimizations) {
      // Use optimized cleanup (transaction rollback + pipeline operations)
      await cleanupOptimizedTest();
    } else {
      // Use standard cleanup
      await cleanupTestDatabase();
      await cleanupTestRedis();
    }
  } catch (error) {
    console.error('Error during test cleanup:', error);
    // Don't throw to avoid breaking test execution
  }
});
