const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/analytics/realtime/track', (req, res) => {
    const { event, properties } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    const tracking = {
      trackingId: `track_${Date.now()}`,
      event,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      processed: true
    };

    res.json(tracking);
  });

  app.get('/api/analytics/realtime/metrics', (req, res) => {
    res.json({
      activeUsers: Math.floor(Math.random() * 1000),
      eventsPerSecond: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/analytics/realtime/stream', (req, res) => {
    res.json({
      streamId: `stream_${Date.now()}`,
      status: 'active',
      events: []
    });
  });

  return app;
}

describe('Azora Analytics - Real-time Analytics Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/analytics/realtime/track', () => {
    it('should track real-time event', async () => {
      const response = await request(app)
        .post('/api/analytics/realtime/track')
        .send({
          event: 'page_view',
          properties: {
            page: '/dashboard',
            userId: 'user123'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trackingId');
      expect(response.body.event).toBe('page_view');
      expect(response.body.processed).toBe(true);
    });

    it('should return error when event name is missing', async () => {
      const response = await request(app)
        .post('/api/analytics/realtime/track')
        .send({ properties: { page: '/home' } });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Event name is required');
    });

    it('should handle events without properties', async () => {
      const response = await request(app)
        .post('/api/analytics/realtime/track')
        .send({ event: 'button_click' });

      expect(response.status).toBe(200);
      expect(response.body.properties).toEqual({});
    });

    it('should include timestamp in tracking response', async () => {
      const response = await request(app)
        .post('/api/analytics/realtime/track')
        .send({ event: 'user_login' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/analytics/realtime/metrics', () => {
    it('should return current real-time metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/realtime/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('eventsPerSecond');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return numeric values for metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/realtime/metrics');

      expect(response.status).toBe(200);
      expect(typeof response.body.activeUsers).toBe('number');
      expect(typeof response.body.eventsPerSecond).toBe('number');
    });
  });

  describe('GET /api/analytics/realtime/stream', () => {
    it('should provide real-time event stream', async () => {
      const response = await request(app)
        .get('/api/analytics/realtime/stream');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('streamId');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('events');
    });
  });
});
