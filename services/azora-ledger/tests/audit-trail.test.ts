import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase } from '../../../tests/utils/database';

const API_URL = process.env.LEDGER_SERVICE_URL || 'http://localhost:3012';

describe('Azora Ledger - Audit Trail', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Transaction Audit', () => {
    it('should record transaction creation in audit log', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId: 'account-123',
          type: 'credit',
        });

      const res = await request(API_URL)
        .get(`/api/audit/transactions/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.auditLog).toBeDefined();
      expect(res.body.auditLog.action).toBe('CREATE');
    });

    it('should record transaction updates in audit log', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId: 'account-123',
        });

      await request(API_URL)
        .put(`/api/transactions/${createRes.body.data.id}`)
        .send({
          description: 'Updated',
        });

      const res = await request(API_URL)
        .get(`/api/audit/transactions/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.auditLog.length).toBeGreaterThan(1);
    });

    it('should record transaction deletion in audit log', async () => {
      const createRes = await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId: 'account-123',
        });

      await request(API_URL)
        .delete(`/api/transactions/${createRes.body.data.id}`);

      const res = await request(API_URL)
        .get(`/api/audit/transactions/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.auditLog.some((log: any) => log.action === 'DELETE')).toBe(true);
    });
  });

  describe('Account Audit', () => {
    it('should retrieve account audit trail', async () => {
      const accountId = 'account-audit';

      await request(API_URL)
        .post('/api/transactions')
        .send({
          amount: 100,
          currency: 'USD',
          accountId,
          type: 'credit',
        });

      const res = await request(API_URL)
        .get(`/api/audit/accounts/${accountId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.auditLog)).toBe(true);
    });

    it('should filter audit trail by date', async () => {
      const accountId = 'account-date-audit';

      const res = await request(API_URL)
        .get(`/api/audit/accounts/${accountId}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.auditLog)).toBe(true);
    });

    it('should filter audit trail by action type', async () => {
      const accountId = 'account-action-audit';

      const res = await request(API_URL)
        .get(`/api/audit/accounts/${accountId}`)
        .query({
          action: 'CREATE',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.auditLog)).toBe(true);
    });
  });

  describe('Audit Report Generation', () => {
    it('should generate audit report', async () => {
      const res = await request(API_URL)
        .post('/api/audit/reports')
        .send({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          accountIds: ['account-123', 'account-456'],
        });

      expect(res.status).toBe(200);
      expect(res.body.report).toBeDefined();
      expect(res.body.report.totalTransactions).toBeDefined();
    });

    it('should export audit report as CSV', async () => {
      const res = await request(API_URL)
        .get('/api/audit/reports/export')
        .query({
          format: 'csv',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should export audit report as PDF', async () => {
      const res = await request(API_URL)
        .get('/api/audit/reports/export')
        .query({
          format: 'pdf',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
    });
  });
});
