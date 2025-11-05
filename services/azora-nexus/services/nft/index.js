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


app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }))
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP, please try again later.' })
app.use('/api/', limiter)
app.use(express.json())

const logger = {
  info: (msg, meta = {}) => { const timestamp = new Date().toISOString(); console.log(`[${timestamp}] [INFO] ${msg}`, Object.keys(meta).length > 0 ? meta : '') },
  warn: (msg, meta = {}) => { const timestamp = new Date().toISOString(); console.warn(`[${timestamp}] [WARN] ${msg}`, Object.keys(meta).length > 0 ? meta : '') },
  error: (msg, meta = {}) => { const timestamp = new Date().toISOString(); console.error(`[${timestamp}] [ERROR] ${msg}`, Object.keys(meta).length > 0 ? meta : '') },
}

app.use((req, res, next) => { logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('user-agent') }); next() })

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
      title: 'Azora Nexus NFT Service API',
      version: '1.0.0',
      description: 'API documentation for nft service',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4114}`,
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

app.get('/health', (req, res) => { res.json({ status: 'healthy', service: 'nft', timestamp: new Date().toISOString(), uptime: process.uptime() }) })

app.post('/api/nft/mint', (req, res) => { logger.info('Mint new NFT', { body: req.body }); res.json({ tokenId: '', message: 'NFT service endpoint - implementation pending' }) })

app.use((err, req, res, _next) => { logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path, method: req.method }); res.status(err.status || 500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' }) })

app.use((req, res) => { res.status(404).json({ error: 'Not found', message: `Route ${req.method} ${req.path} not found` }) })

const PORT = process.env.PORT || 4114
const HOST = process.env.HOST || '0.0.0.0'

app.listen(PORT, HOST, () => { logger.info(`🎨 Azora Nexus NFT Service running on ${HOST}:${PORT}`, { environment: process.env.NODE_ENV || 'development', service: 'nft' }) })

process.on('SIGTERM', () => { logger.info('SIGTERM received, shutting down gracefully'); process.exit(0) })
process.on('SIGINT', () => { logger.info('SIGINT received, shutting down gracefully'); process.exit(0) })
