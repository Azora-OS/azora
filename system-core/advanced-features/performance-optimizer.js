/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Advanced Performance Optimizer
 * Optimizes app performance across all devices and network conditions
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: 0,
      networkSpeed: 'unknown',
      deviceCapability: 'unknown',
    }
    this.observers = []
    this.init()
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    this.detectDeviceCapability()
    this.measureNetworkSpeed()
    this.startPerformanceMonitoring()
    this.setupIntersectionObserver()
    this.enableResourceHints()
  }

  /**
   * Detect device capability
   */
  detectDeviceCapability() {
    const memory = navigator.deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 2
    const connection = navigator.connection || {}

    let capability = 'high'
    
    if (memory < 2 || cores < 2) {
      capability = 'low'
    } else if (memory < 4 || cores < 4) {
      capability = 'medium'
    }

    // Adjust for connection type
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      capability = 'low'
    } else if (connection.effectiveType === '3g') {
      capability = Math.min(capability, 'medium')
    }

    this.metrics.deviceCapability = capability
    this.applyOptimizations(capability)
  }

  /**
   * Measure network speed
   */
  async measureNetworkSpeed() {
    if (!navigator.connection) {
      this.metrics.networkSpeed = 'unknown'
      return
    }

    const connection = navigator.connection
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink
    const rtt = connection.rtt

    this.metrics.networkSpeed = effectiveType
    this.metrics.downlink = downlink
    this.metrics.rtt = rtt

    // Listen for network changes
    connection.addEventListener('change', () => {
      this.detectDeviceCapability()
    })
  }

  /**
   * Apply optimizations based on device capability
   */
  applyOptimizations(capability) {
    const root = document.documentElement

    switch (capability) {
      case 'low':
        root.style.setProperty('--animation-duration', '0ms')
        root.style.setProperty('--transition-duration', '0ms')
        root.classList.add('reduce-motion')
        this.disableNonCriticalAnimations()
        this.enableDataSaver()
        break
      
      case 'medium':
        root.style.setProperty('--animation-duration', '150ms')
        root.style.setProperty('--transition-duration', '150ms')
        this.enableSelectiveLoading()
        break
      
      case 'high':
      default:
        root.style.setProperty('--animation-duration', '300ms')
        root.style.setProperty('--transition-duration', '300ms')
        this.enableEnhancedFeatures()
        break
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor FPS
      this.monitorFPS()

      // Monitor Long Tasks
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry.duration, 'ms')
              this.optimizeLongTask(entry)
            }
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
        this.observers.push(observer)
      } catch (e) {
        // PerformanceObserver not supported
      }

      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          }
          if (cls > 0.1) {
            console.warn('Cumulative Layout Shift:', cls)
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        // Not supported
      }
    }

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
        this.metrics.memory = memoryUsage
        
        if (memoryUsage > 0.9) {
          console.warn('High memory usage:', (memoryUsage * 100).toFixed(1), '%')
          this.releaseMemory()
        }
      }, 10000)
    }
  }

  /**
   * Monitor FPS
   */
  monitorFPS() {
    let lastTime = performance.now()
    let frames = 0

    const measureFPS = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime))
        frames = 0
        lastTime = currentTime

        if (this.metrics.fps < 30) {
          console.warn('Low FPS detected:', this.metrics.fps)
          this.reduceFPSLoad()
        }
      }

      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      return
    }

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.dataset.src
            
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })

    this.observers.push(imageObserver)
  }

  /**
   * Enable resource hints
   */
  enableResourceHints() {
    // Preconnect to API
    this.addResourceHint('preconnect', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    
    // DNS prefetch for external resources
    this.addResourceHint('dns-prefetch', 'https://fonts.googleapis.com')
    this.addResourceHint('dns-prefetch', 'https://cdn.azora.world')

    // Prefetch critical routes
    this.prefetchRoute('/services/sapiens')
    this.prefetchRoute('/services/mint')
  }

  /**
   * Add resource hint
   */
  addResourceHint(rel, href) {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    document.head.appendChild(link)
  }

  /**
   * Prefetch route
   */
  prefetchRoute(path) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = path
    document.head.appendChild(link)
  }

  /**
   * Disable non-critical animations
   */
  disableNonCriticalAnimations() {
    const style = document.createElement('style')
    style.textContent = `
      * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Enable data saver mode
   */
  enableDataSaver() {
    // Reduce image quality
    document.querySelectorAll('img').forEach((img) => {
      if (img.srcset) {
        img.removeAttribute('srcset')
      }
    })

    // Disable video autoplay
    document.querySelectorAll('video[autoplay]').forEach((video) => {
      video.removeAttribute('autoplay')
    })

    console.log('📉 Data saver mode enabled')
  }

  /**
   * Enable selective loading
   */
  enableSelectiveLoading() {
    // Load images above the fold immediately
    const viewportHeight = window.innerHeight
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      const rect = img.getBoundingClientRect()
      if (rect.top < viewportHeight) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    })
  }

  /**
   * Enable enhanced features for high-end devices
   */
  enableEnhancedFeatures() {
    document.documentElement.classList.add('enhanced-mode')
    console.log('✨ Enhanced features enabled')
  }

  /**
   * Optimize long task
   */
  optimizeLongTask(entry) {
    // Break up long tasks using requestIdleCallback
    if ('requestIdleCallback' in window) {
      console.log('Deferring non-critical work')
      // Implementation depends on specific use case
    }
  }

  /**
   * Reduce FPS load
   */
  reduceFPSLoad() {
    // Pause non-visible animations
    document.querySelectorAll('[data-animate]').forEach((el) => {
      if (!this.isElementInViewport(el)) {
        el.style.animationPlayState = 'paused'
      }
    })
  }

  /**
   * Release memory
   */
  releaseMemory() {
    // Clear caches if memory is high
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('runtime')) {
            caches.delete(name)
          }
        })
      })
    }

    // Clear old IndexedDB entries
    this.clearOldData()
  }

  /**
   * Clear old data
   */
  async clearOldData() {
    if (!('indexedDB' in window)) return

    try {
      const db = await this.openDB()
      const tx = db.transaction('pending-transactions', 'readwrite')
      const store = tx.objectStore('pending-transactions')
      
      const now = Date.now()
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000

      const allRecords = await store.getAll()
      allRecords.forEach((record) => {
        if (record.timestamp < weekAgo) {
          store.delete(record.id)
        }
      })
    } catch (error) {
      console.error('Failed to clear old data:', error)
    }
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return { ...this.metrics }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }

  /**
   * Helper to open IndexedDB
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('azora-offline-db', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

// Initialize on load
let performanceOptimizer = null

if (typeof window !== 'undefined') {
  performanceOptimizer = new PerformanceOptimizer()
  
  // Expose to window for debugging
  window.azoraPerformance = performanceOptimizer
}

export default performanceOptimizer
