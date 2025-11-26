import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';

const API_URL = process.env.TREASURY_SERVICE_URL || 'http://localhost:3028';

describe('Azora Treasury - Reporting', () => {
  describe('Financial Reports', () => {
    it('should generate financial report', async () => {
      const res = await request(API_URL)
        .get('/api/reports');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAssets).toBeDefined();
      expect(res.body.data.totalLiabilities).toBeDefined();
      expect(res.body.data.netWorth).toBeDefined();
    });

    it('should include asset breakdown in report', async () => {
      const res = await request(API_URL)
        .get('/api/reports');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.assetBreakdown)).toBe(true);
      expect(res.body.data.assetBreakdown.length).toBeGreaterThan(0);
    });

    it('should calculate net worth correctly', async () => {
      const res = await request(API_URL)
        .get('/api/reports');

      expect(res.status).toBe(200);
      const { totalAssets, totalLiabilities, netWorth } = res.body.data;
      expect(netWorth).toBe(totalAssets - totalLiabilities);
    });

    it('should retrieve specific report by ID', async () => {
      const createRes = await request(API_URL)
        .get('/api/reports');

      const res = await request(API_URL)
        .get(`/api/reports/${createRes.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createRes.body.data.id);
    });

    it('should retrieve report history', async () => {
      const res = await request(API_URL)
        .get('/api/reports/history');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate portfolio performance', async () => {
      const res = await request(API_URL)
        .get('/api/reports/performance')
        .query({
          period: '30d',
        });

      expect(res.status).toBe(200);
      expect(res.body.performance).toBeDefined();
      expect(res.body.returnPercentage).toBeDefined();
    });

    it('should track asset value changes', async () => {
      const res = await request(API_URL)
        .get('/api/reports/value-changes')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.changes)).toBe(true);
    });

    it('should calculate ROI', async () => {
      const res = await request(API_URL)
        .get('/api/reports/roi');

      expect(res.status).toBe(200);
      expect(res.body.roi).toBeDefined();
      expect(typeof res.body.roi).toBe('number');
    });
  });

  describe('Compliance Reports', () => {
    it('should generate compliance report', async () => {
      const res = await request(API_URL)
        .get('/api/reports/compliance');

      expect(res.status).toBe(200);
      expect(res.body.compliant).toBeDefined();
      expect(res.body.checks).toBeDefined();
    });

    it('should verify reserve requirements', async () => {
      const res = await request(API_URL)
        .get('/api/reports/reserve-requirements');

      expect(res.status).toBe(200);
      expect(res.body.meetsRequirements).toBeDefined();
      expect(res.body.requiredReserves).toBeDefined();
      expect(res.body.actualReserves).toBeDefined();
    });

    it('should generate audit trail report', async () => {
      const res = await request(API_URL)
        .get('/api/reports/audit-trail')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.auditTrail)).toBe(true);
    });
  });

  describe('Export Functionality', () => {
    it('should export report as PDF', async () => {
      const res = await request(API_URL)
        .get('/api/reports/export')
        .query({
          format: 'pdf',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('should export report as CSV', async () => {
      const res = await request(API_URL)
        .get('/api/reports/export')
        .query({
          format: 'csv',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should export report as JSON', async () => {
      const res = await request(API_URL)
        .get('/api/reports/export')
        .query({
          format: 'json',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
    });
  });

  describe('Scheduled Reports', () => {
    it('should schedule report generation', async () => {
      const res = await request(API_URL)
        .post('/api/reports/schedule')
        .send({
          frequency: 'monthly',
          reportType: 'financial',
          recipients: ['admin@azora.com'],
        });

      expect(res.status).toBe(201);
      expect(res.body.scheduleId).toBeDefined();
    });

    it('should retrieve scheduled reports', async () => {
      const res = await request(API_URL)
        .get('/api/reports/scheduled');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.schedules)).toBe(true);
    });

    it('should cancel scheduled report', async () => {
      const createRes = await request(API_URL)
        .post('/api/reports/schedule')
        .send({
          frequency: 'weekly',
          reportType: 'compliance',
        });

      const res = await request(API_URL)
        .delete(`/api/reports/schedule/${createRes.body.scheduleId}`);

      expect(res.status).toBe(200);
      expect(res.body.canceled).toBe(true);
    });
  });
});
