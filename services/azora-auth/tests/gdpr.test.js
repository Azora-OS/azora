const request = require('supertest');
const express = require('express');
const gdprRoutes = require('../src/routes/gdpr');
const { generateAccessToken } = require('../src/middleware/jwt');

const app = express();
app.use(express.json());
app.use('/api/gdpr', gdprRoutes);

describe('GDPR Compliance', () => {
  let token;

  beforeAll(() => {
    token = generateAccessToken({ userId: 1, email: 'test@azora.world', role: 'student' });
  });

  test('should export user data', async () => {
    const res = await request(app)
      .get('/api/gdpr/export')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('profile');
  });

  test('should schedule data deletion', async () => {
    const res = await request(app)
      .post('/api/gdpr/delete')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.retentionPeriod).toBe('30 days');
  });

  test('should update consent preferences', async () => {
    const res = await request(app)
      .post('/api/gdpr/consent')
      .set('Authorization', `Bearer ${token}`)
      .send({ marketing: true, analytics: true });
    
    expect(res.status).toBe(200);
    expect(res.body.consent.marketing).toBe(true);
  });
});
