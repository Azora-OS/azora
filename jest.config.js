module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    '!**/*.test.{js,ts}',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/services/**/__tests__/**/*.test.{js,ts}',
    '**/tests/**/*.test.{js,ts}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 15000
};
