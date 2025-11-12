const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@azora.world' },
    update: {},
    create: { email: 'admin@azora.world', password: hash, name: 'Admin', role: 'ADMIN' }
  });
  console.log('✅', admin.email);
}

main().finally(() => prisma.$disconnect());
