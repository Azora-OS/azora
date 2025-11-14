import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Azora Pay database...');

  await prisma.payment.createMany({
    data: [
      {
        userId: 'user_themba_001',
        amount: 100,
        currency: 'AZR',
        type: 'deposit',
        status: 'completed',
        method: 'crypto',
      },
      {
        userId: 'user_naledi_002',
        amount: 450,
        currency: 'AZR',
        type: 'payment',
        status: 'completed',
        method: 'crypto',
      },
    ],
  });

  await prisma.escrow.create({
    data: {
      contractId: 'contract_001',
      amount: 450,
      status: 'locked',
    },
  });

  await prisma.paymentMethod.create({
    data: {
      userId: 'user_themba_001',
      type: 'crypto_wallet',
      details: { address: '0x1234...5678' },
      isDefault: true,
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
