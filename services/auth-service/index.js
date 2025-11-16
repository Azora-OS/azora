const express = require('express');
const { setupMfa, verifyMfa, disableMfa } = require('./src/mfa');
const { handleGoogleOAuth, handleGitHubOAuth, handleAppleOAuth } = require('./src/oauth');
const promClient = require('prom-client');
const { PrismaClient } = require('@prisma/client');
const { helmetConfig, corsConfig, rateLimiters, errorHandler } = require('../shared/middleware');
const api = require('./src/api');

const prisma = new PrismaClient();
const app = express();

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(rateLimiters.auth); // Auth service - strict rate limiting

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
  });
  next();
});

// MFA routes
app.post('/api/auth/mfa/setup', setupMfa);
app.post('/api/auth/mfa/verify', verifyMfa);
app.post('/api/auth/mfa/disable', disableMfa);

// OAuth routes
app.post('/api/auth/oauth/google', handleGoogleOAuth);
app.post('/api/auth/oauth/github', handleGitHubOAuth);
app.post('/api/auth/oauth/apple', handleAppleOAuth);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API routes
app.use('/', api);

app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Azora Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start auth service:', error);
    process.exit(1);
  }
};

startServer();
