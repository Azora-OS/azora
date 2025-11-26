const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/analytics/generate-report', (req, res) => {
    const { reportType, parameters, format } = req.body;

    if (!reportType) {
      return res.status(400).json({ error: 'Report type is required' });
    }

    const report = {
      reportId: `report_${Date.now()}`,
      reportType,
      format: format || 'json',
      status: 'completed',
      generatedAt: new Date().toISOString(),
      data: {
        summary: {},
        details: []
      }
    };

    res.json(report);
  });

  app.get('/api/analytics/reports/:reportId', (req, res) => {
    const { reportId } = req.params;

    res.json({
      reportId,
      status: 'completed',
      downloadUrl: `/api/analytics/download/${reportId}`
    });
  });

  app.get('/api/analytics/report-types', (req, res) => {
    res.json({
      types: ['user_activity', 'revenue', 'course_performance', 'system_health'],
      count: 4
    });
  });

  return app;
}

describe('Azora Analytics - Reporting Generation Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/analytics/generate-report', () => {
    it('should generate report of specified type', async () => {
      const response = await request(app)
        .post('/api/analytics/generate-report')
        .send({
          reportType: 'user_activity',
          parameters: { timeRange: 'last_30d' },
          format: 'pdf'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reportId');
      expect(response.body.reportType).toBe('user_activity');
      expect(response.body.format).toBe('pdf');
    });

    it('should return error when report type is missing', async () => {
      const response = await request(app)
        .post('/api/analytics/generate-report')
        .send({ format: 'json' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Report type is required');
    });

    it('should default to JSON format when not specified', async () => {
      const response = await request(app)
        .post('/api/analytics/generate-report')
        .send({ reportType: 'revenue' });

      expect(response.status).toBe(200);
      expect(response.body.format).toBe('json');
    });

    it('should include report data structure', async () => {
      const response = await request(app)
        .post('/api/analytics/generate-report')
        .send({ reportType: 'course_performance' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('details');
    });

    it('should mark report as completed', async () => {
      const response = await request(app)
        .post('/api/analytics/generate-report')
        .send({ reportType: 'system_health' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });
  });

  describe('GET /api/analytics/reports/:reportId', () => {
    it('should retrieve report by ID', async () => {
      const reportId = 'report_123456';
      const response = await request(app)
        .get(`/api/analytics/reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.reportId).toBe(reportId);
      expect(response.body).toHaveProperty('status');
    });

    it('should include download URL', async () => {
      const response = await request(app)
        .get('/api/analytics/reports/report_123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('downloadUrl');
    });
  });

  describe('GET /api/analytics/report-types', () => {
    it('should return available report types', async () => {
      const response = await request(app)
        .get('/api/analytics/report-types');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types.length).toBeGreaterThan(0);
    });
  });
});
