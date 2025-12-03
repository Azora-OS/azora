const request = require('supertest');
const server = require('../server-simple');
const jwt = require('jsonwebtoken');

describe('Azora Mint', () => {
  it('rejects mint requests without token', async () => {
    const res = await request(server).post('/api/mint').send({ name: 'AZR', symbol: 'AZR', amount: 100 });
    expect(res.status).toBe(401);
  });

  it('accepts mint requests with proper role', async () => {
    const token = jwt.sign({ sub: 'user-1', roles: ['mint:tokens'] }, process.env.JWT_SECRET || 'dev-secret');
    const res = await request(server).post('/api/mint').set('Authorization', `Bearer ${token}`).send({ name: 'AZR', symbol: 'AZR', amount: 100 });
    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
  });
});
