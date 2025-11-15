import { PrismaClient } from '@prisma/client';

export const dbHelper = {
  cleanupTestData: async (prisma: PrismaClient) => {
    const tables = ['User', 'Course', 'Enrollment', 'Transaction', 'Wallet'];
    
    for (const table of tables) {
      const model = (prisma as any)[table.toLowerCase()];
      if (model) {
        await model.deleteMany({
          where: {
            OR: [
              { email: { contains: '@test.azora' } },
              { email: { contains: '@test.' } },
            ],
          },
        });
      }
    }
  },

  createTestDatabase: async (prisma: PrismaClient) => {
    // Run migrations
    // This would typically be done in CI/CD
  },

  seedTestData: async (prisma: PrismaClient, data: any) => {
    // Seed specific test data
    return data;
  },

  resetSequences: async (prisma: PrismaClient) => {
    // Reset auto-increment sequences if needed
  },
};
