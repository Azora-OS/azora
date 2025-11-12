const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

async function connectDatabase() {
  const client = getPrismaClient();
  try {
    await client.$connect();
    console.log('✅ Database connected');
    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

module.exports = {
  getPrismaClient,
  connectDatabase,
  disconnectDatabase
};
