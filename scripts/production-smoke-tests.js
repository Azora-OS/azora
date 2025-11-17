#!/usr/bin/env node

const axios = require('axios');
const { execSync } = require('child_process');

console.log('💨 AZORA PRODUCTION SMOKE TESTS');
console.log('===============================\n');

const PROD_BASE_URL = process.env.PROD_BASE_URL || 'https://api.azora.world';
const services = [
  { name: 'api-gateway', port: 4000, path: '/health' },
  { name: 'auth-service', port: 3001, path: '/health' },
  { name: 'azora-education', port: 3010, path: '/api/health' },
  { name: 'azora-mint', port: 3002, path: '/health' },
  { name: 'azora-studyspaces', port: 3009, path: '/health' },
  { name: 'enterprise', port: 3023, path: '/api/health' }
];

let passedTests = 0;
let totalTests = 0;

async function testEndpoint(service, url) {
  totalTests++;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status === 200 && response.data.status === 'healthy') {
      console.log(`✅ ${service}: ${url} - HEALTHY`);
      passedTests++;
      return true;
    }
  } catch (error) {
    console.log(`❌ ${service}: ${url} - FAILED (${error.message})`);
  }
  return false;
}

async function testDatabase() {
  totalTests++;
  try {
    // Test database connectivity via health endpoint
    const response = await axios.get(`${PROD_BASE_URL}/api/db/health`, { timeout: 10000 });
    if (response.status === 200) {
      console.log(`✅ Database: Connection - HEALTHY`);
      passedTests++;
      return true;
    }
  } catch (error) {
    console.log(`❌ Database: Connection - FAILED`);
  }
  return false;
}

async function testExternalServices() {
  const externals = [
    { name: 'Stripe', url: 'https://api.stripe.com/v1' },
    { name: 'OpenAI', test: () => !!process.env.OPENAI_API_KEY }
  ];

  for (const ext of externals) {
    totalTests++;
    try {
      if (ext.test) {
        if (ext.test()) {
          console.log(`✅ ${ext.name}: Configuration - OK`);
          passedTests++;
        } else {
          console.log(`❌ ${ext.name}: Configuration - MISSING`);
        }
      } else {
        const response = await axios.get(ext.url, { timeout: 5000 });
        console.log(`✅ ${ext.name}: Connectivity - OK`);
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${ext.name}: ${error.message}`);
    }
  }
}

async function runSmokeTests() {
  console.log('🔥 Testing critical endpoints...\n');
  
  for (const service of services) {
    const url = `${PROD_BASE_URL.replace('api.', service.name + '.')}${service.path}`;
    await testEndpoint(service.name, url);
  }

  console.log('\n🗄️ Testing database connectivity...\n');
  await testDatabase();

  console.log('\n🌐 Testing external services...\n');
  await testExternalServices();

  console.log('\n📊 SMOKE TEST RESULTS');
  console.log('=====================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);
  
  const allPassed = passedTests === totalTests;
  console.log(`🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🚀 PRODUCTION READY FOR LAUNCH! 🌟');
  } else {
    console.log('\n⚠️ Fix failing tests before production deployment');
  }
}

runSmokeTests().catch(console.error);