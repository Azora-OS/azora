import request from 'supertest';
import { app } from '../server';

describe('Proof of Value Service', () => {
    it('GET /health should return healthy', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('healthy');
    });

    it('POST /api/mine/knowledge should calculate reward', async () => {
        const res = await request(app)
            .post('/api/mine/knowledge')
            .send({ userId: 'user123', content: 'Great article on Ubuntu' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.reward).toBeGreaterThan(0);
    });

    it('POST /api/verify should verify proof', async () => {
        const res = await request(app)
            .post('/api/verify')
            .send({ proof: 'valid-proof-hash' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.isValid).toBe(true);
    });
});
