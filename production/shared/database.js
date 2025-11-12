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
    // Database connected successfully
    return client;
  } catch (error) {
    // Database connection failed
    throw error;
  }
}

async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    // Database disconnected
  }
}

module.exports = {
  getPrismaClient,
  connectDatabase,
  disconnectDatabase
};
