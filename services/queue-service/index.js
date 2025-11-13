const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class QueueService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3071;
    this.queues = new Map();
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
      res.json({ status: 'healthy', service: 'queue-service', timestamp: new Date().toISOString(), queues: this.queues.size });
    });

    this.app.post('/api/queue/:name/enqueue', this.enqueue.bind(this));
    this.app.post('/api/queue/:name/dequeue', this.dequeue.bind(this));
    this.app.get('/api/queue/:name/peek', this.peek.bind(this));
    this.app.get('/api/queue/:name/size', this.size.bind(this));
    this.app.delete('/api/queue/:name/clear', this.clear.bind(this));
  }

  enqueue(req, res) {
    const { name } = req.params;
    const { data, priority = 0 } = req.body;
    
    if (!this.queues.has(name)) this.queues.set(name, []);
    const queue = this.queues.get(name);
    
    const item = { id: Date.now().toString(), data, priority, enqueuedAt: new Date() };
    queue.push(item);
    queue.sort((a, b) => b.priority - a.priority);
    
    res.json({ enqueued: true, item, position: queue.indexOf(item) });
  }

  dequeue(req, res) {
    const { name } = req.params;
    const queue = this.queues.get(name);
    
    if (!queue || queue.length === 0) {
      return res.status(404).json({ error: 'Queue empty' });
    }
    
    const item = queue.shift();
    res.json({ item });
  }

  peek(req, res) {
    const { name } = req.params;
    const queue = this.queues.get(name);
    
    if (!queue || queue.length === 0) {
      return res.status(404).json({ error: 'Queue empty' });
    }
    
    res.json({ item: queue[0] });
  }

  size(req, res) {
    const { name } = req.params;
    const queue = this.queues.get(name);
    res.json({ size: queue ? queue.length : 0 });
  }

  clear(req, res) {
    const { name } = req.params;
    const queue = this.queues.get(name);
    const size = queue ? queue.length : 0;
    this.queues.set(name, []);
    res.json({ cleared: size });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Queue Service running on port ${this.port}`));
  }
}

const service = new QueueService();
if (require.main === module) service.start();
module.exports = service;
