/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { EventEmitter } from 'events';

const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class SecurityMiddleware extends EventEmitter {
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private blacklist = new Set<string>();

  // JWT Authentication
  authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      this.emit('auth-success', { userId: (decoded as any).userId });
      next();
    } catch (error) {
      this.emit('auth-failed', { token, error });
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Rate Limiting
  rateLimit(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const entry = this.rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return next();
    }

    if (entry.count >= RATE_LIMIT_MAX) {
      this.emit('rate-limit-exceeded', { ip, count: entry.count });
      return res.status(429).json({ error: 'Too many requests' });
    }

    entry.count++;
    next();
  }

  // Input Validation
  validateInput(req: Request, res: Response, next: NextFunction) {
    const body = JSON.stringify(req.body);
    
    // XSS Prevention
    if (/<script|javascript:|onerror=/i.test(body)) {
      this.emit('xss-attempt', { ip: req.ip, body });
      return res.status(400).json({ error: 'Invalid input detected' });
    }

    // SQL Injection Prevention
    if (/(\bOR\b|\bAND\b).*=|--|;|\/\*|\*\//i.test(body)) {
      this.emit('sql-injection-attempt', { ip: req.ip, body });
      return res.status(400).json({ error: 'Invalid input detected' });
    }

    next();
  }

  // CSRF Protection
  csrfProtection(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const token = req.headers['x-csrf-token'];
      if (!token || !this.verifyCsrfToken(token as string)) {
        this.emit('csrf-violation', { ip: req.ip, method: req.method });
        return res.status(403).json({ error: 'CSRF token invalid' });
      }
    }
    next();
  }

  // Encryption Helpers
  encrypt(data: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(JWT_SECRET, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encrypted: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(JWT_SECRET, 'salt', 32);
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Generate JWT
  generateToken(payload: any, expiresIn: string = '24h'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  // Verify JWT
  verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }

  // CSRF Token Management
  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyCsrfToken(token: string): boolean {
    return token.length === 64 && /^[a-f0-9]+$/.test(token);
  }

  // IP Blacklist
  addToBlacklist(ip: string) {
    this.blacklist.add(ip);
    this.emit('ip-blacklisted', { ip });
  }

  checkBlacklist(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || 'unknown';
    if (this.blacklist.has(ip)) {
      this.emit('blacklist-hit', { ip });
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  }

  // Security Headers
  securityHeaders(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
  }

  // Audit Logging
  auditLog(req: Request, res: Response, next: NextFunction) {
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: (req as any).user?.userId,
      userAgent: req.headers['user-agent']
    };
    this.emit('audit-log', log);
    next();
  }
}

export const securityMiddleware = new SecurityMiddleware();
export default securityMiddleware;
