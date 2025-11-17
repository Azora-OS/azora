module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'packages/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/services/**/tests/**/*.test.js'
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html', 'json-summary']
};