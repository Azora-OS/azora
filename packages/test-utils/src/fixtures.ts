export const testUser = {
  id: 'test-user-id',
  email: 'test@azora.world',
  name: 'Test User',
  role: 'STUDENT',
};

export const testCourse = {
  id: 'test-course-id',
  title: 'Test Course',
  description: 'Test course description',
  instructorId: 'test-instructor-id',
  price: 100,
};

export const testToken = 'test-jwt-token';

export const testEnv = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-secret',
  NODE_ENV: 'test',
};
