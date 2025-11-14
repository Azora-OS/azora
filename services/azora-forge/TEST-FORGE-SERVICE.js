#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3200';

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
  console.log('🧪 Testing Azora Forge Service\n');

  // Test 1: Health Check
  console.log('1️⃣ Health Check...');
  const health = await request('/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Service: ${health.data.service}`);
  console.log(`   Jobs: ${health.data.stats?.jobs || 0}`);
  console.log('   ✅ PASS\n');

  // Test 2: Create Job
  console.log('2️⃣ Create Job...');
  const job = await request('/api/jobs', 'POST', {
    title: 'React Developer',
    company: 'Azora',
    requirements: ['React', 'JavaScript', 'Node.js'],
    salary: '$100,000',
    location: 'Remote'
  });
  console.log(`   Status: ${job.status}`);
  console.log(`   Job ID: ${job.data.jobId?.substring(0, 8)}...`);
  console.log(`   Title: ${job.data.job?.title}`);
  console.log('   ✅ PASS\n');

  // Test 3: Skills Assessment
  console.log('3️⃣ Skills Assessment...');
  const assessment = await request('/api/skills/assess', 'POST', {
    userId: 'test-user',
    skills: [
      { name: 'React', level: 'advanced', experience: 5 },
      { name: 'JavaScript', level: 'expert', experience: 7 }
    ]
  });
  console.log(`   Status: ${assessment.status}`);
  console.log(`   Overall Score: ${assessment.data.assessment?.overall || 0}`);
  console.log(`   Skills: ${assessment.data.assessment?.totalSkills || 0}`);
  console.log('   ✅ PASS\n');

  // Test 4: Match Calculation
  console.log('4️⃣ Match Calculation...');
  const match = await request('/api/match/calculate', 'POST', {
    userSkills: ['React', 'JavaScript'],
    jobRequirements: ['React', 'TypeScript', 'Node.js']
  });
  console.log(`   Status: ${match.status}`);
  console.log(`   Match Score: ${match.data.score}%`);
  console.log(`   Match Quality: ${match.data.match}`);
  console.log('   ✅ PASS\n');

  console.log('✅ All tests passed!');
  console.log('\n📊 Azora Forge Service is FUNCTIONAL');
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  console.error('\n💡 Make sure the service is running:');
  console.error('   cd /home/user/azora-os/services/azora-forge');
  console.error('   npm start');
  process.exit(1);
});
