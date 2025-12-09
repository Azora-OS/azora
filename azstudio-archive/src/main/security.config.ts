/**
 * Security Configuration for AzStudio
 * Centralized security settings and constants
 */

export const SecurityConfig = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Monaco requires unsafe-inline
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: [
      "'self'",
      'https://api.openai.com',
      'https://api.anthropic.com',
      'https://api.github.com',
    ],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },

  // Rate Limiting
  rateLimit: {
    network: {
      requestsPerMinute: 30, // Reduced from 60
      burstSize: 10,
    },
    api: {
      requestsPerMinute: 20,
      burstSize: 5,
    },
    fileOperations: {
      operationsPerSecond: 100,
    },
  },

  // File Size Limits
  fileSizeLimits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxUploadSize: 50 * 1024 * 1024, // 50MB
    maxResponseSize: 10 * 1024 * 1024, // 10MB
  },

  // Timeout Settings
  timeouts: {
    network: 30000, // 30 seconds
    fileOperation: 60000, // 60 seconds
    apiCall: 120000, // 2 minutes
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    authTagLength: 16,
  },

  // Session
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    renewThreshold: 60 * 60 * 1000, // 1 hour
  },

  // Allowed Domains
  allowedDomains: [
    'api.openai.com',
    'api.anthropic.com',
    'api.elevenlabs.io',
    'api.heygen.com',
    'github.com',
    'api.github.com',
    'gitlab.com',
    'vercel.com',
    'railway.app',
    'render.com',
  ],

  // Blocked Patterns
  blockedPatterns: [
    /\.\./g, // Path traversal
    /<script/gi, // XSS
    /javascript:/gi, // XSS
    /on\w+\s*=/gi, // Event handlers
  ],

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
};
