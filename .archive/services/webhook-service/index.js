const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class WebhookService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3073;
    this.webhooks = new Map();
    this.deliveries = [];
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
      res.json({ status: 'healthy', service: 'webhook-service', timestamp: new Date().toISOString(), webhooks: this.webhooks.size });
    });

    this.app.post('/api/webhooks', this.create.bind(this));
    this.app.get('/api/webhooks', this.getAll.bind(this));
    this.app.delete('/api/webhooks/:id', this.delete.bind(this));
    this.app.post('/api/webhooks/:id/trigger', this.trigger.bind(this));
    this.app.get('/api/webhooks/:id/deliveries', this.getDeliveries.bind(this));
  }

  create(req, res) {
    const { url, events, secret } = req.body;
    const id = Date.now().toString();
    const webhook = { id, url, events, secret, active: true, createdAt: new Date() };
    this.webhooks.set(id, webhook);
    res.status(201).json({ webhook });
  }

  getAll(req, res) {
    res.json({ webhooks: Array.from(this.webhooks.values()) });
  }

  delete(req, res) {
    const deleted = this.webhooks.delete(req.params.id);
    res.json({ deleted });
  }

  async trigger(req, res) {
    const webhook = this.webhooks.get(req.params.id);
    if (!webhook) return res.status(404).json({ error: 'Webhook not found' });
    
    const { event, data } = req.body;
    if (!webhook.events.includes(event)) {
      return res.status(400).json({ error: 'Event not subscribed' });
    }
    
    const deliveryId = Date.now().toString();
    const delivery = { id: deliveryId, webhookId: webhook.id, event, data, status: 'pending', timestamp: new Date() };
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': webhook.secret || '' },
        body: JSON.stringify({ event, data })
      });
      
      delivery.status = response.ok ? 'delivered' : 'failed';
      delivery.statusCode = response.status;
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error.message;
    }
    
    this.deliveries.push(delivery);
    res.json({ delivery });
  }

  getDeliveries(req, res) {
    const deliveries = this.deliveries.filter(d => d.webhookId === req.params.id);
    res.json({ deliveries: deliveries.slice(-50) });
  }

  start() {
    this.app.use(require('./routes'));

app.listen(this.port, () => console.log(`Webhook Service running on port ${this.port}`));
  }
}

const service = new WebhookService();
if (require.main === module) service.start();
module.exports = service;
