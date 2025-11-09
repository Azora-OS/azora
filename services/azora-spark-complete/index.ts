/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA SPARK COMPLETE - GitHub Spark/Copilot Alternative
Fully capable AI coding assistant for Codespaces
Integrated with Elara, Design System, and Ubuntu Philosophy
*/

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { SparkService } from './core/spark-service'
import { SparkAPI } from './api/spark-api'
import { SparkWebSocket } from './websocket/spark-websocket'
import { SparkIndexer } from './indexing/spark-indexer'
import { SparkCompleter } from './completion/spark-completer'
import { SparkChat } from './chat/spark-chat'
import { SparkSearch } from './search/spark-search'

const app = express()
app.set('trust proxy', true)

const server = createServer(app)
const wss = new WebSocketServer({ server })
const PORT = process.env.PORT || 4300

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }))

// Initialize Spark Service
const sparkService = new SparkService()
const sparkAPI = new SparkAPI(sparkService)
const sparkWebSocket = new SparkWebSocket(wss, sparkService)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-spark-complete',
    version: '1.0.0',
    ubuntu: 'I code because we create',
    features: {
      codeCompletion: true,
      codeSearch: true,
      chat: true,
      indexing: true,
      elaraIntegration: true,
    },
    timestamp: new Date(),
  })
})

// API Routes
app.use('/api/spark', sparkAPI.router)

// WebSocket
sparkWebSocket.setup()

// Start server
server.listen(PORT, async () => {
  console.log(`\n${'='.repeat(70)}`)
  console.log('✨ AZORA SPARK COMPLETE - GitHub Spark/Copilot Alternative')
  console.log(`   Port: ${PORT}`)
  console.log(`   Ubuntu: "I code because we create"`)
  console.log('='.repeat(70))
  
  // Initialize Spark Service
  await sparkService.initialize()
  
  console.log('✅ Spark service initialized')
  console.log('🚀 Ready for code completion, search, and chat\n')
})

export default app
