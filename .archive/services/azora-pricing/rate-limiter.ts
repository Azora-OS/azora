/**
 * RATE LIMITER & ABUSE PREVENTION
 * 
 * Protects pricing APIs from abuse and excessive requests
 */

import { createHash } from 'crypto';

interface RateLimitConfig {
  windowMs: number;           // Time window in milliseconds
  maxRequests: number;        // Max requests per window
  blockDurationMs: number;    // How long to block after exceeding limit
}

interface RequestRecord {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

// ============================================================================
// RATE LIMIT CONFIGURATIONS
// ============================================================================

export const RATE_LIMITS = {
  // Pricing endpoint: 10 requests per minute
  PRICING: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 10,
    blockDurationMs: 5 * 60 * 1000  // Block for 5 minutes
  },
  
  // Currency conversion: 20 requests per minute
  CURRENCY: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    blockDurationMs: 5 * 60 * 1000
  },
  
  // Location detection: 5 requests per minute (expensive API)
  LOCATION: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 10 * 60 * 1000  // Block for 10 minutes
  },
  
  // Payment processing: 3 requests per minute
  PAYMENT: {
    windowMs: 60 * 1000,
    maxRequests: 3,
    blockDurationMs: 15 * 60 * 1000  // Block for 15 minutes
  }
};

// ============================================================================
// IN-MEMORY RATE LIMIT STORE (Use Redis in production)
// ============================================================================

const requestStore = new Map<string, RequestRecord>();

/**
 * Clean up expired records every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    // Remove if window expired and not blocked
    if (!record.blocked && now - record.firstRequest > 5 * 60 * 1000) {
      requestStore.delete(key);
    }
    // Remove if block expired
    if (record.blocked && record.blockedUntil && now > record.blockedUntil) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate unique identifier for request (IP + User Agent)
 */
function getRequestIdentifier(ip: string, userAgent?: string): string {
  const data = `${ip}:${userAgent || 'unknown'}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  ip: string,
  userAgent: string | undefined,
  limitType: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number; reason?: string } {
  const config = RATE_LIMITS[limitType];
  const identifier = getRequestIdentifier(ip, userAgent);
  const now = Date.now();
  
  let record = requestStore.get(identifier);
  
  // Check if currently blocked
  if (record?.blocked) {
    const blockedUntil = record.blockedUntil || 0;
    if (now < blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((blockedUntil - now) / 1000),
        reason: `Blocked due to rate limit violation. Try again in ${Math.ceil((blockedUntil - now) / 1000 / 60)} minutes.`
      };
    } else {
      // Block expired, remove record
      requestStore.delete(identifier);
      record = undefined;
    }
  }
  
  // No existing record or window expired
  if (!record || now - record.firstRequest > config.windowMs) {
    requestStore.set(identifier, {
      count: 1,
      firstRequest: now,
      blocked: false
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000)
    };
  }
  
  // Increment count
  record.count++;
  
  // Check if exceeded limit
  if (record.count > config.maxRequests) {
    record.blocked = true;
    record.blockedUntil = now + config.blockDurationMs;
    
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(config.blockDurationMs / 1000),
      reason: `Rate limit exceeded. Blocked for ${Math.ceil(config.blockDurationMs / 1000 / 60)} minutes.`
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: Math.ceil((config.windowMs - (now - record.firstRequest)) / 1000)
  };
}

/**
 * Express/Next.js middleware for rate limiting
 */
export function rateLimitMiddleware(limitType: keyof typeof RATE_LIMITS) {
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const result = checkRateLimit(ip, userAgent, limitType);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS[limitType].maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetIn);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: result.reason,
        retryAfter: result.resetIn
      });
    }
    
    next();
  };
}

// ============================================================================
// FRAUD DETECTION
// ============================================================================

interface FraudIndicator {
  score: number;
  reasons: string[];
}

/**
 * Detect suspicious pricing requests
 */
export function detectFraudulentBehavior(
  ip: string,
  userAgent: string | undefined,
  requestData: any
): FraudIndicator {
  const indicator: FraudIndicator = {
    score: 0,
    reasons: []
  };
  
  // Check for VPN/Proxy (basic check)
  const suspiciousIPs = [
    '10.', '172.16.', '192.168.',  // Private IPs
    '127.', '0.0.0.0'               // Localhost
  ];
  
  if (suspiciousIPs.some(prefix => ip.startsWith(prefix))) {
    indicator.score += 30;
    indicator.reasons.push('Suspicious IP address detected');
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('curl') || userAgent.length < 20) {
    indicator.score += 20;
    indicator.reasons.push('Suspicious or missing user agent');
  }
  
  // Check for rapid location changes (if we track previous requests)
  const identifier = getRequestIdentifier(ip, userAgent);
  const previousLocations = locationHistory.get(identifier) || [];
  
  if (previousLocations.length > 0) {
    const lastLocation = previousLocations[previousLocations.length - 1];
    const timeSinceLastRequest = Date.now() - lastLocation.timestamp;
    
    // If location changed in less than 5 minutes, suspicious
    if (timeSinceLastRequest < 5 * 60 * 1000 && requestData.country !== lastLocation.country) {
      indicator.score += 40;
      indicator.reasons.push('Rapid location change detected');
    }
  }
  
  // Track current location
  previousLocations.push({
    country: requestData.country,
    timestamp: Date.now()
  });
  
  if (previousLocations.length > 10) {
    previousLocations.shift(); // Keep only last 10
  }
  
  locationHistory.set(identifier, previousLocations);
  
  return indicator;
}

const locationHistory = new Map<string, Array<{ country: string; timestamp: number }>>();

/**
 * Clear location history periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, locations] of locationHistory.entries()) {
    const recentLocations = locations.filter(loc => now - loc.timestamp < 30 * 60 * 1000); // Keep last 30 minutes
    if (recentLocations.length === 0) {
      locationHistory.delete(key);
    } else {
      locationHistory.set(key, recentLocations);
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes

// ============================================================================
// PRICE MANIPULATION PREVENTION
// ============================================================================

/**
 * Validate pricing request to prevent manipulation
 */
export function validatePricingRequest(requestData: any): { valid: boolean; error?: string } {
  // Check for required fields
  if (!requestData.country || !requestData.currency) {
    return { valid: false, error: 'Missing required fields: country or currency' };
  }
  
  // Validate country code format (ISO 3166-1 alpha-2)
  if (!/^[A-Z]{2}$/.test(requestData.country)) {
    return { valid: false, error: 'Invalid country code format' };
  }
  
  // Validate currency code format (ISO 4217)
  if (!/^[A-Z]{3}$/.test(requestData.currency)) {
    return { valid: false, error: 'Invalid currency code format' };
  }
  
  // Check for price manipulation attempts
  if (requestData.customPrice !== undefined) {
    return { valid: false, error: 'Custom pricing not allowed' };
  }
  
  // Check for discount manipulation
  if (requestData.discount && requestData.discount > 100) {
    return { valid: false, error: 'Invalid discount value' };
  }
  
  return { valid: true };
}

// ============================================================================
// REQUEST LOGGING (for audit trail)
// ============================================================================

interface PricingRequestLog {
  timestamp: number;
  ip: string;
  userAgent?: string;
  country: string;
  currency: string;
  tier: string;
  price: number;
  fraudScore: number;
  success: boolean;
}

const requestLogs: PricingRequestLog[] = [];

/**
 * Log pricing request for audit
 */
export function logPricingRequest(log: PricingRequestLog): void {
  requestLogs.push(log);
  
  // Keep only last 10,000 requests in memory
  if (requestLogs.length > 10000) {
    requestLogs.shift();
  }
  
  // In production, send to proper logging service (Datadog, CloudWatch, etc.)
  if (log.fraudScore > 50) {
    console.warn('HIGH FRAUD SCORE DETECTED:', log);
  }
}

/**
 * Get request statistics
 */
export function getRequestStats(): any {
  const now = Date.now();
  const last24h = requestLogs.filter(log => now - log.timestamp < 24 * 60 * 60 * 1000);
  
  return {
    total24h: last24h.length,
    successRate: (last24h.filter(log => log.success).length / last24h.length) * 100,
    avgFraudScore: last24h.reduce((sum, log) => sum + log.fraudScore, 0) / last24h.length,
    topCountries: getTopCountries(last24h),
    suspiciousRequests: last24h.filter(log => log.fraudScore > 50).length
  };
}

function getTopCountries(logs: PricingRequestLog[]): Record<string, number> {
  const countries: Record<string, number> = {};
  for (const log of logs) {
    countries[log.country] = (countries[log.country] || 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  detectFraudulentBehavior,
  validatePricingRequest,
  logPricingRequest,
  getRequestStats
};
