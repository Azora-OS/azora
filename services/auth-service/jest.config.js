module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.test.ts', '**/__tests__/**/*.test.js', '**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'index.js',
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
  verbose: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }],
    '^.+\\.jsx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/../../tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../$1',
    '^@services/(.*)$': '<rootDir>/../../services/$1',
    '^@packages/(.*)$': '<rootDir>/../../packages/$1',
    '^@tests/(.*)$': '<rootDir>/../../tests/$1',
  },
};