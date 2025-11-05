/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Native OS Integration Layer
 * Provides deep integration with device OS capabilities
 */

class NativeIntegration {
  constructor() {
    this.platform = this.detectPlatform()
    this.capabilities = this.detectCapabilities()
  }

  /**
   * Detect device platform
   */
  detectPlatform() {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) return 'android'
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
    if (/Win/.test(ua)) return 'windows'
    if (/Mac/.test(ua)) return 'macos'
    if (/Linux/.test(ua)) return 'linux'
    return 'unknown'
  }

  /**
   * Detect device capabilities
   */
  detectCapabilities() {
    return {
      // Hardware
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator,
      geolocation: 'geolocation' in navigator,
      bluetooth: 'bluetooth' in navigator,
      nfc: 'nfc' in navigator,
      usb: 'usb' in navigator,
      
      // Storage
      indexedDB: 'indexedDB' in window,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      
      // Network
      online: 'onLine' in navigator && navigator.onLine,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      
      // Sensors
      accelerometer: 'Accelerometer' in window,
      gyroscope: 'Gyroscope' in window,
      magnetometer: 'Magnetometer' in window,
      ambientLight: 'AmbientLightSensor' in window,
      
      // Biometrics
      webAuthn: 'credentials' in navigator,
      
      // Display
      fullscreen: 'fullscreenEnabled' in document,
      wakeLock: 'wakeLock' in navigator,
      screenOrientation: 'orientation' in screen,
      
      // Payments
      paymentRequest: 'PaymentRequest' in window,
      
      // Sharing
      share: 'share' in navigator,
      
      // Clipboard
      clipboard: 'clipboard' in navigator,
    }
  }

  /**
   * Request camera access for Aegis integrity monitoring
   */
  async requestCamera() {
    if (!this.capabilities.camera) {
      throw new Error('Camera not available')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      return stream
    } catch (error) {
      console.error('Camera access denied:', error)
      throw error
    }
  }

  /**
   * Request geolocation for regional compliance
   */
  async requestGeolocation() {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not available')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  /**
   * Request biometric authentication
   */
  async requestBiometric(challenge) {
    if (!this.capabilities.webAuthn) {
      throw new Error('Biometric authentication not available')
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          timeout: 60000,
          userVerification: 'required',
        },
      })
      return credential
    } catch (error) {
      console.error('Biometric auth failed:', error)
      throw error
    }
  }

  /**
   * Enable push notifications
   */
  async enablePushNotifications() {
    if (!this.capabilities.pushManager) {
      throw new Error('Push notifications not available')
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })

      return subscription
    } catch (error) {
      console.error('Push notification setup failed:', error)
      throw error
    }
  }

  /**
   * Request persistent storage for offline mode
   */
  async requestPersistentStorage() {
    if (!navigator.storage || !navigator.storage.persist) {
      return false
    }

    const isPersisted = await navigator.storage.persist()
    return isPersisted
  }

  /**
   * Estimate storage quota
   */
  async estimateStorage() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null
    }

    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usagePercent: (estimate.usage / estimate.quota) * 100,
    }
  }

  /**
   * Request wake lock to prevent sleep during exams
   */
  async requestWakeLock() {
    if (!this.capabilities.wakeLock) {
      return null
    }

    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      return wakeLock
    } catch (error) {
      console.error('Wake lock failed:', error)
      return null
    }
  }

  /**
   * Share content via native share API
   */
  async share(data) {
    if (!this.capabilities.share) {
      throw new Error('Native sharing not available')
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Sharing failed:', error)
        throw error
      }
    }
  }

  /**
   * Request payment via native payment API
   */
  async requestPayment(details) {
    if (!this.capabilities.paymentRequest) {
      throw new Error('Payment Request API not available')
    }

    const supportedMethods = [
      { supportedMethods: 'basic-card' },
      { supportedMethods: 'https://azora.world/pay' },
    ]

    const paymentRequest = new PaymentRequest(supportedMethods, details)
    
    try {
      const paymentResponse = await paymentRequest.show()
      await paymentResponse.complete('success')
      return paymentResponse
    } catch (error) {
      console.error('Payment failed:', error)
      throw error
    }
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    if (!this.capabilities.clipboard) {
      throw new Error('Clipboard API not available')
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Clipboard write failed:', error)
      throw error
    }
  }

  /**
   * Read from clipboard
   */
  async readFromClipboard() {
    if (!this.capabilities.clipboard) {
      throw new Error('Clipboard API not available')
    }

    try {
      const text = await navigator.clipboard.readText()
      return text
    } catch (error) {
      console.error('Clipboard read failed:', error)
      throw error
    }
  }

  /**
   * Request fullscreen mode
   */
  async requestFullscreen(element = document.documentElement) {
    if (!this.capabilities.fullscreen) {
      throw new Error('Fullscreen not available')
    }

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error)
      throw error
    }
  }

  /**
   * Exit fullscreen
   */
  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen()
    }
  }

  /**
   * Vibrate device
   */
  vibrate(pattern) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Helper to convert VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Create singleton instance
const nativeIntegration = new NativeIntegration()

export default nativeIntegration
