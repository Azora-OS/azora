import { faker } from '@faker-js/faker';

export interface TestUser {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'STUDENT' | 'EDUCATOR' | 'ADMIN';
  isVerified?: boolean;
}

export const userFactory = {
  build: (overrides?: Partial<TestUser>): TestUser => ({
    id: faker.string.uuid(),
    email: faker.internet.email({ provider: 'test.azora' }),
    password: 'Test123!@#',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'STUDENT',
    isVerified: true,
    ...overrides,
  }),

  buildMany: (count: number, overrides?: Partial<TestUser>): TestUser[] => {
    return Array.from({ length: count }, () => userFactory.build(overrides));
  },

  buildStudent: (overrides?: Partial<TestUser>): TestUser => {
    return userFactory.build({ role: 'STUDENT', ...overrides });
  },

  buildEducator: (overrides?: Partial<TestUser>): TestUser => {
    return userFactory.build({ role: 'EDUCATOR', ...overrides });
  },

  buildAdmin: (overrides?: Partial<TestUser>): TestUser => {
    return userFactory.build({ role: 'ADMIN', ...overrides });
  },
};
