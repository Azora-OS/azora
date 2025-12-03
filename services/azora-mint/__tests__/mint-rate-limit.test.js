const request = require('supertest');
const app = require('../dist/server.js') || require('../src/server');
const jwt = require('jsonwebtoken');

describe('Azora Mint Rate Limiting', () => {
  it('rate-limits rapid mint requests', async () => {
    const token = jwt.sign({ sub: 'user-1', roles: ['mint:tokens'] }, process.env.JWT_SECRET || 'dev-secret');
    let lastResponse;
    for (let i = 0; i < 6; i++) {
      lastResponse = await request(app).post('/api/nft/mint')
        .set('Authorization', `Bearer ${token}`)
        .field('name', `testtoken${i}`)
        .field('description', 'Test token')
        .attach('image', Buffer.from(''), 'image.png');
    }
    expect(lastResponse.status).toBeGreaterThanOrEqual(429);
  }, 20000);
});
