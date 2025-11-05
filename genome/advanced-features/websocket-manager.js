/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Real-Time WebSocket Manager
 * Provides live data synchronization across all Azora OS services
 */

class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.listeners = new Map()
    this.heartbeatInterval = null
    this.isConnecting = false
  }

  /**
   * Connect to WebSocket server
   */
  connect(url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4030/ws') {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnecting = false
        this.stopHeartbeat()
        this.emit('disconnected')
        this.reconnect()
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.isConnecting = false
      this.reconnect()
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('max-reconnect-attempts')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    const { type, payload } = data

    switch (type) {
      case 'exchange-rates':
        this.emit('rates-update', payload)
        break
      case 'transaction':
        this.emit('transaction', payload)
        break
      case 'compliance-alert':
        this.emit('compliance-alert', payload)
        break
      case 'knowledge-points':
        this.emit('points-update', payload)
        break
      case 'order-update':
        this.emit('order-update', payload)
        break
      case 'marketplace-listing':
        this.emit('new-listing', payload)
        break
      case 'governance-proposal':
        this.emit('proposal', payload)
        break
      case 'system-alert':
        this.emit('system-alert', payload)
        break
      case 'pong':
        // Heartbeat response
        break
      default:
        this.emit(type, payload)
    }
  }

  /**
   * Send message to server
   */
  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket not connected')
    }
  }

  /**
   * Subscribe to specific channel
   */
  subscribe(channel) {
    this.send('subscribe', { channel })
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel) {
    this.send('unsubscribe', { channel })
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return

    this.listeners.get(event).forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }
}

// React hook for WebSocket
export function useWebSocket() {
  const [status, setStatus] = React.useState('disconnected')
  const [data, setData] = React.useState(null)
  const wsManager = React.useRef(null)

  React.useEffect(() => {
    if (!wsManager.current) {
      wsManager.current = new WebSocketManager()
    }

    const ws = wsManager.current
    ws.connect()

    ws.on('connected', () => setStatus('connected'))
    ws.on('disconnected', () => setStatus('disconnected'))
    ws.on('error', () => setStatus('error'))

    return () => {
      ws.disconnect()
    }
  }, [])

  const subscribe = React.useCallback((event, callback) => {
    if (wsManager.current) {
      wsManager.current.on(event, callback)
    }
  }, [])

  const unsubscribe = React.useCallback((event, callback) => {
    if (wsManager.current) {
      wsManager.current.off(event, callback)
    }
  }, [])

  const send = React.useCallback((type, payload) => {
    if (wsManager.current) {
      wsManager.current.send(type, payload)
    }
  }, [])

  return { status, subscribe, unsubscribe, send, data }
}

// Create singleton instance
const wsManager = typeof window !== 'undefined' ? new WebSocketManager() : null

export default wsManager
