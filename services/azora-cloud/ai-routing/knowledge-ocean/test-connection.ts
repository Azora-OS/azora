/**
 * Quick Connection Test
 * Tests basic connectivity to Pinecone
 */

import { initializePinecone, VectorDBClient } from './index';

async function testConnection() {
  console.log('🧪 Testing Knowledge Ocean Connection...\n');

  try {
    // Test 1: Initialize connection
    console.log('Test 1: Initializing connection...');
    const connection = await initializePinecone();
    console.log('✓ Connection initialized\n');

    // Test 2: Check connection health
    console.log('Test 2: Checking connection health...');
    const isHealthy = await connection.healthCheck();
    if (!isHealthy) {
      throw new Error('Health check failed');
    }
    console.log('✓ Connection is healthy\n');

    // Test 3: Get connection status
    console.log('Test 3: Getting connection status...');
    const status = connection.getConnectionStatus();
    console.log('✓ Status:', JSON.stringify(status, null, 2), '\n');

    // Test 4: Check if index exists
    console.log('Test 4: Checking if index exists...');
    const indexName = process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean';
    const exists = await connection.indexExists(indexName);
    if (!exists) {
      console.log(`⚠️  Index "${indexName}" does not exist`);
      console.log('   Run setup script to create it: npm run setup:knowledge-ocean\n');
    } else {
      console.log(`✓ Index "${indexName}" exists\n`);
    }

    // Test 5: Create client and get stats
    if (exists) {
      console.log('Test 5: Getting index statistics...');
      const client = new VectorDBClient(connection);
      const stats = await client.getStats();
      console.log('✓ Index stats:', JSON.stringify(stats, null, 2), '\n');
    }

    console.log('✅ All tests passed!\n');
    console.log('Next steps:');
    console.log('1. Start ingesting documents');
    console.log('2. Test vector search');
    console.log('3. Implement 70/30 retriever\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has correct credentials');
    console.error('2. Verify Pinecone service is accessible');
    console.error('3. Run setup script: npm run setup:knowledge-ocean\n');
    process.exit(1);
  }
}

// Run tests
testConnection();
