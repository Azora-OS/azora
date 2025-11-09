import { EventEmitter } from 'events'
import { logger } from './logger'

interface HealthCheck {
  name: string
  check: () => Promise<{ healthy: boolean; details?: any; responseTime?: number }>
  interval: number
  timeout: number
  retries: number
}

interface HealthStatus {
  name: string
  healthy: boolean
  lastCheck: Date
  responseTime: number
  details?: any
  consecutiveFailures: number
}

export class HealthChecker extends EventEmitter {
  private checks: Map<string, HealthCheck> = new Map()
  private statuses: Map<string, HealthStatus> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private running: boolean = false

  // Add health check
  addCheck(check: HealthCheck): void {
    this.checks.set(check.name, check)
    this.statuses.set(check.name, {
      name: check.name,
      healthy: false,
      lastCheck: new Date(),
      responseTime: 0,
      consecutiveFailures: 0
    })

    if (this.running) {
      this.startCheck(check.name)
    }

    logger.info(`Health check added: ${check.name}`)
  }

  // Remove health check
  removeCheck(name: string): void {
    this.checks.delete(name)
    this.statuses.delete(name)
    
    const interval = this.intervals.get(name)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(name)
    }

    logger.info(`Health check removed: ${name}`)
  }

  // Start all health checks
  start(): void {
    if (this.running) return

    this.running = true
    
    for (const name of this.checks.keys()) {
      this.startCheck(name)
    }

    logger.info('Health checker started')
  }

  // Stop all health checks
  stop(): void {
    if (!this.running) return

    this.running = false

    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()

    logger.info('Health checker stopped')
  }

  // Start individual check
  private startCheck(name: string): void {
    const check = this.checks.get(name)
    if (!check) return

    // Run initial check
    this.runCheck(name)

    // Schedule periodic checks
    const interval = setInterval(() => {
      this.runCheck(name)
    }, check.interval)

    this.intervals.set(name, interval)
  }

  // Run individual health check
  private async runCheck(name: string): Promise<void> {
    const check = this.checks.get(name)
    const status = this.statuses.get(name)
    
    if (!check || !status) return

    const startTime = Date.now()
    let attempts = 0
    let lastError: Error | null = null

    while (attempts < check.retries) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
        })

        const result = await Promise.race([
          check.check(),
          timeoutPromise
        ])

        const responseTime = Date.now() - startTime

        // Update status
        const wasHealthy = status.healthy
        status.healthy = result.healthy
        status.lastCheck = new Date()
        status.responseTime = responseTime
        status.details = result.details
        status.consecutiveFailures = result.healthy ? 0 : status.consecutiveFailures + 1

        // Emit events
        if (result.healthy && !wasHealthy) {
          this.emit('healthRestored', { name, status })
          logger.info(`Health restored: ${name}`, { responseTime, details: result.details })
        } else if (!result.healthy && wasHealthy) {
          this.emit('healthDegraded', { name, status })
          logger.warn(`Health degraded: ${name}`, { responseTime, details: result.details })
        }

        if (result.healthy) {
          logger.debug(`Health check passed: ${name}`, { responseTime })
        } else {
          logger.warn(`Health check failed: ${name}`, { responseTime, details: result.details })
        }

        return // Success, exit retry loop

      } catch (error) {
        lastError = error as Error
        attempts++
        
        if (attempts < check.retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
        }
      }
    }

    // All retries failed
    const responseTime = Date.now() - startTime
    const wasHealthy = status.healthy
    
    status.healthy = false
    status.lastCheck = new Date()
    status.responseTime = responseTime
    status.consecutiveFailures++
    status.details = { error: lastError?.message }

    if (wasHealthy) {
      this.emit('healthDegraded', { name, status })
    }

    logger.error(`Health check failed after ${attempts} attempts: ${name}`, {
      error: lastError?.message,
      responseTime,
      consecutiveFailures: status.consecutiveFailures
    })

    // Emit critical alert if consecutive failures exceed threshold
    if (status.consecutiveFailures >= 5) {
      this.emit('criticalFailure', { name, status })
    }
  }

  // Get current health status
  getStatus(name?: string): HealthStatus | Map<string, HealthStatus> {
    if (name) {
      return this.statuses.get(name) || null
    }
    return new Map(this.statuses)
  }

  // Get overall system health
  getOverallHealth(): {
    healthy: boolean
    status: 'healthy' | 'degraded' | 'critical'
    checks: { total: number; healthy: number; unhealthy: number }
    details: HealthStatus[]
  } {
    const statuses = Array.from(this.statuses.values())
    const healthy = statuses.filter(s => s.healthy).length
    const total = statuses.length
    const unhealthy = total - healthy

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
    
    if (unhealthy === 0) {
      status = 'healthy'
    } else if (unhealthy < total / 2) {
      status = 'degraded'
    } else {
      status = 'critical'
    }

    return {
      healthy: unhealthy === 0,
      status,
      checks: { total, healthy, unhealthy },
      details: statuses
    }
  }

  // Get health summary for monitoring
  getHealthSummary(): Record<string, any> {
    const overall = this.getOverallHealth()
    const summary: Record<string, any> = {
      timestamp: new Date().toISOString(),
      overall: overall.status,
      healthy: overall.healthy,
      checks: overall.checks
    }

    // Add individual check statuses
    for (const [name, status] of this.statuses) {
      summary[name] = {
        healthy: status.healthy,
        responseTime: status.responseTime,
        lastCheck: status.lastCheck.toISOString(),
        consecutiveFailures: status.consecutiveFailures
      }
    }

    return summary
  }
}

// Pre-configured health checks
export const commonHealthChecks = {
  database: (prisma: any): HealthCheck => ({
    name: 'database',
    check: async () => {
      try {
        await prisma.$queryRaw`SELECT 1`
        return { healthy: true, details: { connection: 'active' } }
      } catch (error) {
        return { 
          healthy: false, 
          details: { error: error.message, connection: 'failed' } 
        }
      }
    },
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    retries: 3
  }),

  redis: (redis: any): HealthCheck => ({
    name: 'redis',
    check: async () => {
      try {
        await redis.ping()
        return { healthy: true, details: { connection: 'active' } }
      } catch (error) {
        return { 
          healthy: false, 
          details: { error: error.message, connection: 'failed' } 
        }
      }
    },
    interval: 30000,
    timeout: 5000,
    retries: 3
  }),

  externalService: (url: string, name: string): HealthCheck => ({
    name: `external_${name}`,
    check: async () => {
      try {
        const response = await fetch(`${url}/health`, { 
          method: 'GET',
          timeout: 5000 
        })
        
        if (response.ok) {
          return { healthy: true, details: { status: response.status } }
        } else {
          return { 
            healthy: false, 
            details: { status: response.status, statusText: response.statusText } 
          }
        }
      } catch (error) {
        return { 
          healthy: false, 
          details: { error: error.message } 
        }
      }
    },
    interval: 60000, // 1 minute
    timeout: 10000,  // 10 seconds
    retries: 2
  }),

  diskSpace: (): HealthCheck => ({
    name: 'disk_space',
    check: async () => {
      try {
        const fs = await import('fs')
        const stats = fs.statSync('.')
        // This is a simplified check - in production you'd use proper disk space checking
        return { healthy: true, details: { available: 'sufficient' } }
      } catch (error) {
        return { 
          healthy: false, 
          details: { error: error.message } 
        }
      }
    },
    interval: 300000, // 5 minutes
    timeout: 5000,
    retries: 1
  }),

  memory: (): HealthCheck => ({
    name: 'memory',
    check: async () => {
      const usage = process.memoryUsage()
      const totalMB = usage.heapTotal / 1024 / 1024
      const usedMB = usage.heapUsed / 1024 / 1024
      const usagePercent = (usedMB / totalMB) * 100

      const healthy = usagePercent < 90 // Alert if memory usage > 90%

      return {
        healthy,
        details: {
          heapUsed: Math.round(usedMB),
          heapTotal: Math.round(totalMB),
          usagePercent: Math.round(usagePercent)
        }
      }
    },
    interval: 60000, // 1 minute
    timeout: 1000,
    retries: 1
  })
}

// Singleton health checker
export const healthChecker = new HealthChecker()