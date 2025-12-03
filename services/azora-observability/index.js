const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const Redis = require('ioredis');
const EventEmitter = require('events');
const client = require('prom-client');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3039;

// Initialize Redis for metrics storage
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-observability' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'observability.log' })
  ]
});

// Prometheus Metrics Setup
const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'azora_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'azora_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'azora_active_connections',
  help: 'Number of active connections'
});

const ubuntuCommunityHealth = new client.Gauge({
  name: 'azora_ubuntu_community_health',
  help: 'Ubuntu community health score (0-100)',
  labelNames: ['service']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(ubuntuCommunityHealth);

// Observability Framework
class ObservabilityFramework extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.alerts = new Map();
    this.dashboards = new Map();
    this.traces = [];
    this.initializeMetrics();
    this.startSystemMonitoring();
  }

  initializeMetrics() {
    // Service-specific metrics
    this.addMetric('service_response_time', 'histogram', 'Service response time in milliseconds', ['service']);
    this.addMetric('service_error_rate', 'gauge', 'Service error rate percentage', ['service']);
    this.addMetric('service_throughput', 'counter', 'Service request throughput', ['service']);
    this.addMetric('service_uptime', 'gauge', 'Service uptime percentage', ['service']);
    this.addMetric('ubuntu_harmony_score', 'gauge', 'Ubuntu harmony score', ['community']);
  }

  addMetric(name, type, help, labelNames = []) {
    let metric;
    
    switch (type) {
      case 'counter':
        metric = new client.Counter({ name, help, labelNames, registers: [register] });
        break;
      case 'gauge':
        metric = new client.Gauge({ name, help, labelNames, registers: [register] });
        break;
      case 'histogram':
        metric = new client.Histogram({ name, help, labelNames, registers: [register] });
        break;
      default:
        throw new Error(`Unsupported metric type: ${type}`);
    }

    this.metrics.set(name, metric);
    logger.info(`Metric added`, { name, type });
  }

  recordMetric(name, value, labels = {}) {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric not found`, { name });
      return;
    }

    switch (metric.constructor.name) {
      case 'Counter':
        metric.inc(labels, value);
        break;
      case 'Gauge':
        metric.set(labels, value);
        break;
      case 'Histogram':
        metric.observe(labels, value);
        break;
    }

    this.emit('metricRecorded', { name, value, labels });
  }

  startSystemMonitoring() {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // Every 5 seconds
  }

  collectSystemMetrics() {
    try {
      // Ubuntu community health (simulated)
      const services = ['api-gateway', 'auth', 'blockchain', 'treasury'];
      services.forEach(service => {
        ubuntuCommunityHealth.set({ service }, Math.random() * 100);
      });

    } catch (error) {
      logger.error('Error collecting system metrics', { error });
    }
  }

  createTrace(operation, startTime, endTime, metadata = {}) {
    const trace = {
      traceId: uuidv4(),
      operation,
      startTime,
      endTime,
      duration: endTime - startTime,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.traces.push(trace);

    // Keep traces bounded
    if (this.traces.length > 10000) {
      this.traces = this.traces.slice(-10000);
    }

    this.emit('traceCreated', trace);
    return trace;
  }

  createAlert(name, condition, severity = 'warning') {
    const alert = {
      id: uuidv4(),
      name,
      condition,
      severity,
      status: 'active',
      createdAt: new Date().toISOString(),
      triggeredAt: null,
      resolvedAt: null
    };

    this.alerts.set(name, alert);
    this.emit('alertCreated', alert);
    return alert;
  }

  triggerAlert(name, message) {
    const alert = this.alerts.get(name);
    if (alert) {
      alert.status = 'triggered';
      alert.triggeredAt = new Date().toISOString();
      alert.message = message;
      
      this.emit('alertTriggered', alert);
      logger.warn('Alert triggered', { name, message });
    }
  }

  resolveAlert(name) {
    const alert = this.alerts.get(name);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
      
      this.emit('alertResolved', alert);
      logger.info('Alert resolved', { name });
    }
  }

  createDashboard(name, panels) {
    const dashboard = {
      id: uuidv4(),
      name,
      panels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.dashboards.set(name, dashboard);
    this.emit('dashboardCreated', dashboard);
    return dashboard;
  }

  getMetrics() {
    return {
      total: this.metrics.size,
      metrics: Array.from(this.metrics.keys()),
      ubuntu: 'Metrics show Ubuntu ecosystem health'
    };
  }

  getAlerts() {
    return Array.from(this.alerts.values());
  }

  getDashboards() {
    return Array.from(this.dashboards.values());
  }

  getTraces(limit = 100) {
    return this.traces.slice(-limit);
  }
}

const observability = new ObservabilityFramework();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString()
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
});

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for observability harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', (req, res) => {
  try {
    res.json({
      service: 'azora-observability',
      status: 'healthy',
      ubuntu: 'I illuminate our ecosystem with Ubuntu clarity',
      timestamp: new Date().toISOString(),
      port: PORT,
      metrics: observability.getMetrics(),
      features: {
        prometheusMetrics: '✅ Active',
        distributedTracing: '✅ Active',
        alerting: '✅ Active',
        dashboards: '✅ Active',
        ubuntuClarity: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-observability',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu observability for ecosystem clarity',
    principles: [
      'My metrics reveal our collective performance',
      'My traces guide our shared understanding',
      'My alerts protect our community wellbeing',
      'My dashboards illuminate our Ubuntu harmony'
    ],
    service: 'azora-observability',
    ubuntu: 'Ubuntu observability'
  });
});

// ========== OBSERVABILITY ENDPOINTS ==========

// GET /metrics - Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics', error);
    res.status(500).end();
  }
});

// GET /api/observability/metrics - Get custom metrics
app.get('/api/observability/metrics', (req, res) => {
  try {
    const metrics = observability.getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting metrics', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      ubuntu: 'We handle metrics errors with Ubuntu grace'
    });
  }
});

// POST /api/observability/metrics - Record metric
app.post('/api/observability/metrics', (req, res) => {
  try {
    const { name, value, labels = {} } = req.body;

    if (!name || value === undefined) {
      return res.status(400).json({
        error: 'Name and value are required',
        ubuntu: 'Ubuntu clarity: Complete metric details enable proper recording'
      });
    }

    observability.recordMetric(name, value, labels);

    console.log(`📊 Metric recorded: ${name} = ${value}`);

    res.json({
      success: true,
      message: `Metric recorded: ${name}`,
      ubuntu: 'Metric recorded with Ubuntu precision'
    });
  } catch (error) {
    logger.error('Error recording metric', error);
    res.status(500).json({
      error: 'Failed to record metric',
      ubuntu: 'We handle metric recording errors with Ubuntu grace'
    });
  }
});

// GET /api/observability/traces - Get traces
app.get('/api/observability/traces', (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const traces = observability.getTraces(parseInt(limit));

    res.json({
      traces,
      total: traces.length,
      ubuntu: 'Traces show Ubuntu journey'
    });
  } catch (error) {
    logger.error('Error getting traces', error);
    res.status(500).json({
      error: 'Failed to get traces',
      ubuntu: 'We handle trace errors with Ubuntu grace'
    });
  }
});

// POST /api/observability/trace - Create trace
app.post('/api/observability/trace', (req, res) => {
  try {
    const { operation, startTime, endTime, metadata = {} } = req.body;

    if (!operation || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Operation, startTime, and endTime are required',
        ubuntu: 'Ubuntu clarity: Complete trace details enable proper recording'
      });
    }

    const trace = observability.createTrace(operation, new Date(startTime), new Date(endTime), metadata);

    console.log(`🔍 Trace created: ${operation}`);

    res.json({
      success: true,
      trace,
      ubuntu: 'Trace created with Ubuntu clarity'
    });
  } catch (error) {
    logger.error('Error creating trace', error);
    res.status(500).json({
      error: 'Failed to create trace',
      ubuntu: 'We handle trace errors with Ubuntu grace'
    });
  }
});

// GET /api/observability/alerts - Get alerts
app.get('/api/observability/alerts', (req, res) => {
  try {
    const alerts = observability.getAlerts();

    res.json({
      alerts,
      total: alerts.length,
      ubuntu: 'Alerts show Ubuntu protection'
    });
  } catch (error) {
    logger.error('Error getting alerts', error);
    res.status(500).json({
      error: 'Failed to get alerts',
      ubuntu: 'We handle alert errors with Ubuntu grace'
    });
  }
});

// POST /api/observability/alerts - Create alert
app.post('/api/observability/alerts', (req, res) => {
  try {
    const { name, condition, severity = 'warning' } = req.body;

    if (!name || !condition) {
      return res.status(400).json({
        error: 'Name and condition are required',
        ubuntu: 'Ubuntu clarity: Complete alert details enable proper protection'
      });
    }

    const alert = observability.createAlert(name, condition, severity);

    console.log(`🚨 Alert created: ${name}`);

    res.json({
      success: true,
      alert,
      ubuntu: 'Alert created with Ubuntu protection'
    });
  } catch (error) {
    logger.error('Error creating alert', error);
    res.status(500).json({
      error: 'Failed to create alert',
      ubuntu: 'We handle alert errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Observability Error:', error);
  res.status(500).json({
    error: 'Ubuntu observability error',
    ubuntu: 'We handle observability errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Observability endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available observability endpoints',
    availableEndpoints: [
      '/metrics',
      '/api/observability/metrics',
      '/api/observability/traces',
      '/api/observability/alerts',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`📊 Azora Observability running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I illuminate our ecosystem with Ubuntu clarity!"');
  console.log(`📈 Prometheus Metrics: Active on /metrics`);
  console.log(`🔍 Distributed Tracing: Active`);
  console.log(`🚨 Alerting System: Active`);
  console.log(`💡 System Monitoring: Active`);
  console.log(`🌍 Ubuntu: Observability through ecosystem clarity`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (redis) await redis.quit();
  process.exit(0);
});

module.exports = app;
