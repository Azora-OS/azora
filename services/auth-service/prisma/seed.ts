import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Auth Service database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'themba@azora.world',
      passwordHash,
      firstName: 'Themba',
      lastName: 'Student',
      role: 'student',
      isVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'naledi@azora.world',
      passwordHash,
      firstName: 'Naledi',
      lastName: 'Freelancer',
      role: 'student',
      isVerified: true,
    },
  });

  await prisma.userProfile.createMany({
    data: [
      {
        userId: user1.id,
        bio: 'Enthusiastic learner',
        location: 'South Africa',
        timezone: 'Africa/Johannesburg',
      },
      {
        userId: user2.id,
        bio: 'Full-stack developer',
        location: 'Kenya',
        timezone: 'Africa/Nairobi',
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      userId: user1.id,
      action: 'user.login',
      resource: 'auth',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
