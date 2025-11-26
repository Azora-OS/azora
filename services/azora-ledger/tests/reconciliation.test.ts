import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase } from '../../../tests/utils/database';

const API_URL = process.env.LEDGER_SERVICE_URL || 'http://localhost:3012';

describe('Azora Ledger - Reconciliation', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Account Reconciliation', () => {
    it('should reconcile account transactions', async () => {
      const accountId = 'account-reconcile';

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
        .post('/api/reconciliation/accounts')
        .send({
          accountId,
          expectedBalance: 70,
        });

      expect(res.status).toBe(200);
      expect(res.body.reconciled).toBe(true);
      expect(res.body.actualBalance).toBe(70);
    });

    it('should detect reconciliation discrepancies', async () => {
      const accountId = 'account-discrepancy';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      const res = await request(API_URL)
        .post('/api/reconciliation/accounts')
        .send({
          accountId,
          expectedBalance: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.reconciled).toBe(false);
      expect(res.body.discrepancy).toBe(50);
    });

    it('should generate reconciliation report', async () => {
      const accountId = 'account-report';

      const res = await request(API_URL)
        .get(`/api/reconciliation/accounts/${accountId}/report`);

      expect(res.status).toBe(200);
      expect(res.body.report).toBeDefined();
      expect(res.body.report.accountId).toBe(accountId);
    });
  });

  describe('Transaction Matching', () => {
    it('should match transactions', async () => {
      const res = await request(API_URL)
        .post('/api/reconciliation/match')
        .send({
          sourceTransactionId: 'txn-123',
          targetTransactionId: 'txn-456',
        });

      expect(res.status).toBe(200);
      expect(res.body.matched).toBe(true);
    });

    it('should identify unmatched transactions', async () => {
      const accountId = 'account-unmatched';

      const res = await request(API_URL)
        .get(`/api/reconciliation/accounts/${accountId}/unmatched`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.unmatchedTransactions)).toBe(true);
    });

    it('should suggest transaction matches', async () => {
      const res = await request(API_URL)
        .get('/api/reconciliation/suggestions')
        .query({
          transactionId: 'txn-123',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });
  });

  describe('Period Reconciliation', () => {
    it('should reconcile period', async () => {
      const res = await request(API_URL)
        .post('/api/reconciliation/period')
        .send({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          accountIds: ['account-123', 'account-456'],
        });

      expect(res.status).toBe(200);
      expect(res.body.reconciled).toBeDefined();
      expect(res.body.summary).toBeDefined();
    });

    it('should generate period reconciliation report', async () => {
      const res = await request(API_URL)
        .get('/api/reconciliation/period/report')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(res.status).toBe(200);
      expect(res.body.report).toBeDefined();
    });
  });

  describe('Automated Reconciliation', () => {
    it('should run automated reconciliation', async () => {
      const res = await request(API_URL)
        .post('/api/reconciliation/automated')
        .send({
          accountIds: ['account-123', 'account-456'],
        });

      expect(res.status).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('should schedule reconciliation', async () => {
      const res = await request(API_URL)
        .post('/api/reconciliation/schedule')
        .send({
          frequency: 'daily',
          time: '00:00',
          accountIds: ['account-123'],
        });

      expect(res.status).toBe(201);
      expect(res.body.scheduleId).toBeDefined();
    });
  });
});
