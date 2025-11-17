import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'https://api.azora.io';

interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: SmokeTestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function smokeTests() {
  console.log('🔥 Starting Production Smoke Tests\n');

  // Health checks
  await runTest('API Gateway Health', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.status !== 200) throw new Error('Health check failed');
  });

  await runTest('Constitutional AI Service', async () => {
    const res = await axios.get(`${API_BASE}/constitutional-ai/health`);
    if (res.status !== 200) throw new Error('Constitutional AI unhealthy');
  });

  await runTest('Knowledge Ocean Service', async () => {
    const res = await axios.get(`${API_BASE}/knowledge-ocean/health`);
    if (res.status !== 200) throw new Error('Knowledge Ocean unhealthy');
  });

  await runTest('AI Routing Service', async () => {
    const res = await axios.get(`${API_BASE}/ai-routing/health`);
    if (res.status !== 200) throw new Error('AI Routing unhealthy');
  });

  // Database connectivity
  await runTest('Database Connectivity', async () => {
    const res = await axios.get(`${API_BASE}/health/database`);
    if (res.status !== 200) throw new Error('Database connection failed');
  });

  // Redis connectivity
  await runTest('Redis Connectivity', async () => {
    const res = await axios.get(`${API_BASE}/health/redis`);
    if (res.status !== 200) throw new Error('Redis connection failed');
  });

  // Core API endpoints
  await runTest('Authentication Endpoint', async () => {
    const res = await axios.post(`${API_BASE}/auth/health`, {});
    if (res.status !== 200 && res.status !== 401) throw new Error('Auth endpoint failed');
  });

  await runTest('Query Routing Endpoint', async () => {
    const res = await axios.post(`${API_BASE}/query/route`, {
      query: 'test',
      userId: 'smoke-test'
    });
    if (res.status !== 200) throw new Error('Query routing failed');
  });

  await runTest('Constitutional Validation Endpoint', async () => {
    const res = await axios.post(`${API_BASE}/constitutional/validate`, {
      query: 'test',
      output: 'test output'
    });
    if (res.status !== 200) throw new Error('Constitutional validation failed');
  });

  await runTest('Knowledge Ocean Retrieval', async () => {
    const res = await axios.post(`${API_BASE}/knowledge-ocean/retrieve`, {
      query: 'test query'
    });
    if (res.status !== 200) throw new Error('Knowledge Ocean retrieval failed');
  });

  // Performance checks
  await runTest('API Response Time <500ms', async () => {
    const start = Date.now();
    await axios.get(`${API_BASE}/health`);
    const duration = Date.now() - start;
    if (duration > 500) throw new Error(`Response time ${duration}ms exceeds 500ms`);
  });

  await runTest('Routing Decision <50ms', async () => {
    const start = Date.now();
    await axios.post(`${API_BASE}/query/route`, {
      query: 'test',
      userId: 'smoke-test'
    });
    const duration = Date.now() - start;
    if (duration > 50) throw new Error(`Routing time ${duration}ms exceeds 50ms`);
  });

  // Security checks
  await runTest('HTTPS Enforced', async () => {
    try {
      await axios.get(`http://api.azora.io/health`);
      throw new Error('HTTP not redirected to HTTPS');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 301) {
        return;
      }
      throw error;
    }
  });

  await runTest('Security Headers Present', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    const headers = res.headers;
    if (!headers['strict-transport-security']) throw new Error('Missing HSTS header');
    if (!headers['x-content-type-options']) throw new Error('Missing X-Content-Type-Options');
    if (!headers['x-frame-options']) throw new Error('Missing X-Frame-Options');
  });

  await runTest('Rate Limiting Active', async () => {
    const requests = Array(100).fill(null);
    let rateLimited = false;

    for (const _ of requests) {
      try {
        await axios.get(`${API_BASE}/health`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          rateLimited = true;
          break;
        }
      }
    }

    if (!rateLimited) throw new Error('Rate limiting not active');
  });

  // Data integrity checks
  await runTest('Database Migrations Applied', async () => {
    const res = await axios.get(`${API_BASE}/health/migrations`);
    if (res.status !== 200) throw new Error('Migrations not applied');
  });

  await runTest('Cache Operational', async () => {
    const res = await axios.get(`${API_BASE}/health/cache`);
    if (res.status !== 200) throw new Error('Cache not operational');
  });

  // External service connectivity
  await runTest('Stripe Integration', async () => {
    const res = await axios.get(`${API_BASE}/health/stripe`);
    if (res.status !== 200) throw new Error('Stripe integration failed');
  });

  await runTest('Pinecone Integration', async () => {
    const res = await axios.get(`${API_BASE}/health/pinecone`);
    if (res.status !== 200) throw new Error('Pinecone integration failed');
  });

  await runTest('OpenAI Integration', async () => {
    const res = await axios.get(`${API_BASE}/health/openai`);
    if (res.status !== 200) throw new Error('OpenAI integration failed');
  });

  // Monitoring
  await runTest('Prometheus Metrics Available', async () => {
    const res = await axios.get(`${API_BASE}/metrics`);
    if (res.status !== 200) throw new Error('Metrics endpoint failed');
  });

  await runTest('Logging Operational', async () => {
    const res = await axios.get(`${API_BASE}/health/logging`);
    if (res.status !== 200) throw new Error('Logging not operational');
  });

  // Report
  console.log('\n📊 Smoke Test Results\n');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  console.log(`Passed: ${passed}/${total}`);
  console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);

  if (passed < total) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed!');
    process.exit(0);
  }
}

smokeTests().catch(error => {
  console.error('Smoke test suite failed:', error);
  process.exit(1);
});
