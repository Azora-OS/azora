// Setup file for AI Family Service tests
console.log('Setting up AI Family Service tests...');

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock external dependencies
jest.mock('../engines/gpt4-integration', () => {
  return {
    isAvailable: jest.fn().mockReturnValue(false),
    chat: jest.fn().mockRejectedValue(new Error('GPT-4 not available in test'))
  };
});

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    familyMember: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'mock-id', name: 'Mock Member' })
    },
    conversation: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'mock-conversation-id' })
    },
    message: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 2 })
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

console.log('AI Family Service test setup complete');
