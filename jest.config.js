module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'packages/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/.next/**'
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
    '**/tests/**/*.test.js',
    '**/services/**/tests/**/*.test.js'
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['text', 'lcov']
};