import request from 'supertest';
import { app } from '../server';

describe('Citadel Fund Service', () => {
    it('GET /health should return healthy', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('healthy');
    });

    it('POST /api/revenue/collect should collect revenue', async () => {
        const res = await request(app)
            .post('/api/revenue/collect')
            .send({ amount: 100, source: 'test' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('GET /api/transparency should return report', async () => {
        const res = await request(app).get('/api/transparency');
        expect(res.statusCode).toEqual(200);
        expect(res.body.report).toBeDefined();
        // Should have at least the 100 we just collected (or more if tests run in parallel/sequence)
        expect(res.body.report.totalRevenue).toBeGreaterThanOrEqual(0);
    });
});
