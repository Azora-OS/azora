import { Request, Response, NextFunction } from 'express';
import { detectThreat, isIPBlocked } from './threat-detection';
import { securityMonitor } from './security-monitoring';

const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bDROP\b.*\bTABLE\b)/i,
  /(\bINSERT\b.*\bINTO\b)/i,
  /(--|\#|\/\*)/,
];

const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

function checkSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function checkXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

export function wafMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    securityMonitor.trackRequest(true);
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check request body for threats
  const bodyStr = JSON.stringify(req.body);
  
  if (checkSQLInjection(bodyStr)) {
    detectThreat({
      ip,
      type: 'SQL_INJECTION',
      severity: 'HIGH',
      details: { body: req.body },
    });
    securityMonitor.trackThreat('HIGH');
    securityMonitor.trackRequest(true);
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (checkXSS(bodyStr)) {
    detectThreat({
      ip,
      type: 'XSS',
      severity: 'HIGH',
      details: { body: req.body },
    });
    securityMonitor.trackThreat('HIGH');
    securityMonitor.trackRequest(true);
    return res.status(400).json({ error: 'Invalid request' });
  }

  securityMonitor.trackRequest(false);
  next();
}
