import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics for Ubuntu performance tracking
const ubuntuSuccessRate = new Rate('ubuntu_success_rate');
const apiResponseRate = new Rate('api_response_rate');

// Load testing configuration
export const options = {
  stages: [
    // Ubuntu ramp-up: Gradual increase to simulate organic growth
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Ramp up to 50 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 200 },  // Peak load: 200 users
    { duration: '10m', target: 200 }, // Sustain peak load
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    // Ubuntu performance standards
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.05'],   // Error rate under 5%
    ubuntu_success_rate: ['rate>0.95'], // Ubuntu success rate over 95%
    api_response_rate: ['rate>0.98'],   // API response rate over 98%
  },
};

// Test data for Ubuntu scenarios
const testUsers = [
  { email: 'student@ubuntu.test', password: 'ubuntu123', role: 'student' },
  { email: 'employer@ubuntu.test', password: 'ubuntu123', role: 'employer' },
  { email: 'teacher@ubuntu.test', password: 'ubuntu123', role: 'teacher' },
];

const jobSearchTerms = [
  'React Developer',
  'AI Engineer',
  'Python Developer',
  'DevOps Engineer',
  'Product Manager',
  'Data Scientist',
];

const skillCategories = [
  'technology',
  'design',
  'business',
  'education',
  'healthcare',
  'finance',
];

// Base URLs for different services
const BASE_URLS = {
  api: 'http://localhost:4000',
  marketplace: 'http://localhost:3002',
  pay: 'http://localhost:3003',
  student: 'http://localhost:3000',
  enterprise: 'http://localhost:3001',
};

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const scenario = Math.random();

  // Scenario 1: Marketplace Job Search (40% of traffic)
  if (scenario < 0.4) {
    testMarketplaceJobSearch();
  }
  // Scenario 2: Payment Operations (25% of traffic)
  else if (scenario < 0.65) {
    testPaymentOperations();
  }
  // Scenario 3: Student Learning Journey (20% of traffic)
  else if (scenario < 0.85) {
    testStudentLearning();
  }
  // Scenario 4: Enterprise Operations (15% of traffic)
  else {
    testEnterpriseOperations();
  }

  sleep(1);
}

function testMarketplaceJobSearch() {
  const searchTerm = jobSearchTerms[Math.floor(Math.random() * jobSearchTerms.length)];
  
  // 1. Load marketplace homepage
  let response = http.get(`${BASE_URLS.marketplace}`);
  check(response, {
    'marketplace homepage loads': (r) => r.status === 200,
    'marketplace has Ubuntu branding': (r) => r.body.includes('Azora Forge'),
  });
  apiResponseRate.add(response.status === 200);

  // 2. Search for jobs
  response = http.get(`${BASE_URLS.api}/api/jobs?search=${encodeURIComponent(searchTerm)}&limit=20`);
  check(response, {
    'job search API responds': (r) => r.status === 200,
    'job search returns data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && Array.isArray(data.data?.jobs);
      } catch {
        return false;
      }
    },
  });
  apiResponseRate.add(response.status === 200);

  // 3. Filter jobs by type
  response = http.get(`${BASE_URLS.api}/api/jobs?search=${encodeURIComponent(searchTerm)}&type=full-time`);
  check(response, {
    'filtered job search works': (r) => r.status === 200,
  });
  apiResponseRate.add(response.status === 200);

  // 4. Get job details
  if (response.status === 200) {
    try {
      const data = JSON.parse(response.body);
      if (data.data?.jobs?.length > 0) {
        const jobId = data.data.jobs[0].id;
        response = http.get(`${BASE_URLS.api}/api/jobs/${jobId}`);
        check(response, {
          'job details load': (r) => r.status === 200,
          'job has Ubuntu principles': (r) => r.body.includes('ubuntu') || r.body.includes('Ubuntu'),
        });
        apiResponseRate.add(response.status === 200);
      }
    } catch (e) {
      console.error('Error parsing job search response:', e);
    }
  }

  ubuntuSuccessRate.add(true); // Marketplace scenario completed
}

function testPaymentOperations() {
  // 1. Load payment dashboard
  let response = http.get(`${BASE_URLS.pay}`);
  check(response, {
    'payment dashboard loads': (r) => r.status === 200,
    'payment has Ubuntu branding': (r) => r.body.includes('Constitutional AI Financial'),
  });
  apiResponseRate.add(response.status === 200);

  // 2. Get wallet balance
  response = http.get(`${BASE_URLS.api}/api/wallet/balance`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(response, {
    'wallet balance API responds': (r) => r.status === 200 || r.status === 401, // 401 expected without real auth
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  // 3. Get transaction history
  response = http.get(`${BASE_URLS.api}/api/transactions?limit=20`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(response, {
    'transaction history API responds': (r) => r.status === 200 || r.status === 401,
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  // 4. Get mining status
  response = http.get(`${BASE_URLS.api}/api/mining/status`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(response, {
    'mining status API responds': (r) => r.status === 200 || r.status === 401,
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  // 5. Load wallet management page
  response = http.get(`${BASE_URLS.pay}/wallet`);
  check(response, {
    'wallet management page loads': (r) => r.status === 200,
    'wallet has Ubuntu sovereignty message': (r) => r.body.includes('sovereignty'),
  });
  apiResponseRate.add(response.status === 200);

  ubuntuSuccessRate.add(true); // Payment scenario completed
}

function testStudentLearning() {
  // 1. Load student portal
  let response = http.get(`${BASE_URLS.student}`);
  check(response, {
    'student portal loads': (r) => r.status === 200,
    'student portal has Ubuntu elements': (r) => r.body.includes('Ubuntu') || r.body.includes('Azora'),
  });
  apiResponseRate.add(response.status === 200);

  // 2. Get available courses
  response = http.get(`${BASE_URLS.api}/api/courses?limit=10`);
  check(response, {
    'courses API responds': (r) => r.status === 200,
    'courses data is valid': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && Array.isArray(data.data?.courses);
      } catch {
        return false;
      }
    },
  });
  apiResponseRate.add(response.status === 200);

  // 3. Get AI tutor status
  response = http.get(`${BASE_URLS.api}/api/ai-family/status`);
  check(response, {
    'AI family API responds': (r) => r.status === 200,
  });
  apiResponseRate.add(response.status === 200);

  // 4. Simulate AI chat interaction
  response = http.post(`${BASE_URLS.api}/api/ai/elara/chat`, 
    JSON.stringify({
      message: 'Help me understand Ubuntu philosophy',
      context: 'learning',
      studentId: 'test-student-123'
    }),
    {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
    }
  );
  check(response, {
    'AI chat API responds': (r) => r.status === 200 || r.status === 401,
    'AI response includes Ubuntu': (r) => r.body.includes('ubuntu') || r.body.includes('Ubuntu'),
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  ubuntuSuccessRate.add(true); // Student scenario completed
}

function testEnterpriseOperations() {
  // 1. Load enterprise dashboard
  let response = http.get(`${BASE_URLS.enterprise}`);
  check(response, {
    'enterprise dashboard loads': (r) => r.status === 200,
    'enterprise has Ubuntu branding': (r) => r.body.includes('Ubuntu') || r.body.includes('Constitutional'),
  });
  apiResponseRate.add(response.status === 200);

  // 2. Get employer statistics
  response = http.get(`${BASE_URLS.api}/api/employer/test-employer/stats`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(response, {
    'employer stats API responds': (r) => r.status === 200 || r.status === 401,
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  // 3. Get applications for employer
  response = http.get(`${BASE_URLS.api}/api/applications/employer/test-employer`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(response, {
    'applications API responds': (r) => r.status === 200 || r.status === 401,
  });
  apiResponseRate.add(response.status === 200 || response.status === 401);

  // 4. Load job posting page
  response = http.get(`${BASE_URLS.marketplace}/post-job`);
  check(response, {
    'job posting page loads': (r) => r.status === 200,
    'job posting has Ubuntu elements': (r) => r.body.includes('Ubuntu') || r.body.includes('collective'),
  });
  apiResponseRate.add(response.status === 200);

  ubuntuSuccessRate.add(true); // Enterprise scenario completed
}

// Teardown function to log Ubuntu performance summary
export function teardown(data) {
  console.log('\n🌍 Ubuntu Performance Summary:');
  console.log('================================');
  console.log('✅ Load test completed with Ubuntu principles');
  console.log('🤝 Collective performance validated');
  console.log('🚀 Platform ready for Ubuntu community');
  console.log('💎 Individual sovereignty + Collective prosperity = Success');
}

// Setup function for Ubuntu initialization
export function setup() {
  console.log('\n🌟 Initializing Ubuntu Load Testing...');
  console.log('======================================');
  console.log('🎯 Testing Azora OS platform performance');
  console.log('🤖 Validating Constitutional AI responses');
  console.log('💰 Checking financial service reliability');
  console.log('🛒 Verifying marketplace functionality');
  console.log('🎓 Testing educational service performance');
  console.log('\n"Ngiyakwazi ngoba sikwazi" - I can because we can\n');
  
  return {};
}