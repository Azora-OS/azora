const csrf = require('csurf');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { z } = require('zod');

// CSRF Protection
const csrfProtection = csrf({ 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {return res.status(401).json({ error: 'Authentication required' });}

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'azora-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {return res.status(401).json({ error: 'Authentication required' });}
  if (!roles.includes(req.user.role)) {return res.status(403).json({ error: 'Insufficient permissions' });}
  next();
};

// Secure CORS
const secureCors = require('cors')({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
});

// Rate Limiters
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const rateLimiters = {
  standard: createRateLimiter(15 * 60 * 1000, 100),
  strict: createRateLimiter(15 * 60 * 1000, 50),
  auth: createRateLimiter(15 * 60 * 1000, 5),
  financial: createRateLimiter(15 * 60 * 1000, 20)
};

// Helmet Security Headers
const secureHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Input Validation
const validateInput = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid input', details: err.errors });
  }
};

// Sanitize Input
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/[<>"'&]/g, (char) => {
        const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
        return entities[char];
      });
    }
    if (Array.isArray(obj)) {return obj.map(sanitize);}
    if (obj && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  
  if (req.body) {req.body = sanitize(req.body);}
  if (req.query) {req.query = sanitize(req.query);}
  if (req.params) {req.params = sanitize(req.params);}
  next();
};

// Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { 
  csrfProtection, 
  authenticate, 
  authorize, 
  secureCors, 
  secureHeaders,
  rateLimiters,
  validateInput,
  sanitizeInput,
  errorHandler 
};
