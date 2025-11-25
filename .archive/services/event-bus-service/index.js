const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class EventBusService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3069;
    this.subscribers = new Map();
    this.events = [];
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
      res.json({ status: 'healthy', service: 'event-bus-service', timestamp: new Date().toISOString(), subscribers: this.subscribers.size });
    });

    this.app.post('/api/events/publish', this.publish.bind(this));
    this.app.post('/api/events/subscribe', this.subscribe.bind(this));
    this.app.delete('/api/events/unsubscribe/:id', this.unsubscribe.bind(this));
    this.app.get('/api/events/history', this.getHistory.bind(this));
  }

  publish(req, res) {
    const { event, data } = req.body;
    const eventData = { id: Date.now().toString(), event, data, timestamp: new Date() };
    this.events.push(eventData);
    
    const subscribers = this.subscribers.get(event) || [];
    subscribers.forEach(sub => {
      fetch(sub.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).catch(() => {});
    });
    
    res.json({ published: true, subscribers: subscribers.length });
  }

  subscribe(req, res) {
    const { event, webhook } = req.body;
    const id = Date.now().toString();
    const sub = { id, event, webhook, createdAt: new Date() };
    
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    this.subscribers.get(event).push(sub);
    
    res.json({ subscription: sub });
  }

  unsubscribe(req, res) {
    let found = false;
    this.subscribers.forEach((subs, event) => {
      const filtered = subs.filter(s => s.id !== req.params.id);
      if (filtered.length !== subs.length) {
        this.subscribers.set(event, filtered);
        found = true;
      }
    });
    res.json({ unsubscribed: found });
  }

  getHistory(req, res) {
    const { event, limit = 100 } = req.query;
    let events = this.events;
    if (event) events = events.filter(e => e.event === event);
    res.json({ events: events.slice(-limit) });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Event Bus Service running on port ${this.port}`));
  }
}

const service = new EventBusService();
if (require.main === module) service.start();
module.exports = service;
