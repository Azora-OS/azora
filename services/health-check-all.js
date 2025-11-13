#!/usr/bin/env node
/**
 * Azora OS Health Check - All Services
 * Checks health status of all running services
 */

const http = require('http');

const services = [
  { name: 'API Gateway', port: 4000 },
  { name: 'Auth Service', port: 3001 },
  { name: 'AI Ethics Monitor', port: 3010 },
  { name: 'AI Enhancement', port: 3020 },
  { name: 'AI ML Service', port: 3021 },
  { name: 'AI Orchestrator', port: 3022 },
  { name: 'Airtime Rewards', port: 3023 },
  { name: 'API Integration', port: 3024 },
  { name: 'Blockchain', port: 3025 },
  { name: 'Database', port: 3026 },
  { name: 'DevOps', port: 3027 },
  { name: 'DNA Service', port: 3028 },
  { name: 'Documentation', port: 3029 },
  { name: 'Email', port: 3030 },
  { name: 'Enterprise', port: 3031 },
  { name: 'Global', port: 3032 },
  { name: 'Governance', port: 3033 },
  { name: 'Logger', port: 3034 },
  { name: 'Master UI', port: 3035 },
  { name: 'Mobile', port: 3036 },
  { name: 'Notification', port: 3037 },
  { name: 'Payment Gateway', port: 3038 },
  { name: 'Payment Service', port: 3039 },
  { name: 'Student Earnings', port: 3040 },
  { name: 'Testing', port: 3041 },
  { name: 'UI Enhancement', port: 3042 }
];

function checkHealth(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            name: service.name,
            port: service.port,
            status: 'healthy',
            statusCode: res.statusCode,
            response: health
          });
        } catch (e) {
          resolve({
            name: service.name,
            port: service.port,
            status: 'unhealthy',
            statusCode: res.statusCode,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        name: service.name,
        port: service.port,
        status: 'down',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        port: service.port,
        status: 'timeout',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log('🏥 Azora OS - Health Check\n');
  console.log('═'.repeat(80));
  console.log('');

  const results = await Promise.all(services.map(checkHealth));

  const healthy = results.filter(r => r.status === 'healthy');
  const unhealthy = results.filter(r => r.status === 'unhealthy');
  const down = results.filter(r => r.status === 'down');
  const timeout = results.filter(r => r.status === 'timeout');

  // Display results
  console.log('✅ HEALTHY SERVICES:\n');
  healthy.forEach(r => {
    console.log(`   ✓ ${r.name.padEnd(25)} Port: ${r.port}  Status: ${r.statusCode}`);
  });

  if (unhealthy.length > 0) {
    console.log('\n⚠️  UNHEALTHY SERVICES:\n');
    unhealthy.forEach(r => {
      console.log(`   ! ${r.name.padEnd(25)} Port: ${r.port}  Error: ${r.error}`);
    });
  }

  if (down.length > 0) {
    console.log('\n❌ DOWN SERVICES:\n');
    down.forEach(r => {
      console.log(`   ✗ ${r.name.padEnd(25)} Port: ${r.port}  Error: ${r.error}`);
    });
  }

  if (timeout.length > 0) {
    console.log('\n⏱️  TIMEOUT SERVICES:\n');
    timeout.forEach(r => {
      console.log(`   ⊗ ${r.name.padEnd(25)} Port: ${r.port}  Error: ${r.error}`);
    });
  }

  console.log('\n' + '═'.repeat(80));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Total Services:    ${services.length}`);
  console.log(`   ✅ Healthy:        ${healthy.length} (${Math.round(healthy.length/services.length*100)}%)`);
  console.log(`   ⚠️  Unhealthy:      ${unhealthy.length}`);
  console.log(`   ❌ Down:           ${down.length}`);
  console.log(`   ⏱️  Timeout:        ${timeout.length}`);
  console.log('');

  // Exit code based on health
  const exitCode = (unhealthy.length + down.length + timeout.length) > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    console.log('🎉 All services are healthy!\n');
  } else {
    console.log('⚠️  Some services need attention!\n');
  }

  process.exit(exitCode);
}

checkAllServices().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
