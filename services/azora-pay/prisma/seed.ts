import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Azora Pay database...');

  // Create default staking pools
  const pools = [
    {
      id: 'ubuntu-growth',
      name: 'Ubuntu Growth Pool',
      description: 'Support community development projects',
      apr: 8.5,
      totalStaked: 0,
      participants: 0,
      minAmount: 100,
      maxAmount: 10000,
      duration: [30, 90, 365],
      status: 'active'
    },
    {
      id: 'education-fund',
      name: 'Education Fund Pool',
      description: 'Fund educational initiatives and scholarships',
      apr: 12.0,
      totalStaked: 0,
      participants: 0,
      minAmount: 50,
      maxAmount: 5000,
      duration: [30, 90, 180],
      status: 'active'
    },
    {
      id: 'innovation-lab',
      name: 'Innovation Lab Pool',
      description: 'Support technological innovation and research',
      apr: 15.5,
      totalStaked: 0,
      participants: 0,
      minAmount: 200,
      maxAmount: 20000,
      duration: [90, 180, 365],
      status: 'active'
    }
  ];

  for (const pool of pools) {
    await prisma.stakingPool.upsert({
      where: { id: pool.id },
      update: {},
      create: pool,
    });
  }
  console.log(`✅ Created ${pools.length} staking pools`);

  // Create sample wallet
  const wallet = await prisma.wallet.upsert({
    where: { userId: 'demo-user-001' },
    update: {},
    create: {
      userId: 'demo-user-001',
      balance: 1000,
      available: 1000,
      currency: 'AZR',
      status: 'active'
    }
  });
  console.log(`✅ Created sample wallet for ${wallet.userId}`);

  // Create sample transaction
  await prisma.transaction.create({
    data: {
      fromUserId: 'system',
      toUserId: 'demo-user-001',
      amount: 1000,
      currency: 'AZR',
      type: 'wallet_funding',
      status: 'completed',
      description: 'Initial wallet funding',
      source: 'system'
    }
  });
  console.log('✅ Created sample transaction');

  // Create constitutional audit
  await prisma.constitutionalAudit.create({
    data: {
      auditType: 'NO_MOCK_PROTOCOL',
      complianceScore: 100,
      violations: [],
      recommendations: ['Maintain database persistence for all financial records'],
    },
  });
  console.log('✅ Created constitutional audit record');

  console.log('');
  console.log('🎉 Azora Pay database seeded successfully!');
  console.log('"Ngiyakwazi ngoba sikwazi" - "I can because we can"');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
