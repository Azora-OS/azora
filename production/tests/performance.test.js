const request = require('supertest');
const { app: authApp } = require('../auth-service');
const educationApp = require('../education-service');
const paymentApp = require('../payment-service');

describe('Performance Tests', () => {
  let authToken;
  const testUser = {
    email: `perf${Date.now()}@azora.world`,
    password: 'perftest123',
    name: 'Performance Test User',
  };

  beforeAll(async () => {
    const registerRes = await request(authApp)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerRes.body.data.accessToken;
  });

  describe('Response Time Benchmarks', () => {
    it('auth login should respond within 500ms', async () => {
      const start = Date.now();
      
      await request(authApp)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const duration = Date.now() - start;
      // bcrypt with 12 rounds intentionally takes time for security
      expect(duration).toBeLessThan(500);
    });

    it('get courses should respond within 100ms', async () => {
      const start = Date.now();
      
      await request(educationApp).get('/api/courses');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('get wallet should respond within 100ms', async () => {
      const start = Date.now();
      
      await request(paymentApp)
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle 50 concurrent login requests', async () => {
      const requests = Array(50).fill().map(() =>
        request(authApp)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach(res => {
        expect(res.status).toBe(200);
      });

      // bcrypt hashing is intentionally slow for security
      // 50 concurrent requests should complete within 15 seconds
      expect(duration).toBeLessThan(15000);
    }, 20000); // Increase timeout to 20 seconds

    it('should handle 100 concurrent course list requests', async () => {
      const requests = Array(100).fill().map(() =>
        request(educationApp).get('/api/courses')
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      results.forEach(res => {
        expect(res.status).toBe(200);
      });

      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Load Test', () => {
    it('should handle sequential requests without degradation', async () => {
      const times = [];
      
      for (let i = 0; i < 20; i++) {
        const start = Date.now();
        
        await request(educationApp).get('/api/courses');
        
        times.push(Date.now() - start);
      }

      // Calculate average
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      
      // Average should be under 100ms
      expect(avg).toBeLessThan(100);
      
      // Last request should not be significantly slower than first
      const firstRequest = times[0];
      const lastRequest = times[times.length - 1];
      expect(lastRequest).toBeLessThan(firstRequest * 2);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory on repeated requests', async () => {
      const before = process.memoryUsage().heapUsed;

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(educationApp).get('/api/courses');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const after = process.memoryUsage().heapUsed;
      const increase = (after - before) / 1024 / 1024; // MB

      // Memory increase should be reasonable (<50MB)
      expect(increase).toBeLessThan(50);
    });
  });
});
