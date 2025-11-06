/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { z } from 'zod';

/**
 * Input Validation Schemas
 * Use these to validate all user inputs across the platform
 */

// User Registration/Profile
export const userEmailSchema = z.string().email().max(255);
export const userPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const userNameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100)
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const userIdSchema = z.string().uuid();

// Course/Content
export const courseIdSchema = z.string().uuid();
export const courseTitleSchema = z.string().min(3).max(200);
export const courseDescriptionSchema = z.string().max(5000);

// Financial
export const amountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount exceeds maximum allowed');

export const currencySchema = z.enum(['USD', 'ZAR', 'AZR', 'ETH', 'BTC']);

export const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Search/Query
export const searchQuerySchema = z.string()
  .max(500)
  .transform(str => str.trim());

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// File Upload
export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  mimetype: z.string(),
  size: z.number().max(50 * 1024 * 1024), // 50MB max
});

/**
 * Sanitization Utilities
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize SQL input to prevent SQL injection
 */
export function sanitizeSql(input: string): string {
  return input.replace(/['";\\]/g, '');
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(input: string): string {
  return input
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Rate Limiting Types
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

export const rateLimitConfigs = {
  // Authentication endpoints - strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // API endpoints - moderate
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Public endpoints - lenient
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 500,
  },
};

/**
 * CORS Configuration
 */
export function getAllowedOrigins(env: 'development' | 'production' | 'test'): string[] {
  const origins = {
    development: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://127.0.0.1:3000',
    ],
    production: [
      'https://azora.es',
      'https://www.azora.es',
      'https://app.azora.es',
      'https://api.azora.es',
    ],
    test: ['http://localhost:3000'],
  };

  return origins[env] || origins.development;
}

/**
 * Security Headers
 */
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * Content Security Policy
 */
export function getContentSecurityPolicy(env: 'development' | 'production'): string {
  const isDev = env === 'development';

  return [
    `default-src 'self'`,
    `script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://api.azora.es wss://api.azora.es`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  sanitize: boolean = true
): T {
  const validated = schema.parse(data);

  if (sanitize && typeof validated === 'string') {
    return sanitizeHtml(validated) as T;
  }

  if (sanitize && typeof validated === 'object' && validated !== null) {
    return Object.fromEntries(
      Object.entries(validated).map(([key, value]) => [
        key,
        typeof value === 'string' ? sanitizeHtml(value) : value,
      ])
    ) as T;
  }

  return validated;
}

/**
 * Check if a password has been compromised (stub - integrate with HaveIBeenPwned API)
 */
export async function checkPasswordCompromised(password: string): Promise<boolean> {
  // TODO: Integrate with HaveIBeenPwned API
  // For now, just check against a basic blacklist
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
  ];

  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback for Node.js
    const nodeCrypto = require('crypto');
    nodeCrypto.randomFillSync(randomValues);
  }

  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i]! % chars.length];
  }

  return token;
}
