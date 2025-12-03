import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

// Default rate limit values are still pulled dynamically in checkRateLimit to
// allow dynamic reconfiguration during test runs (tests often set env vars).

// Simple per-key rate limiter: map<key, {count, startMs}>
const rateMap = new Map<string, { count: number; start: number }>();

// Exported for tests to inspect/reset
export function resetRateMap(key?: string) {
  if (key) rateMap.delete(key);
  else rateMap.clear();
}

export function getRateCount(key: string) {
  const e = rateMap.get(key);
  return e?.count ?? 0;
}

export function apiKeyOrJwtAuth(required: boolean = true) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const indexApiKey = process.env.INDEX_API_KEY;
      const apiKeyHeader = (req.headers['x-api-key'] || req.headers['authorization']) as string | undefined;

      if (!indexApiKey && !process.env.JWT_SECRET) {
        // no auth configured
        return next();
      }

      let key = 'anon';
      if (apiKeyHeader) {
        // Accept both raw API key or Bearer <key>
        key = apiKeyHeader.startsWith('Bearer ') ? apiKeyHeader.split(' ')[1] : apiKeyHeader;
        if (indexApiKey && key === indexApiKey) {
          // authorized via API key
          return checkRateLimit(key, req, res, next);
        }
      }

      // Try JWT validation if provided
      const authHeader = req.headers['authorization'] as string | undefined;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || '';
        if (!secret) {
          logger.warn('JWT_SECRET not configured');
          if (required) return res.status(401).json({ error: 'unauthorized' });
        }
        try {
          const payload = jwt.verify(token, secret) as any;
          key = payload.sub || payload?.clientId || token;
          // check role
          const role = payload.role || payload?.roles?.[0] || 'user';
          if (['admin', 'indexer', 'azstudio-service'].includes(role)) {
            return checkRateLimit(key, req, res, next);
          }
          logger.warn({ payload }, 'JWT role not permitted');
          if (required) return res.status(403).json({ error: 'forbidden' });
        } catch (jwtErr) {
          logger.warn({ jwtErr }, 'JWT verification failed');
          if (required) return res.status(401).json({ error: 'unauthorized' });
        }
      }

      if (required) return res.status(401).json({ error: 'unauthorized' });
      return next();
    } catch (err) {
      logger.error({ err }, 'Auth middleware failed');
      return res.status(500).json({ error: 'internal error' });
    }
  };
}

function checkRateLimit(key: string, req: Request, res: Response, next: NextFunction) {
  // per-key limiter
  const now = Date.now();
  const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1m default
  const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60');
  const entry = rateMap.get(key) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }
  rateMap.set(key, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'rate limit exceeded' });
  }
  // Proceed
  return next();
}
