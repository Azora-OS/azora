const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class MonitoringService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3072;
    this.metrics = new Map();
    this.alerts = [];
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
      res.json({ status: 'healthy', service: 'monitoring-service', timestamp: new Date().toISOString(), metrics: this.metrics.size });
    });

    this.app.post('/api/metrics/record', this.recordMetric.bind(this));
    this.app.get('/api/metrics/:service', this.getMetrics.bind(this));
    this.app.get('/api/metrics/:service/summary', this.getSummary.bind(this));
    this.app.post('/api/alerts', this.createAlert.bind(this));
    this.app.get('/api/alerts', this.getAlerts.bind(this));
  }

  recordMetric(req, res) {
    const { service, metric, value, tags } = req.body;
    const key = `${service}:${metric}`;
    
    if (!this.metrics.has(key)) this.metrics.set(key, []);
    const metrics = this.metrics.get(key);
    
    metrics.push({ value, tags, timestamp: new Date() });
    if (metrics.length > 1000) metrics.shift();
    
    res.json({ recorded: true });
  }

  getMetrics(req, res) {
    const { service } = req.params;
    const { metric, limit = 100 } = req.query;
    
    const key = metric ? `${service}:${metric}` : null;
    if (key) {
      const metrics = this.metrics.get(key) || [];
      return res.json({ metrics: metrics.slice(-limit) });
    }
    
    const allMetrics = {};
    this.metrics.forEach((values, k) => {
      if (k.startsWith(service + ':')) {
        allMetrics[k.split(':')[1]] = values.slice(-limit);
      }
    });
    
    res.json({ metrics: allMetrics });
  }

  getSummary(req, res) {
    const { service } = req.params;
    const summary = {};
    
    this.metrics.forEach((values, key) => {
      if (key.startsWith(service + ':')) {
        const metric = key.split(':')[1];
        const nums = values.map(v => v.value).filter(v => typeof v === 'number');
        if (nums.length > 0) {
          summary[metric] = {
            count: nums.length,
            avg: nums.reduce((a, b) => a + b, 0) / nums.length,
            min: Math.min(...nums),
            max: Math.max(...nums)
          };
        }
      }
    });
    
    res.json({ summary });
  }

  createAlert(req, res) {
    const { service, condition, severity, message } = req.body;
    const alert = { id: Date.now().toString(), service, condition, severity, message, createdAt: new Date() };
    this.alerts.push(alert);
    res.json({ alert });
  }

  getAlerts(req, res) {
    const { service, severity } = req.query;
    let alerts = this.alerts;
    if (service) alerts = alerts.filter(a => a.service === service);
    if (severity) alerts = alerts.filter(a => a.severity === severity);
    res.json({ alerts: alerts.slice(-100) });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Monitoring Service running on port ${this.port}`));
  }
}

const service = new MonitoringService();
if (require.main === module) service.start();
module.exports = service;
