import { prisma } from '../database/prisma-config'
import { redis } from '../database/redis-config'

export class ServiceConnector {
  private services = new Map<string, { url: string; healthy: boolean }>()

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    const serviceMap = {
      'auth-service': process.env.AUTH_URL || 'http://localhost:3001',
      'mint-service': process.env.MINT_URL || 'http://localhost:3002',
      'lms-service': process.env.LMS_URL || 'http://localhost:3003',
      'forge-service': process.env.FORGE_URL || 'http://localhost:3004',
      'nexus-service': process.env.NEXUS_URL || 'http://localhost:3005',
      'education-service': process.env.EDUCATION_URL || 'http://localhost:3007',
      'payments-service': process.env.PAYMENTS_URL || 'http://localhost:3008'
    }

    for (const [name, url] of Object.entries(serviceMap)) {
      this.services.set(name, { url, healthy: false })
    }
  }

  async checkAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    for (const [name, service] of this.services) {
      try {
        const response = await fetch(`${service.url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
          headers: { 'Content-Type': 'application/json' }
        })

        results[name] = response.ok
        service.healthy = response.ok
      } catch (error) {
        results[name] = false
        service.healthy = false
        console.warn(`Service ${name} health check failed:`, (error as Error).message)
      }
    }

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`
      results['database'] = true
    } catch {
      results['database'] = false
    }

    // Check Redis
    try {
      await redis.ping()
      results['redis'] = true
    } catch {
      results['redis'] = false
    }

    return results
  }

  async validateServiceIntegration(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []
    const connections = await this.checkAllConnections()

    for (const [service, connected] of Object.entries(connections)) {
      if (!connected) {
        issues.push(`${service} is not responding`)
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}
