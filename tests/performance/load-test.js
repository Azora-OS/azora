import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 10000 }, // Ramp up to 10000 users
    { duration: '5m', target: 10000 }, // Stay at 10000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests < 200ms
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4004';

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, { 'health check ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  sleep(1);
  
  // Login
  res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@azora.world',
    password: 'password123'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  check(res, { 'login ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  const token = res.json('accessToken');
  
  sleep(1);
  
  // Profile access
  res = http.get(`${BASE_URL}/api/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  check(res, { 'profile ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  sleep(1);
}
