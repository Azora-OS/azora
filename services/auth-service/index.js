const express = require('express');
const { setupMfa, verifyMfa, disableMfa } = require('./src/mfa');
const { handleGoogleOAuth, handleGitHubOAuth, handleAppleOAuth } = require('./src/oauth');
const promClient = require('prom-client');
const { PrismaClient } = require('@prisma/client');
const { setupMiddleware } = require('../shared/middleware');
const rateLimit = require('express-rate-limit');
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

// Setup shared middleware (Helmet, CORS, Body Parser, Health Check)
setupMiddleware(app);

// Rate Limiter
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(authRateLimiter);

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

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API routes
app.use('/api/auth', api);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

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
