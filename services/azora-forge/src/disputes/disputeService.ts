/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface Dispute {
  id: string;
  escrowId: string;
  projectId: string;
  sellerId: string;
  buyerId: string;
  initiatedBy: 'buyer' | 'seller';
  reason: string;
  evidence: DisputeEvidence[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: DisputeResolution;
  mediatorId?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  type: 'text' | 'image' | 'file' | 'message';
  content: string;
  fileUrl?: string;
  timestamp: Date;
}

export interface DisputeResolution {
  outcome: 'buyer_wins' | 'seller_wins' | 'partial_refund' | 'rework';
  refundAmount?: number;
  refundPercentage?: number;
  explanation: string;
  decidedBy: string;
  decidedAt: Date;
}

/**
 * ⚖️ DISPUTE RESOLUTION SERVICE
 * 
 * Handles conflicts between buyers and sellers.
 * Fair, transparent, and efficient dispute resolution.
 */
export class DisputeService {
  
  /**
   * Create a new dispute
   */
  static async createDispute(data: {
    escrowId: string;
    projectId: string;
    sellerId: string;
    buyerId: string;
    initiatedBy: 'buyer' | 'seller';
    reason: string;
  }): Promise<Dispute> {
    const { escrowId, projectId, sellerId, buyerId, initiatedBy, reason } = data;

    // Validate reason is substantial
    if (reason.length < 20) {
      throw new Error('Dispute reason must be at least 20 characters');
    }

    const dispute: Dispute = {
      id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      escrowId,
      projectId,
      sellerId,
      buyerId,
      initiatedBy,
      reason,
      evidence: [],
      status: 'open',
      createdAt: new Date()
    };

    // TODO: Save to database
    // await prisma.dispute.create({ data: dispute });

    // Notify other party
    await this.notifyDisputeOpened(dispute);

    // Assign mediator if available
    await this.assignMediator(dispute.id);

    this.emitEvent('dispute:created', dispute);

    return dispute;
  }

  /**
   * Add evidence to dispute
   */
  static async addEvidence(
    disputeId: string,
    userId: string,
    evidence: Omit<DisputeEvidence, 'id' | 'disputeId' | 'timestamp'>
  ): Promise<DisputeEvidence> {
    // TODO: Validate user is part of dispute
    // const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    // if (userId !== dispute.buyerId && userId !== dispute.sellerId) {
    //   throw new Error('Only parties involved can submit evidence');
    // }

    const newEvidence: DisputeEvidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      disputeId,
      timestamp: new Date()
    };

    // TODO: Save to database
    // await prisma.disputeEvidence.create({ data: newEvidence });

    this.emitEvent('dispute:evidence_added', { disputeId, evidence: newEvidence });

    return newEvidence;
  }

  /**
   * Assign mediator to dispute
   */
  private static async assignMediator(disputeId: string): Promise<void> {
    // TODO: Find available mediator
    // Could be:
    // 1. Human mediator (Azora staff)
    // 2. AI mediator (for simple cases)
    // 3. Community mediator (trusted users)

    // For now, assign to AI mediator for simple cases
    const mediatorId = 'ai_mediator_001';

    // await prisma.dispute.update({
    //   where: { id: disputeId },
    //   data: {
    //     mediatorId,
    //     status: 'under_review'
    //   }
    // });

    this.emitEvent('dispute:mediator_assigned', { disputeId, mediatorId });
  }

  /**
   * Resolve dispute
   */
  static async resolveDispute(
    disputeId: string,
    resolution: Omit<DisputeResolution, 'decidedAt'>,
    mediatorId: string
  ): Promise<Dispute> {
    // TODO: Validate mediator is assigned to this dispute
    // const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    // if (dispute.mediatorId !== mediatorId) {
    //   throw new Error('Only assigned mediator can resolve dispute');
    // }

    const finalResolution: DisputeResolution = {
      ...resolution,
      decidedAt: new Date()
    };

    // Update dispute
    // await prisma.dispute.update({
    //   where: { id: disputeId },
    //   data: {
    //     status: 'resolved',
    //     resolution: finalResolution,
    //     resolvedAt: new Date()
    //   }
    // });

    // Execute resolution (refund, release, etc.)
    await this.executeResolution(disputeId, finalResolution);

    this.emitEvent('dispute:resolved', { disputeId, resolution: finalResolution });

    return { id: disputeId, resolution: finalResolution } as Dispute;
  }

  /**
   * Execute resolution (process refunds/releases)
   */
  private static async executeResolution(
    disputeId: string,
    resolution: DisputeResolution
  ): Promise<void> {
    // TODO: Get dispute details
    // const dispute = await prisma.dispute.findUnique({
    //   where: { id: disputeId },
    //   include: { escrow: true }
    // });

    switch (resolution.outcome) {
      case 'buyer_wins':
        // Full refund to buyer
        // await EscrowService.refundEscrow(dispute.escrowId, resolution.explanation, 'mediator');
        break;

      case 'seller_wins':
        // Full release to seller
        // await EscrowService.releaseFunds(
        //   dispute.escrowId,
        //   { type: 'full', amount: dispute.escrow.amount, approvedBy: 'dispute_resolution' },
        //   'mediator'
        // );
        break;

      case 'partial_refund':
        // Partial refund
        if (resolution.refundPercentage) {
          // const refundAmount = dispute.escrow.amount * (resolution.refundPercentage / 100);
          // const releaseAmount = dispute.escrow.amount - refundAmount;

          // Release to seller
          // await EscrowService.releaseFunds(...);
          // Refund to buyer
          // await EscrowService.refundEscrow(...);
        }
        break;

      case 'rework':
        // Seller must rework, escrow stays funded
        // Notify seller to rework
        break;
    }
  }

  /**
   * Get dispute details
   */
  static async getDispute(disputeId: string): Promise<Dispute | null> {
    // TODO: Fetch from database
    // return await prisma.dispute.findUnique({
    //   where: { id: disputeId },
    //   include: { evidence: true }
    // });
    return null;
  }

  /**
   * Get user's disputes
   */
  static async getUserDisputes(userId: string): Promise<Dispute[]> {
    // TODO: Fetch from database
    // return await prisma.dispute.findMany({
    //   where: {
    //     OR: [
    //       { buyerId: userId },
    //       { sellerId: userId }
    //     ]
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });
    return [];
  }

  /**
   * Get dispute statistics
   */
  static async getDisputeStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byOutcome: Record<string, number>;
    averageResolutionTime: number;
  }> {
    // TODO: Aggregate from database
    return {
      total: 0,
      byStatus: {},
      byOutcome: {},
      averageResolutionTime: 0
    };
  }

  /**
   * Notify parties that dispute was opened
   */
  private static async notifyDisputeOpened(dispute: Dispute): Promise<void> {
    // TODO: Send notifications via notification service
    console.log(`📧 Notifying parties about dispute ${dispute.id}`);
  }

  /**
   * AI-powered dispute resolution for simple cases
   */
  static async autoResolveSimpleDispute(disputeId: string): Promise<boolean> {
    // TODO: Implement AI logic
    // Analyze evidence, previous cases, and suggest resolution
    // For now, return false (manual resolution required)
    return false;
  }

  private static emitEvent(event: string, data: any) {
    console.log(`🔔 Dispute Event: ${event}`, data);
    // Emit to organism event bus
    // OrganismEventBus.emit(event, data);
  }
}
