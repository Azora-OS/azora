/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Seed demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@azora.com' },
    update: {},
    create: {
      email: 'demo@azora.com',
      password: '$2a$10$demo.hash.here', // bcrypt hash of 'demo123'
      name: 'Demo User',
      role: 'student'
    }
  });

  console.log('✅ Demo user created:', user.email);
  console.log('🎉 Demo data seeded successfully!');
  console.log('');
  console.log('Login with:');
  console.log('Email: demo@azora.com');
  console.log('Password: demo123');
}

seedDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
