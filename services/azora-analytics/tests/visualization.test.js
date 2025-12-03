const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/analytics/visualize', (req, res) => {
    const { chartType, data, options } = req.body;

    if (!chartType || !data) {
      return res.status(400).json({ error: 'Chart type and data are required' });
    }

    const visualization = {
      visualizationId: `viz_${Date.now()}`,
      chartType,
      config: {
        width: options?.width || 800,
        height: options?.height || 600,
        theme: options?.theme || 'light'
      },
      dataPoints: Array.isArray(data) ? data.length : 0,
      timestamp: new Date().toISOString()
    };

    res.json(visualization);
  });

  app.get('/api/analytics/chart-types', (req, res) => {
    res.json({
      types: ['line', 'bar', 'pie', 'scatter', 'heatmap'],
      count: 5
    });
  });

  return app;
}

describe('Azora Analytics - Visualization Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/analytics/visualize', () => {
    it('should create visualization with specified chart type', async () => {
      const response = await request(app)
        .post('/api/analytics/visualize')
        .send({
          chartType: 'line',
          data: [
            { x: 1, y: 10 },
            { x: 2, y: 20 },
            { x: 3, y: 15 }
          ],
          options: { width: 1000, height: 500 }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('visualizationId');
      expect(response.body.chartType).toBe('line');
      expect(response.body.dataPoints).toBe(3);
    });

    it('should return error when chart type is missing', async () => {
      const response = await request(app)
        .post('/api/analytics/visualize')
        .send({ data: [{ x: 1, y: 2 }] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Chart type and data are required');
    });

    it('should return error when data is missing', async () => {
      const response = await request(app)
        .post('/api/analytics/visualize')
        .send({ chartType: 'bar' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Chart type and data are required');
    });

    it('should use default dimensions when not specified', async () => {
      const response = await request(app)
        .post('/api/analytics/visualize')
        .send({
          chartType: 'pie',
          data: [{ label: 'A', value: 30 }]
        });

      expect(response.status).toBe(200);
      expect(response.body.config.width).toBe(800);
      expect(response.body.config.height).toBe(600);
    });

    it('should use light theme by default', async () => {
      const response = await request(app)
        .post('/api/analytics/visualize')
        .send({
          chartType: 'bar',
          data: [{ x: 'A', y: 10 }]
        });

      expect(response.status).toBe(200);
      expect(response.body.config.theme).toBe('light');
    });
  });

  describe('GET /api/analytics/chart-types', () => {
    it('should return available chart types', async () => {
      const response = await request(app)
        .get('/api/analytics/chart-types');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types).toContain('line');
      expect(response.body.types).toContain('bar');
    });
  });
});
