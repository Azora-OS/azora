#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');
const app = express();

app.use(cors());
app.use(express.json());

class AzoraNexus extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.events = [];
    this.circuitBreakers = new Map();
    this.initServiceDiscovery();
  }

  initServiceDiscovery() {
    this.services.set('ai-family', { url: 'http://localhost:4010', status: 'healthy' });
    this.services.set('sapiens', { url: 'http://localhost:4011', status: 'healthy' });
    this.services.set('mint', { url: 'http://localhost:4012', status: 'healthy' });
    this.services.set('forge', { url: 'http://localhost:4013', status: 'healthy' });
  }

  registerService(name, config) {
    this.services.set(name, {
      ...config,
      registeredAt: new Date(),
      status: 'healthy'
    });
    this.publishEvent('service.registered', { service: name, config });
  }

  publishEvent(eventType, data) {
    const event = {
      id: `event_${Date.now()}`,
      type: eventType,
      data,
      timestamp: new Date(),
      source: 'nexus'
    };
    this.events.push(event);
    this.emit(eventType, event);
    return event;
  }

  getServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    return service ? service.status : 'unknown';
  }

  circuitBreaker(serviceName, operation) {
    const breaker = this.circuitBreakers.get(serviceName) || { 
      failures: 0, 
      state: 'closed',
      lastFailure: null 
    };
    
    if (breaker.state === 'open') {
      throw new Error(`Circuit breaker open for ${serviceName}`);
    }
    
    try {
      const result = operation();
      breaker.failures = 0;
      breaker.state = 'closed';
      this.circuitBreakers.set(serviceName, breaker);
      return result;
    } catch (error) {
      breaker.failures += 1;
      breaker.lastFailure = new Date();
      if (breaker.failures >= 3) {
        breaker.state = 'open';
      }
      this.circuitBreakers.set(serviceName, breaker);
      throw error;
    }
  }
}

const nexus = new AzoraNexus();

app.get('/api/services', (req, res) => {
  const services = Array.from(nexus.services.entries()).map(([name, config]) => ({
    name,
    ...config
  }));
  res.json({ success: true, data: services });
});

app.post('/api/services/register', (req, res) => {
  try {
    const { name, url, metadata } = req.body;
    nexus.registerService(name, { url, metadata });
    res.json({ success: true, message: 'Service registered' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/events/publish', (req, res) => {
  try {
    const { type, data } = req.body;
    const event = nexus.publishEvent(type, data);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const events = nexus.events.slice(-limit);
  res.json({ success: true, data: events });
});

app.get('/api/health/:service', (req, res) => {
  const health = nexus.getServiceHealth(req.params.service);
  res.json({ success: true, data: { service: req.params.service, health } });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Azora Nexus',
    status: 'healthy',
    timestamp: new Date(),
    stats: { services: nexus.services.size, events: nexus.events.length },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4016;
app.listen(PORT, () => {
  console.log(`🌐 Azora Nexus running on port ${PORT}`);
});

module.exports = app;