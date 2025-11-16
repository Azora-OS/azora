import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const dbQueryErrorRate = new Rate('db_query_errors');
const dbQueryDuration = new Trend('db_query_duration');

// Test configuration for database load testing
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Ramp up to 10 concurrent DB operations
    { duration: '3m', target: 10 },    // Stay at 10
    { duration: '1m', target: 25 },    // Ramp up to 25
    { duration: '3m', target: 25 },    // Stay at 25
    { duration: '1m', target: 50 },    // Ramp up to 50
    { duration: '2m', target: 50 },    // Stay at 50
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    db_query_duration: ['p(95)<100', 'p(99)<200'],  // DB queries under 100ms 95%, 200ms 99%
    db_query_errors: ['rate<0.01'],                  // <1% DB errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

// Test data for database operations
const testUsers = Array.from({ length: 100 }, (_, i) => ({
  email: `loadtest${i}@azora.world`,
  password: 'Test123!',
}));

export function setup() {
  console.log('Setting up database load test...');
  // Could create test data here if needed
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  let authToken = null;

  // Authenticate first
  const loginRes = http.post(`${data.baseUrl}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    authToken = loginRes.json('token');
  } else {
    // Skip if login fails
    sleep(1);
    return;
  }

  // Simulate database-intensive operations
  const operations = [
    () => testUserQueries(data.baseUrl, authToken),
    () => testCourseQueries(data.baseUrl, authToken),
    () => testWalletQueries(data.baseUrl, authToken),
    () => testJobQueries(data.baseUrl, authToken),
    () => testAssessmentQueries(data.baseUrl, authToken),
  ];

  // Execute random operations
  const operation = operations[Math.floor(Math.random() * operations.length)];
  operation();

  sleep(0.5);
}

function testUserQueries(baseUrl, token) {
  const start = new Date().getTime();

  const res = http.get(`${baseUrl}/api/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const duration = new Date().getTime() - start;
  dbQueryDuration.add(duration);

  const success = check(res, {
    'user query status is 200': (r) => r.status === 200,
    'user query has data': (r) => r.json('user') !== undefined,
  });

  dbQueryErrorRate.add(!success);
}

function testCourseQueries(baseUrl, token) {
  const start = new Date().getTime();

  const res = http.get(`${baseUrl}/api/courses?limit=20&include=enrollments`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const duration = new Date().getTime() - start;
  dbQueryDuration.add(duration);

  const success = check(res, {
    'courses query status is 200': (r) => r.status === 200,
    'courses query has data': (r) => r.json('courses') !== undefined,
  });

  dbQueryErrorRate.add(!success);
}

function testWalletQueries(baseUrl, token) {
  const start = new Date().getTime();

  const res = http.get(`${baseUrl}/api/wallet/transactions?limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const duration = new Date().getTime() - start;
  dbQueryDuration.add(duration);

  const success = check(res, {
    'wallet query status is 200': (r) => r.status === 200,
    'wallet query has data': (r) => r.json('transactions') !== undefined,
  });

  dbQueryErrorRate.add(!success);
}

function testJobQueries(baseUrl, token) {
  const start = new Date().getTime();

  const res = http.get(`${baseUrl}/api/jobs?limit=15&include=applications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const duration = new Date().getTime() - start;
  dbQueryDuration.add(duration);

  const success = check(res, {
    'jobs query status is 200': (r) => r.status === 200,
    'jobs query has data': (r) => r.json('jobs') !== undefined,
  });

  dbQueryErrorRate.add(!success);
}

function testAssessmentQueries(baseUrl, token) {
  const start = new Date().getTime();

  const res = http.get(`${baseUrl}/api/assessments?status=completed&limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const duration = new Date().getTime() - start;
  dbQueryDuration.add(duration);

  const success = check(res, {
    'assessments query status is 200': (r) => r.status === 200,
    'assessments query has data': (r) => r.json('assessments') !== undefined,
  });

  dbQueryErrorRate.add(!success);
}

export function handleSummary(data) {
  return {
    'database-load-test-summary.json': JSON.stringify(data),
    stdout: `
Database Load Test Results:
===========================
Duration: ${data.state.testRunDurationMs / 1000}s
Total DB Operations: ${data.metrics.db_query_duration.values.count}
Avg DB Query Time: ${data.metrics.db_query_duration.values.avg.toFixed(2)}ms
P95 DB Query Time: ${data.metrics.db_query_duration.values['p(95)'].toFixed(2)}ms
P99 DB Query Time: ${data.metrics.db_query_duration.values['p(99)'].toFixed(2)}ms
DB Error Rate: ${(data.metrics.db_query_errors?.values.rate * 100 || 0).toFixed(2)}%
`,
  };
}