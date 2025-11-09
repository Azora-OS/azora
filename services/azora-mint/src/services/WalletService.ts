/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isVerified: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  transactions: any[];
}

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'send' | 'receive' | 'contract_interaction';
}

export class WalletService {
  private provider: ethers.providers.JsonRpcProvider;
  private azrContract: ethers.Contract;

  constructor(
    private rpcUrl: string = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    private azrContractAddress: string = process.env.AZR_CONTRACT_ADDRESS || ''
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Initialize AZR contract if address is provided
    if (azrContractAddress) {
      const azrAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function mintReward(address to, uint256 amount) external",
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ];
      this.azrContract = new ethers.Contract(azrContractAddress, azrAbi, this.provider);
    }
  }

  /**
   * Create a new wallet for a user
   */
  async createWallet(userId: string): Promise<{ address: string; privateKey: string }> {
    try {
      const wallet = ethers.Wallet.createRandom();

      // Store wallet info in database (encrypted)
      await prisma.wallet.create({
        data: {
          userId,
          address: wallet.address,
          encryptedPrivateKey: this.encryptPrivateKey(wallet.privateKey), // In production, use proper encryption
          network: 'ethereum',
          createdAt: new Date()
        }
      });

      return {
        address: wallet.address,
        privateKey: wallet.privateKey // In production, don't return this
      };
    } catch (error) {
      console.error('Create wallet error:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Import an existing wallet
   */
  async importWallet(userId: string, privateKey: string): Promise<{ address: string }> {
    try {
      const wallet = new ethers.Wallet(privateKey);

      // Check if wallet already exists
      const existingWallet = await prisma.wallet.findFirst({
        where: { address: wallet.address }
      });

      if (existingWallet) {
        throw new Error('Wallet already imported');
      }

      // Store wallet info
      await prisma.wallet.create({
        data: {
          userId,
          address: wallet.address,
          encryptedPrivateKey: this.encryptPrivateKey(privateKey),
          network: 'ethereum',
          createdAt: new Date()
        }
      });

      return { address: wallet.address };
    } catch (error) {
      console.error('Import wallet error:', error);
      throw error;
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(userId: string): Promise<WalletInfo | null> {
    try {
      const walletData = await prisma.wallet.findFirst({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!walletData) {
        return null;
      }

      // Get ETH balance
      const ethBalance = await this.provider.getBalance(walletData.address);

      // Get AZR balance if contract is available
      let azrBalance = '0';
      if (this.azrContract) {
        try {
          const balance = await this.azrContract.balanceOf(walletData.address);
          azrBalance = ethers.utils.formatEther(balance);
        } catch (error) {
          console.warn('Failed to get AZR balance:', error);
        }
      }

      // Get recent transactions
      const transactions = await this.getTransactionHistory(walletData.address);

      return {
        address: walletData.address,
        balance: ethers.utils.formatEther(ethBalance),
        network: walletData.network,
        isVerified: walletData.isVerified,
        kycStatus: walletData.kycStatus as any,
        transactions
      };
    } catch (error) {
      console.error('Get wallet info error:', error);
      throw new Error('Failed to get wallet information');
    }
  }

  /**
   * Send ETH transaction
   */
  async sendTransaction(
    userId: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<{ hash: string }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Verify the wallet belongs to the user
      const walletData = await prisma.wallet.findFirst({
        where: { userId, address: wallet.address }
      });

      if (!walletData) {
        throw new Error('Wallet not found or does not belong to user');
      }

      // Create transaction
      const transaction = {
        to,
        value: ethers.utils.parseEther(amount),
        gasLimit: 21000
      };

      const tx = await wallet.sendTransaction(transaction);

      // Record transaction in database
      await prisma.transaction.create({
        data: {
          walletId: walletData.id,
          hash: tx.hash,
          type: 'send',
          to,
          amount,
          network: 'ethereum',
          status: 'pending',
          createdAt: new Date()
        }
      });

      return { hash: tx.hash };
    } catch (error) {
      console.error('Send transaction error:', error);
      throw error;
    }
  }

  /**
   * Send AZR tokens
   */
  async sendAZRTokens(
    userId: string,
    to: string,
    amount: string,
    privateKey: string
  ): Promise<{ hash: string }> {
    try {
      if (!this.azrContract) {
        throw new Error('AZR contract not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Verify the wallet belongs to the user
      const walletData = await prisma.wallet.findFirst({
        where: { userId, address: wallet.address }
      });

      if (!walletData) {
        throw new Error('Wallet not found or does not belong to user');
      }

      // Create contract instance with signer
      const contractWithSigner = this.azrContract.connect(wallet);

      // Send tokens
      const tx = await contractWithSigner.transfer(to, ethers.utils.parseEther(amount));

      // Record transaction in database
      await prisma.transaction.create({
        data: {
          walletId: walletData.id,
          hash: tx.hash,
          type: 'send_azr',
          to,
          amount,
          network: 'ethereum',
          status: 'pending',
          createdAt: new Date()
        }
      });

      return { hash: tx.hash };
    } catch (error) {
      console.error('Send AZR tokens error:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address: string): Promise<TransactionInfo[]> {
    try {
      // Get transactions from database
      const dbTransactions = await prisma.transaction.findMany({
        where: { wallet: { address } },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Get additional transaction details from blockchain
      const transactions: TransactionInfo[] = [];

      for (const tx of dbTransactions) {
        try {
          const receipt = await this.provider.getTransactionReceipt(tx.hash);

          transactions.push({
            hash: tx.hash,
            from: tx.from || '',
            to: tx.to,
            value: tx.amount,
            gasUsed: receipt?.gasUsed?.toString() || '0',
            gasPrice: tx.gasPrice || '0',
            timestamp: tx.createdAt.getTime(),
            status: receipt?.status === 1 ? 'confirmed' : 'failed',
            type: tx.type as any
          });
        } catch (error) {
          // If blockchain query fails, use database data
          transactions.push({
            hash: tx.hash,
            from: tx.from || '',
            to: tx.to,
            value: tx.amount,
            gasUsed: '0',
            gasPrice: tx.gasPrice || '0',
            timestamp: tx.createdAt.getTime(),
            status: tx.status as any,
            type: tx.type as any
          });
        }
      }

      return transactions;
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  /**
   * Verify wallet ownership
   */
  async verifyWalletOwnership(userId: string, address: string, signature: string, message: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Verify wallet ownership error:', error);
      return false;
    }
  }

  /**
   * Get gas price estimate
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Get gas price error:', error);
      throw new Error('Failed to get gas price');
    }
  }

  /**
   * Estimate transaction gas
   */
  async estimateGas(to: string, value: string): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.utils.parseEther(value)
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error('Estimate gas error:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  // Private helper methods
  private encryptPrivateKey(privateKey: string): string {
    // In production, use proper encryption with user-specific keys
    // For demo purposes, this is a simple placeholder
    return Buffer.from(privateKey).toString('base64');
  }

  private decryptPrivateKey(encryptedKey: string): string {
    // In production, use proper decryption
    return Buffer.from(encryptedKey, 'base64').toString();
  }
}