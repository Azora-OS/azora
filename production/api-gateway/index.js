const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../shared/logger');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const EDUCATION_SERVICE = process.env.EDUCATION_SERVICE_URL || 'http://localhost:4002';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4003';

// Proxy configuration with retry logic
const proxyOptions = {
  changeOrigin: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    logger.error('Proxy error:', err);
    res.status(502).json({
      success: false,
      error: 'Service temporarily unavailable',
    });
  },
  onProxyReq: (proxyReq, req) => {
    // Forward headers
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
};

// Auth service routes
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  ...proxyOptions,
}));

// Education service routes
app.use('/api/courses', createProxyMiddleware({
  target: EDUCATION_SERVICE,
  ...proxyOptions,
}));

app.use('/api/enrollments', createProxyMiddleware({
  target: EDUCATION_SERVICE,
  ...proxyOptions,
}));

// Payment service routes
app.use('/api/wallet', createProxyMiddleware({
  target: PAYMENT_SERVICE,
  ...proxyOptions,
}));

app.use('/api/transactions', createProxyMiddleware({
  target: PAYMENT_SERVICE,
  ...proxyOptions,
}));

app.use('/api/earn', createProxyMiddleware({
  target: PAYMENT_SERVICE,
  ...proxyOptions,
}));

app.use('/api/payments', createProxyMiddleware({
  target: PAYMENT_SERVICE,
  ...proxyOptions,
}));

app.use('/api/refunds', createProxyMiddleware({
  target: PAYMENT_SERVICE,
  ...proxyOptions,
}));

// Health check - aggregates all services
app.get('/health', async (req, res) => {
  const services = {
    gateway: 'healthy',
    auth: 'unknown',
    education: 'unknown',
    payment: 'unknown',
  };

  // Check each service
  const checkService = async (name, url) => {
    try {
      const response = await fetch(`${url}/health`, { 
        signal: AbortSignal.timeout(2000) 
      });
      return response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  };

  try {
    const [authStatus, educationStatus, paymentStatus] = await Promise.allSettled([
      checkService('auth', AUTH_SERVICE),
      checkService('education', EDUCATION_SERVICE),
      checkService('payment', PAYMENT_SERVICE),
    ]);

    services.auth = authStatus.status === 'fulfilled' ? authStatus.value : 'unhealthy';
    services.education = educationStatus.status === 'fulfilled' ? educationStatus.value : 'unhealthy';
    services.payment = paymentStatus.status === 'fulfilled' ? paymentStatus.value : 'unhealthy';

    const allHealthy = Object.values(services).every(s => s === 'healthy');
    const status = allHealthy ? 200 : 503;

    res.status(status).json({
      service: 'api-gateway',
      status: allHealthy ? 'healthy' : 'degraded',
      services,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      service: 'api-gateway',
      status: 'unhealthy',
      services,
      timestamp: new Date().toISOString(),
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Azora OS API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PATCH /api/auth/profile',
        logout: 'POST /api/auth/logout',
      },
      education: {
        listCourses: 'GET /api/courses',
        getCourse: 'GET /api/courses/:id',
        enrollCourse: 'POST /api/courses/:id/enroll',
        listEnrollments: 'GET /api/enrollments',
        updateProgress: 'PATCH /api/enrollments/:id/progress',
        createCourse: 'POST /api/courses (educators only)',
      },
      payment: {
        getWallet: 'GET /api/wallet',
        getTransactions: 'GET /api/transactions',
        earnTokens: 'POST /api/earn',
        processPayment: 'POST /api/payments',
        requestRefund: 'POST /api/refunds',
      },
    },
    documentation: 'https://docs.azora.world',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.GATEWAY_PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`✅ API Gateway running on port ${PORT}`);
    logger.info(`   Auth Service: ${AUTH_SERVICE}`);
    logger.info(`   Education Service: ${EDUCATION_SERVICE}`);
    logger.info(`   Payment Service: ${PAYMENT_SERVICE}`);
  });
}
