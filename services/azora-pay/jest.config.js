module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '*.js',
    '!server.js'  // Exclude server.js as it's the entry point
  ],
  verbose: true,
  testTimeout: 10000
};