import request from 'supertest';
import express from 'express';
import { healthCheck } from '../src/health';

const app = express();
app.get('/health', healthCheck);

describe('GET /health', () => {
  it('should return a healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});
