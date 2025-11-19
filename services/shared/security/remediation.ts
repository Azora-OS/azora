/**
 * Security Remediation Implementation
 * Addresses identified vulnerabilities from penetration testing
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';

/**
 * Security Headers Middleware
 * Implements OWASP recommended security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
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
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * Rate Limiting Middleware
 * Prevents brute force and DoS attacks
 */
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  });
};

/**
 * Strict Rate Limiter for Authentication
 * Prevents brute force attacks on login endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * Input Validation & Sanitization
 */
export const inputSanitization = [
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Potential NoSQL injection detected in ${key}`);
    },
  }),
  xss(),
  hpp({
    whitelist: ['sort', 'fields', 'filter', 'page', 'limit'],
  }),
];

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

/**
 * SQL Injection Prevention
 * Use parameterized queries (handled by ORM)
 */
export const sqlInjectionPrevention = {
  // Always use parameterized queries
  // Example: db.query('SELECT * FROM users WHERE id = ?', [userId])
  // Never concatenate user input into queries
};

/**
 * Authentication Security
 */
export class AuthenticationSecurity {
  /**
   * Password validation rules
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Session security
   */
  static getSessionConfig() {
    return {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    };
  }

  /**
   * Regenerate session on login
   */
  static regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

/**
 * Data Protection
 */
export class DataProtection {
  /**
   * Encrypt sensitive fields
   */
  static encryptField(value: string, key: string): string {
    // Implementation would use crypto library
    // This is a placeholder
    return Buffer.from(value).toString('base64');
  }

  /**
   * Decrypt sensitive fields
   */
  static decryptField(encrypted: string, key: string): string {
    // Implementation would use crypto library
    // This is a placeholder
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }

  /**
   * Mask sensitive data in logs
   */
  static maskSensitiveData(data: any): any {
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'apiKey', 'secret'];
    const masked = JSON.parse(JSON.stringify(data));

    const maskField = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '***MASKED***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskField(obj[key]);
        }
      }
    };

    maskField(masked);
    return masked;
  }
}

/**
 * Access Control
 */
export class AccessControl {
  /**
   * Verify user owns resource
   */
  static verifyResourceOwnership(
    req: Request,
    resourceOwnerId: string
  ): boolean {
    const userId = (req as any).user?.id;
    return userId === resourceOwnerId;
  }

  /**
   * Check user role
   */
  static hasRole(req: Request, requiredRoles: string[]): boolean {
    const userRoles = (req as any).user?.roles || [];
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   * Role-based access control middleware
   */
  static requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!AccessControl.hasRole(req, roles)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    };
  }
}

/**
 * Logging & Monitoring
 */
export class SecurityLogging {
  /**
   * Log security events
   */
  static logSecurityEvent(
    eventType: string,
    userId: string,
    details: any,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ) {
    const event = {
      timestamp: new Date(),
      eventType,
      userId,
      details: DataProtection.maskSensitiveData(details),
      severity,
      ip: details.ip,
      userAgent: details.userAgent,
    };

    console.log(`[SECURITY] ${severity}: ${eventType}`, event);

    // Send to monitoring system
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      // Alert operations team
      console.error(`[ALERT] ${eventType}:`, event);
    }
  }

  /**
   * Log failed authentication attempts
   */
  static logFailedAuth(email: string, ip: string, reason: string) {
    this.logSecurityEvent('FAILED_AUTH', email, { ip, reason }, 'MEDIUM');
  }

  /**
   * Log successful authentication
   */
  static logSuccessfulAuth(userId: string, ip: string) {
    this.logSecurityEvent('SUCCESSFUL_AUTH', userId, { ip }, 'LOW');
  }

  /**
   * Log unauthorized access attempts
   */
  static logUnauthorizedAccess(userId: string, resource: string, ip: string) {
    this.logSecurityEvent('UNAUTHORIZED_ACCESS', userId, { resource, ip }, 'HIGH');
  }

  /**
   * Log data access
   */
  static logDataAccess(userId: string, dataType: string, action: string) {
    this.logSecurityEvent('DATA_ACCESS', userId, { dataType, action }, 'LOW');
  }
}

/**
 * Compliance Helpers
 */
export class ComplianceHelpers {
  /**
   * GDPR: Right to be forgotten
   */
  static async deleteUserData(userId: string) {
    // Implementation would delete all user data
    console.log(`Deleting all data for user ${userId}`);
  }

  /**
   * GDPR: Data portability
   */
  static async exportUserData(userId: string) {
    // Implementation would export all user data
    console.log(`Exporting all data for user ${userId}`);
  }

  /**
   * GDPR: Consent management
   */
  static async recordConsent(userId: string, consentType: string, version: string) {
    console.log(`Recording ${consentType} consent v${version} for user ${userId}`);
  }

  /**
   * Audit trail
   */
  static async logAuditEvent(
    action: string,
    actor: string,
    resource: string,
    changes: any
  ) {
    const auditEvent = {
      timestamp: new Date(),
      action,
      actor,
      resource,
      changes,
    };

    console.log('[AUDIT]', auditEvent);
  }
}

export default {
  securityHeaders,
  createRateLimiter,
  authRateLimiter,
  inputSanitization,
  corsConfig,
  AuthenticationSecurity,
  DataProtection,
  AccessControl,
  SecurityLogging,
  ComplianceHelpers,
};
