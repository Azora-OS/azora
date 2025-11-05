/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Advanced Security Manager
 * Implements zero-trust architecture and cryptographic sovereignty
 */

class SecurityManager {
  constructor() {
    this.securityLevel = 'standard'
    this.encryptionKey = null
    this.deviceFingerprint = null
    this.trustedDevices = new Set()
    this.init()
  }

  /**
   * Initialize security features
   */
  async init() {
    await this.generateDeviceFingerprint()
    await this.initEncryption()
    this.enableCSP()
    this.setupSecurityHeaders()
    this.monitorSecurityEvents()
  }

  /**
   * Generate unique device fingerprint
   */
  async generateDeviceFingerprint() {
    const components = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      webgl: await this.getWebGLFingerprint(),
      canvas: await this.getCanvasFingerprint(),
    }

    const fingerprint = await this.hashObject(components)
    this.deviceFingerprint = fingerprint
    
    return fingerprint
  }

  /**
   * Get WebGL fingerprint
   */
  async getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) return 'no-webgl'

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      
      return `${vendor}~${renderer}`
    } catch (e) {
      return 'webgl-error'
    }
  }

  /**
   * Get Canvas fingerprint
   */
  async getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Azora OS 🌍', 2, 15)
      
      return canvas.toDataURL()
    } catch (e) {
      return 'canvas-error'
    }
  }

  /**
   * Initialize encryption
   */
  async initEncryption() {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API not available')
      return
    }

    try {
      // Generate or retrieve encryption key
      const storedKey = localStorage.getItem('azora-encryption-key')
      
      if (storedKey) {
        this.encryptionKey = await this.importKey(storedKey)
      } else {
        this.encryptionKey = await this.generateKey()
        const exportedKey = await this.exportKey(this.encryptionKey)
        localStorage.setItem('azora-encryption-key', exportedKey)
      }
    } catch (error) {
      console.error('Encryption initialization failed:', error)
    }
  }

  /**
   * Generate encryption key
   */
  async generateKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Export encryption key
   */
  async exportKey(key) {
    const exported = await window.crypto.subtle.exportKey('jwk', key)
    return JSON.stringify(exported)
  }

  /**
   * Import encryption key
   */
  async importKey(keyData) {
    const jwk = JSON.parse(keyData)
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt data
   */
  async encrypt(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(JSON.stringify(data))

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      encodedData
    )

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    }
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    const iv = new Uint8Array(encryptedData.iv)
    const data = new Uint8Array(encryptedData.data)

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      data
    )

    const decoded = new TextDecoder().decode(decrypted)
    return JSON.parse(decoded)
  }

  /**
   * Hash object for fingerprinting
   */
  async hashObject(obj) {
    const str = JSON.stringify(obj)
    const buffer = new TextEncoder().encode(str)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Enable Content Security Policy
   */
  enableCSP() {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' ws: wss: https://azora.world;
      frame-src 'none';
      object-src 'none';
    `.replace(/\s+/g, ' ').trim()
    
    document.head.appendChild(meta)
  }

  /**
   * Setup security headers (client-side enforcement)
   */
  setupSecurityHeaders() {
    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('[data-allow-context-menu]')) {
          e.preventDefault()
        }
      })
    }

    // Prevent text selection of sensitive data
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('[data-sensitive]')) {
        e.preventDefault()
      }
    })

    // Detect developer tools
    this.detectDevTools()
  }

  /**
   * Detect developer tools
   */
  detectDevTools() {
    const threshold = 160
    let devtoolsOpen = false

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true
          this.handleDevToolsOpen()
        }
      } else {
        devtoolsOpen = false
      }
    }, 1000)
  }

  /**
   * Handle dev tools opened
   */
  handleDevToolsOpen() {
    console.warn('⚠️ Developer tools detected. Azora OS is protected by proprietary license.')
    
    if (process.env.NODE_ENV === 'production') {
      // In production, log security event
      this.logSecurityEvent('devtools-opened', {
        timestamp: Date.now(),
        deviceFingerprint: this.deviceFingerprint,
      })
    }
  }

  /**
   * Monitor security events
   */
  monitorSecurityEvents() {
    // Monitor for suspicious activity
    let clickCount = 0
    let lastClickTime = 0

    document.addEventListener('click', () => {
      const now = Date.now()
      
      if (now - lastClickTime < 100) {
        clickCount++
        if (clickCount > 10) {
          this.logSecurityEvent('suspicious-clicking', {
            count: clickCount,
            timestamp: now,
          })
          clickCount = 0
        }
      } else {
        clickCount = 0
      }
      
      lastClickTime = now
    })

    // Monitor for copy/paste of sensitive data
    document.addEventListener('copy', (e) => {
      if (e.target.closest('[data-sensitive]')) {
        e.preventDefault()
        this.logSecurityEvent('sensitive-data-copy-attempt', {
          element: e.target.tagName,
          timestamp: Date.now(),
        })
      }
    })

    // Monitor for screenshot attempts (limited detection)
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'PrintScreen') || 
          (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
        this.logSecurityEvent('screenshot-attempt', {
          timestamp: Date.now(),
        })
      }
    })
  }

  /**
   * Log security event
   */
  logSecurityEvent(type, data) {
    const event = {
      type,
      data,
      deviceFingerprint: this.deviceFingerprint,
      timestamp: Date.now(),
    }

    // Store locally
    const events = JSON.parse(localStorage.getItem('azora-security-events') || '[]')
    events.push(event)
    localStorage.setItem('azora-security-events', JSON.stringify(events.slice(-100)))

    // Send to server
    this.sendSecurityEvent(event)
  }

  /**
   * Send security event to server
   */
  async sendSecurityEvent(event) {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Failed to send security event:', error)
    }
  }

  /**
   * Verify device trust
   */
  async verifyDeviceTrust() {
    const fingerprint = await this.generateDeviceFingerprint()
    
    try {
      const response = await fetch('/api/security/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint }),
      })

      const result = await response.json()
      
      if (result.trusted) {
        this.trustedDevices.add(fingerprint)
      }

      return result.trusted
    } catch (error) {
      console.error('Device verification failed:', error)
      return false
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA() {
    // Generate TOTP secret
    const secret = this.generateTOTPSecret()
    
    return {
      secret,
      qrCode: await this.generateQRCode(secret),
    }
  }

  /**
   * Generate TOTP secret
   */
  generateTOTPSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)]
    }
    
    return secret
  }

  /**
   * Generate QR code for TOTP
   */
  async generateQRCode(secret) {
    const otpauth = `otpauth://totp/Azora:user?secret=${secret}&issuer=Azora`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
  }

  /**
   * Verify TOTP code
   */
  verifyTOTP(secret, code) {
    // Simplified TOTP verification
    // In production, use proper TOTP library
    const timestamp = Math.floor(Date.now() / 30000)
    const expectedCode = this.generateTOTPCode(secret, timestamp)
    
    return code === expectedCode
  }

  /**
   * Generate TOTP code
   */
  generateTOTPCode(secret, timestamp) {
    // Simplified implementation
    // In production, use proper HMAC-based algorithm
    const hash = timestamp.toString() + secret
    return (parseInt(hash, 36) % 1000000).toString().padStart(6, '0')
  }

  /**
   * Get security metrics
   */
  getMetrics() {
    return {
      deviceFingerprint: this.deviceFingerprint,
      securityLevel: this.securityLevel,
      trustedDevicesCount: this.trustedDevices.size,
      encryptionEnabled: !!this.encryptionKey,
    }
  }
}

// Initialize on load
let securityManager = null

if (typeof window !== 'undefined') {
  securityManager = new SecurityManager()
  
  // Expose to window for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    window.azoraSecurity = securityManager
  }
}

export default securityManager
