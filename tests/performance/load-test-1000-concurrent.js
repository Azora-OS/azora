import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

/**
 * Load Test: 1000 Concurrent Users
 * 
 * This test simulates 1000 concurrent users performing realistic workflows:
 * - Subscription flow
 * - Course purchase flow
 * - Token earning flow
 * - Enterprise flow
 * 
 * Requirements: 4.2
 * Target: p95 response time < 500ms
 */

// Custom metrics
const errorRate = new Rate('errors');
const subscriptionDuration = new Trend('subscription_duration');
const coursePurchaseDuration = new Trend('course_purchase_duration');
const tokenEarningDuration = new Trend('token_earning_duration');
const enterpriseFlowDuration = new Trend('enterprise_flow_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5175';
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:4000';

export const options = {
  stages: [
    // Ramp up to 1000 concurrent users over 5 minutes
    { duration: '5m', target: 1000 },
    // Stay at 1000 concurrent users for 10 minutes
    { duration: '10m', target: 1000 },
    // Ramp down to 0 over 2 minutes
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    // HTTP request duration thresholds
    'http_req_duration': [
      'p(95)<500',  // 95th percentile under 500ms
      'p(99)<1000', // 99th percentile under 1000ms
      'p(50)<200'   // 50th percentile under 200ms
    ],
    // HTTP request failure rate
    'http_req_failed': ['rate<0.01'], // Less than 1% failure rate
    // Custom error rate
    'errors': ['rate<0.05'], // Less than 5% error rate
    // Successful requests
    'successful_requests': ['value>0'],
    // Failed requests
    'failed_requests': ['rate<0.01']
  },
  // VU configuration
  vus: 1000,
  duration: '17m'
};

/**
 * Subscription Flow Test
 * Simulates user subscribing to a plan
 */
function subscriptionFlow(userId) {
  group('Subscription Flow', () => {
    const startTime = new Date();
    
    // Get pricing page
    let res = http.get(`${BASE_URL}/pricing`);
    check(res, {
      'pricing page loads': (r) => r.status === 200,
      'pricing page response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Select subscription tier
    res = http.post(`${API_BASE_URL}/api/subscriptions/select-tier`, JSON.stringify({
      tier: 'pro',
      userId: userId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const subscriptionSuccess = check(res, {
      'tier selection successful': (r) => r.status === 200 || r.status === 201,
      'tier selection response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (subscriptionSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
    
    sleep(1);
    
    // Process payment
    res = http.post(`${API_BASE_URL}/api/payments/process`, JSON.stringify({
      subscriptionId: 'sub_' + userId,
      amount: 9.99,
      currency: 'USD'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const paymentSuccess = check(res, {
      'payment processed': (r) => r.status === 200 || r.status === 201,
      'payment response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (paymentSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
    
    sleep(1);
    
    // Verify subscription
    res = http.get(`${API_BASE_URL}/api/subscriptions/${userId}`);
    check(res, {
      'subscription verified': (r) => r.status === 200,
      'subscription response time < 500ms': (r) => r.timings.duration < 500
    });
    
    const duration = new Date() - startTime;
    subscriptionDuration.add(duration);
  });
}

/**
 * Course Purchase Flow Test
 * Simulates user browsing and purchasing a course
 */
function coursePurchaseFlow(userId) {
  group('Course Purchase Flow', () => {
    const startTime = new Date();
    
    // Browse courses
    let res = http.get(`${API_BASE_URL}/api/courses?page=1&limit=20`);
    check(res, {
      'courses list loads': (r) => r.status === 200,
      'courses list response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get course details
    res = http.get(`${API_BASE_URL}/api/courses/course_${Math.floor(Math.random() * 100)}`);
    check(res, {
      'course details load': (r) => r.status === 200,
      'course details response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Purchase course
    res = http.post(`${API_BASE_URL}/api/courses/purchase`, JSON.stringify({
      courseId: 'course_' + Math.floor(Math.random() * 100),
      userId: userId,
      price: 49.99
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const purchaseSuccess = check(res, {
      'course purchased': (r) => r.status === 200 || r.status === 201,
      'purchase response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (purchaseSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
    
    sleep(1);
    
    // Access course content
    res = http.get(`${API_BASE_URL}/api/courses/course_${Math.floor(Math.random() * 100)}/content`);
    check(res, {
      'course content accessible': (r) => r.status === 200,
      'course content response time < 500ms': (r) => r.timings.duration < 500
    });
    
    const duration = new Date() - startTime;
    coursePurchaseDuration.add(duration);
  });
}

/**
 * Token Earning Flow Test
 * Simulates user completing lessons and earning tokens
 */
function tokenEarningFlow(userId) {
  group('Token Earning Flow', () => {
    const startTime = new Date();
    
    // Get user wallet
    let res = http.get(`${API_BASE_URL}/api/wallet/${userId}`);
    check(res, {
      'wallet loads': (r) => r.status === 200,
      'wallet response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Complete lesson
    res = http.post(`${API_BASE_URL}/api/lessons/complete`, JSON.stringify({
      lessonId: 'lesson_' + Math.floor(Math.random() * 1000),
      userId: userId,
      completionTime: Math.floor(Math.random() * 3600)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const lessonSuccess = check(res, {
      'lesson completed': (r) => r.status === 200 || r.status === 201,
      'lesson completion response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (lessonSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
    
    sleep(1);
    
    // Claim tokens
    res = http.post(`${API_BASE_URL}/api/tokens/claim`, JSON.stringify({
      userId: userId,
      amount: Math.floor(Math.random() * 100) + 10
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    check(res, {
      'tokens claimed': (r) => r.status === 200 || r.status === 201,
      'token claim response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Check token balance
    res = http.get(`${API_BASE_URL}/api/wallet/${userId}/balance`);
    check(res, {
      'token balance retrieved': (r) => r.status === 200,
      'balance response time < 500ms': (r) => r.timings.duration < 500
    });
    
    const duration = new Date() - startTime;
    tokenEarningDuration.add(duration);
  });
}

/**
 * Enterprise Flow Test
 * Simulates enterprise user accessing admin features
 */
function enterpriseFlow(userId) {
  group('Enterprise Flow', () => {
    const startTime = new Date();
    
    // Get enterprise dashboard
    let res = http.get(`${API_BASE_URL}/api/enterprise/dashboard`);
    check(res, {
      'enterprise dashboard loads': (r) => r.status === 200,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get analytics
    res = http.get(`${API_BASE_URL}/api/enterprise/analytics?period=month`);
    check(res, {
      'analytics loads': (r) => r.status === 200,
      'analytics response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get team members
    res = http.get(`${API_BASE_URL}/api/enterprise/team`);
    check(res, {
      'team members load': (r) => r.status === 200,
      'team response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get API keys
    res = http.get(`${API_BASE_URL}/api/enterprise/api-keys`);
    check(res, {
      'API keys load': (r) => r.status === 200,
      'API keys response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get billing info
    res = http.get(`${API_BASE_URL}/api/enterprise/billing`);
    check(res, {
      'billing info loads': (r) => r.status === 200,
      'billing response time < 500ms': (r) => r.timings.duration < 500
    });
    
    const duration = new Date() - startTime;
    enterpriseFlowDuration.add(duration);
  });
}

/**
 * Health check - verify API is responsive
 */
function healthCheck() {
  const res = http.get(`${API_BASE_URL}/api/health`);
  check(res, {
    'health check passes': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100
  });
}

/**
 * Main test function
 * Each VU executes this function
 */
export default function () {
  const userId = `user_${__VU}_${__ITER}`;
  
  // Health check
  healthCheck();
  sleep(1);
  
  // Randomly select a flow to execute
  const flowType = Math.floor(Math.random() * 4);
  
  switch (flowType) {
    case 0:
      subscriptionFlow(userId);
      break;
    case 1:
      coursePurchaseFlow(userId);
      break;
    case 2:
      tokenEarningFlow(userId);
      break;
    case 3:
      enterpriseFlow(userId);
      break;
  }
  
  // Random think time between requests
  sleep(Math.random() * 3 + 1);
}

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('Starting load test with 1000 concurrent users');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  console.log('Load test completed');
}
