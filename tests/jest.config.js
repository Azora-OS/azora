module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/services/**/tests/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'services/**/*.ts',
    '!services/**/*.d.ts',
    '!services/**/node_modules/**',
    '!services/**/dist/**',
    '!services/**/build/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coverageDirectory: '<rootDir>/tests/coverage',
  testTimeout: 30000,
  verbose: true,
};
