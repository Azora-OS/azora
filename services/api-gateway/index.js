const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');
const CircuitBreaker = require('opossum');
const promClient = require('prom-client');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/gateway-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/gateway.log' }),
    new winston.transports.Console()
  ]
});

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const serviceHealthStatus = new promClient.Gauge({
  name: 'service_health_status',
  help: 'Health status of downstream services (1=healthy, 0=unhealthy)',
  labelNames: ['service', 'instance']
});

const circuitBreakerState = new promClient.Gauge({
  name: 'circuit_breaker_state',
  help: 'State of circuit breakers (0=open, 1=half-open, 2=closed)',
  labelNames: ['service']
});

// Fallback strategies for critical services
const fallbackResponses = {
  auth: {
    verify: { valid: false, message: 'Authentication service temporarily unavailable' },
    profile: { error: 'Profile service temporarily unavailable' }
  },
  default: { error: 'Service temporarily unavailable, please try again later' }
};

// Graceful degradation middleware
const gracefulDegradation = (service, endpoint) => {
  return (req, res, next) => {
    // Check if service is available
    const serviceUrl = serviceRegistry.getServiceUrl(service);
    if (!serviceUrl) {
      logger.warn('Service unavailable, using fallback', { service, endpoint });
      const fallback = fallbackResponses[service]?.[endpoint] || fallbackResponses.default;
      return res.status(503).json(fallback);
    }
    next();
  };
};

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced rate limiting with different tiers
const createRateLimiter = (windowMs, max, message, type) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    rateLimitHits.inc({ type });
    res.status(429).json({ error: message });
  }
});

const generalLimiter = createRateLimiter(15 * 60 * 1000, 1000, 'Too many requests', 'general');
const authLimiter = createRateLimiter(15 * 60 * 1000, 50, 'Too many auth attempts', 'auth');
const paymentLimiter = createRateLimiter(60 * 1000, 10, 'Too many payment requests', 'payment');

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/payments/', paymentLimiter);

// Service registry with health checking and load balancing
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthCheckInterval = 30000; // 30 seconds
    this.initializeServices();
    this.startHealthChecks();
  }

  initializeServices() {
    const serviceConfigs = {
      // Constitutional Governance
      'constitutional-court': { urls: [process.env.CONSTITUTIONAL_COURT_URL || 'http://localhost:4500'], weight: 1 },
      'constitutional-ai': { urls: [process.env.CONSTITUTIONAL_AI_URL || 'http://localhost:4501'], weight: 1 },
      'chronicle': { urls: [process.env.CHRONICLE_URL || 'http://localhost:4400'], weight: 1 },
      
      // Core Services
      auth: { urls: [process.env.AUTH_URL || 'http://localhost:3001'], weight: 1 },
      mint: { urls: [process.env.MINT_URL || 'http://localhost:3002'], weight: 1 },
      lms: { urls: [process.env.LMS_URL || 'http://localhost:3003'], weight: 1 },
      forge: { urls: [process.env.FORGE_URL || 'http://localhost:4700'], weight: 1 },
      nexus: { urls: [process.env.NEXUS_URL || 'http://localhost:3005'], weight: 1 },
      education: { urls: [process.env.EDUCATION_URL || 'http://localhost:3007'], weight: 1 },
      payments: { urls: [process.env.PAYMENTS_URL || 'http://localhost:3008'], weight: 1 },
      analytics: { urls: [process.env.ANALYTICS_URL || 'http://localhost:3009'], weight: 1 },
      
      // Marketplace & Skills
      marketplace: { urls: [process.env.MARKETPLACE_URL || 'http://localhost:4600'], weight: 1 },
      careers: { urls: [process.env.CAREERS_URL || 'http://localhost:4800'], weight: 1 },
      
      // Infrastructure
      health: { urls: [process.env.HEALTH_URL || 'http://localhost:9090'], weight: 1 }
    };

    for (const [name, config] of Object.entries(serviceConfigs)) {
      this.services.set(name, {
        instances: config.urls.map(url => ({ url, healthy: true, lastCheck: Date.now() })),
        weight: config.weight,
        currentIndex: 0
      });
    }
  }

  getServiceUrl(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return null;

    // Round-robin load balancing among healthy instances
    const healthyInstances = service.instances.filter(instance => instance.healthy);
    if (healthyInstances.length === 0) return null;

    const instance = healthyInstances[service.currentIndex % healthyInstances.length];
    service.currentIndex++;
    return instance.url;
  }

  async checkServiceHealth(serviceName, instance) {
    try {
      const response = await fetch(`${instance.url}/health`, {
        method: 'GET',
        timeout: 5000
      });
      instance.healthy = response.ok;
      instance.lastCheck = Date.now();
    } catch (error) {
      instance.healthy = false;
      instance.lastCheck = Date.now();
      logger.warn(`Health check failed for ${serviceName} at ${instance.url}:`, error.message);
    }
  }

  startHealthChecks() {
    setInterval(async () => {
      for (const [serviceName, service] of this.services.entries()) {
        for (const instance of service.instances) {
          await this.checkServiceHealth(serviceName, instance);
        }
      }
    }, this.healthCheckInterval);
  }

  getServiceStatus() {
    const status = {};
    for (const [name, service] of this.services.entries()) {
      status[name] = {
        total: service.instances.length,
        healthy: service.instances.filter(i => i.healthy).length,
        instances: service.instances.map(i => ({
          url: i.url,
          healthy: i.healthy,
          lastCheck: new Date(i.lastCheck).toISOString()
        }))
      };
    }
    return status;
  }
}

const serviceRegistry = new ServiceRegistry();

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;

  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;

    // Extract service name from path for metrics
    const pathParts = req.path.split('/');
    const service = pathParts[2] || 'unknown'; // /api/service/...

    // Record metrics
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode.toString(), service)
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, req.path, res.statusCode.toString(), service)
      .inc();

    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
});

// Enhanced authentication middleware with circuit breaker
const authCircuitBreaker = new CircuitBreaker(async (token) => {
  const authUrl = serviceRegistry.getServiceUrl('auth');
  if (!authUrl) throw new Error('Auth service unavailable');

  const response = await fetch(`${authUrl}/verify`, {
    headers: { 'Authorization': `Bearer ${token}` },
    timeout: 5000
  });

  if (!response.ok) throw new Error('Invalid token');
  return await response.json();
}, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  name: 'auth-service-circuit-breaker'
});

// Track circuit breaker state changes
authCircuitBreaker.on('open', () => {
  circuitBreakerState.labels('auth-service').set(0); // Open
  logger.warn('Auth service circuit breaker opened');
});

authCircuitBreaker.on('halfOpen', () => {
  circuitBreakerState.labels('auth-service').set(1); // Half-open
  logger.info('Auth service circuit breaker half-open');
});

authCircuitBreaker.on('close', () => {
  circuitBreakerState.labels('auth-service').set(2); // Closed
  logger.info('Auth service circuit breaker closed');
});

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Skip auth for public endpoints
  const publicPaths = ['/health', '/api/auth/login', '/api/auth/register', '/status'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = await authCircuitBreaker.fire(token);
    next();
  } catch (error) {
    logger.warn('Authentication failed, using fallback', {
      requestId: req.requestId,
      error: error.message
    });

    // Fallback: Allow request to proceed with limited access
    // In production, you might want to block or redirect
    req.user = { id: 'anonymous', role: 'guest', fallback: true };
    next();
  }
};

app.use(verifyToken);

// Service proxy with enhanced error handling and retries
app.all('/api/:service/*', async (req, res) => {
  const { service } = req.params;
  const serviceUrl = serviceRegistry.getServiceUrl(service);

  if (!serviceUrl) {
    logger.error('Service not found', { requestId: req.requestId, service });
    return res.status(404).json({ error: 'Service not found' });
  }

  const path = req.path.replace(`/api/${service}`, '');
  const url = `${serviceUrl}${path}${req.url.includes('?') ? '&' + req.url.split('?')[1] : ''}`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Request-ID': req.requestId,
        'X-Forwarded-For': req.ip,
        'X-Original-Host': req.get('host'),
        ...(req.user && {
          'X-User-ID': req.user.id,
          'X-User-Role': req.user.role
        })
      };

      // Forward original headers (except sensitive ones)
      const forwardHeaders = ['user-agent', 'accept', 'accept-language'];
      forwardHeaders.forEach(header => {
        if (req.get(header)) {
          headers[header] = req.get(header);
        }
      });

      const requestOptions = {
        method: req.method,
        headers,
        timeout: 30000
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        requestOptions.body = JSON.stringify(req.body);
      }

      logger.info('Proxying request', {
        requestId: req.requestId,
        service,
        method: req.method,
        url,
        attempt
      });

      const response = await fetch(url, requestOptions);

      // Forward response headers
      const responseHeaders = ['content-type', 'cache-control', 'etag'];
      responseHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) res.set(header, value);
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      logger.info('Request proxied successfully', {
        requestId: req.requestId,
        service,
        statusCode: response.status,
        attempt
      });

      return res.status(response.status).json(data);

    } catch (error) {
      lastError = error;
      logger.warn('Request proxy attempt failed', {
        requestId: req.requestId,
        service,
        attempt,
        error: error.message
      });

      if (attempt === maxRetries) break;

      // Exponential backoff with jitter
      const baseDelay = Math.pow(2, attempt) * 1000; // 2^attempt seconds
      const jitter = Math.random() * 1000; // Add up to 1 second of jitter
      const delay = baseDelay + jitter;

      logger.info('Retrying request after delay', {
        requestId: req.requestId,
        attempt,
        delay: Math.round(delay)
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  logger.error('All proxy attempts failed', {
    requestId: req.requestId,
    service,
    error: lastError?.message
  });

  res.status(503).json({
    error: 'Service temporarily unavailable',
    requestId: req.requestId,
    retryAfter: 30 // Suggest client retry after 30 seconds
  });
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const serviceStatus = serviceRegistry.getServiceStatus();
  const overallHealth = Object.values(serviceStatus).every(service => service.healthy > 0);

  res.status(overallHealth ? 200 : 503).json({
    status: overallHealth ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: serviceStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// Service status endpoint
app.get('/status', (req, res) => {
  res.json({
    gateway: 'operational',
    services: serviceRegistry.getServiceStatus(),
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl
  });
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: error.message,
    stack: error.stack
  });
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🌐 API Gateway running on port ${PORT}`);
  console.log(`🌐 API Gateway running on port ${PORT}`);
});
