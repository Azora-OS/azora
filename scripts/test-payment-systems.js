#!/usr/bin/env node

/**
 * Test payment systems
 */

const axios = require('axios');

const AZORA_PAY = 'http://localhost:3003';
const PAYMENT_GATEWAY = 'http://localhost:3038';
const VIRTUAL_CARDS = 'http://localhost:3039';

async function testPaymentSystems() {
  console.log('💰 Testing Payment Systems\n');

  const tests = [
    // Azora Pay
    { name: 'Azora Pay Health', url: `${AZORA_PAY}/health` },
    { name: 'Get Wallet', url: `${AZORA_PAY}/api/wallet`, headers: { 'x-user-id': 'test-user' } },
    { name: 'Earn Tokens', url: `${AZORA_PAY}/api/earn`, method: 'POST', data: { userId: 'test-user', amount: 10, source: 'test' } },
    { name: 'Get Transactions', url: `${AZORA_PAY}/api/transactions`, headers: { 'x-user-id': 'test-user' } },
    
    // Payment Gateway
    { name: 'Payment Gateway Health', url: `${PAYMENT_GATEWAY}/health` },
    
    // Virtual Cards
    { name: 'Virtual Cards Health', url: `${VIRTUAL_CARDS}/health` },
    { name: 'Issue Card', url: `${VIRTUAL_CARDS}/api/cards/issue`, method: 'POST', data: { userId: 'test-user', limit: 1000 } }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const config = {
        method: test.method || 'GET',
        url: test.url,
        timeout: 5000,
        headers: test.headers || {}
      };

      if (test.data) {
        config.data = test.data;
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await axios(config);
      console.log(`✅ ${test.name}: ${response.status}`);
      if (response.data?.data) {
        console.log(`   → ${JSON.stringify(response.data.data).substring(0, 80)}...`);
      }
      passed++;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Service not running`);
      } else if (error.response) {
        console.log(`⚠️  ${test.name}: ${error.response.status}`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n💡 To fix:');
    console.log('1. cd services/azora-pay && npm install && npm start');
    console.log('2. cd services/payment-gateway && npm install && npm start');
    console.log('3. cd services/virtual-cards && npm install && npm start');
  }

  process.exit(failed > 0 ? 1 : 0);
}

testPaymentSystems();
