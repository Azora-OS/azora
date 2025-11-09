import { prisma } from './prisma-config'
import { redis, checkRedisHealth } from './redis-config'

interface DatabaseMetrics {
  connections: number
  activeQueries: number
  slowQueries: number
  cacheHitRate: number
  uptime: number
  lastBackup?: Date
}

export class DatabaseMonitor {
  private metricsInterval?: NodeJS.Timeout
  private alertThresholds = {
    maxConnections: 80,
    maxSlowQueries: 10,
    minCacheHitRate: 0.8,
    maxResponseTime: 1000
  }

  // Start monitoring
  startMonitoring(intervalMs: number = 30000): void {
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics()
    }, intervalMs)
    
    console.log('Database monitoring started')
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = undefined
    }
    console.log('Database monitoring stopped')
  }

  // Collect database metrics
  async collectMetrics(): Promise<DatabaseMetrics> {
    try {
      const [dbMetrics, redisMetrics] = await Promise.all([
        this.getPostgreSQLMetrics(),
        this.getRedisMetrics()
      ])

      const metrics: DatabaseMetrics = {
        connections: dbMetrics.connections,
        activeQueries: dbMetrics.activeQueries,
        slowQueries: dbMetrics.slowQueries,
        cacheHitRate: redisMetrics.hitRate,
        uptime: dbMetrics.uptime
      }

      // Check for alerts
      await this.checkAlerts(metrics)

      return metrics
    } catch (error) {
      console.error('Failed to collect database metrics:', error)
      throw error
    }
  }

  // Get PostgreSQL metrics
  private async getPostgreSQLMetrics() {
    const connectionQuery = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
    `
    
    const slowQueryQuery = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_stat_activity 
      WHERE state = 'active' AND query_start < now() - interval '5 seconds'
    `

    const uptimeQuery = await prisma.$queryRaw<Array<{ uptime: number }>>`
      SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime
    `

    return {
      connections: Number(connectionQuery[0]?.count || 0),
      activeQueries: Number(connectionQuery[0]?.count || 0),
      slowQueries: Number(slowQueryQuery[0]?.count || 0),
      uptime: uptimeQuery[0]?.uptime || 0
    }
  }

  // Get Redis metrics
  private async getRedisMetrics() {
    try {
      const info = await redis.info('stats')
      const lines = info.split('\r\n')
      
      let keyspaceHits = 0
      let keyspaceMisses = 0
      
      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          keyspaceHits = parseInt(line.split(':')[1])
        }
        if (line.startsWith('keyspace_misses:')) {
          keyspaceMisses = parseInt(line.split(':')[1])
        }
      }

      const totalRequests = keyspaceHits + keyspaceMisses
      const hitRate = totalRequests > 0 ? keyspaceHits / totalRequests : 0

      return { hitRate }
    } catch (error) {
      console.error('Failed to get Redis metrics:', error)
      return { hitRate: 0 }
    }
  }

  // Check for alert conditions
  private async checkAlerts(metrics: DatabaseMetrics): Promise<void> {
    const alerts: string[] = []

    if (metrics.connections > this.alertThresholds.maxConnections) {
      alerts.push(`High connection count: ${metrics.connections}`)
    }

    if (metrics.slowQueries > this.alertThresholds.maxSlowQueries) {
      alerts.push(`High slow query count: ${metrics.slowQueries}`)
    }

    if (metrics.cacheHitRate < this.alertThresholds.minCacheHitRate) {
      alerts.push(`Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`)
    }

    if (alerts.length > 0) {
      console.warn('Database alerts:', alerts)
      // Here you would integrate with your alerting system
      await this.sendAlerts(alerts)
    }
  }

  // Send alerts (integrate with your alerting system)
  private async sendAlerts(alerts: string[]): Promise<void> {
    // This would integrate with Slack, email, PagerDuty, etc.
    console.log('ALERT: Database issues detected:', alerts)
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const [dbHealth, redisHealth] = await Promise.all([
        this.checkDatabaseHealth(),
        checkRedisHealth()
      ])

      const status = dbHealth && redisHealth ? 'healthy' : 'unhealthy'
      
      return {
        status,
        details: {
          database: dbHealth ? 'connected' : 'disconnected',
          redis: redisHealth ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // Check database connectivity
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }

  // Performance optimization suggestions
  async getOptimizationSuggestions(): Promise<string[]> {
    const suggestions: string[] = []
    const metrics = await this.collectMetrics()

    if (metrics.cacheHitRate < 0.9) {
      suggestions.push('Consider increasing Redis memory or optimizing cache keys')
    }

    if (metrics.slowQueries > 5) {
      suggestions.push('Review and optimize slow database queries')
    }

    if (metrics.connections > 50) {
      suggestions.push('Consider implementing connection pooling')
    }

    return suggestions
  }
}