import AzoraAPIGateway from '../src/index';
import request from 'supertest';

describe('API Gateway Health Aggregator', () => {
  it('GET /health returns services array', async () => {
    const gateway = new AzoraAPIGateway();
    // Start in-process server on a random port; we won't actually start it for tests
    const app: any = gateway['app'];
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.services).toBeDefined();
    expect(Array.isArray(res.body.services)).toBeTruthy();
  });
});
