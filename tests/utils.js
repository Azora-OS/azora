// Test utilities for Azora OS
const { PrismaClient } = require('@prisma/client');

class TestUtils {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async setupTestDb() {
    // Setup test database
    console.log('🗜️ Setting up test database...');
  }

  async cleanupTestDb() {
    // Cleanup test database
    console.log('🧹 Cleaning up test database...');
    await this.prisma.$disconnect();
  }

  generateTestUser() {
    return {
      id: 'test-user-' + Date.now(),
      email: 'test@azora.world',
      name: 'Ubuntu Test User'
    };
  }

  async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {return true;}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Condition not met within timeout');
  }

  mockUbuntuResponse(service) {
    return {
      status: 'healthy',
      service,
      ubuntu: 'I serve because we prosper together',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TestUtils;