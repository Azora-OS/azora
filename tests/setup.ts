import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

let prisma: PrismaClient;
let redis: Redis;

// Global setup
beforeAll(async () => {
  // Database setup
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test',
      },
    },
  });
  
  await prisma.$connect();
  
  // Redis setup
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  // Global test timeout
  jest.setTimeout(10000);
  
  // Make available globally
  (global as any).prisma = prisma;
  (global as any).redis = redis;
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data (only test users)
  const testTables = [
    'User',
    'Course',
    'Enrollment',
    'Transaction',
    'Wallet',
    'Job',
    'Application',
  ];
  
  for (const table of testTables) {
    const model = (prisma as any)[table.toLowerCase()];
    if (model) {
      try {
        await model.deleteMany({
          where: {
            OR: [
              { email: { contains: '@test.azora' } },
              { email: { contains: '@test.com' } },
            ],
          },
        });
      } catch (error) {
        // Table might not have email field, skip
      }
    }
  }
  
  // Clear Redis test keys
  const keys = await redis.keys('test:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.OPENAI_API_KEY = 'sk-test-mock';
