const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  const helmet = require('helmet');
  const cors = require('cors');

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.post('/api/analytics/aggregate', (req, res) => {
    const { dataSource, metrics, timeRange } = req.body;

    if (!dataSource || !metrics) {
      return res.status(400).json({ error: 'Data source and metrics are required' });
    }

    const aggregation = {
      aggregationId: `agg_${Date.now()}`,
      dataSource,
      metrics,
      timeRange: timeRange || 'last_24h',
      results: {},
      timestamp: new Date().toISOString()
    };

    // Simulate aggregation results
    metrics.forEach(metric => {
      aggregation.results[metric] = {
        value: Math.floor(Math.random() * 1000),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    });

    res.json(aggregation);
  });

  app.get('/api/analytics/data-sources', (req, res) => {
    res.json({
      sources: ['users', 'transactions', 'courses', 'payments'],
      count: 4
    });
  });

  return app;
}

describe('Azora Analytics - Data Aggregation Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/analytics/aggregate', () => {
    it('should aggregate data from specified source', async () => {
      const response = await request(app)
        .post('/api/analytics/aggregate')
        .send({
          dataSource: 'users',
          metrics: ['total_count', 'active_users'],
          timeRange: 'last_7d'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('aggregationId');
      expect(response.body.dataSource).toBe('users');
      expect(response.body.metrics).toEqual(['total_count', 'active_users']);
    });

    it('should return error when data source is missing', async () => {
      const response = await request(app)
        .post('/api/analytics/aggregate')
        .send({ metrics: ['count'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Data source and metrics are required');
    });

    it('should return error when metrics are missing', async () => {
      const response = await request(app)
        .post('/api/analytics/aggregate')
        .send({ dataSource: 'users' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Data source and metrics are required');
    });

    it('should default to last 24 hours when timeRange not specified', async () => {
      const response = await request(app)
        .post('/api/analytics/aggregate')
        .send({
          dataSource: 'transactions',
          metrics: ['total_amount']
        });

      expect(response.status).toBe(200);
      expect(response.body.timeRange).toBe('last_24h');
    });

    it('should return aggregated results for all metrics', async () => {
      const response = await request(app)
        .post('/api/analytics/aggregate')
        .send({
          dataSource: 'courses',
          metrics: ['enrollments', 'completions', 'revenue']
        });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveProperty('enrollments');
      expect(response.body.results).toHaveProperty('completions');
      expect(response.body.results).toHaveProperty('revenue');
    });
  });

  describe('GET /api/analytics/data-sources', () => {
    it('should return available data sources', async () => {
      const response = await request(app)
        .get('/api/analytics/data-sources');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sources');
      expect(Array.isArray(response.body.sources)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });
  });
});
