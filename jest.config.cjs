module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
    '<rootDir>/tests/utils/test-optimization.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/.next/**',
    '!**/build/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/services/**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.test.{js,ts}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/.archive/',
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/tests/coverage',
  // Optimized parallelization settings
  maxWorkers: process.env.CI ? 4 : '75%',
  // Cache test results for faster subsequent runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Bail after first failure in CI to save time
  bail: process.env.CI ? 1 : 0,
  // Force exit after tests complete
  forceExit: false,
  // Global teardown for cleanup
  globalTeardown: '<rootDir>/tests/utils/global-teardown.js',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    }
  }
};