module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } }
};