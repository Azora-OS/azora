import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Azora Mint database...');

  // Create test wallets
  const wallet1 = await prisma.wallet.create({
    data: {
      userId: 'user_themba_001',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: 1000,
      earned: 500,
    },
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      userId: 'user_naledi_002',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: 750,
      earned: 300,
    },
  });

  // Create transactions
  await prisma.transaction.create({
    data: {
      type: 'mint',
      toId: wallet1.id,
      amount: 500,
      reason: 'Course completion reward',
    },
  });

  await prisma.transaction.create({
    data: {
      type: 'transfer',
      fromId: wallet1.id,
      toId: wallet2.id,
      amount: 100,
      reason: 'Payment for tutoring',
    },
  });

  // Create stakes
  await prisma.stake.create({
    data: {
      walletId: wallet1.id,
      amount: 500,
      rewardRate: 0.05,
    },
  });

  // Create mining records
  await prisma.miningRecord.create({
    data: {
      walletId: wallet1.id,
      activityId: 'course_python_101',
      activityType: 'course_completion',
      tokensEarned: 250,
      difficulty: 3,
    },
  });

  await prisma.miningRecord.create({
    data: {
      walletId: wallet2.id,
      activityId: 'job_web_dev_001',
      activityType: 'job_completion',
      tokensEarned: 300,
      difficulty: 5,
    },
  });

  // Create economic metrics
  await prisma.economicMetrics.create({
    data: {
      totalSupply: 1000000,
      circulatingSupply: 1750,
      totalStaked: 500,
      totalMinted: 800,
      activeWallets: 2,
      dailyVolume: 100,
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
