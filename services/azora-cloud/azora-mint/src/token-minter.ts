import * as crypto from 'crypto';
import { EconomicPolicyEngine } from './economic-policy';

interface Wallet {
  userId: string;
  address: string;
  balance: number;
  staked: number;
  earned: number;
  created: number;
}

interface Transaction {
  id: string;
  type: 'mint' | 'transfer';
  to?: string;
  from?: string;
  amount: number;
  reason?: string;
  timestamp: number;
}

export class TokenMinter {
  policy: EconomicPolicyEngine;
  wallets: Map<string, Wallet>;
  transactions: Transaction[];
  blocks: any[]; // Define a proper type for blocks later

  constructor(economicPolicy: EconomicPolicyEngine) {
    this.policy = economicPolicy;
    this.wallets = new Map();
    this.transactions = [];
    this.blocks = [];
  }

  createWallet(userId: string): Wallet {
    const address = crypto.randomBytes(20).toString('hex');
    const wallet: Wallet = {
      userId,
      address,
      balance: 0,
      staked: 0,
      earned: 0,
      created: Date.now()
    };
    this.wallets.set(address, wallet);
    return wallet;
  }

  getWallet(address: string): Wallet | undefined {
    return this.wallets.get(address);
  }

  mintReward(address: string, amount: number, reason: string): { success: boolean; message?: string; balance?: number; minted?: number } {
    const result = this.policy.mintTokens(amount, reason);
    if (!result.success) {return result;}

    const wallet = this.wallets.get(address);
    if (!wallet) {return { success: false, message: 'Wallet not found' };}

    wallet.balance += amount;
    wallet.earned += amount;

    this.transactions.push({
      id: crypto.randomBytes(16).toString('hex'),
      type: 'mint',
      to: address,
      amount,
      reason,
      timestamp: Date.now()
    });

    return { success: true, balance: wallet.balance, minted: amount };
  }

  transfer(fromAddress: string, toAddress: string, amount: number): { success: boolean; message?: string; from?: number; to?: number } {
    const from = this.wallets.get(fromAddress);
    const to = this.wallets.get(toAddress);

    if (!from || !to) {return { success: false, message: 'Wallet not found' };}

    const validation = this.policy.validateTransaction(amount, from.balance);
    if (!validation.valid) {return { success: false, message: validation.message };}

    from.balance -= amount;
    to.balance += amount;

    this.transactions.push({
      id: crypto.randomBytes(16).toString('hex'),
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
      timestamp: Date.now()
    });

    return { success: true, from: from.balance, to: to.balance };
  }

  stake(address: string, amount: number): { success: boolean; message?: string; staked?: number; balance?: number } {
    const wallet = this.wallets.get(address);
    if (!wallet) {return { success: false, message: 'Wallet not found' };}

    const validation = this.policy.validateTransaction(amount, wallet.balance);
    if (!validation.valid) {return { success: false, message: validation.message };}

    wallet.balance -= amount;
    wallet.staked += amount;

    return { success: true, staked: wallet.staked, balance: wallet.balance };
  }

  unstake(address: string, amount: number): { success: boolean; message?: string; staked?: number; balance?: number } {
    const wallet = this.wallets.get(address);
    if (!wallet || amount > wallet.staked) {
      return { success: false, message: 'Invalid unstake' };
    }

    wallet.staked -= amount;
    wallet.balance += amount;

    return { success: true, staked: wallet.staked, balance: wallet.balance };
  }

  getBalance(address: string): { balance: number; staked: number; earned: number } | null {
    const wallet = this.wallets.get(address);
    return wallet ? { balance: wallet.balance, staked: wallet.staked, earned: wallet.earned } : null;
  }
}
