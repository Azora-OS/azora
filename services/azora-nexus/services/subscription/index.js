/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const promClient = require('prom-client')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()

// Prometheus metrics
const register = new promClient.Registry()
promClient.collectDefaultMetrics({ register })

// HTTP request metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

app.use(express.json())

// Simple logger (replace with Winston in production)
const logger = {
  info: (msg, meta = {}) => {
    const timestamp = new Date().toISOString()
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [INFO] ${msg}`, Object.keys(meta).length > 0 ? meta : '')
  },
  warn: (msg, meta = {}) => {
    const timestamp = new Date().toISOString()
    console.warn(`[${timestamp}] [WARN] ${msg}`, Object.keys(meta).length > 0 ? meta : '')
  },
  error: (msg, meta = {}) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [ERROR] ${msg}`, Object.keys(meta).length > 0 ? meta : '')
  },
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
      duration
    )
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    })
  })
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  next()
})

// Swagger/OpenAPI documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Azora Nexus Subscription Service API',
      version: '1.0.0',
      description: 'API documentation for subscription service',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4129}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.end(metrics)
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message })
    res.status(500).end()
  }
})

// Import pricing config from main service
// In production, this should be a shared package or API call
let pricingConfig
try {
  // Try to load from relative path (when running from project root)
  pricingConfig = require('../../../../ui/lib/services/pricingConfig.js')
  logger.info('Loaded pricing config from main service')
} catch (error) {
  logger.warn('Could not load pricing config, using fallback', { error: error.message })
  // Fallback pricing
  pricingConfig = {
    platformTiers: [
      { id: 'student', name: 'Student Plan', basePrice: 500 },
      { id: 'starter', name: 'Starter Plan', basePrice: 2500 },
      { id: 'professional', name: 'Professional Plan', basePrice: 7500 },
      { id: 'enterprise', name: 'Enterprise Plan', basePrice: 25000 },
    ],
    calculatePriceWithBreakdown: (_tier, _services, _applyDiscount, _isStudent, _countryCode) => ({
      basePrice: 2500,
      finalPrice: 1875,
      currency: 'USD',
      formatted: { final: '$1,875.00' },
    }),
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'subscription',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Proxy to main subscription service
app.get('/api/subscription/pricing', async (req, res) => {
  try {
    const mainServiceUrl = process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:4129'
    logger.info('Fetching pricing from main service', { url: mainServiceUrl })

    // AbortController for request timeout (Node.js 18+)
    const controller = new globalThis.AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${mainServiceUrl}/api/subscription/pricing`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    logger.info('Successfully fetched pricing from main service')
    res.json(data)
  } catch (error) {
    logger.error('Failed to fetch pricing from main service, using fallback', {
      error: error.message,
      stack: error.stack,
    })
    res.json({
      platformTiers: pricingConfig.platformTiers || [],
      services: [],
      message: 'Using fallback pricing',
      fallback: true,
    })
  }
})

app.post('/api/subscription/calculate', async (req, res) => {
  try {
    // Basic input validation
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be a valid JSON object',
      })
    }

    const mainServiceUrl = process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:4129'
    logger.info('Calculating subscription pricing', {
      url: mainServiceUrl,
      body: req.body,
    })

    // AbortController for request timeout (Node.js 18+)
    const controller = new globalThis.AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${mainServiceUrl}/api/subscription/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    logger.info('Successfully calculated subscription pricing')
    res.json(data)
  } catch (error) {
    logger.error('Failed to calculate subscription pricing', {
      error: error.message,
      stack: error.stack,
    })

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Subscription service request timed out',
      })
    }

    res.status(500).json({
      error: 'Subscription service unavailable',
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  })
})

// Fixed port configuration
const PORT = process.env.PORT || 4129
const HOST = process.env.HOST || '0.0.0.0'

app.listen(PORT, HOST, () => {
  logger.info(`💳 Azora Nexus Subscription Service running on ${HOST}:${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    service: 'subscription',
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})
