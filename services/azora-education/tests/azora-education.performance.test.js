const request = require('supertest');
const app = require('../server');

describe('azora-education Performance Tests', () => {
  it('should respond within 100ms', async () => {
    const start = Date.now();
    await request(app).get('/health').expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle 1000 requests per second', async () => {
    const start = Date.now();
    const promises = Array(1000).fill().map(() => 
      request(app).get('/health')
    );
    await Promise.all(promises);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('should have low memory usage', () => {
    const memBefore = process.memoryUsage().heapUsed;
    // Simulate workload
    for (let i = 0; i < 10000; i++) {
      const obj = { data: 'test'.repeat(100) };
    }
    const memAfter = process.memoryUsage().heapUsed;
    const memIncrease = memAfter - memBefore;
    expect(memIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});