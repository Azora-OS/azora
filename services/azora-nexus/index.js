#!/usr/bin/env node

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const EventEmitter = require('events');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

class AzoraNexus extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.events = [];
    this.circuitBreakers = new Map();
    this.subscriptions = new Map();
    this.wsClients = new Set();
    this.maxEvents = 1000;
    this.initServiceDiscovery();
  }

  initServiceDiscovery() {
    const defaultServices = [
      { name: 'education', url: 'http://localhost:4200', port: 4200 },
      { name: 'lms', url: 'http://localhost:4015', port: 4015 },
      { name: 'mint', url: 'http://localhost:4020', port: 4020 },
      { name: 'forge', url: 'http://localhost:4030', port: 4030 },
      { name: 'sapiens', url: 'http://localhost:4011', port: 4011 },
      { name: 'ai-family', url: 'http://localhost:4010', port: 4010 }
    ];

    defaultServices.forEach(svc => {
      this.services.set(svc.name, { ...svc, status: 'healthy', lastCheck: new Date() });
    });
  }

  registerService(name, config) {
    this.services.set(name, {
      ...config,
      registeredAt: new Date(),
      lastCheck: new Date(),
      status: 'healthy',
      healthCheckInterval: config.healthCheckInterval || 30000
    });
    this.publishEvent('service.registered', { service: name, config });
    return this.services.get(name);
  }

  unregisterService(name) {
    if (!this.services.has(name)) throw new Error('Service not found');
    this.services.delete(name);
    this.publishEvent('service.unregistered', { service: name });
  }

  updateServiceStatus(name, status) {
    const service = this.services.get(name);
    if (!service) throw new Error('Service not found');
    service.status = status;
    service.lastCheck = new Date();
    this.publishEvent('service.status_changed', { service: name, status });
  }

  publishEvent(eventType, data, source = 'nexus') {
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data,
      timestamp: new Date(),
      source
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.emit(eventType, event);
    this.broadcastToSubscribers(event);
    this.broadcastToWebSockets(event);

    return event;
  }

  subscribe(clientId, eventTypes) {
    if (!this.subscriptions.has(clientId)) {
      this.subscriptions.set(clientId, { eventTypes: [], createdAt: new Date() });
    }
    const sub = this.subscriptions.get(clientId);
    sub.eventTypes = [...new Set([...sub.eventTypes, ...eventTypes])];
    return sub;
  }

  unsubscribe(clientId, eventTypes = null) {
    if (!eventTypes) {
      this.subscriptions.delete(clientId);
    } else {
      const sub = this.subscriptions.get(clientId);
      if (sub) {
        sub.eventTypes = sub.eventTypes.filter(t => !eventTypes.includes(t));
      }
    }
  }

  broadcastToSubscribers(event) {
    for (const [clientId, sub] of this.subscriptions.entries()) {
      if (sub.eventTypes.includes(event.type) || sub.eventTypes.includes('*')) {
        this.emit(`client.${clientId}`, event);
      }
    }
  }

  broadcastToWebSockets(event) {
    const message = JSON.stringify({ type: 'event', data: event });
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  getServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    return service ? service.status : 'unknown';
  }

  getAllServices() {
    return Array.from(this.services.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  getEvents(filter = {}) {
    let filtered = [...this.events];

    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }
    if (filter.source) {
      filtered = filtered.filter(e => e.source === filter.source);
    }
    if (filter.since) {
      const since = new Date(filter.since);
      filtered = filtered.filter(e => new Date(e.timestamp) >= since);
    }

    const limit = filter.limit || 50;
    return filtered.slice(-limit).reverse();
  }

  circuitBreaker(serviceName, operation) {
    const breaker = this.circuitBreakers.get(serviceName) || { 
      failures: 0, 
      state: 'closed',
      lastFailure: null,
      successCount: 0
    };
    
    if (breaker.state === 'open') {
      const timeSinceFailure = Date.now() - breaker.lastFailure;
      if (timeSinceFailure > 60000) {
        breaker.state = 'half-open';
      } else {
        throw new Error(`Circuit breaker open for ${serviceName}`);
      }
    }
    
    try {
      const result = operation();
      breaker.failures = 0;
      breaker.successCount += 1;
      if (breaker.state === 'half-open' && breaker.successCount >= 3) {
        breaker.state = 'closed';
        breaker.successCount = 0;
      }
      this.circuitBreakers.set(serviceName, breaker);
      return result;
    } catch (error) {
      breaker.failures += 1;
      breaker.lastFailure = Date.now();
      breaker.successCount = 0;
      if (breaker.failures >= 3) {
        breaker.state = 'open';
        this.publishEvent('circuit_breaker.opened', { service: serviceName });
      }
      this.circuitBreakers.set(serviceName, breaker);
      throw error;
    }
  }

  getCircuitBreakerStatus(serviceName) {
    return this.circuitBreakers.get(serviceName) || { state: 'closed', failures: 0 };
  }
}

const nexus = new AzoraNexus();

// WebSocket handling
wss.on('connection', (ws) => {
  nexus.wsClients.add(ws);
  console.log('WebSocket client connected');

  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Azora Nexus' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe') {
        ws.clientId = data.clientId || `client_${Date.now()}`;
        nexus.subscribe(ws.clientId, data.eventTypes || ['*']);
        ws.send(JSON.stringify({ type: 'subscribed', clientId: ws.clientId }));
      } else if (data.type === 'publish') {
        const event = nexus.publishEvent(data.eventType, data.data, data.source);
        ws.send(JSON.stringify({ type: 'published', event }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    nexus.wsClients.delete(ws);
    if (ws.clientId) {
      nexus.unsubscribe(ws.clientId);
    }
    console.log('WebSocket client disconnected');
  });
});

// Service discovery
app.get('/api/services', (req, res) => {
  const services = nexus.getAllServices();
  res.json({ success: true, data: services, count: services.length });
});

app.get('/api/services/:name', (req, res) => {
  const service = nexus.services.get(req.params.name);
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.json({ success: true, data: service });
});

app.post('/api/services/register', (req, res) => {
  try {
    const { name, url, metadata } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, error: 'name and url required' });
    }
    const service = nexus.registerService(name, { url, metadata });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/services/:name', (req, res) => {
  try {
    nexus.unregisterService(req.params.name);
    res.json({ success: true, message: 'Service unregistered' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/services/:name/status', (req, res) => {
  try {
    const { status } = req.body;
    nexus.updateServiceStatus(req.params.name, status);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Event bus
app.post('/api/events/publish', (req, res) => {
  try {
    const { type, data, source } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, error: 'type required' });
    }
    const event = nexus.publishEvent(type, data, source);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/events', (req, res) => {
  const filter = {
    type: req.query.type,
    source: req.query.source,
    since: req.query.since,
    limit: parseInt(req.query.limit) || 50
  };
  const events = nexus.getEvents(filter);
  res.json({ success: true, data: events, count: events.length });
});

app.post('/api/events/subscribe', (req, res) => {
  try {
    const { clientId, eventTypes } = req.body;
    if (!clientId || !eventTypes) {
      return res.status(400).json({ success: false, error: 'clientId and eventTypes required' });
    }
    const sub = nexus.subscribe(clientId, eventTypes);
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/events/subscribe/:clientId', (req, res) => {
  nexus.unsubscribe(req.params.clientId);
  res.json({ success: true, message: 'Unsubscribed' });
});

// Circuit breaker
app.get('/api/circuit-breaker/:service', (req, res) => {
  const status = nexus.getCircuitBreakerStatus(req.params.service);
  res.json({ success: true, data: status });
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
    stats: { 
      services: nexus.services.size, 
      events: nexus.events.length,
      subscriptions: nexus.subscriptions.size,
      wsConnections: nexus.wsClients.size
    },
    version: '2.0.0'
  });
});

const PORT = process.env.PORT || 4016;
server.listen(PORT, () => {
  console.log(`🌐 Azora Nexus running on port ${PORT}`);
  console.log('🔌 WebSocket event bus, service discovery, and circuit breakers active');
});

module.exports = app;