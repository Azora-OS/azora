/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Security Middleware Utilities
 * 
 * Standardized security middleware for Express applications
 */

import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';
import { log } from '../logger';

/**
 * Standard Helmet configuration for security headers
 */
export function getHelmetConfig() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust for production
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.API_URL || "http://localhost:3001"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
  });
}

/**
 * CORS configuration
 */
export function getCorsConfig() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || 
                         process.env.CORS_ORIGIN?.split(',') || 
                         ['http://localhost:3000', 'http://localhost:3001'];

  return cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        log.warn('CORS blocked origin:', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });
}

/**
 * Rate limiter for API endpoints
 */
export function createRateLimiter(options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options?.max || 100, // Limit each IP to 100 requests per windowMs
    message: options?.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        log.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
        });
        const resetTime = (req as unknown as { rateLimit?: { resetTime?: number } }).rateLimit?.resetTime || Date.now();
        res.status(429).json({
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil(resetTime / 1000),
        });
      },
  });
}

/**
 * Slow down middleware for API endpoints
 */
export function createSlowDown(options?: {
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
}) {
  return slowDown({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    delayAfter: options?.delayAfter || 50, // Start delaying after 50 requests
    delayMs: options?.delayMs || 500, // Delay each request by 500ms
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.http(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
  });
  
  next();
}


