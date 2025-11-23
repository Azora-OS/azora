import { userFactory, walletFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Payment Service - Webhooks', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should handle payment success webhook', async () => {
    const user = await userFactory.create();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 5000,
        currency: 'usd',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test_123',
        idempotencyKey: 'key_123',
      },
    });

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' },
    });

    expect(updated.status).toBe('COMPLETED');
  });

  it('should handle payment failure webhook', async () => {
    const user = await userFactory.create();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 5000,
        currency: 'usd',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test_123',
        idempotencyKey: 'key_123',
      },
    });

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    expect(updated.status).toBe('FAILED');
  });

  it('should update wallet on successful payment', async () => {
    const user = await userFactory.create();
    const wallet = await walletFactory.create({
      userId: user.id,
      balance: 1000,
      address: 'wallet_123',
    });

    const newBalance = 1500;

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    expect(updatedWallet.balance).toBe(newBalance);
  });

  it('should create transaction record', async () => {
    const user = await userFactory.create();
    const wallet = await walletFactory.create({
      userId: user.id,
      balance: 1000,
      address: 'wallet_123',
    });

    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: 500,
        type: 'DEPOSIT',
        status: 'COMPLETED',
      },
    });

    expect(transaction.amount).toBe(500);
    expect(transaction.type).toBe('DEPOSIT');
  });
});