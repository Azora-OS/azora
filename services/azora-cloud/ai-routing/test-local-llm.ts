/**
 * Simple test runner for Local LLM Service
 * Bypasses jest configuration issues
 */

import { LocalLLMService } from './local-llm-service';
import { RoutingTier } from './types';

async function runTests() {
  console.log('🧪 Testing Local LLM Service...\n');

  const service = new LocalLLMService();
  let passedTests = 0;
  let failedTests = 0;

  try {
    // Test 1: Initialization
    console.log('Test 1: Initialization with default config');
    const status = service.getStatus();
    if (status.model === 'llama' && status.quantization === 'q4') {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 2: Model loading
    console.log('Test 2: Model loading');
    if (!service.isReady()) {
      await service.initialize();
      if (service.isReady()) {
        console.log('✅ PASSED\n');
        passedTests++;
      } else {
        console.log('❌ FAILED\n');
        failedTests++;
      }
    }

    // Test 3: Query processing
    console.log('Test 3: Query processing');
    const response = await service.processQuery({
      query: 'Hello',
      userId: 'user-123'
    });

    if (
      response.id &&
      response.content &&
      response.routingTier === RoutingTier.LOCAL_LLM &&
      response.cost === 0 &&
      !response.cached
    ) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 4: Caching
    console.log('Test 4: Response caching');
    const query = { query: 'What is Azora?' };
    const firstResponse = await service.processQuery(query);
    const secondResponse = await service.processQuery(query);

    if (!firstResponse.cached && secondResponse.cached && firstResponse.content === secondResponse.content) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 5: FAQ handling
    console.log('Test 5: FAQ query handling');
    const faqResponse = await service.processQuery({
      query: 'How do I start with Azora?'
    });

    if (faqResponse.content.toLowerCase().includes('start')) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 6: Token-related queries
    console.log('Test 6: Token-related query handling');
    const tokenResponse = await service.processQuery({
      query: 'What are AZR tokens?'
    });

    if (tokenResponse.content.toLowerCase().includes('token')) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 7: Factual queries
    console.log('Test 7: Factual query handling');
    const factualResponse = await service.processQuery({
      query: 'What is the capital of France?'
    });

    if (factualResponse.content.includes('Paris')) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 8: Unknown queries
    console.log('Test 8: Unknown query handling');
    const unknownResponse = await service.processQuery({
      query: 'xyzabc unknown query'
    });

    if (unknownResponse.content && unknownResponse.content.length > 0) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 9: Metadata inclusion
    console.log('Test 9: Response metadata');
    const metadataResponse = await service.processQuery({
      query: 'Test query'
    });

    if (
      metadataResponse.metadata?.model === 'llama' &&
      metadataResponse.metadata?.quantization === 'q4' &&
      metadataResponse.metadata?.tokensGenerated > 0
    ) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 10: Zero cost
    console.log('Test 10: Zero cost for local LLM');
    const costResponse = await service.processQuery({
      query: 'Test query'
    });

    if (costResponse.cost === 0) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 11: Response time
    console.log('Test 11: Response time performance');
    const perfResponse = await service.processQuery({
      query: 'Test query'
    });

    if (perfResponse.responseTime < 500) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 12: Cache statistics
    console.log('Test 12: Cache statistics');
    const stats = service.getCacheStats();
    if (stats.size > 0 && stats.maxSize === 1000 && stats.utilizationPercent >= 0) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 13: Cache clearing
    console.log('Test 13: Cache clearing');
    service.clearCache();
    const clearedStats = service.getCacheStats();
    if (clearedStats.size === 0) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 14: Model unloading
    console.log('Test 14: Model unloading');
    await service.unload();
    if (!service.isReady()) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Test 15: Reinitialization
    console.log('Test 15: Reinitialization after unload');
    await service.initialize();
    if (service.isReady()) {
      console.log('✅ PASSED\n');
      passedTests++;
    } else {
      console.log('❌ FAILED\n');
      failedTests++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
    console.log('='.repeat(50));

    if (failedTests === 0) {
      console.log('✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  }
}

runTests();
