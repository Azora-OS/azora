import { faker } from '@faker-js/faker';
import { Wallet, Transaction, Payment, TransactionType, PaymentStatus } from '@prisma/client';
import { BaseFactory } from './base.factory';

export interface CreateWalletOptions {
  userId: string;
  balance?: number;
  currency?: string;
}

export interface CreateTransactionOptions {
  walletId: string;
  amount: number;
  type?: TransactionType;
  description?: string;
  metadata?: any;
}

export interface CreatePaymentOptions {
  userId: string;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  stripePaymentIntentId?: string;
  metadata?: any;
}

/**
 * Factory for creating test wallets
 */
export class WalletFactory extends BaseFactory<Wallet> {
  /**
   * Create a test wallet
   */
  async create(overrides: CreateWalletOptions): Promise<Wallet> {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId: overrides.userId,
        balance: overrides.balance ?? 0,
        currency: overrides.currency || 'USD',
      },
    });

    this.trackRecord('wallet', wallet.id);
    return wallet;
  }

  /**
   * Create wallet with balance
   */
  async createWithBalance(userId: string, balance: number): Promise<Wallet> {
    return this.create({
      userId,
      balance,
    });
  }

  /**
   * Create empty wallet
   */
  async createEmpty(userId: string): Promise<Wallet> {
    return this.create({
      userId,
      balance: 0,
    });
  }
}

/**
 * Factory for creating test transactions
 */
export class TransactionFactory extends BaseFactory<Transaction> {
  /**
   * Create a test transaction
   */
  async create(overrides: CreateTransactionOptions): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: overrides.walletId,
        amount: overrides.amount,
        type: overrides.type || TransactionType.CREDIT,
        description: overrides.description || faker.lorem.sentence(),
        metadata: overrides.metadata || {},
        createdAt: new Date(),
      },
    });

    this.trackRecord('transaction', transaction.id);
    return transaction;
  }

  /**
   * Create credit transaction
   */
  async createCredit(walletId: string, amount: number): Promise<Transaction> {
    return this.create({
      walletId,
      amount,
      type: TransactionType.CREDIT,
      description: 'Test credit transaction',
    });
  }

  /**
   * Create debit transaction
   */
  async createDebit(walletId: string, amount: number): Promise<Transaction> {
    return this.create({
      walletId,
      amount,
      type: TransactionType.DEBIT,
      description: 'Test debit transaction',
    });
  }

  /**
   * Create refund transaction
   */
  async createRefund(walletId: string, amount: number): Promise<Transaction> {
    return this.create({
      walletId,
      amount,
      type: TransactionType.REFUND,
      description: 'Test refund transaction',
    });
  }
}

/**
 * Factory for creating test payments
 */
export class PaymentFactory extends BaseFactory<Payment> {
  /**
   * Create a test payment
   */
  async create(overrides: CreatePaymentOptions): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        userId: overrides.userId,
        amount: overrides.amount,
        currency: overrides.currency || 'USD',
        status: overrides.status || PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: overrides.stripePaymentIntentId || `pi_test_${faker.string.alphanumeric(24)}`,
        metadata: overrides.metadata || {},
        createdAt: new Date(),
      },
    });

    this.trackRecord('payment', payment.id);
    return payment;
  }

  /**
   * Create successful payment
   */
  async createSuccessful(userId: string, amount: number): Promise<Payment> {
    return this.create({
      userId,
      amount,
      status: PaymentStatus.SUCCEEDED,
    });
  }

  /**
   * Create pending payment
   */
  async createPending(userId: string, amount: number): Promise<Payment> {
    return this.create({
      userId,
      amount,
      status: PaymentStatus.PENDING,
    });
  }

  /**
   * Create failed payment
   */
  async createFailed(userId: string, amount: number): Promise<Payment> {
    return this.create({
      userId,
      amount,
      status: PaymentStatus.FAILED,
    });
  }

  /**
   * Create refunded payment
   */
  async createRefunded(userId: string, amount: number): Promise<Payment> {
    return this.create({
      userId,
      amount,
      status: PaymentStatus.REFUNDED,
    });
  }
}

// Export singleton instances
export const walletFactory = new WalletFactory();
export const transactionFactory = new TransactionFactory();
export const paymentFactory = new PaymentFactory();
