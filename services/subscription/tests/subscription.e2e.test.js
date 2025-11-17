const request = require('supertest');
const app = require('../server');

describe('subscription E2E Tests', () => {
  it('should complete full user workflow', async () => {
    // Health check
    const health = await request(app).get('/health').expect(200);
    expect(health.body.status).toBe('healthy');

    // Service info
    const info = await request(app).get('/').expect(200);
    expect(info.body.service).toBe('subscription');

    // Ubuntu philosophy check
    expect(info.body.ubuntu).toBe('I serve because we prosper together');
  });

  it('should maintain service availability', async () => {
    const checks = [];
    for (let i = 0; i < 60; i++) {
      const res = await request(app).get('/health');
      checks.push(res.status === 200);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const uptime = checks.filter(Boolean).length / checks.length;
    expect(uptime).toBeGreaterThan(0.99); // 99% uptime
  });
});