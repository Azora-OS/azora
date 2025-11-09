/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK WEBSOCKET - Real-time Spark updates
*/

import { WebSocketServer } from 'ws'
import type { SparkService } from '../core/spark-service'

/**
 * 🔌 SPARK WEBSOCKET
 * 
 * Real-time WebSocket updates for Spark
 */
export class SparkWebSocket {
  private wss: WebSocketServer
  private sparkService: SparkService
  private clients: Map<string, any> = new Map()

  constructor(wss: WebSocketServer, sparkService: SparkService) {
    this.wss = wss
    this.sparkService = sparkService
  }

  /**
   * Setup WebSocket handlers
   */
  setup(): void {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId()
      this.clients.set(clientId, ws)

      console.log(`✨ Spark WebSocket client connected: ${clientId}`)

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString())
          await this.handleMessage(clientId, message)
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
        console.log(`✨ Spark WebSocket client disconnected: ${clientId}`)
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        message: 'Connected to Spark service',
      }))
    })

    // Listen to Spark service events
    this.sparkService.on('completion-generated', (data) => {
      this.broadcast('completion', data)
    })

    this.sparkService.on('search-complete', (data) => {
      this.broadcast('search', data)
    })

    this.sparkService.on('chat-response', (data) => {
      this.broadcast('chat', data)
    })
  }

  /**
   * Handle WebSocket message
   */
  private async handleMessage(clientId: string, message: any): Promise<void> {
    const ws = this.clients.get(clientId)
    if (!ws) return

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break

      case 'subscribe':
        // Subscribe to repository updates
        ws.send(JSON.stringify({
          type: 'subscribed',
          repositoryId: message.repositoryId,
        }))
        break

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`,
        }))
    }
  }

  /**
   * Broadcast message to all clients
   */
  private broadcast(type: string, data: any): void {
    const message = JSON.stringify({ type, data })
    
    for (const ws of this.clients.values()) {
      if (ws.readyState === 1) { // OPEN
        ws.send(message)
      }
    }
  }

  /**
   * Generate client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
