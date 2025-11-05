/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

export interface EscrowAccount {
  id: string;
  projectId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded' | 'cancelled';
  milestones?: EscrowMilestone[];
  createdAt: Date;
  fundedAt?: Date;
  releasedAt?: Date;
  autoReleaseDate?: Date;
  transactionHash?: string;
  notes?: string;
}

export interface EscrowMilestone {
  id: string;
  escrowId: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'completed' | 'approved' | 'released';
  dueDate?: Date;
  completedAt?: Date;
  approvedAt?: Date;
  releasedAt?: Date;
}

export interface EscrowRelease {
  type: 'full' | 'partial' | 'milestone';
  amount: number;
  milestoneId?: string;
  reason?: string;
  approvedBy: 'buyer' | 'auto' | 'admin' | 'dispute_resolution';
}

/**
 * 🔒 ESCROW SERVICE - The Trust Engine of Azora Forge
 * 
 * Holds funds safely until work is completed and approved.
 * Protects both buyers (money held safely) and sellers (guaranteed payment).
 */
export class EscrowService extends EventEmitter {
  
  /**
   * Create an escrow account for a project
   * Money is not held yet - this just creates the account
   */
  static async createEscrowAccount(data: {
    projectId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    currency?: string;
    autoReleaseDays?: number;
    milestones?: Omit<EscrowMilestone, 'id' | 'escrowId' | 'status'>[];
  }): Promise<EscrowAccount> {
    const {
      projectId,
      sellerId,
      buyerId,
      amount,
      currency = 'AZR',
      autoReleaseDays = 7,
      milestones
    } = data;

    // Validate amount
    if (amount <= 0) {
      throw new Error('Escrow amount must be greater than 0');
    }

    // If milestones provided, validate they add up to 100%
    if (milestones && milestones.length > 0) {
      const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Milestone percentages must add up to 100%');
      }
    }

    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + autoReleaseDays);

    const escrow: EscrowAccount = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      sellerId,
      buyerId,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date(),
      autoReleaseDate,
      milestones: milestones?.map(m => ({
        ...m,
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        escrowId: '', // Will be set below
        status: 'pending' as const
      }))
    };

    // Set escrowId for milestones
    if (escrow.milestones) {
      escrow.milestones.forEach(m => m.escrowId = escrow.id);
    }

    // TODO: Save to database
    // await prisma.escrowAccount.create({ data: escrow });

    this.emitEvent('escrow:created', escrow);

    return escrow;
  }

  /**
   * Fund the escrow account
   * This is when buyer actually puts money in
   */
  static async fundEscrow(escrowId: string, transactionHash: string): Promise<EscrowAccount> {
    // TODO: Fetch from database
    // const escrow = await prisma.escrowAccount.findUnique({ where: { id: escrowId } });

    // Validate escrow exists and is in pending state
    // if (!escrow || escrow.status !== 'pending') {
    //   throw new Error('Escrow not found or not in pending state');
    // }

    // Call Mint API to verify transaction and hold funds
    // await MintService.holdFunds({
    //   amount: escrow.amount,
    //   currency: escrow.currency,
    //   fromUserId: escrow.buyerId,
    //   escrowId: escrow.id,
    //   transactionHash
    // });

    // Update escrow status
    // await prisma.escrowAccount.update({
    //   where: { id: escrowId },
    //   data: {
    //     status: 'funded',
    //     fundedAt: new Date(),
    //     transactionHash
    //   }
    // });

    const escrow = {
      id: escrowId,
      status: 'funded' as const,
      fundedAt: new Date(),
      transactionHash
    };

    this.emitEvent('escrow:funded', escrow);

    return escrow as EscrowAccount;
  }

  /**
   * Release funds to seller
   * Can be full release or partial/milestone release
   */
  static async releaseFunds(
    escrowId: string,
    release: EscrowRelease,
    userId: string
  ): Promise<EscrowAccount> {
    // TODO: Fetch from database
    // const escrow = await prisma.escrowAccount.findUnique({
    //   where: { id: escrowId },
    //   include: { milestones: true }
    // });

    // Validate escrow is funded
    // if (!escrow || escrow.status !== 'funded') {
    //   throw new Error('Escrow not found or not funded');
    // }

    // Validate user is authorized (buyer, admin, or auto-release)
    // if (release.approvedBy === 'buyer' && userId !== escrow.buyerId) {
    //   throw new Error('Only buyer can approve release');
    // }

    // Process release based on type
    if (release.type === 'full') {
      // Release all funds
      // await MintService.releaseFunds({
      //   escrowId,
      //   amount: escrow.amount,
      //   toUserId: escrow.sellerId,
      //   reason: release.reason
      // });

      // Update escrow
      // await prisma.escrowAccount.update({
      //   where: { id: escrowId },
      //   data: {
      //     status: 'released',
      //     releasedAt: new Date()
      //   }
      // });

      this.emitEvent('escrow:released:full', { escrowId, amount: release.amount });

    } else if (release.type === 'milestone' && release.milestoneId) {
      // Release milestone funds
      // const milestone = escrow.milestones.find(m => m.id === release.milestoneId);
      // if (!milestone) throw new Error('Milestone not found');

      // await MintService.releaseFunds({
      //   escrowId,
      //   amount: milestone.amount,
      //   toUserId: escrow.sellerId,
      //   reason: `Milestone: ${milestone.name}`
      // });

      // await prisma.escrowMilestone.update({
      //   where: { id: milestone.id },
      //   data: {
      //     status: 'released',
      //     releasedAt: new Date()
      //   }
      // });

      this.emitEvent('escrow:released:milestone', { escrowId, milestoneId: release.milestoneId });

    } else if (release.type === 'partial') {
      // Release partial funds
      // await MintService.releaseFunds({
      //   escrowId,
      //   amount: release.amount,
      //   toUserId: escrow.sellerId,
      //   reason: release.reason
      // });

      this.emitEvent('escrow:released:partial', { escrowId, amount: release.amount });
    }

    return { id: escrowId } as EscrowAccount;
  }

  /**
   * Refund funds to buyer
   * Used when project is cancelled or dispute resolved in buyer's favor
   */
  static async refundEscrow(
    escrowId: string,
    reason: string,
    userId: string
  ): Promise<EscrowAccount> {
    // TODO: Fetch from database
    // const escrow = await prisma.escrowAccount.findUnique({ where: { id: escrowId } });

    // Validate escrow is funded or disputed
    // if (!escrow || !['funded', 'disputed'].includes(escrow.status)) {
    //   throw new Error('Escrow not found or cannot be refunded');
    // }

    // Release funds back to buyer via Mint
    // await MintService.releaseFunds({
    //   escrowId,
    //   amount: escrow.amount,
    //   toUserId: escrow.buyerId,
    //   reason: `Refund: ${reason}`
    // });

    // Update escrow
    // await prisma.escrowAccount.update({
    //   where: { id: escrowId },
    //   data: {
    //     status: 'refunded',
    //     notes: reason
    //   }
    // });

    this.emitEvent('escrow:refunded', { escrowId, reason });

    return { id: escrowId, status: 'refunded' } as EscrowAccount;
  }

  /**
   * Dispute an escrow
   * Freezes funds until dispute is resolved
   */
  static async disputeEscrow(
    escrowId: string,
    disputeReason: string,
    userId: string
  ): Promise<void> {
    // TODO: Fetch from database
    // const escrow = await prisma.escrowAccount.findUnique({ where: { id: escrowId } });

    // Validate user is buyer or seller
    // if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
    //   throw new Error('Only buyer or seller can open dispute');
    // }

    // Update escrow status
    // await prisma.escrowAccount.update({
    //   where: { id: escrowId },
    //   data: {
    //     status: 'disputed',
    //     notes: disputeReason
    //   }
    // });

    // Create dispute in dispute system
    // await DisputeService.createDispute({
    //   escrowId,
    //   reason: disputeReason,
    //   initiatedBy: userId
    // });

    this.emitEvent('escrow:disputed', { escrowId, reason: disputeReason, userId });
  }

  /**
   * Auto-release funds after deadline
   * Runs as a cron job - checks for escrows past auto-release date
   */
  static async autoReleaseFunds(): Promise<void> {
    // TODO: Find escrows past auto-release date
    // const escrows = await prisma.escrowAccount.findMany({
    //   where: {
    //     status: 'funded',
    //     autoReleaseDate: { lte: new Date() }
    //   }
    // });

    // for (const escrow of escrows) {
    //   try {
    //     await this.releaseFunds(
    //       escrow.id,
    //       { type: 'full', amount: escrow.amount, approvedBy: 'auto' },
    //       'system'
    //     );
    //     console.log(`✅ Auto-released escrow ${escrow.id}`);
    //   } catch (error) {
    //     console.error(`❌ Failed to auto-release escrow ${escrow.id}:`, error);
    //   }
    // }

    this.emitEvent('escrow:auto_release:complete', {});
  }

  /**
   * Get escrow details
   */
  static async getEscrow(escrowId: string): Promise<EscrowAccount | null> {
    // TODO: Fetch from database
    // return await prisma.escrowAccount.findUnique({
    //   where: { id: escrowId },
    //   include: { milestones: true }
    // });
    return null;
  }

  /**
   * Get all escrows for a user (buyer or seller)
   */
  static async getUserEscrows(userId: string): Promise<EscrowAccount[]> {
    // TODO: Fetch from database
    // return await prisma.escrowAccount.findMany({
    //   where: {
    //     OR: [
    //       { buyerId: userId },
    //       { sellerId: userId }
    //     ]
    //   },
    //   include: { milestones: true },
    //   orderBy: { createdAt: 'desc' }
    // });
    return [];
  }

  /**
   * Get escrow statistics
   */
  static async getEscrowStats(): Promise<{
    total: number;
    totalValue: number;
    byStatus: Record<string, number>;
  }> {
    // TODO: Aggregate from database
    // const stats = await prisma.escrowAccount.aggregate({
    //   _count: true,
    //   _sum: { amount: true }
    // });

    // const byStatus = await prisma.escrowAccount.groupBy({
    //   by: ['status'],
    //   _count: true
    // });

    return {
      total: 0,
      totalValue: 0,
      byStatus: {}
    };
  }

  private static emitEvent(event: string, data: any) {
    console.log(`🔔 Escrow Event: ${event}`, data);
    // Emit to organism event bus
    // OrganismEventBus.emit(event, data);
  }
}
