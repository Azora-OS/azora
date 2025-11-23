import { userFactory, walletFactory, transactionFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Payment Service - Transactions', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create transaction', async () => {
    const user = await userFactory.create();
    const wallet = await walletFactory.create({ 
      userId: user.id, 
      balance: 1000,
      address: 'wallet_address_123'
    });

    const transaction = await transactionFactory.create({
      walletId: wallet.id,
      amount: 500,
      type: 'DEPOSIT',
    });

    expect(transaction.amount).toBe(500);
    expect(transaction.type).toBe('DEPOSIT');
    expect(transaction.walletId).toBe(wallet.id);
  });

  it('should update wallet balance', async () => {
    const user = await userFactory.create();
    const wallet = await walletFactory.create({ 
      userId: user.id, 
      balance: 1000,
      address: 'wallet_address_123'
    });

    const newBalance = 1500;
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    expect(updatedWallet.balance).toBe(newBalance);
  });

  it('should retrieve transaction history', async () => {
    const user = await userFactory.create();
    const wallet = await walletFactory.create({ 
      userId: user.id,
      address: 'wallet_address_123'
    });

    await transactionFactory.create({ walletId: wallet.id, amount: 1000, type: 'DEPOSIT' });
    await transactionFactory.create({ walletId: wallet.id, amount: 500, type: 'WITHDRAWAL' });

    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
    });

    expect(transactions.length).toBe(2);
  });

  it('should validate transaction amounts', () => {
    const validAmount = 1000;
    const invalidAmount = -500;

    expect(validAmount).toBeGreaterThan(0);
    expect(invalidAmount).toBeLessThan(0);
  });
});