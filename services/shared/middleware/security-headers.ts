/**
 * Security Headers Middleware
 * Implements OWASP security best practices
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Configure security headers
 */
export function configureSecurityHeaders(app: any) {
  // Helmet for security headers
  app.use(helmet());

  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    })
  );

  // X-Frame-Options
  app.use(helmet.frameguard({ action: 'deny' }));

  // X-Content-Type-Options
  app.use(helmet.noSniff());

  // X-XSS-Protection
  app.use(helmet.xssFilter());

  // Referrer-Policy
  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

  // Permissions-Policy
  app.use(
    helmet.permittedCrossDomainPolicies({
      permittedPolicies: 'none',
    })
  );
}

/**
 * Configure rate limiting
 */
export function configureRateLimiting(app: any) {
  // General API rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Strict rate limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
  });

  // Apply rate limiters
  app.use('/api/', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
}

/**
 * Configure data sanitization
 */
export function configureSanitization(app: any) {
  // Data sanitization against NoSQL injection
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution attacks
  app.use(hpp());
}

/**
 * Configure CORS
 */
export function configureCORS(app: any) {
  const cors = require('cors');

  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  };

  app.use(cors(corsOptions));
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy / Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

/**
 * Remove sensitive headers
 */
export function removeSensitiveHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
}

/**
 * Setup all security middleware
 */
export function setupSecurityMiddleware(app: any) {
  // Configure security headers
  configureSecurityHeaders(app);

  // Configure rate limiting
  configureRateLimiting(app);

  // Configure data sanitization
  configureSanitization(app);

  // Configure CORS
  configureCORS(app);

  // Apply custom security headers
  app.use(securityHeadersMiddleware);

  // Remove sensitive headers
  app.use(removeSensitiveHeaders);
}

export default setupSecurityMiddleware;
