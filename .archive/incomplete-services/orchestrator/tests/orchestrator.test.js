const request = require('supertest');
const app = require('../server');

describe('orchestrator', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('healthy');
  });
});