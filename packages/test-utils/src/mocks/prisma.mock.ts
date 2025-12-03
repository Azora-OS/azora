import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>() as MockPrismaClient;

beforeEach(() => {
  mockReset(prismaMock);
});

export const createMockPrismaClient = (): MockPrismaClient => {
  return mockDeep<PrismaClient>() as MockPrismaClient;
};
