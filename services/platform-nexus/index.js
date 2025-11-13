const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformNexus {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3078;
    this.events = [];
    this.subscriptions = new Map();
    this.services = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'platform-nexus', timestamp: new Date().toISOString(), services: this.services.size });
    });

    this.app.post('/api/nexus/register', (req, res) => {
      const { serviceName, endpoint } = req.body;
      this.services.set(serviceName, { endpoint, registeredAt: new Date() });
      res.json({ registered: true, serviceName });
    });

    this.app.get('/api/nexus/services', (req, res) => {
      res.json({ services: Object.fromEntries(this.services) });
    });

    this.app.post('/api/nexus/publish', (req, res) => {
      const event = { id: Date.now().toString(), ...req.body, timestamp: new Date() };
      this.events.push(event);
      const subs = this.subscriptions.get(req.body.topic) || [];
      subs.forEach(sub => {
        fetch(sub.callback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        }).catch(() => {});
      });
      res.json({ published: true, subscribers: subs.length });
    });

    this.app.post('/api/nexus/subscribe', (req, res) => {
      const { topic, callback } = req.body;
      if (!this.subscriptions.has(topic)) this.subscriptions.set(topic, []);
      this.subscriptions.get(topic).push({ callback, subscribedAt: new Date() });
      res.json({ subscribed: true, topic });
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Nexus running on port ${this.port}`));
  }
}

const service = new PlatformNexus();
if (require.main === module) service.start();
module.exports = service;
