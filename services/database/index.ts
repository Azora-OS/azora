// 🌟 Azora Database Layer - Ubuntu Data Infrastructure
export { prisma, default as prismaClient } from './prisma-client';
export { cache, connectRedis, default as redisClient } from './redis-client';
export { connectMongoDB, getCollection, default as mongoClient } from './mongodb-client';
export { syncManager, SyncManager } from './sync-manager';

// Initialize all connections
export async function initializeDatabase() {
  try {
    await connectRedis();
    await connectMongoDB();
    console.log('🌟 Azora Database Layer initialized - Ubuntu data infrastructure active');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
