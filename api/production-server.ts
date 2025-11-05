/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * PRODUCTION API SERVER
 * Complete Azora OS API with all services
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mintRoutes from '../services/azora-mint/api/routes'

// Load environment variables
dotenv.config({ path: '.env.production' })
dotenv.config({ path: '.env.supabase' })

const app = express()
const PORT = process.env.PORT || 4300

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-os-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Service routes
app.use('/api/mint', mintRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Azora OS API',
    version: '1.0.0',
    services: [
      { name: 'Azora Mint', path: '/api/mint', status: 'active' }
    ],
    documentation: 'https://docs.azora.world'
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Azora OS API Server`)
    console.log(`   Port: ${PORT}`)
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`)
    console.log(`   Health: http://localhost:${PORT}/health`)
    console.log(`   Ready to serve!\n`)
  })
}

export default app

