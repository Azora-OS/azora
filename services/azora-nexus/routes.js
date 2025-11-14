const express = require('express');
const router = express.Router();
const eventBus = require('./engines/event-bus');
const serviceConnector = require('./service-connector');

// Event publishing
router.post('/api/events', async (req, res) => {
  try {
    const { type, data, source = 'api' } = req.body;
    const event = await eventBus.publish(type, { ...data, source });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Event history
router.get('/api/events', (req, res) => {
  const { limit = 100 } = req.query;
  const history = eventBus.getEventHistory(parseInt(limit));
  res.json({ success: true, events: history, total: history.length });
});

// Event subscriptions
router.get('/api/events/types', (req, res) => {
  const types = eventBus.getAllEventTypes();
  const subscriptions = types.map(type => ({
    type,
    subscribers: eventBus.getSubscribers(type)
  }));
  res.json({ success: true, subscriptions });
});

// Service status
router.get('/api/services', (req, res) => {
  const status = serviceConnector.getServiceStatus();
  res.json({ success: true, services: status });
});

// Service health check
router.get('/api/services/health', async (req, res) => {
  const health = await serviceConnector.healthCheckAll();
  res.json({ success: true, health });
});

// Service-specific health
router.get('/api/services/:name/health', async (req, res) => {
  const health = await serviceConnector.checkHealth(req.params.name);
  res.json({ success: true, service: req.params.name, health });
});

module.exports = router;
