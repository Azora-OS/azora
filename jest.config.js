export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    'apps/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/*.d.ts',
    '!**/dist/**',
    '!**/.next/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/services/**/tests/**/*.test.{js,ts}',
    '**/apps/**/tests/**/*.test.{js,ts}',
    '**/packages/**/tests/**/*.test.{js,ts}'
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html', 'json-summary']
};
