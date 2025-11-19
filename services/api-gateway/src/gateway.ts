/**
 * API Gateway
 * Central entry point for all API requests with routing, rate limiting, and authentication
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import httpProxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { SecurityLogging, AccessControl, corsConfig } from '../../shared/security/remediation';
import { tracingMiddleware, BusinessLogicTracing } from '../../shared/observability/distributed-tracing';

interface ServiceConfig {
  name: string;
  url: string;
  timeout?: number;
  retries?: number;
  rateLimit?: { windowMs: number; max: number };
  requireAuth?: boolean;
  roles?: string[];
}

interface GatewayConfig {
  port: number;
  services: Record<string, ServiceConfig>;
  jwtSecret: string;
  environment: string;
}

/**
 * API Gateway Implementation
 */
export class APIGateway {
  private app: Express;
  private config: GatewayConfig;
  private rateLimiters: Map<string, any> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup global middleware
   */
  private setupMiddleware() {
    // Security headers
    this.app.use(helmet());

    // CORS
    this.app.use(cors(corsConfig));

    // Request logging
    this.app.use(morgan('combined'));

    // Tracing
    this.app.use(tracingMiddleware);

    // Request ID
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = req.get('X-Request-ID') || uuidv4();
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Global rate limiter
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: 'Too many requests from this IP',
    });
    this.app.use(globalLimiter);
  }

  /**
   * Setup routes
   */
  private setupRoutes() {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });

    // Setup service routes
    for (const [path, serviceConfig] of Object.entries(this.config.services)) {
      this.setupServiceRoute(path, serviceConfig);
    }

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Gateway error:', err);

      SecurityLogging.logSecurityEvent(
        'GATEWAY_ERROR',
        (req as any).user?.id || 'anonymous',
        {
          error: err.message,
          path: req.path,
          method: req.method,
          ip: req.ip,
        },
        'HIGH'
      );

      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        requestId: req.id,
      });
    });
  }

  /**
   * Setup route for a service
   */
  private setupServiceRoute(path: string, serviceConfig: ServiceConfig) {
    const router = express.Router();

    // Create rate limiter for this service
    if (serviceConfig.rateLimit) {
      const limiter = rateLimit({
        windowMs: serviceConfig.rateLimit.windowMs,
        max: serviceConfig.rateLimit.max,
        message: `Too many requests to ${serviceConfig.name}`,
      });
      this.rateLimiters.set(path, limiter);
      router.use(limiter);
    }

    // Authentication middleware
    if (serviceConfig.requireAuth) {
      router.use((req: Request, res: Response, next: NextFunction) => {
        this.authenticateRequest(req, res, next, serviceConfig);
      });
    }

    // Request logging
    router.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${serviceConfig.name}] ${req.method} ${req.path}`);
      next();
    });

    // Proxy to service
    router.use(
      httpProxy(serviceConfig.url, {
        timeout: serviceConfig.timeout || 30000,
        proxyReqPathResolver: (req: Request) => {
          return req.originalUrl.replace(`/${path}`, '');
        },
        proxyReqOptDecorator: (proxyReqOpts: any, srcReq: Request) => {
          // Add request ID
          proxyReqOpts.headers['X-Request-ID'] = srcReq.id;

          // Add user info if authenticated
          if ((srcReq as any).user) {
            proxyReqOpts.headers['X-User-ID'] = (srcReq as any).user.id;
            proxyReqOpts.headers['X-User-Roles'] = (srcReq as any).user.roles.join(',');
          }

          return proxyReqOpts;
        },
        userResDecorator: (proxyRes: any, proxyResData: any, userReq: Request, userRes: Response) => {
          // Add response headers
          userRes.setHeader('X-Service', serviceConfig.name);

          return proxyResData;
        },
        onError: (err: any, req: Request, res: Response) => {
          console.error(`[${serviceConfig.name}] Proxy error:`, err);

          SecurityLogging.logSecurityEvent(
            'SERVICE_ERROR',
            (req as any).user?.id || 'anonymous',
            {
              service: serviceConfig.name,
              error: err.message,
              path: req.path,
              ip: req.ip,
            },
            'HIGH'
          );

          res.status(503).json({
            error: `${serviceConfig.name} is unavailable`,
            requestId: req.id,
          });
        },
      })
    );

    this.app.use(`/${path}`, router);
  }

  /**
   * Authenticate request
   */
  private authenticateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    serviceConfig: ServiceConfig
  ) {
    const token = req.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      SecurityLogging.logFailedAuth('anonymous', req.ip || '', 'Missing token');
      return res.status(401).json({ error: 'Missing authentication token' });
    }

    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;

      // Check roles if required
      if (serviceConfig.roles) {
        if (!AccessControl.hasRole(req, serviceConfig.roles)) {
          SecurityLogging.logUnauthorizedAccess(
            decoded.id,
            serviceConfig.name,
            req.ip || ''
          );
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      // Attach user to request
      (req as any).user = decoded;
      SecurityLogging.logSuccessfulAuth(decoded.id, req.ip || '');
      next();
    } catch (error: any) {
      SecurityLogging.logFailedAuth('anonymous', req.ip || '', error.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  /**
   * Start gateway
   */
  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.config.port, () => {
        console.log(`API Gateway listening on port ${this.config.port}`);
        resolve();
      });
    });
  }

  /**
   * Get Express app
   */
  getApp(): Express {
    return this.app;
  }
}

/**
 * Request/Response Logging
 */
export class RequestLogger {
  /**
   * Log request details
   */
  static logRequest(req: Request) {
    console.log({
      timestamp: new Date(),
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log response details
   */
  static logResponse(req: Request, res: Response, duration: number) {
    console.log({
      timestamp: new Date(),
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  }
}

/**
 * Circuit Breaker for Service Resilience
 */
export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailureTime = 0;

  constructor(
    private failureThreshold = 5,
    private successThreshold = 2,
    private timeout = 60000
  ) {}

  /**
   * Record success
   */
  recordSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  /**
   * Record failure
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Get state
   */
  getState() {
    return this.state;
  }
}

/**
 * Request Retry Logic
 */
export class RetryPolicy {
  /**
   * Retry with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 100
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    // Retry on network errors and 5xx errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    return false;
  }
}

export default APIGateway;
