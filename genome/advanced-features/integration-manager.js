/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import nativeIntegration from './native-integration'
import wsManager from './websocket-manager'
import elaraAI from './ai-assistant'
import performanceOptimizer from './performance-optimizer'
import securityManager from './security-manager'

/**
 * Advanced Integration Manager
 * Powered by Elara AI Constitutional Intelligence
 * 
 * Orchestrates all advanced features for OS-level integration:
 * - Native device capabilities
 * - Real-time WebSocket communication
 * - Elara AI assistance
 * - Performance optimization
 * - Zero-trust security
 */

class IntegrationManager {
  constructor() {
    this.initialized = false
    this.features = {
      native: null,
      websocket: null,
      ai: null,
      performance: null,
      security: null,
    }
    this.capabilities = {}
    this.state = 'initializing'
  }

  /**
   * Initialize all systems
   */
  async initialize() {
    if (this.initialized) return

    console.log('🚀 Initializing Azora OS Advanced Features...')

    try {
      // Initialize core features
      this.features.native = nativeIntegration
      this.features.websocket = wsManager
      this.features.elaraAI = elaraAI
      this.features.performance = performanceOptimizer
      this.features.security = securityManager

      // Detect capabilities
      this.capabilities = await this.detectAllCapabilities()

      // Setup integrations
      await this.setupNativeIntegration()
      await this.setupWebSocketIntegration()
      await this.setupPWA()
      await this.setupOfflineSupport()
      await this.setupNotifications()
      await this.setupSecurityFeatures()

      this.initialized = true
      this.state = 'ready'

      console.log('✅ Azora OS fully initialized')
      console.log('📊 Capabilities:', this.capabilities)

      // Announce to parent app
      this.announceReady()
    } catch (error) {
      console.error('❌ Initialization failed:', error)
      this.state = 'error'
      throw error
    }
  }

  /**
   * Detect all device capabilities
   */
  async detectAllCapabilities() {
    const capabilities = {
      platform: nativeIntegration.platform,
      native: nativeIntegration.capabilities,
      performance: performanceOptimizer.getMetrics(),
      security: securityManager.getMetrics(),
      network: {
        online: navigator.onLine,
        effectiveType: navigator.connection?.effectiveType || 'unknown',
        downlink: navigator.connection?.downlink || 0,
      },
      storage: await this.detectStorage(),
    }

    return capabilities
  }

  /**
   * Detect storage capabilities
   */
  async detectStorage() {
    const storage = {
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      quota: null,
    }

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      storage.quota = {
        usage: estimate.usage,
        quota: estimate.quota,
        available: estimate.quota - estimate.usage,
      }
    }

    return storage
  }

  /**
   * Setup native OS integration
   */
  async setupNativeIntegration() {
    console.log('🔧 Setting up native integration...')

    // Request persistent storage
    if (nativeIntegration.capabilities.indexedDB) {
      await nativeIntegration.requestPersistentStorage()
    }

    // Setup geolocation for compliance
    if (nativeIntegration.capabilities.geolocation) {
      try {
        const location = await nativeIntegration.requestGeolocation()
        this.updateComplianceRegion(location)
      } catch (error) {
        console.warn('Geolocation not available:', error.message)
      }
    }

    // Enable background sync if available
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      this.enableBackgroundSync()
    }
  }

  /**
   * Setup WebSocket integration
   */
  async setupWebSocketIntegration() {
    console.log('🔌 Setting up WebSocket...')

    if (wsManager) {
      wsManager.connect()

      // Subscribe to critical channels
      wsManager.subscribe('exchange-rates')
      wsManager.subscribe('transactions')
      wsManager.subscribe('compliance-alerts')
      wsManager.subscribe('system-alerts')

      // Setup event handlers
      this.setupWebSocketHandlers()
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers() {
    wsManager.on('rates-update', (rates) => {
      this.updateExchangeRates(rates)
    })

    wsManager.on('transaction', (tx) => {
      this.handleTransaction(tx)
    })

    wsManager.on('compliance-alert', (alert) => {
      this.showComplianceAlert(alert)
    })

    wsManager.on('system-alert', (alert) => {
      this.showSystemAlert(alert)
    })
  }

  /**
   * Setup Progressive Web App
   */
  async setupPWA() {
    console.log('📱 Setting up PWA...')

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable()
            }
          })
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installPrompt = e
      this.showInstallPrompt()
    })

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ Azora OS installed as app')
      this.trackEvent('app-installed')
    })
  }

  /**
   * Setup offline support
   */
  async setupOfflineSupport() {
    console.log('💾 Setting up offline support...')

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.state = 'online'
      this.syncOfflineData()
      this.showNotification('Back online', 'Syncing your data...')
    })

    window.addEventListener('offline', () => {
      this.state = 'offline'
      this.showNotification('Offline mode', 'Changes will sync when reconnected')
    })

    // Setup IndexedDB for offline data
    if ('indexedDB' in window) {
      await this.setupOfflineDB()
    }
  }

  /**
   * Setup offline database
   */
  async setupOfflineDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('azora-offline-db', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create stores
        if (!db.objectStoreNames.contains('pending-transactions')) {
          db.createObjectStore('pending-transactions', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('offline-courses')) {
          db.createObjectStore('offline-courses', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('cached-data')) {
          db.createObjectStore('cached-data', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * Setup push notifications
   */
  async setupNotifications() {
    console.log('🔔 Setting up notifications...')

    if (nativeIntegration.capabilities.pushManager) {
      try {
        const subscription = await nativeIntegration.enablePushNotifications()
        await this.sendSubscriptionToServer(subscription)
      } catch (error) {
        console.warn('Notifications not enabled:', error.message)
      }
    }
  }

  /**
   * Setup security features
   */
  async setupSecurityFeatures() {
    console.log('🔐 Setting up security...')

    // Verify device trust
    const isTrusted = await securityManager.verifyDeviceTrust()
    
    if (!isTrusted) {
      console.warn('⚠️ Untrusted device detected')
      this.requireAdditionalVerification()
    }

    // Enable biometric auth if available
    if (nativeIntegration.capabilities.webAuthn) {
      this.enableBiometricAuth()
    }
  }

  /**
   * Enable background sync
   */
  enableBackgroundSync() {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('sync-transactions')
    })
  }

  /**
   * Sync offline data
   */
  async syncOfflineData() {
    if (!navigator.onLine) return

    console.log('🔄 Syncing offline data...')

    try {
      const db = await this.openDB()
      const tx = db.transaction('pending-transactions', 'readonly')
      const store = tx.objectStore('pending-transactions')
      const transactions = await store.getAll()

      for (const tx of transactions) {
        await this.sendTransaction(tx)
      }

      console.log('✅ Offline data synced')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  /**
   * Update compliance region
   */
  updateComplianceRegion(location) {
    // Reverse geocode to get region
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}`)
      .then(res => res.json())
      .then(data => {
        const region = data.countryName
        console.log('📍 Detected region:', region)
        
        // Update compliance settings
        localStorage.setItem('azora-region', region)
      })
      .catch(error => {
        console.error('Reverse geocoding failed:', error)
      })
  }

  /**
   * Update exchange rates
   */
  updateExchangeRates(rates) {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('azora:rates-update', { detail: rates }))
  }

  /**
   * Handle transaction
   */
  handleTransaction(tx) {
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('Transaction Received', {
        body: `${tx.amount} ${tx.currency} from ${tx.sender}`,
        icon: '/icons/icon-192x192.png',
      })
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('azora:transaction', { detail: tx }))
  }

  /**
   * Show compliance alert
   */
  showComplianceAlert(alert) {
    window.dispatchEvent(new CustomEvent('azora:compliance-alert', { detail: alert }))
  }

  /**
   * Show system alert
   */
  showSystemAlert(alert) {
    window.dispatchEvent(new CustomEvent('azora:system-alert', { detail: alert }))
  }

  /**
   * Show notification
   */
  showNotification(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      })
    }
  }

  /**
   * Show update available
   */
  showUpdateAvailable() {
    const event = new CustomEvent('azora:update-available')
    window.dispatchEvent(event)
  }

  /**
   * Show install prompt
   */
  showInstallPrompt() {
    const event = new CustomEvent('azora:install-prompt', {
      detail: this.installPrompt,
    })
    window.dispatchEvent(event)
  }

  /**
   * Require additional verification
   */
  requireAdditionalVerification() {
    const event = new CustomEvent('azora:verification-required')
    window.dispatchEvent(event)
  }

  /**
   * Enable biometric auth
   */
  enableBiometricAuth() {
    const event = new CustomEvent('azora:biometric-available')
    window.dispatchEvent(event)
  }

  /**
   * Send subscription to server
   */
  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
    } catch (error) {
      console.error('Failed to send subscription:', error)
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(tx) {
    try {
      await fetch('/api/mint/transactions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      })
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  /**
   * Track event
   */
  trackEvent(event, data = {}) {
    const eventData = {
      event,
      data,
      timestamp: Date.now(),
      deviceFingerprint: securityManager.deviceFingerprint,
    }

    // Send to analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch(() => {})
  }

  /**
   * Open IndexedDB
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('azora-offline-db', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * Announce ready state
   */
  announceReady() {
    window.dispatchEvent(new CustomEvent('azora:ready', {
      detail: {
        capabilities: this.capabilities,
        features: Object.keys(this.features),
        state: this.state,
      },
    }))
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      state: this.state,
      initialized: this.initialized,
      capabilities: this.capabilities,
      features: Object.keys(this.features).reduce((acc, key) => {
        acc[key] = !!this.features[key]
        return acc
      }, {}),
    }
  }

  /**
   * Install app
   */
  async installApp() {
    if (this.installPrompt) {
      this.installPrompt.prompt()
      const { outcome } = await this.installPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted install')
      }
      
      this.installPrompt = null
    }
  }
}

// Create singleton
const integrationManager = typeof window !== 'undefined' ? new IntegrationManager() : null

// Auto-initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      integrationManager.initialize()
    })
  } else {
    integrationManager.initialize()
  }
}

export default integrationManager
