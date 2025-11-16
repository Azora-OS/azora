import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '3m', target: 50 },    // Stay at 50 users
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '2m', target: 200 },   // Stay at 200 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'],                   // <1% errors
    errors: ['rate<0.05'],                            // <5% errors
    api_duration: ['p(95)<400'],                      // API calls under 400ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

// Test data
const testUsers = [
  { email: 'test1@azora.world', password: 'Test123!' },
  { email: 'test2@azora.world', password: 'Test123!' },
  { email: 'test3@azora.world', password: 'Test123!' },
];

export function setup() {
  // Setup: Create test users if needed
  console.log('Setting up load test...');
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  let authToken = null;

  // Group 1: Authentication
  group('Authentication', () => {
    const loginRes = http.post(`${data.baseUrl}/api/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Login' },
    });

    const loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => r.json('token') !== undefined,
      'login response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (loginSuccess) {
      authToken = loginRes.json('token');
      successfulRequests.add(1);
      apiDuration.add(loginRes.timings.duration);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
      return; // Skip rest if login fails
    }
  });

  sleep(1);

  // Group 2: Course Browsing
  group('Course Browsing', () => {
    const coursesRes = http.get(`${data.baseUrl}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      tags: { name: 'GetCourses' },
    });

    const coursesSuccess = check(coursesRes, {
      'courses status is 200': (r) => r.status === 200,
      'courses has data': (r) => r.json('courses') !== undefined,
      'courses response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (coursesSuccess) {
      successfulRequests.add(1);
      apiDuration.add(coursesRes.timings.duration);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(2);

  // Group 3: User Profile
  group('User Profile', () => {
    const profileRes = http.get(`${data.baseUrl}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      tags: { name: 'GetProfile' },
    });

    const profileSuccess = check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => r.json('user') !== undefined,
      'profile response time < 200ms': (r) => r.timings.duration < 200,
    });

    if (profileSuccess) {
      successfulRequests.add(1);
      apiDuration.add(profileRes.timings.duration);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);

  // Group 4: Wallet Balance
  group('Wallet Operations', () => {
    const walletRes = http.get(`${data.baseUrl}/api/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      tags: { name: 'GetWalletBalance' },
    });

    const walletSuccess = check(walletRes, {
      'wallet status is 200': (r) => r.status === 200,
      'wallet has balance': (r) => r.json('balance') !== undefined,
      'wallet response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (walletSuccess) {
      successfulRequests.add(1);
      apiDuration.add(walletRes.timings.duration);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(2);

  // Group 5: Job Marketplace
  group('Job Marketplace', () => {
    const jobsRes = http.get(`${data.baseUrl}/api/jobs?limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      tags: { name: 'GetJobs' },
    });

    const jobsSuccess = check(jobsRes, {
      'jobs status is 200': (r) => r.status === 200,
      'jobs has data': (r) => r.json('jobs') !== undefined,
      'jobs response time < 400ms': (r) => r.timings.duration < 400,
    });

    if (jobsSuccess) {
      successfulRequests.add(1);
      apiDuration.add(jobsRes.timings.duration);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);

  // Group 6: Health Check
  group('System Health', () => {
    const healthRes = http.get(`${data.baseUrl}/api/health`, {
      tags: { name: 'HealthCheck' },
    });

    const healthSuccess = check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 100ms': (r) => r.timings.duration < 100,
    });

    if (healthSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);
}

export function teardown(data) {
  console.log('Load test completed!');
  console.log(`Base URL: ${data.baseUrl}`);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}✓ Test Duration: ${data.state.testRunDurationMs / 1000}s\n`;
  summary += `${indent}✓ Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}✓ Successful: ${data.metrics.successful_requests?.values.count || 0}\n`;
  summary += `${indent}✗ Failed: ${data.metrics.failed_requests?.values.count || 0}\n`;
  summary += `${indent}⏱  Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}⏱  P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}⏱  P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}📊 Error Rate: ${(data.metrics.errors?.values.rate * 100 || 0).toFixed(2)}%\n`;
  
  return summary;
}
