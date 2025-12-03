import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Warm up
    { duration: '3m', target: 100 },   // Normal load
    { duration: '2m', target: 200 },   // Peak load
    { duration: '2m', target: 200 },   // Sustain peak
    { duration: '1m', target: 0 },     // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms, 99% under 1s
    'http_req_failed': ['rate<0.01'],                   // <1% errors
    'errors': ['rate<0.05'],                            // <5% custom errors
    'api_duration': ['p(95)<400'],                      // API specific threshold
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

// Test data
const testUser = {
  email: `test-${Date.now()}@test.azora`,
  password: 'Test123!@#',
};

export function setup() {
  // Register test user
  const res = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  return { token: res.json('token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Test 1: Health check
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    if (!success) {errorRate.add(1);}
    else {successfulRequests.add(1);}
    
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 2: Get courses
  group('Browse Courses', () => {
    const res = http.get(`${BASE_URL}/api/courses`, { headers });
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has courses': (r) => r.json('courses') !== undefined,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    if (!success) {errorRate.add(1);}
    else {successfulRequests.add(1);}
    
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 3: Get user profile
  group('User Profile', () => {
    const res = http.get(`${BASE_URL}/api/auth/profile`, { headers });
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has user data': (r) => r.json('user') !== undefined,
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    if (!success) {errorRate.add(1);}
    else {successfulRequests.add(1);}
    
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 4: Get wallet balance
  group('Wallet Balance', () => {
    const res = http.get(`${BASE_URL}/api/wallet/balance`, { headers });
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has balance': (r) => r.json('balance') !== undefined,
      'response time < 400ms': (r) => r.timings.duration < 400,
    });
    
    if (!success) {errorRate.add(1);}
    else {successfulRequests.add(1);}
    
    apiDuration.add(res.timings.duration);
  });

  sleep(2);
}

export function teardown(data) {
  // Cleanup test data if needed
  console.log('Test completed');
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors;
  
  return `
${indent}Test Summary:
${indent}  Duration: ${data.state.testRunDurationMs}ms
${indent}  Requests: ${data.metrics.http_reqs.values.count}
${indent}  Success Rate: ${(100 - data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
${indent}  Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}  P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}  P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
  `;
}
