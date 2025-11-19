// Global test setup for Azora OS
import TestUtils from './utils.js';

global.testUtils = new TestUtils();

beforeAll(async () => {
  console.log('🚀 Starting Ubuntu test suite...');
  await global.testUtils.setupTestDb();
});

afterAll(async () => {
  console.log('✨ Ubuntu test suite complete!');
  await global.testUtils.cleanupTestDb();
});

// Ubuntu test matchers
expect.extend({
  toBeUbuntuHealthy(received) {
    const pass = received.status === 'healthy' && 
                 received.ubuntu === 'I serve because we prosper together';
    return {
      message: () => `Expected Ubuntu healthy response`,
      pass
    };
  }
});