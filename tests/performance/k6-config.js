/**
 * K6 Load Testing Configuration
 * 
 * This file provides configuration options for different load testing scenarios
 * Requirements: 4.2
 */

export const scenarios = {
  // Scenario 1: 1000 concurrent users
  concurrent1000: {
    stages: [
      { duration: '5m', target: 1000 },
      { duration: '10m', target: 1000 },
      { duration: '2m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<500', 'p(99)<1000'],
      'http_req_failed': ['rate<0.01'],
      'errors': ['rate<0.05']
    }
  },

  // Scenario 2: Realistic traffic patterns
  realisticTraffic: {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 500 },
      { duration: '2m', target: 1000 },
      { duration: '5m', target: 1000 },
      { duration: '3m', target: 300 },
      { duration: '3m', target: 300 },
      { duration: '2m', target: 800 },
      { duration: '3m', target: 800 },
      { duration: '2m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<500', 'p(99)<1000'],
      'http_req_failed': ['rate<0.01'],
      'errors': ['rate<0.05'],
      'cache_hits': ['rate>0.3']
    }
  },

  // Scenario 3: Spike test (sudden traffic spike)
  spike: {
    stages: [
      { duration: '1m', target: 100 },
      { duration: '30s', target: 5000 }, // Sudden spike
      { duration: '5m', target: 5000 },
      { duration: '1m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
      'http_req_failed': ['rate<0.05']
    }
  },

  // Scenario 4: Stress test (gradually increase load)
  stress: {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '2m', target: 500 },
      { duration: '2m', target: 1000 },
      { duration: '2m', target: 2000 },
      { duration: '2m', target: 3000 },
      { duration: '2m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<1000'],
      'http_req_failed': ['rate<0.1']
    }
  },

  // Scenario 5: Soak test (sustained load for long duration)
  soak: {
    stages: [
      { duration: '5m', target: 500 },
      { duration: '30m', target: 500 }, // Sustained load
      { duration: '5m', target: 0 }
    ],
    thresholds: {
      'http_req_duration': ['p(95)<500'],
      'http_req_failed': ['rate<0.01']
    }
  }
};

export const endpoints = {
  health: '/api/health',
  courses: '/api/courses',
  courseDetails: (id) => `/api/courses/${id}`,
  courseEnroll: '/api/courses/purchase',
  lessons: (id) => `/api/lessons/${id}`,
  lessonComplete: '/api/lessons/complete',
  wallet: (userId) => `/api/wallet/${userId}`,
  walletBalance: (userId) => `/api/wallet/${userId}/balance`,
  walletTransactions: (userId) => `/api/wallet/${userId}/transactions`,
  tokensClaim: '/api/tokens/claim',
  subscriptionSelect: '/api/subscriptions/select-tier',
  paymentProcess: '/api/payments/process',
  enterpriseDashboard: '/api/enterprise/dashboard',
  enterpriseAnalytics: '/api/enterprise/analytics',
  enterpriseTeam: '/api/enterprise/team',
  enterpriseBilling: '/api/enterprise/billing',
  enterpriseApiKeys: '/api/enterprise/api-keys'
};

export const responseTimeTargets = {
  p50: 200,    // 50th percentile
  p95: 500,    // 95th percentile (main target)
  p99: 1000    // 99th percentile
};

export const errorRateTargets = {
  acceptable: 0.01,    // 1% acceptable error rate
  warning: 0.05,       // 5% warning threshold
  critical: 0.1        // 10% critical threshold
};

export const cacheTargets = {
  minHitRate: 0.3,     // Minimum 30% cache hit rate
  targetHitRate: 0.5   // Target 50% cache hit rate
};

export const loadTestDurations = {
  warmup: '2m',
  rampUp: '5m',
  spike: '2m',
  sustained: '10m',
  rampDown: '2m',
  cooldown: '2m'
};

export const userBehaviors = {
  newUser: 0.1,        // 10% new users
  browsing: 0.3,       // 30% browsing
  learning: 0.3,       // 30% learning
  wallet: 0.2,         // 20% wallet activity
  enterprise: 0.1      // 10% enterprise admin
};

export const thinkTimes = {
  min: 1,              // Minimum 1 second
  max: 5,              // Maximum 5 seconds
  pageView: 2,         // 2 seconds for page views
  formFill: 3,         // 3 seconds for form filling
  reading: 5           // 5 seconds for reading content
};

export const getScenarioConfig = (scenarioName) => {
  return scenarios[scenarioName] || scenarios.concurrent1000;
};

export const getEndpoint = (endpointName, ...args) => {
  const endpoint = endpoints[endpointName];
  if (typeof endpoint === 'function') {
    return endpoint(...args);
  }
  return endpoint;
};
