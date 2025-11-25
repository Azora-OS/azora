const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database for Azora Assessment Service...');
  
  // This script doesn't need to create any specific data since we're using
  // the main database schema. It's here as a placeholder for future use.
  
  console.log('Database initialization complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });