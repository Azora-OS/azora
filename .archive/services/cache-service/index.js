const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class CacheService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3070;
    this.cache = new Map();
    this.ttls = new Map();
    this.setupMiddleware();
    this.setupRoutes();
    this.startCleanup();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'cache-service', timestamp: new Date().toISOString(), keys: this.cache.size });
    });

    this.app.post('/api/cache/set', this.set.bind(this));
    this.app.get('/api/cache/get/:key', this.get.bind(this));
    this.app.delete('/api/cache/delete/:key', this.delete.bind(this));
    this.app.post('/api/cache/clear', this.clear.bind(this));
    this.app.get('/api/cache/keys', this.keys.bind(this));
  }

  set(req, res) {
    const { key, value, ttl } = req.body;
    this.cache.set(key, value);
    if (ttl) this.ttls.set(key, Date.now() + ttl * 1000);
    res.json({ cached: true, key });
  }

  get(req, res) {
    const { key } = req.params;
    if (this.ttls.has(key) && Date.now() > this.ttls.get(key)) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return res.status(404).json({ error: 'Key expired' });
    }
    const value = this.cache.get(key);
    if (value === undefined) return res.status(404).json({ error: 'Key not found' });
    res.json({ key, value });
  }

  delete(req, res) {
    const deleted = this.cache.delete(req.params.key);
    this.ttls.delete(req.params.key);
    res.json({ deleted });
  }

  clear(req, res) {
    const count = this.cache.size;
    this.cache.clear();
    this.ttls.clear();
    res.json({ cleared: count });
  }

  keys(req, res) {
    res.json({ keys: Array.from(this.cache.keys()) });
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      this.ttls.forEach((expiry, key) => {
        if (now > expiry) {
          this.cache.delete(key);
          this.ttls.delete(key);
        }
      });
    }, 60000);
  }

  start() {
    this.app.use(require('./routes'));

app.listen(this.port, () => console.log(`Cache Service running on port ${this.port}`));
  }
}

const service = new CacheService();
if (require.main === module) service.start();
module.exports = service;
