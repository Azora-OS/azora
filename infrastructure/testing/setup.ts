import { prisma } from '../database/prisma-config'
import { redis } from '../database/redis-config'

// Global test setup
beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/azora_test'
  process.env.REDIS_URL = 'redis://localhost:6379/15'
})

// Cleanup after each test
afterEach(async () => {
  await redis.flushdb()
  
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `
  
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
    }
  }
})

// Global cleanup
afterAll(async () => {
  await prisma.$disconnect()
  await redis.disconnect()
})