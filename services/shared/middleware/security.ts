import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

export const createRateLimiter = (max: number = 100) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Pre-configured rate limiters for different service types
export const rateLimiters = {
  // General API - 100 requests per 15 minutes
  general: createRateLimiter(100),
  
  // Financial operations - 50 requests per 15 minutes (stricter)
  financial: createRateLimiter(50),
  
  // Auth operations - 30 requests per 15 minutes (very strict)
  auth: createRateLimiter(30),
  
  // Public endpoints - 200 requests per 15 minutes (lenient)
  public: createRateLimiter(200),
};

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
