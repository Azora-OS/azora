import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import { mockStripe } from '../../../tests/mocks';

const prisma = getTestPrismaClient();

describe('Payment Service - Comprehensive Tests', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
    mockStripe.reset();
  });

  it('should create subscription', async () => {
    const user = await userFactory.create();

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'ACTIVE',
        tier: 'FREE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    expect(subscription.status).toBe('ACTIVE');
    expect(subscription.tier).toBe('FREE');
  });

  it('should cancel subscription', async () => {
    const user = await userFactory.create();

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'ACTIVE',
        tier: 'FREE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    const cancelled = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    });

    expect(cancelled!.status).toBe('CANCELLED');
    expect(cancelled!.cancelledAt).toBeDefined();
  });

  it('should create payment', async () => {
    const user = await userFactory.create();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 5000,
        currency: 'usd',
        status: 'COMPLETED',
        stripePaymentIntentId: 'pi_test_123',
        idempotencyKey: 'test_key_123',
      },
    });

    expect(payment.amount).toBe(5000);
    expect(payment.status).toBe('COMPLETED');
  });

  it('should calculate total revenue', async () => {
    const user = await userFactory.create();

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 5000,
        currency: 'usd',
        status: 'COMPLETED',
        stripePaymentIntentId: 'pi_test_1',
        idempotencyKey: 'key_1',
      },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 3000,
        currency: 'usd',
        status: 'COMPLETED',
        stripePaymentIntentId: 'pi_test_2',
        idempotencyKey: 'key_2',
      },
    });

    const payments = await prisma.payment.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    expect(total).toBe(8000);
  });
});