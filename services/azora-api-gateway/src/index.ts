/**
 * Azora API Gateway - Main Entry Point
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { CircuitBreaker } from './middleware/circuit-breaker';
import { HealthCheck } from './middleware/health-check';
import { Logger } from './middleware/logger';
import { Metrics } from './middleware/metrics';

interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  retries: number;
  circuitBreaker: {
    threshold: number;
    timeout: number;
  };
}

class AzoraAPIGateway {
  private app: express.Application;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private logger: Logger;
  private metrics: Metrics;
  private healthCheck: HealthCheck;

  constructor() {
    this.app = express();
    this.logger = new Logger();
    this.metrics = new Metrics();
    this.healthCheck = new HealthCheck();
    
    this.initializeMiddleware();
    this.initializeServices();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        ubuntu: 'My security ensures our freedom - Please respect rate limits'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });
  }

  private initializeServices(): void {
    const services: ServiceConfig[] = [
      {
        name: 'auth',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'user',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'education',
        url: process.env.EDUCATION_SERVICE_URL || 'http://localhost:3003',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'blockchain',
        url: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3029',
        timeout: 10000,
        retries: 2,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'citadel-fund',
        url: process.env.CITADEL_FUND_URL || 'http://localhost:3030',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'proof-of-value',
        url: process.env.PROOF_OF_VALUE_URL || 'http://localhost:3031',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'treasury',
        url: process.env.TREASURY_SERVICE_URL || 'http://localhost:3028',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'pay',
        url: process.env.PAY_SERVICE_URL || 'http://localhost:3018',
        timeout: 10000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'mint',
        url: process.env.MINT_SERVICE_URL || 'http://localhost:3010',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'marketplace',
        url: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3004',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'assessment',
        url: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:3005',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'careers',
        url: process.env.CAREERS_SERVICE_URL || 'http://localhost:3006',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'analytics',
        url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'ai',
        url: process.env.AI_SERVICE_URL || 'http://localhost:3008',
        timeout: 15000,
        retries: 2,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'aegis',
        url: process.env.AEGIS_SERVICE_URL || 'http://localhost:3009',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'erp',
        url: process.env.ERP_SERVICE_URL || 'http://localhost:3011',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'ledger',
        url: process.env.LEDGER_SERVICE_URL || 'http://localhost:3012',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'subscription',
        url: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3013',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'events',
        url: process.env.EVENTS_SERVICE_URL || 'http://localhost:3014',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'monitoring',
        url: process.env.MONITORING_SERVICE_URL || 'http://localhost:3015',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'corporate-learning',
        url: process.env.CORPORATE_LEARNING_SERVICE_URL || 'http://localhost:3016',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'lending',
        url: process.env.LENDING_SERVICE_URL || 'http://localhost:3017',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'cloud',
        url: process.env.CLOUD_SERVICE_URL || 'http://localhost:3019',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'forge',
        url: process.env.FORGE_SERVICE_URL || 'http://localhost:3020',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'library',
        url: process.env.LIBRARY_SERVICE_URL || 'http://localhost:3021',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'classroom',
        url: process.env.CLASSROOM_SERVICE_URL || 'http://localhost:3022',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'judiciary',
        url: process.env.JUDICIARY_SERVICE_URL || 'http://localhost:3023',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'constitutional-court',
        url: process.env.CONSTITUTIONAL_COURT_SERVICE_URL || 'http://localhost:3024',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'governance',
        url: process.env.GOVERNANCE_SERVICE_URL || 'http://localhost:3025',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'kyc-aml',
        url: process.env.KYC_AML_SERVICE_URL || 'http://localhost:3026',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      },
      {
        name: 'audit-logging',
        url: process.env.AUDIT_LOGGING_SERVICE_URL || 'http://localhost:3027',
        timeout: 5000,
        retries: 3,
        circuitBreaker: { threshold: 5, timeout: 30000 }
      }
    ];

    services.forEach(service => {
      const circuitBreaker = new CircuitBreaker(
        service.name,
        service.circuitBreaker.threshold,
        service.circuitBreaker.timeout
      );
      this.circuitBreakers.set(service.name, circuitBreaker);
      
      this.healthCheck.addService(service.name, service.url);
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ubuntu: 'My security ensures our freedom',
        services: this.healthCheck.getAllServiceStatuses()
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      res.json(this.metrics.getAllMetrics());
    });

    // Service routes
    this.circuitBreakers.forEach((circuitBreaker, serviceName) => {
      const serviceUrl = process.env[`${serviceName.toUpperCase()}_SERVICE_URL`];
      
      if (serviceUrl) {
        const proxy = createProxyMiddleware({
          target: serviceUrl,
          changeOrigin: true,
          timeout: 5000,
          onProxyReq: (proxyReq, req, res) => {
            // Add authentication headers
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
            
            // Add Ubuntu philosophy header
            proxyReq.setHeader('X-Ubuntu-Philosophy', 'My security ensures our freedom');
            
            // Log proxy request
            this.logger.info(`Proxying ${req.method} ${req.path} to ${serviceName}`, {
              service: serviceName,
              path: req.path,
              method: req.method
            });
          },
          onProxyRes: (proxyRes, req, res) => {
            // Log proxy response
            this.logger.info(`Proxy response from ${serviceName}`, {
              service: serviceName,
              statusCode: proxyRes.statusCode,
              path: req.path
            });
          },
          onError: (err, req, res) => {
            this.logger.error(`Proxy error for ${serviceName}`, {
              service: serviceName,
              error: err.message,
              path: req.path
            });
            
            circuitBreaker.recordFailure();
            
            if (!res.headersSent) {
              res.status(503).json({
                error: 'Service temporarily unavailable',
                service: serviceName,
                ubuntu: 'My security ensures our freedom - Please try again later'
              });
            }
          }
        });

        this.app.use(`/api/${serviceName}`, (req, res, next) => {
          if (circuitBreaker.isOpen()) {
            res.status(503).json({
              error: 'Service circuit breaker is open',
              service: serviceName,
              ubuntu: 'My security ensures our freedom - Service protection activated'
            });
            return;
          }
          
          try {
            proxy(req, res, next);
            circuitBreaker.recordSuccess();
          } catch (error) {
            circuitBreaker.recordFailure();
            next(error);
          }
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Azora API Gateway',
        ubuntu: 'My security ensures our freedom',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        services: Array.from(this.circuitBreakers.keys())
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        ubuntu: 'My security ensures our freedom - Check available endpoints'
      });
    });

    // Error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path
      });
      
      res.status(500).json({
        error: 'Internal server error',
        ubuntu: 'My security ensures our freedom - Error logged for investigation'
      });
    });
  }

  public start(port: number = 4000): void {
    this.app.listen(port, () => {
      this.logger.info(`Azora API Gateway started on port ${port}`, {
        port,
        ubuntu: 'My security ensures our freedom - Gateway operational'
      });
    });
  }
}

// Start the gateway
if (require.main === module) {
  const gateway = new AzoraAPIGateway();
  const port = parseInt(process.env.PORT || '4000');
  gateway.start(port);
}

export default AzoraAPIGateway;
