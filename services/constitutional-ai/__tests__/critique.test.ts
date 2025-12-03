import request from 'supertest';
import app from '../src/server';

describe('Constitutional AI - self critique', () => {
  it('returns critique and suggestions for a short biased response', async () => {
    const res = await request(app).post('/api/critique').send({ response: 'Women are bad drivers' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.critiques || res.body.result.critique || 'critique' in res.body.result).toBeTruthy();
  });
});
