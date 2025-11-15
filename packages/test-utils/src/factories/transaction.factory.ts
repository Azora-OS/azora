import { faker } from '@faker-js/faker';

export interface TestTransaction {
  id?: string;
  userId: string;
  amount: number;
  currency: 'AZR' | 'USD' | 'BTC' | 'ETH';
  type: 'MINING' | 'PURCHASE' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  metadata?: Record<string, any>;
}

export const transactionFactory = {
  build: (overrides?: Partial<TestTransaction>): TestTransaction => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    amount: faker.number.float({ min: 0.01, max: 1000, fractionDigits: 2 }),
    currency: 'AZR',
    type: 'MINING',
    status: 'COMPLETED',
    metadata: {},
    ...overrides,
  }),

  buildMany: (count: number, overrides?: Partial<TestTransaction>): TestTransaction[] => {
    return Array.from({ length: count }, () => transactionFactory.build(overrides));
  },

  buildMining: (overrides?: Partial<TestTransaction>): TestTransaction => {
    return transactionFactory.build({ type: 'MINING', currency: 'AZR', ...overrides });
  },

  buildPurchase: (overrides?: Partial<TestTransaction>): TestTransaction => {
    return transactionFactory.build({ type: 'PURCHASE', ...overrides });
  },

  buildPending: (overrides?: Partial<TestTransaction>): TestTransaction => {
    return transactionFactory.build({ status: 'PENDING', ...overrides });
  },
};
