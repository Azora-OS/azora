import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

/**
 * Load Test: Realistic Traffic Patterns
 * 
 * This test simulates realistic user behavior with:
 * - Peak hours (higher concurrency)
 * - Off-peak hours (lower concurrency)
 * - Varied user behaviors
 * - Think time between actions
 * - Session persistence
 * 
 * Requirements: 4.2
 * Target: p95 response time < 500ms
 */

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');
const activeUsers = new Gauge('active_users');
const cacheHitRate = new Rate('cache_hits');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5175';
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:4000';

export const options = {
  stages: [
    // Warm up: 100 users for 2 minutes
    { duration: '2m', target: 100 },
    // Ramp up to 500 users over 5 minutes (simulating morning peak)
    { duration: '5m', target: 500 },
    // Spike to 1000 users over 2 minutes (simulating lunch hour peak)
    { duration: '2m', target: 1000 },
    // Maintain 1000 users for 5 minutes
    { duration: '5m', target: 1000 },
    // Ramp down to 300 users over 3 minutes (afternoon decline)
    { duration: '3m', target: 300 },
    // Maintain 300 users for 3 minutes
    { duration: '3m', target: 300 },
    // Evening spike to 800 users over 2 minutes
    { duration: '2m', target: 800 },
    // Maintain 800 users for 3 minutes
    { duration: '3m', target: 800 },
    // Cool down to 0 over 2 minutes
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    'http_req_duration': [
      'p(95)<500',  // 95th percentile under 500ms
      'p(99)<1000', // 99th percentile under 1000ms
      'p(50)<200'   // 50th percentile under 200ms
    ],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.05'],
    'successful_requests': ['value>0'],
    'failed_requests': ['rate<0.01'],
    'cache_hits': ['rate>0.3'] // At least 30% cache hit rate
  }
};

/**
 * Simulate a new user registration and subscription
 */
function newUserFlow(userId) {
  group('New User Registration', () => {
    // Sign up page
    let res = http.get(`${BASE_URL}/signup`);
    check(res, {
      'signup page loads': (r) => r.status === 200
    });
    sleep(2);
    
    // Register user
    res = http.post(`${API_BASE_URL}/api/auth/register`, JSON.stringify({
      email: `${userId}@test.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const registerSuccess = check(res, {
      'registration successful': (r) => r.status === 201 || r.status === 200,
      'registration response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (registerSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
      errorRate.add(1);
    }
    
    sleep(1);
    
    // Select subscription tier
    res = http.post(`${API_BASE_URL}/api/subscriptions/select-tier`, JSON.stringify({
      tier: 'pro',
      userId: userId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    check(res, {
      'tier selection successful': (r) => r.status === 200 || r.status === 201,
      'tier selection response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
  });
}

/**
 * Simulate returning user browsing courses
 */
function browsingFlow(userId) {
  group('Course Browsing', () => {
    // Get courses list
    let res = http.get(`${API_BASE_URL}/api/courses?page=1&limit=20`);
    const startTime = new Date();
    
    const browseSuccess = check(res, {
      'courses list loads': (r) => r.status === 200,
      'courses list response time < 500ms': (r) => r.timings.duration < 500
    });
    
    pageLoadTime.add(new Date() - startTime);
    
    if (res.headers['X-Cache'] === 'HIT') {
      cacheHitRate.add(1);
    }
    
    sleep(2);
    
    // View course details (multiple courses)
    for (let i = 0; i < 3; i++) {
      const courseId = Math.floor(Math.random() * 100);
      res = http.get(`${API_BASE_URL}/api/courses/course_${courseId}`);
      
      check(res, {
        'course details load': (r) => r.status === 200,
        'course details response time < 500ms': (r) => r.timings.duration < 500
      });
      
      sleep(1);
    }
  });
}

/**
 * Simulate user learning (completing lessons)
 */
function learningFlow(userId) {
  group('Learning Activity', () => {
    // Get enrolled courses
    let res = http.get(`${API_BASE_URL}/api/courses/enrolled`);
    check(res, {
      'enrolled courses load': (r) => r.status === 200
    });
    sleep(1);
    
    // Get lesson content
    res = http.get(`${API_BASE_URL}/api/lessons/lesson_${Math.floor(Math.random() * 1000)}`);
    check(res, {
      'lesson loads': (r) => r.status === 200,
      'lesson response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(3); // Simulate reading/watching lesson
    
    // Complete lesson
    res = http.post(`${API_BASE_URL}/api/lessons/complete`, JSON.stringify({
      lessonId: 'lesson_' + Math.floor(Math.random() * 1000),
      userId: userId,
      completionTime: Math.floor(Math.random() * 3600)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const completeSuccess = check(res, {
      'lesson completed': (r) => r.status === 200 || r.status === 201,
      'completion response time < 500ms': (r) => r.timings.duration < 500
    });
    
    if (completeSuccess) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
    
    sleep(1);
  });
}

/**
 * Simulate user checking wallet and tokens
 */
function walletFlow(userId) {
  group('Wallet Activity', () => {
    // Get wallet balance
    let res = http.get(`${API_BASE_URL}/api/wallet/${userId}/balance`);
    check(res, {
      'wallet balance loads': (r) => r.status === 200,
      'wallet response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(1);
    
    // Get transaction history
    res = http.get(`${API_BASE_URL}/api/wallet/${userId}/transactions?limit=10`);
    check(res, {
      'transaction history loads': (r) => r.status === 200
    });
    
    sleep(1);
    
    // Claim available tokens
    res = http.post(`${API_BASE_URL}/api/tokens/claim`, JSON.stringify({
      userId: userId,
      amount: Math.floor(Math.random() * 100) + 10
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    check(res, {
      'tokens claimed': (r) => r.status === 200 || r.status === 201
    });
    
    sleep(1);
  });
}

/**
 * Simulate enterprise admin accessing dashboard
 */
function enterpriseAdminFlow(userId) {
  group('Enterprise Admin Activity', () => {
    // Get dashboard
    let res = http.get(`${API_BASE_URL}/api/enterprise/dashboard`);
    check(res, {
      'dashboard loads': (r) => r.status === 200,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500
    });
    
    sleep(2);
    
    // Get analytics
    res = http.get(`${API_BASE_URL}/api/enterprise/analytics?period=week`);
    check(res, {
      'analytics loads': (r) => r.status === 200
    });
    
    sleep(1);
    
    // Get team members
    res = http.get(`${API_BASE_URL}/api/enterprise/team`);
    check(res, {
      'team loads': (r) => r.status === 200
    });
    
    sleep(1);
    
    // Get billing
    res = http.get(`${API_BASE_URL}/api/enterprise/billing`);
    check(res, {
      'billing loads': (r) => r.status === 200
    });
    
    sleep(1);
  });
}

/**
 * Health check endpoint
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
 */
export default function () {
  const userId = `user_${__VU}_${__ITER}`;
  
  // Update active users gauge
  activeUsers.add(__VU);
  
  // Health check
  healthCheck();
  sleep(1);
  
  // Determine user type and behavior
  const userType = Math.random();
  
  if (userType < 0.1) {
    // 10% new users
    newUserFlow(userId);
  } else if (userType < 0.4) {
    // 30% browsing users
    browsingFlow(userId);
  } else if (userType < 0.7) {
    // 30% learning users
    learningFlow(userId);
  } else if (userType < 0.9) {
    // 20% wallet users
    walletFlow(userId);
  } else {
    // 10% enterprise admins
    enterpriseAdminFlow(userId);
  }
  
  // Random think time
  sleep(Math.random() * 5 + 2);
}

/**
 * Setup function
 */
export function setup() {
  console.log('Starting realistic traffic pattern load test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('Simulating realistic user behavior patterns');
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log('Realistic traffic pattern load test completed');
}
