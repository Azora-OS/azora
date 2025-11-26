import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase } from '../../../tests/utils/database';

const API_URL = process.env.LEDGER_SERVICE_URL || 'http://localhost:3012';

describe('Azora Ledger - Balance Calculation', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Account Balance', () => {
    it('should calculate account balance', async () => {
      const accountId = 'account-123';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 30,
          currency: 'USD',
          accountId,
          type: 'debit',
        });

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance`);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(70);
    });

    it('should handle zero balance', async () => {
      const accountId = 'account-456';

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance`);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(0);
    });

    it('should handle negative balance', async () => {
      const accountId = 'account-789';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 50,
          currency: 'USD',
          accountId,
          type: 'debit',
        });

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance`);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(-50);
    });

    it('should calculate balance by currency', async () => {
      const accountId = 'account-multi';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 50,
          currency: 'EUR',
          accountId,
          type: 'credit',
        });

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance`)
        .query({ currency: 'USD' });

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(100);
    });
  });

  describe('Balance History', () => {
    it('should retrieve balance history', async () => {
      const accountId = 'account-history';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance-history`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
    });

    it('should filter balance history by date range', async () => {
      const accountId = 'account-date-filter';

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balance-history`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });

  describe('Multi-Currency Balance', () => {
    it('should calculate balances for multiple currencies', async () => {
      const accountId = 'account-multi-currency';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 50,
          currency: 'EUR',
          accountId,
          type: 'credit',
        });

      const res = await request(API_URL)
        .get(`/api/accounts/${accountId}/balances`);

      expect(res.status).toBe(200);
      expect(res.body.balances).toBeDefined();
      expect(res.body.balances.USD).toBe(100);
      expect(res.body.balances.EUR).toBe(50);
    });
  });
});
