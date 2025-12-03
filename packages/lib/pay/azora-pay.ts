/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 💰 AZORA PAY
 * 
 * Financial freedom for the 4 billion unbanked
 * 
 * "For the worker deserves his wages." - 1 Timothy 5:18
 */

import { validateAgainstConstitution } from '@/lib/scripture/bible-integration';

// Payment method types
export type PaymentMethod = 
  | 'crypto'           // Bitcoin, Ethereum, Stablecoins
  | 'mobile-money'     // M-Pesa, bKash, GCash, etc.
  | 'bank-transfer'    // Traditional banking
  | 'cash'             // Physical cash (for on-ramps)
  | 'learning-credits'; // Earn by learning in Sapiens

// Cryptocurrency types
export type CryptoType = 
  | 'BTC'   // Bitcoin
  | 'ETH'   // Ethereum
  | 'USDC'  // USD Coin (stablecoin)
  | 'USDT'  // Tether (stablecoin)
  | 'DAI'   // Dai (stablecoin)
  | 'AZORA'; // Azora Token (future)

// Mobile money providers
export type MobileMoneyProvider =
  | 'M-Pesa'     // Kenya, Tanzania, etc.
  | 'bKash'      // Bangladesh
  | 'GCash'      // Philippines
  | 'Paytm'      // India
  | 'WeChat Pay' // China
  | 'Alipay'     // China
  | 'MTN Mobile Money' // Africa
  | 'Orange Money';    // Africa

// Wallet interface
export interface Wallet {
  id: string;
  userId: string;
  type: PaymentMethod;
  address?: string;           // For crypto
  phoneNumber?: string;       // For mobile money
  accountNumber?: string;     // For bank
  balance: {
    amount: number;
    currency: string;
  };
  isVerified: boolean;
  createdAt: number;
  lastTransaction?: number;
}

// Transaction interface
export interface Transaction {
  id: string;
  from: string;               // Wallet ID or address
  to: string;                 // Wallet ID or address
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  fee: number;
  description?: string;
  metadata?: Record<string, any>;
}

// Payment request
export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  from: string;
  to: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Exchange rate
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

/**
 * Azora Pay - Financial System
 */
export class AzoraPay {
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map();

  constructor() {
    console.log('[Azora Pay] Initializing financial system...');
    this.initializeExchangeRates();
  }

  /**
   * Create wallet
   */
  async createWallet(
    userId: string,
    type: PaymentMethod,
    options: {
      address?: string;
      phoneNumber?: string;
      accountNumber?: string;
      currency?: string;
    } = {}
  ): Promise<Wallet> {
    console.log(`[Azora Pay] Creating ${type} wallet for user ${userId}`);

    // Validate against Constitution
    const validation = validateAgainstConstitution({
      type: 'financial-action',
      description: `Create wallet for user ${userId}`,
      target: 'wallet',
    });

    if (!validation.valid) {
      throw new Error(`Constitutional violation: ${validation.explanation}`);
    }

    // Generate wallet ID
    const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create wallet
    const wallet: Wallet = {
      id: walletId,
      userId,
      type,
      address: options.address || (type === 'crypto' ? this.generateCryptoAddress() : undefined),
      phoneNumber: options.phoneNumber,
      accountNumber: options.accountNumber,
      balance: {
        amount: 0,
        currency: options.currency || 'USD',
      },
      isVerified: false,
      createdAt: Date.now(),
    };

    this.wallets.set(walletId, wallet);
    console.log('[Azora Pay] ✅ Wallet created:', walletId);

    return wallet;
  }

  /**
   * Send payment
   */
  async sendPayment(request: PaymentRequest): Promise<Transaction> {
    console.log('[Azora Pay] Processing payment:', request);

    // Validate against Constitution
    const validation = validateAgainstConstitution({
      type: 'financial-transaction',
      description: `Send ${request.amount} ${request.currency} from ${request.from} to ${request.to}`,
      target: 'transaction',
    });

    if (!validation.valid) {
      throw new Error(`Constitutional violation: ${validation.explanation}`);
    }

    // Validate request
    if (request.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Get wallets
    const fromWallet = this.wallets.get(request.from);
    const toWallet = this.wallets.get(request.to);

    if (!fromWallet) {
      throw new Error('From wallet not found');
    }

    // Check balance
    if (fromWallet.balance.amount < request.amount) {
      throw new Error('Insufficient balance');
    }

    // Calculate fee (0.1% for now, NO MINIMUM - serve the poor!)
    const fee = request.amount * 0.001;

    // Create transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      from: request.from,
      to: request.to,
      amount: request.amount,
      currency: request.currency,
      method: request.method,
      status: 'pending',
      timestamp: Date.now(),
      fee,
      description: request.description,
      metadata: request.metadata,
    };

    this.transactions.set(transaction.id, transaction);

    try {
      // Process based on method
      switch (request.method) {
        case 'crypto':
          await this.processCryptoPayment(transaction);
          break;
        case 'mobile-money':
          await this.processMobileMoneyPayment(transaction);
          break;
        case 'bank-transfer':
          await this.processBankTransfer(transaction);
          break;
        case 'learning-credits':
          await this.processLearningCredits(transaction);
          break;
        default:
          throw new Error(`Unsupported payment method: ${request.method}`);
      }

      // Update balances
      fromWallet.balance.amount -= (request.amount + fee);
      fromWallet.lastTransaction = Date.now();

      if (toWallet) {
        toWallet.balance.amount += request.amount;
        toWallet.lastTransaction = Date.now();
      }

      // Mark as completed
      transaction.status = 'completed';
      console.log('[Azora Pay] ✅ Payment completed:', transaction.id);

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      console.error('[Azora Pay] ❌ Payment failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<{ amount: number; currency: string }> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    return wallet.balance;
  }

  /**
   * Get transaction history
   */
  async getTransactions(walletId: string, limit: number = 100): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(txn => txn.from === walletId || txn.to === walletId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return transactions;
  }

  /**
   * Exchange currency
   */
  async exchange(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = this.exchangeRates.get(rateKey);

    if (!rate) {
      throw new Error(`Exchange rate not available for ${rateKey}`);
    }

    return amount * rate.rate;
  }

  /**
   * Process crypto payment
   */
  private async processCryptoPayment(transaction: Transaction): Promise<void> {
    console.log('[Azora Pay] Processing crypto payment...');

    // In production, integrate with:
    // - Bitcoin: bitcoinjs-lib
    // - Ethereum: web3.js or ethers.js
    // - Stablecoins: ERC-20 contracts

    // Simulate blockchain confirmation
    await this.simulateDelay(2000);

    console.log('[Azora Pay] ✅ Crypto payment confirmed on blockchain');
  }

  /**
   * Process mobile money payment
   */
  private async processMobileMoneyPayment(transaction: Transaction): Promise<void> {
    console.log('[Azora Pay] Processing mobile money payment...');

    // In production, integrate with:
    // - M-Pesa: Safaricom API
    // - bKash: bKash API
    // - GCash: GCash API

    // Simulate mobile money transfer
    await this.simulateDelay(1000);

    console.log('[Azora Pay] ✅ Mobile money transfer completed');
  }

  /**
   * Process bank transfer
   */
  private async processBankTransfer(transaction: Transaction): Promise<void> {
    console.log('[Azora Pay] Processing bank transfer...');

    // In production, integrate with:
    // - SWIFT for international
    // - ACH for US
    // - SEPA for EU
    // - Local bank APIs

    // Simulate bank transfer
    await this.simulateDelay(3000);

    console.log('[Azora Pay] ✅ Bank transfer completed');
  }

  /**
   * Process learning credits
   */
  private async processLearningCredits(transaction: Transaction): Promise<void> {
    console.log('[Azora Pay] Processing learning credits...');

    // Learning credits are earned by:
    // - Completing courses
    // - Passing quizzes
    // - Peer teaching
    // - Community contributions

    // Instant transfer (no external dependencies)
    await this.simulateDelay(100);

    console.log('[Azora Pay] ✅ Learning credits transferred');
  }

  /**
   * Generate crypto address
   */
  private generateCryptoAddress(): string {
    // In production, use proper crypto libraries
    // For now, simulate
    return '0x' + Math.random().toString(16).substring(2, 42);
  }

  /**
   * Initialize exchange rates
   */
  private initializeExchangeRates(): void {
    // In production, fetch from APIs like:
    // - CoinGecko
    // - CoinMarketCap
    // - Binance
    // - Fiat rates from forex APIs

    const rates = [
      { from: 'BTC', to: 'USD', rate: 45000 },
      { from: 'ETH', to: 'USD', rate: 2500 },
      { from: 'USDC', to: 'USD', rate: 1.0 },
      { from: 'USDT', to: 'USD', rate: 1.0 },
      { from: 'USD', to: 'KES', rate: 155 },  // Kenyan Shilling
      { from: 'USD', to: 'BDT', rate: 110 },  // Bangladeshi Taka
      { from: 'USD', to: 'PHP', rate: 56 },   // Philippine Peso
      { from: 'USD', to: 'INR', rate: 83 },   // Indian Rupee
    ];

    rates.forEach(rate => {
      const key = `${rate.from}-${rate.to}`;
      this.exchangeRates.set(key, {
        ...rate,
        timestamp: Date.now(),
      });

      // Add reverse rate
      const reverseKey = `${rate.to}-${rate.from}`;
      this.exchangeRates.set(reverseKey, {
        from: rate.to,
        to: rate.from,
        rate: 1 / rate.rate,
        timestamp: Date.now(),
      });
    });

    console.log(`[Azora Pay] ✅ Loaded ${this.exchangeRates.size} exchange rates`);
  }

  /**
   * Simulate delay (for async operations)
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.userId === userId);
  }

  /**
   * Verify wallet (KYC)
   */
  async verifyWallet(walletId: string): Promise<void> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // In production, implement proper KYC
    // For now, auto-verify
    wallet.isVerified = true;
    console.log('[Azora Pay] ✅ Wallet verified:', walletId);
  }
}

// Singleton instance
let azoraPayInstance: AzoraPay | null = null;

export function getAzoraPay(): AzoraPay {
  if (!azoraPayInstance) {
    azoraPayInstance = new AzoraPay();
  }
  return azoraPayInstance;
}

export default {
  AzoraPay,
  getAzoraPay,
};

