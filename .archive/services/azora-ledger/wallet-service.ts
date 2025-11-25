/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

WALLET SERVICE - Multi-Currency Wallet Management
*/

import { ethers } from 'ethers';
import { AzoraBlockchain } from './blockchain-core';

export interface Wallet {
  userId: string;
  address: string;
  balances: {
    AZR: number;
    BTC: number;
    ETH: number;
    USD: number;
  };
  privateKey?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'REWARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: Date;
  txHash?: string;
}

export class WalletService {
  private blockchain: AzoraBlockchain;

  constructor(blockchain: AzoraBlockchain) {
    this.blockchain = blockchain;
  }

  async createWallet(userId: string): Promise<Wallet> {
    const wallet = ethers.Wallet.createRandom();
    return {
      userId,
      address: wallet.address,
      balances: { AZR: 0, BTC: 0, ETH: 0, USD: 0 },
      privateKey: wallet.privateKey
    };
  }

  async getBalance(address: string): Promise<Wallet['balances']> {
    const azrBalance = await this.blockchain.getWalletBalance(address);
    return {
      AZR: azrBalance,
      BTC: 0,
      ETH: 0,
      USD: azrBalance * 0.5
    };
  }

  async transfer(from: string, to: string, amount: number, privateKey: string): Promise<Transaction> {
    const txHash = await this.blockchain.rewardAZRTokens(
      { userId: to, amount, reason: 'Transfer', proofOfKnowledge: '' },
      privateKey
    );
    return {
      id: ethers.id(`${from}-${to}-${Date.now()}`),
      from,
      to,
      amount,
      currency: 'AZR',
      type: 'TRANSFER',
      status: 'COMPLETED',
      timestamp: new Date(),
      txHash
    };
  }

  async rewardProofOfKnowledge(userId: string, amount: number, proof: string, privateKey: string): Promise<Transaction> {
    const txHash = await this.blockchain.rewardAZRTokens(
      { userId, amount, reason: 'Proof-of-Knowledge', proofOfKnowledge: proof },
      privateKey
    );
    return {
      id: ethers.id(`reward-${userId}-${Date.now()}`),
      from: 'SYSTEM',
      to: userId,
      amount,
      currency: 'AZR',
      type: 'REWARD',
      status: 'COMPLETED',
      timestamp: new Date(),
      txHash
    };
  }
}
