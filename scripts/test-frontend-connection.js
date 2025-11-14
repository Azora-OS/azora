#!/usr/bin/env node

/**
 * Test frontend-backend connection
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:4000';

async function testConnection() {
  console.log('🔌 Testing Frontend-Backend Connection\n');
  console.log(`API Gateway: ${API_URL}\n`);

  const tests = [
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'API Info', url: '/api', method: 'GET' },
    { name: 'Auth Login', url: '/api/auth/login', method: 'POST', data: { email: 'test@azora.world', password: 'test123' } },
    { name: 'Courses List', url: '/api/courses', method: 'GET' },
    { name: 'Wallet', url: '/api/wallet', method: 'GET', requiresAuth: true }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: `${API_URL}${test.url}`,
        timeout: 5000
      };

      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      console.log(`✅ ${test.name}: ${response.status}`);
      passed++;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Connection refused (service not running)`);
      } else if (error.response) {
        console.log(`⚠️  ${test.name}: ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n💡 To fix:');
    console.log('1. Start API Gateway: cd services/api-gateway && npm start');
    console.log('2. Start backend services: cd production && docker-compose up');
    console.log('3. Check .env file has NEXT_PUBLIC_API_URL=http://localhost:4000');
  }

  process.exit(failed > 0 ? 1 : 0);
}

testConnection();
