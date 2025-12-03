/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from 'axios';

const MINT_API_URL = process.env.MINT_API_URL || 'http://localhost:3001';

/**
 * 💰 MINT BRIDGE - Connect Forge to Azora Mint
 * 
 * All payments in Forge go through Mint.
 * This includes:
 * - Escrow funding
 * - Fund releases
 * - Refunds
 * - Platform fees
 * - Learn-to-Earn bonuses
 */
export class MintBridge {
  
  /**
   * Hold funds in escrow
   */
  static async holdFunds(data: {
    amount: number;
    currency: string;
    fromUserId: string;
    escrowId: string;
    transactionHash?: string;
  }): Promise<{ success: boolean; transactionId: string }> {
    try {
      const response = await axios.post(`${MINT_API_URL}/api/escrow/hold`, {
        amount: data.amount,
        currency: data.currency,
        fromUserId: data.fromUserId,
        metadata: {
          service: 'azora-forge',
          escrowId: data.escrowId,
          transactionHash: data.transactionHash
        }
      });

      return {
        success: true,
        transactionId: response.data.transactionId
      };
    } catch (error) {
      console.error('❌ Mint holdFunds failed:', error);
      throw new Error('Failed to hold funds in escrow');
    }
  }

  /**
   * Release funds from escrow to seller
   */
  static async releaseFunds(data: {
    escrowId: string;
    amount: number;
    toUserId: string;
    reason?: string;
  }): Promise<{ success: boolean; transactionId: string }> {
    try {
      const response = await axios.post(`${MINT_API_URL}/api/escrow/release`, {
        escrowId: data.escrowId,
        amount: data.amount,
        toUserId: data.toUserId,
        reason: data.reason,
        metadata: {
          service: 'azora-forge'
        }
      });

      // Calculate and distribute platform fees
      await this.distributePlatformFees({
        amount: data.amount,
        sellerId: data.toUserId,
        projectId: data.escrowId
      });

      return {
        success: true,
        transactionId: response.data.transactionId
      };
    } catch (error) {
      console.error('❌ Mint releaseFunds failed:', error);
      throw new Error('Failed to release funds');
    }
  }

  /**
   * Distribute platform fees
   * Takes commission and distributes to:
   * - Platform (Azora)
   * - Learn-to-Earn bonus pool
   * - Metabolic tax (20%)
   */
  private static async distributePlatformFees(data: {
    amount: number;
    sellerId: string;
    projectId: string;
  }): Promise<void> {
    const PLATFORM_FEE_RATE = 0.15; // 15% commission
    const METABOLIC_TAX_RATE = 0.20; // 20% constitutional tax
    const LEARN_TO_EARN_RATE = 0.05; // 5% to Learn-to-Earn pool

    const platformFee = data.amount * PLATFORM_FEE_RATE;
    const metabolicTax = platformFee * METABOLIC_TAX_RATE;
    const learnToEarnBonus = platformFee * LEARN_TO_EARN_RATE;
    const platformRevenue = platformFee - metabolicTax - learnToEarnBonus;

    try {
      // Distribute fees via Mint
      await axios.post(`${MINT_API_URL}/api/fees/distribute`, {
        sellerId: data.sellerId,
        projectId: data.projectId,
        totalAmount: data.amount,
        fees: {
          platformRevenue,
          metabolicTax,
          learnToEarnBonus
        },
        metadata: {
          service: 'azora-forge'
        }
      });

      console.log(`✅ Distributed fees for project ${data.projectId}`);
    } catch (error) {
      console.error('❌ Fee distribution failed:', error);
      // Don't throw - fees can be retried later
    }
  }

  /**
   * Process refund
   */
  static async processRefund(data: {
    escrowId: string;
    amount: number;
    toUserId: string;
    reason: string;
  }): Promise<{ success: boolean; transactionId: string }> {
    try {
      const response = await axios.post(`${MINT_API_URL}/api/escrow/refund`, {
        escrowId: data.escrowId,
        amount: data.amount,
        toUserId: data.toUserId,
        reason: data.reason,
        metadata: {
          service: 'azora-forge'
        }
      });

      return {
        success: true,
        transactionId: response.data.transactionId
      };
    } catch (error) {
      console.error('❌ Mint processRefund failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get user's balance
   */
  static async getUserBalance(userId: string): Promise<{
    AZR: number;
    USD: number;
    ZAR: number;
  }> {
    try {
      const response = await axios.get(`${MINT_API_URL}/api/wallet/${userId}/balance`);
      return response.data.balance;
    } catch (error) {
      console.error('❌ Failed to get user balance:', error);
      return { AZR: 0, USD: 0, ZAR: 0 };
    }
  }

  /**
   * Award Learn-to-Earn bonus
   * Users earn extra AZR for completing Forge projects
   */
  static async awardLearnToEarnBonus(data: {
    userId: string;
    projectId: string;
    amount: number;
    reason: string;
  }): Promise<void> {
    try {
      await axios.post(`${MINT_API_URL}/api/learn-to-earn/award`, {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        metadata: {
          service: 'azora-forge',
          projectId: data.projectId
        }
      });

      console.log(`✅ Awarded ${data.amount} AZR Learn-to-Earn bonus to ${data.userId}`);
    } catch (error) {
      console.error('❌ Failed to award Learn-to-Earn bonus:', error);
    }
  }

  /**
   * Get transaction history for user
   */
  static async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const response = await axios.get(`${MINT_API_URL}/api/transactions/${userId}`, {
        params: { page, limit, service: 'azora-forge' }
      });
      return response.data.transactions;
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Generate invoice
   */
  static async generateInvoice(data: {
    escrowId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    currency: string;
    items: Array<{ name: string; amount: number }>;
  }): Promise<{ invoiceId: string; invoiceUrl: string }> {
    try {
      const response = await axios.post(`${MINT_API_URL}/api/invoices/generate`, {
        ...data,
        metadata: {
          service: 'azora-forge'
        }
      });

      return {
        invoiceId: response.data.invoiceId,
        invoiceUrl: response.data.invoiceUrl
      };
    } catch (error) {
      console.error('❌ Failed to generate invoice:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  /**
   * Check if user has sufficient balance
   */
  static async hasSufficientBalance(
    userId: string,
    amount: number,
    currency: string
  ): Promise<boolean> {
    try {
      const balance = await this.getUserBalance(userId);
      return balance[currency as keyof typeof balance] >= amount;
    } catch (error) {
      console.error('❌ Failed to check balance:', error);
      return false;
    }
  }

  /**
   * Enable Mint-Mine Engine for user
   * Users earn passive income while working on Forge projects
   */
  static async enableMintMineEngine(userId: string): Promise<void> {
    try {
      await axios.post(`${MINT_API_URL}/api/mint-mine/enable`, {
        userId,
        source: 'azora-forge',
        learningMultiplier: 2.0 // 2x mining rate while working on Forge
      });

      console.log(`✅ Enabled Mint-Mine Engine for ${userId} on Forge`);
    } catch (error) {
      console.error('❌ Failed to enable Mint-Mine Engine:', error);
    }
  }

  /**
   * Organism Health Check - Ensure Mint is operational
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${MINT_API_URL}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('❌ Mint health check failed:', error);
      return false;
    }
  }
}
