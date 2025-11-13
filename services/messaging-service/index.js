const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class MessagingService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3061;
    this.data = new Map();
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
      res.json({ status: 'healthy', service: 'messaging-service', timestamp: new Date().toISOString(), items: this.data.size });
    });

    this.app.post('/api/messaging', this.sendMessage.bind(this));
    this.app.get('/api/messaging', this.getMessages.bind(this));
    this.app.post('/api/messaging', this.subscribe.bind(this));
  }

  sendMessage(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getMessages(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  subscribe(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  start() {
    this.app.listen(this.port, () => console.log(`messaging-service running on port ${this.port}`));
  }
}

const service = new MessagingService();
if (require.main === module) service.start();
module.exports = service;
