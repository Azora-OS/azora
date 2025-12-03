import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    errors: ['rate<0.1'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

export default function () {
  // Test API Gateway health
  let response = http.get(`${BASE_URL}/health`)
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1)

  // Test auth service
  response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@azora.es',
    password: 'TestPassword123!'
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
  
  check(response, {
    'auth login status is 200 or 401': (r) => [200, 401].includes(r.status),
    'auth response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1)

  sleep(1)
}