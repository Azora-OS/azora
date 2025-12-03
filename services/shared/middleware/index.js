const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Helmet configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// CORS configuration
const corsConfig = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});

// Rate limiter factory
const createRateLimiter = (maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip).filter(time => now - time < windowMs);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
  };
};

// Authentication middleware (placeholder)
const authenticate = (req, res, next) => {
  // TODO: Implement proper JWT authentication
  next();
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Specific rate limiters
const rateLimiters = {
  financial: createRateLimiter(10),
  api: createRateLimiter(100),
  auth: createRateLimiter(5),
};

// Common middleware setup
const commonMiddleware = () => {
  return (req, res, next) => {
    next();
  };
};

const setupMiddleware = (app) => {
  app.use(helmetConfig);
  app.use(corsConfig);
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
};

module.exports = {
  commonMiddleware,
  setupMiddleware,
  helmetConfig,
  corsConfig,
  createRateLimiter,
  errorHandler,
  authenticate,
  rateLimiters,
};