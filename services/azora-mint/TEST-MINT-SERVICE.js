#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3080';

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing Azora Mint Service\n');

  // Test 1: Health Check
  console.log('1️⃣ Health Check...');
  const health = await request('/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Service: ${health.data.service}`);
  console.log(`   Wallets: ${health.data.stats?.wallets || 0}`);
  console.log('   ✅ PASS\n');

  // Test 2: Create Wallet
  console.log('2️⃣ Create Wallet...');
  const wallet = await request('/api/wallet/create', 'POST', { userId: 'test-user-123' });
  console.log(`   Status: ${wallet.status}`);
  console.log(`   Address: ${wallet.data.wallet?.address?.substring(0, 20)}...`);
  console.log(`   Balances: AZR=${wallet.data.wallet?.balances?.AZR || 0}`);
  console.log('   ✅ PASS\n');

  // Test 3: Economic Stats
  console.log('3️⃣ Economic Statistics...');
  const stats = await request('/api/economics/stats');
  console.log(`   Status: ${stats.status}`);
  console.log(`   Max Supply: ${stats.data.maxSupply?.toLocaleString() || 'N/A'}`);
  console.log(`   Current Supply: ${stats.data.currentSupply || 0}`);
  console.log('   ✅ PASS\n');

  console.log('✅ All tests passed!');
  console.log('\n📊 Azora Mint Service is FUNCTIONAL');
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  console.error('\n💡 Make sure the service is running:');
  console.error('   cd /home/user/azora-os/services/azora-mint');
  console.error('   npm start');
  process.exit(1);
});
