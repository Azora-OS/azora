import { faker } from '@faker-js/faker';

export interface TestCourse {
  id?: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
  duration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  isPublished?: boolean;
}

export const courseFactory = {
  build: (overrides?: Partial<TestCourse>): TestCourse => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    instructorId: faker.string.uuid(),
    price: faker.number.int({ min: 0, max: 500 }),
    duration: faker.number.int({ min: 1, max: 40 }),
    level: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: faker.helpers.arrayElement(['Programming', 'Design', 'Business', 'Data Science']),
    isPublished: true,
    ...overrides,
  }),

  buildMany: (count: number, overrides?: Partial<TestCourse>): TestCourse[] => {
    return Array.from({ length: count }, () => courseFactory.build(overrides));
  },

  buildBeginner: (overrides?: Partial<TestCourse>): TestCourse => {
    return courseFactory.build({ level: 'BEGINNER', ...overrides });
  },

  buildFree: (overrides?: Partial<TestCourse>): TestCourse => {
    return courseFactory.build({ price: 0, ...overrides });
  },
};
