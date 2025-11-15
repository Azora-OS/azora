import { PrismaClient } from '@prisma/client';
import { createRedisMock } from '@azora/test-utils';

// Global test setup
let prisma: PrismaClient;
let redis: ReturnType<typeof createRedisMock>;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize Prisma for integration tests
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
    await prisma.$connect();
  }
  
  // Initialize Redis mock
  redis = createRedisMock();
  
  // Set global timeout
  jest.setTimeout(10000);
});

afterAll(async () => {
  // Cleanup connections
  if (prisma) {
    await prisma.$disconnect();
  }
  
  if (redis) {
    await redis.flushall();
  }
});

afterEach(async () => {
  // Clean up test data after each test
  if (prisma) {
    const tables = ['User', 'Course', 'Enrollment', 'Transaction', 'Wallet'];
    
    for (const table of tables) {
      const model = (prisma as any)[table.toLowerCase()];
      if (model && model.deleteMany) {
        try {
          await model.deleteMany({
            where: {
              OR: [
                { email: { contains: '@test.azora' } },
                { email: { contains: '@test.' } },
              ],
            },
          });
        } catch (error) {
          // Table might not exist, continue
        }
      }
    }
  }
  
  // Clear Redis test keys
  if (redis) {
    const keys = await redis.keys('test:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Export for use in tests
export { prisma, redis };
