import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Azora Forge database...');

  const job1 = await prisma.job.create({
    data: {
      title: 'Build React Dashboard',
      description: 'Need a modern dashboard with charts',
      employerId: 'user_employer_001',
      budget: 500,
      skills: ['React', 'TypeScript', 'Tailwind'],
      category: 'Web Development',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job1.id,
      freelancerId: 'user_naledi_002',
      proposal: 'I can build this in 2 weeks',
      bidAmount: 450,
    },
  });

  const contract = await prisma.contract.create({
    data: {
      jobId: job1.id,
      freelancerId: 'user_naledi_002',
      employerId: 'user_employer_001',
      amount: 450,
    },
  });

  await prisma.milestone.create({
    data: {
      contractId: contract.id,
      description: 'Complete UI design',
      amount: 150,
    },
  });

  await prisma.skillProfile.create({
    data: {
      userId: 'user_naledi_002',
      skills: ['React', 'TypeScript', 'Node.js'],
      rating: 4.8,
      jobsCompleted: 12,
      totalEarned: 5400,
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
