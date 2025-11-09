import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prisma connection configuration with pooling
const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty' as const,
}

// Connection pooling configuration
const connectionConfig = {
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  pool: {
    timeout: 20000,
    idleTimeout: 30000,
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
  }
}

// Singleton pattern for Prisma client
export const prisma = globalThis.__prisma || new PrismaClient(prismaConfig)

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

// Migration utilities
export const migrationUtils = {
  async runMigrations() {
    console.log('Running database migrations...')
  },
  
  async rollbackMigration(steps: number = 1) {
    console.log(`Rolling back ${steps} migration(s)...`)
  }
}