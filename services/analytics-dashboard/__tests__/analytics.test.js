const request = require('supertest');
const app = require('../index.js');

describe('Analytics Dashboard Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('analytics-dashboard');
    });
  });

  // Get all metrics test
  describe('GET /api/metrics', () => {
    it('should return all metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  // Get specific metric test
  describe('GET /api/metrics/:metricType', () => {
    it('should return specific metric data', async () => {
      const response = await request(app)
        .get('/api/metrics/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('users');
      expect(response.body.data.value).toBeDefined();
    });

    it('should return 404 for non-existent metric', async () => {
      const response = await request(app)
        .get('/api/metrics/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Metric not found');
    });
  });

  // Update metric test
  describe('PUT /api/metrics/:metricType', () => {
    it('should update a metric', async () => {
      const metricData = {
        value: {
          total: 15000,
          active: 10000,
          new: 500
        }
      };

      const response = await request(app)
        .put('/api/metrics/users')
        .send(metricData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('users');
      expect(response.body.data.value.total).toBe(15000);
    });

    it('should return 400 for missing value', async () => {
      const response = await request(app)
        .put('/api/metrics/users')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Value is required');
    });
  });

  // Report generation test
  describe('POST /api/reports', () => {
    it('should generate a report', async () => {
      const reportData = {
        type: 'user-engagement',
        period: 'monthly'
      };

      const response = await request(app)
        .post('/api/reports')
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('user-engagement');
      expect(response.body.data.period).toBe('monthly');
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for missing type or period', async () => {
      const reportData = {
        type: 'user-engagement'
      };

      const response = await request(app)
        .post('/api/reports')
        .send(reportData)
        .expect(400);

      expect(response.body.error).toBe('Type and period are required');
    });
  });

  // Get all reports test
  describe('GET /api/reports', () => {
    it('should return all reports', async () => {
      const response = await request(app)
        .get('/api/reports')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Get specific report test
  describe('GET /api/reports/:reportId', () => {
    let reportId;

    beforeAll(async () => {
      // Create a report first
      const reportData = {
        type: 'revenue',
        period: 'quarterly'
      };

      const response = await request(app)
        .post('/api/reports')
        .send(reportData);

      reportId = response.body.data.id;
    });

    it('should return specific report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/reports/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Report not found');
    });
  });

  // Data visualization test
  describe('GET /api/visualizations/:type', () => {
    it('should generate a visualization', async () => {
      const response = await request(app)
        .get('/api/visualizations/bar-chart')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('bar-chart');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });
  });

  // Get all visualizations test
  describe('GET /api/visualizations', () => {
    it('should return all visualizations', async () => {
      const response = await request(app)
        .get('/api/visualizations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
