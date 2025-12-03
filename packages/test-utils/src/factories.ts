import { faker } from '@faker-js/faker';

export const userFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

export const courseFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    instructorId: faker.string.uuid(),
    price: faker.number.int({ min: 0, max: 1000 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

export const transactionFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    amount: faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
    currency: 'AZR',
    type: 'CREDIT',
    status: 'COMPLETED',
    createdAt: new Date(),
    ...overrides,
  }),
};
