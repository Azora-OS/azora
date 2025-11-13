#!/usr/bin/env node
const http = require('http');

const services = [
  { name: 'API Gateway', port: 4000 },
  { name: 'Auth Service', port: 3001 },
  { name: 'Billing Service', port: 3009 },
  { name: 'Lending Service', port: 3010 },
  { name: 'Exchange Rate', port: 3008 },
  { name: 'Virtual Card', port: 3007 },
  { name: 'KYC/AML', port: 3043 },
  { name: 'Security', port: 3044 },
  { name: 'Course Management', port: 3055 },
  { name: 'Job Matching', port: 3056 },
  { name: 'AI Tutor', port: 3057 },
  { name: 'Assessment', port: 3058 }
];

async function testService(service) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${service.port}/health`, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ...service, status: 'healthy', response: json });
        } catch {
          resolve({ ...service, status: 'error', error: 'Invalid JSON' });
        }
      });
    });
    req.on('error', () => resolve({ ...service, status: 'down', error: 'Connection failed' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ...service, status: 'timeout', error: 'Request timeout' });
    });
  });
}

async function runTests() {
  console.log('🧪 Azora OS - Service Integration Test\n');
  console.log('═'.repeat(70));
  
  const results = await Promise.all(services.map(testService));
  
  const healthy = results.filter(r => r.status === 'healthy');
  const down = results.filter(r => r.status === 'down');
  const errors = results.filter(r => r.status === 'error' || r.status === 'timeout');
  
  console.log('\n✅ HEALTHY SERVICES:\n');
  healthy.forEach(r => console.log(`   ✓ ${r.name.padEnd(20)} Port: ${r.port}`));
  
  if (down.length > 0) {
    console.log('\n❌ DOWN SERVICES:\n');
    down.forEach(r => console.log(`   ✗ ${r.name.padEnd(20)} Port: ${r.port}`));
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERROR SERVICES:\n');
    errors.forEach(r => console.log(`   ! ${r.name.padEnd(20)} Port: ${r.port} - ${r.error}`));
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 RESULTS: ${healthy.length}/${services.length} services healthy (${Math.round(healthy.length/services.length*100)}%)\n`);
  
  process.exit(healthy.length === services.length ? 0 : 1);
}

runTests();
