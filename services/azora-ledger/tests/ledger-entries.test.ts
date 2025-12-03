import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase } from '../../../tests/utils/database';

const API_URL = process.env.LEDGER_SERVICE_URL || 'http://localhost:3012';

describe('Azora Ledger - Ledger Entries', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Transaction Creation', () => {
    it('should create ledger entry', async () => {
      const res = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          description: 'Test transaction',
          accountId: 'account-123',
          type: 'credit',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(100);
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject entry without required fields', async () => {
      const res = await request(API_URL)
        .post('/api/transactions')
        .send({
          description: 'Test transaction',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('should create debit entry', async () => {
      const res = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 50,
          currency: 'USD',
          description: 'Debit transaction',
          accountId: 'account-123',
          type: 'debit',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('debit');
    });

    it('should create credit entry', async () => {
      const res = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 75,
          currency: 'USD',
          description: 'Credit transaction',
          accountId: 'account-123',
          type: 'credit',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('credit');
    });
  });

  describe('Transaction Retrieval', () => {
    it('should get all transactions', async () => {
      const res = await request(API_URL)
        .get('/api/transactions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get transaction by ID', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          description: 'Test',
          accountId: 'account-123',
        });

      const res = await request(API_URL)
        .get(`/api/transactions/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createRes.body.data.id);
    });

    it('should return 404 for non-existent transaction', async () => {
      const res = await request(API_URL)
        .get('/api/transactions/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('Transaction Updates', () => {
    it('should update transaction', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          description: 'Original',
          accountId: 'account-123',
        });

      const res = await request(API_URL)
        .put(`/api/transactions/${createRes.body.data.id}`)
        .send({
          description: 'Updated description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should not allow amount modification', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          description: 'Test',
          accountId: 'account-123',
        });

      const res = await request(API_URL)
        .put(`/api/transactions/${createRes.body.data.id}`)
        .send({
          amount: 200,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('amount');
    });
  });

  describe('Transaction Deletion', () => {
    it('should delete transaction', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          description: 'Test',
          accountId: 'account-123',
        });

      const res = await request(API_URL)
        .delete(`/api/transactions/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent transaction', async () => {
      const res = await request(API_URL)
        .delete('/api/transactions/non-existent-id');

      expect(res.status).toBe(404);
    });
  });
});
