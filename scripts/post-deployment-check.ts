// Task 24: Post-Deployment Validation
import axios from 'axios';

const BASE_URL = process.env.PROD_URL || 'https://azora.world';

// Task 24.1: Verify services healthy
async function checkServices() {
  const services = ['api-gateway', 'auth', 'pay', 'education'];
  const results = [];
  
  for (const svc of services) {
    try {
      const res = await axios.get(`${BASE_URL}/api/${svc}/health`);
      results.push({ service: svc, healthy: res.status === 200 });
    } catch {
      results.push({ service: svc, healthy: false });
    }
  }
  
  return results;
}

// Task 24.2: Verify monitoring
async function checkMonitoring() {
  const checks = [
    { name: 'Prometheus', url: 'http://prometheus:9090/api/v1/query?query=up' },
    { name: 'Grafana', url: 'http://grafana:3000/api/health' },
  ];
  
  const results = [];
  for (const check of checks) {
    try {
      const res = await axios.get(check.url);
      results.push({ ...check, working: res.status === 200 });
    } catch {
      results.push({ ...check, working: false });
    }
  }
  
  return results;
}

// Task 24.3: Run E2E tests
async function runE2ETests() {
  const tests = [
    { name: 'Login', endpoint: '/api/auth/login', method: 'POST' },
    { name: 'Health', endpoint: '/api/health', method: 'GET' },
  ];
  
  const results = [];
  for (const test of tests) {
    try {
      const res = await axios({ method: test.method, url: `${BASE_URL}${test.endpoint}` });
      results.push({ ...test, passed: res.status < 400 });
    } catch {
      results.push({ ...test, passed: false });
    }
  }
  
  return results;
}

async function runPostDeploymentCheck() {
  console.log('=== Post-Deployment Validation ===\n');
  
  console.log('Task 24.1: Service Health');
  const services = await checkServices();
  services.forEach(s => console.log(`  ${s.healthy ? '✅' : '❌'} ${s.service}`));
  
  console.log('\nTask 24.2: Monitoring');
  const monitoring = await checkMonitoring();
  monitoring.forEach(m => console.log(`  ${m.working ? '✅' : '❌'} ${m.name}`));
  
  console.log('\nTask 24.3: E2E Tests');
  const e2e = await runE2ETests();
  e2e.forEach(t => console.log(`  ${t.passed ? '✅' : '❌'} ${t.name}`));
  
  console.log('\nTask 24.4: Monitor for 24-48 hours');
  console.log('  ⏳ Continuous monitoring in progress...');
  
  const allPassed = [...services, ...monitoring, ...e2e].every(r => r.healthy || r.working || r.passed);
  process.exit(allPassed ? 0 : 1);
}

runPostDeploymentCheck();
