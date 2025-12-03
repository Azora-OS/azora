import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';

const API_URL = process.env.TREASURY_SERVICE_URL || 'http://localhost:3028';

describe('Azora Treasury - Fund Management', () => {
  describe('Asset Management', () => {
    it('should retrieve all treasury assets', async () => {
      const res = await request(API_URL)
        .get('/api/assets');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.assets)).toBe(true);
      expect(res.body.data.totalValue).toBeDefined();
    });

    it('should retrieve specific asset', async () => {
      const createRes = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'cryptocurrency',
          name: 'Bitcoin',
          symbol: 'BTC',
          amount: 1.5,
          value: 50000,
        });

      const res = await request(API_URL)
        .get(`/api/assets/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Bitcoin');
    });

    it('should add new asset', async () => {
      const res = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'fiat',
          name: 'US Dollar',
          symbol: 'USD',
          amount: 100000,
          value: 100000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject asset without required fields', async () => {
      const res = await request(API_URL)
        .post('/api/assets')
        .send({
          name: 'Incomplete Asset',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('should update asset value', async () => {
      const createRes = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'cryptocurrency',
          name: 'Ethereum',
          symbol: 'ETH',
          amount: 10,
          value: 20000,
        });

      const res = await request(API_URL)
        .put(`/api/assets/${createRes.body.data.id}`)
        .send({
          value: 25000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.value).toBe(25000);
    });

    it('should calculate total portfolio value', async () => {
      const res = await request(API_URL)
        .get('/api/assets');

      expect(res.status).toBe(200);
      expect(res.body.data.totalValue).toBeGreaterThan(0);
    });
  });

  describe('Reserve Operations', () => {
    it('should add funds to reserves', async () => {
      const createRes = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'fiat',
          name: 'USD',
          symbol: 'USD',
          amount: 50000,
          value: 50000,
        });

      const res = await request(API_URL)
        .post('/api/reserves')
        .send({
          assetId: createRes.body.data.id,
          amount: 10000,
          action: 'add',
          description: 'Monthly contribution',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.action).toBe('add');
    });

    it('should remove funds from reserves', async () => {
      const createRes = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'fiat',
          name: 'USD',
          symbol: 'USD',
          amount: 50000,
          value: 50000,
        });

      const res = await request(API_URL)
        .post('/api/reserves')
        .send({
          assetId: createRes.body.data.id,
          amount: 5000,
          action: 'remove',
          description: 'Operational expenses',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.action).toBe('remove');
    });

    it('should retrieve reserve transaction history', async () => {
      const res = await request(API_URL)
        .get('/api/reserves');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should retrieve specific reserve transaction', async () => {
      const createRes = await request(API_URL)
        .post('/api/assets')
        .send({
          type: 'fiat',
          name: 'USD',
          symbol: 'USD',
          amount: 50000,
          value: 50000,
        });

      const txnRes = await request(API_URL)
        .post('/api/reserves')
        .send({
          assetId: createRes.body.data.id,
          amount: 1000,
          action: 'add',
        });

      const res = await request(API_URL)
        .get(`/api/reserves/${txnRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(txnRes.body.data.id);
    });
  });

  describe('Asset Allocation', () => {
    it('should calculate asset allocation percentages', async () => {
      const res = await request(API_URL)
        .get('/api/assets');

      expect(res.status).toBe(200);
      expect(res.body.data.assets.length).toBeGreaterThan(0);
      
      const totalValue = res.body.data.totalValue;
      res.body.data.assets.forEach((asset: any) => {
        const percentage = (asset.value / totalValue) * 100;
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should rebalance portfolio', async () => {
      const res = await request(API_URL)
        .post('/api/portfolio/rebalance')
        .send({
          targetAllocations: {
            'cryptocurrency': 40,
            'fiat': 60,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.rebalanced).toBe(true);
    });
  });
});
