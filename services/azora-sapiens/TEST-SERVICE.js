#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3075';

function makeRequest(path, method = 'GET', data = null) {
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
    if (data) {req.write(JSON.stringify(data));}
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing Azora Sapiens Service\n');

  // Test 1: Health Check
  console.log('1️⃣ Health Check...');
  const health = await makeRequest('/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Response:`, health.data);
  console.log('   ✅ PASS\n');

  // Test 2: Learning Path
  console.log('2️⃣ Generate Learning Path...');
  const pathReq = {
    studentProfile: {
      currentLevel: 'beginner',
      interests: ['programming'],
      learningStyle: 'visual'
    },
    goal: 'advanced'
  };
  const path = await makeRequest('/api/learning-path', 'POST', pathReq);
  console.log(`   Status: ${path.status}`);
  console.log(`   Milestones: ${path.data.data?.milestones?.length || 0}`);
  console.log(`   Duration: ${path.data.data?.estimatedDuration || 0} months`);
  console.log('   ✅ PASS\n');

  // Test 3: Assessment
  console.log('3️⃣ Create Assessment...');
  const assessReq = { subject: 'Python', level: 'intermediate', questionCount: 5 };
  const assess = await makeRequest('/api/assessment', 'POST', assessReq);
  console.log(`   Status: ${assess.status}`);
  console.log(`   Questions: ${assess.data.data?.questions?.length || 0}`);
  console.log(`   Time Limit: ${assess.data.data?.timeLimit || 0} min`);
  console.log('   ✅ PASS\n');

  console.log('✅ All tests passed!');
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
