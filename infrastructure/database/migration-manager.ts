import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface MigrationRecord {
  id: string
  name: string
  applied_at: Date
  checksum: string
}

export class MigrationManager {
  private servicesPath: string

  constructor(servicesPath: string = './services') {
    this.servicesPath = servicesPath
  }

  // Get all services with Prisma schemas
  async getServicesWithPrisma(): Promise<string[]> {
    const services = await fs.readdir(this.servicesPath)
    const prismaServices: string[] = []

    for (const service of services) {
      const prismaPath = path.join(this.servicesPath, service, 'prisma')
      try {
        await fs.access(prismaPath)
        prismaServices.push(service)
      } catch {
        // Service doesn't have Prisma
      }
    }

    return prismaServices
  }

  // Run migrations for all services
  async runAllMigrations(): Promise<void> {
    const services = await this.getServicesWithPrisma()
    
    for (const service of services) {
      console.log(`Running migrations for ${service}...`)
      await this.runServiceMigration(service)
    }
  }

  // Run migration for specific service
  async runServiceMigration(serviceName: string): Promise<void> {
    const servicePath = path.join(this.servicesPath, serviceName)
    
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
        cwd: servicePath,
        env: { ...process.env }
      })
      
      if (stderr) {
        console.error(`Migration error for ${serviceName}:`, stderr)
      } else {
        console.log(`Migration success for ${serviceName}:`, stdout)
      }
    } catch (error) {
      console.error(`Failed to run migration for ${serviceName}:`, error)
      throw error
    }
  }

  // Generate Prisma client for all services
  async generateAllClients(): Promise<void> {
    const services = await this.getServicesWithPrisma()
    
    for (const service of services) {
      console.log(`Generating Prisma client for ${service}...`)
      await this.generateServiceClient(service)
    }
  }

  // Generate Prisma client for specific service
  async generateServiceClient(serviceName: string): Promise<void> {
    const servicePath = path.join(this.servicesPath, serviceName)
    
    try {
      const { stdout, stderr } = await execAsync('npx prisma generate', {
        cwd: servicePath,
        env: { ...process.env }
      })
      
      if (stderr) {
        console.error(`Client generation error for ${serviceName}:`, stderr)
      } else {
        console.log(`Client generation success for ${serviceName}:`, stdout)
      }
    } catch (error) {
      console.error(`Failed to generate client for ${serviceName}:`, error)
      throw error
    }
  }

  // Rollback migration (requires manual implementation)
  async rollbackMigration(serviceName: string, steps: number = 1): Promise<void> {
    console.log(`Rolling back ${steps} migration(s) for ${serviceName}...`)
    // This would require custom implementation based on migration history
    // For now, we'll log the action
    console.warn('Rollback functionality requires manual implementation')
  }

  // Check migration status
  async checkMigrationStatus(): Promise<Record<string, boolean>> {
    const services = await this.getServicesWithPrisma()
    const status: Record<string, boolean> = {}

    for (const service of services) {
      try {
        const servicePath = path.join(this.servicesPath, service)
        await execAsync('npx prisma migrate status', {
          cwd: servicePath,
          env: { ...process.env }
        })
        status[service] = true
      } catch {
        status[service] = false
      }
    }

    return status
  }
}