/**
 * HEALTH AGGREGATOR SERVICE
 * Centralized health monitoring for all Azora services
 */

interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  score: number
  lastCheck: number
  url?: string
}

export class HealthAggregator {
  private services: Map<string, ServiceHealth> = new Map()
  private checkInterval: NodeJS.Timeout | null = null

  async checkService(name: string, url: string): Promise<ServiceHealth> {
    try {
      const response = await fetch(`${url}/health`, { 
        signal: AbortSignal.timeout(5000) 
      })
      const data = await response.json()
      
      return {
        name,
        status: data.status === 'healthy' ? 'healthy' : 'degraded',
        score: data.status === 'healthy' ? 100 : 70,
        lastCheck: Date.now(),
        url
      }
    } catch {
      return {
        name,
        status: 'unhealthy',
        score: 0,
        lastCheck: Date.now(),
        url
      }
    }
  }

  async checkAll(services: Record<string, string>): Promise<Map<string, ServiceHealth>> {
    const checks = Object.entries(services).map(([name, url]) =>
      this.checkService(name, url)
    )
    
    const results = await Promise.all(checks)
    results.forEach(result => this.services.set(result.name, result))
    
    return this.services
  }

  getOverallHealth(): number {
    if (this.services.size === 0) return 100
    
    const total = Array.from(this.services.values())
      .reduce((sum, s) => sum + s.score, 0)
    
    return Math.round(total / this.services.size)
  }

  startMonitoring(services: Record<string, string>, intervalMs = 30000) {
    this.checkInterval = setInterval(() => {
      this.checkAll(services)
    }, intervalMs)
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}

export const healthAggregator = new HealthAggregator()
