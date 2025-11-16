import { faker } from '@faker-js/faker';

export interface TestCourse {
  id?: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
  currency: 'AZR' | 'USD';
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  published?: boolean;
  createdAt?: Date;
}

export const courseFactory = {
  build: (overrides: Partial<TestCourse> = {}): TestCourse => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    instructorId: faker.string.uuid(),
    price: faker.number.int({ min: 10, max: 500 }),
    currency: 'AZR',
    duration: faker.number.int({ min: 1, max: 40 }),
    level: 'beginner',
    published: true,
    createdAt: new Date(),
    ...overrides,
  }),

  buildMany: (count: number, overrides: Partial<TestCourse> = {}): TestCourse[] => {
    return Array.from({ length: count }, () => courseFactory.build(overrides));
  },

  buildBeginner: (overrides: Partial<TestCourse> = {}): TestCourse => {
    return courseFactory.build({ level: 'beginner', ...overrides });
  },

  buildIntermediate: (overrides: Partial<TestCourse> = {}): TestCourse => {
    return courseFactory.build({ level: 'intermediate', ...overrides });
  },

  buildAdvanced: (overrides: Partial<TestCourse> = {}): TestCourse => {
    return courseFactory.build({ level: 'advanced', ...overrides });
  },
};
