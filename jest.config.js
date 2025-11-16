module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    '!**/*.test.{js,ts}',
    '!**/*.spec.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  testMatch: [
    '**/services/**/__tests__/**/*.test.{js,ts}',
    '**/tests/**/*.test.{js,ts}'
  ],
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'json',
    'lcov',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 15000,
  verbose: true,
  bail: false
};
