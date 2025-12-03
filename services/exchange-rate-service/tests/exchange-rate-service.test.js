const request = require('supertest');
const app = require('../server');

describe('exchange-rate-service', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.ubuntu).toBe('I serve because we prosper together');
  });
  
  it('should return service info', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body.service).toBe('exchange-rate-service');
  });
});