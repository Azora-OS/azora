class EscrowSystem {
  constructor() {
    this.escrows = new Map();
  }

  createEscrow(jobId, clientId, freelancerId, amount) {
    const escrow = {
      id: `escrow_${Date.now()}`,
      jobId,
      clientId,
      freelancerId,
      amount,
      status: 'pending',
      createdAt: new Date(),
      milestones: [],
      disputes: []
    };

    this.escrows.set(escrow.id, escrow);
    return escrow;
  }

  addMilestone(escrowId, milestone) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, reason: 'Escrow not found' };

    escrow.milestones.push({
      id: `milestone_${Date.now()}`,
      description: milestone.description,
      amount: milestone.amount,
      status: 'pending',
      createdAt: new Date()
    });

    return { success: true, escrow };
  }

  completeMilestone(escrowId, milestoneId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, reason: 'Escrow not found' };

    const milestone = escrow.milestones.find(m => m.id === milestoneId);
    if (!milestone) return { success: false, reason: 'Milestone not found' };

    milestone.status = 'completed';
    milestone.completedAt = new Date();

    return { success: true, milestone };
  }

  releasePayment(escrowId, milestoneId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, reason: 'Escrow not found' };

    const milestone = escrow.milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'completed') {
      return { success: false, reason: 'Milestone not completed' };
    }

    milestone.status = 'paid';
    milestone.paidAt = new Date();

    return {
      success: true,
      payment: {
        from: escrow.clientId,
        to: escrow.freelancerId,
        amount: milestone.amount,
        timestamp: new Date()
      }
    };
  }

  raiseDispute(escrowId, raisedBy, reason) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, reason: 'Escrow not found' };

    const dispute = {
      id: `dispute_${Date.now()}`,
      raisedBy,
      reason,
      status: 'open',
      createdAt: new Date()
    };

    escrow.disputes.push(dispute);
    escrow.status = 'disputed';

    return { success: true, dispute };
  }

  resolveDispute(escrowId, disputeId, resolution) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, reason: 'Escrow not found' };

    const dispute = escrow.disputes.find(d => d.id === disputeId);
    if (!dispute) return { success: false, reason: 'Dispute not found' };

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedAt = new Date();

    const openDisputes = escrow.disputes.filter(d => d.status === 'open');
    if (openDisputes.length === 0) {
      escrow.status = 'active';
    }

    return { success: true, dispute };
  }
}

module.exports = new EscrowSystem();
