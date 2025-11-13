const express = require('express');
const router = express.Router();
const eventBus = require('../engines/event-bus');
const serviceDiscovery = require('../engines/service-discovery');
const circuitBreaker = require('../engines/circuit-breaker');

router.post('/events/publish', async (req, res) => {
  try {
    const { eventType, data } = req.body;
    const event = await eventBus.publish(eventType, data);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/events/history', (req, res) => {
  const { limit } = req.query;
  const history = eventBus.getEventHistory(parseInt(limit) || 100);
  res.json(history);
});

router.get('/events/types', (req, res) => {
  const types = eventBus.getAllEventTypes();
  res.json(types);
});

router.post('/services/register', (req, res) => {
  const { serviceName, config } = req.body;
  const service = serviceDiscovery.register(serviceName, config);
  res.json(service);
});

router.delete('/services/:name', (req, res) => {
  const result = serviceDiscovery.deregister(req.params.name);
  res.json({ success: result });
});

router.get('/services', (req, res) => {
  const services = serviceDiscovery.getAllServices();
  res.json(services);
});

router.get('/services/:name', (req, res) => {
  const service = serviceDiscovery.getService(req.params.name);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

router.get('/services/:name/health', async (req, res) => {
  const result = await serviceDiscovery.healthCheck(req.params.name);
  res.json(result);
});

router.get('/circuit/:name', (req, res) => {
  const state = circuitBreaker.getState(req.params.name);
  res.json({ service: req.params.name, state });
});

router.post('/circuit/:name/reset', (req, res) => {
  circuitBreaker.reset(req.params.name);
  res.json({ success: true });
});

module.exports = router;
