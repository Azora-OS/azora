/**
 * Global Jest Teardown
 * Cleanup resources after all tests complete
 */

const { globalCleanup } = require('./test-optimization');

module.exports = async () => {
  console.log('🧹 Running global test cleanup...');
  
  try {
    // Cleanup test optimizer resources
    await globalCleanup();
    
    // Additional cleanup if needed
    console.log('✅ Global cleanup completed');
  } catch (error) {
    console.error('❌ Global cleanup failed:', error);
    // Don't fail the test run for cleanup errors
  }
};