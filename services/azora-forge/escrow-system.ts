import { prisma } from '../../infrastructure/database/prisma-config'
import { logger } from '../../infrastructure/monitoring/logger'

export class EscrowSystem {
  async createEscrow(projectId: string, clientId: string, freelancerId: string, amount: number) {
    try {
      // Check client has sufficient balance
      const clientWallet = await prisma.wallet.findUnique({
        where: { userId: clientId }
      })

      if (!clientWallet || clientWallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      // Create escrow record
      const escrow = await prisma.escrow.create({
        data: {
          projectId,
          clientId,
          freelancerId,
          amount,
          status: 'PENDING',
          createdAt: new Date()
        }
      })

      // Lock funds in client wallet
      await prisma.wallet.update({
        where: { userId: clientId },
        data: {
          balance: { decrement: amount },
          locked: { increment: amount }
        }
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          type: 'ESCROW_LOCK',
          status: 'COMPLETED',
          amount,
          coinType: 'AZR',
          usdEquivalent: amount,
          hash: `escrow-${escrow.id}`,
          senderId: clientWallet.id,
          notes: `Escrow for project ${projectId}`
        }
      })

      logger.info('Escrow created', { escrowId: escrow.id, projectId, amount })
      return escrow
    } catch (error) {
      logger.error('Escrow creation failed', { error, projectId, clientId, freelancerId })
      throw error
    }
  }

  async releaseEscrow(escrowId: string, releasedBy: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId }
      })

      if (!escrow || escrow.status !== 'PENDING') {
        throw new Error('Invalid escrow or already processed')
      }

      // Verify authorization (client or admin)
      if (releasedBy !== escrow.clientId && !await this.isAdmin(releasedBy)) {
        throw new Error('Unauthorized to release escrow')
      }

      // Update escrow status
      await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          releasedBy
        }
      })

      // Transfer funds to freelancer
      const freelancerWallet = await prisma.wallet.findUnique({
        where: { userId: escrow.freelancerId }
      })

      if (freelancerWallet) {
        await prisma.wallet.update({
          where: { userId: escrow.freelancerId },
          data: { balance: { increment: escrow.amount } }
        })
      }

      // Unlock funds from client wallet
      await prisma.wallet.update({
        where: { userId: escrow.clientId },
        data: { locked: { decrement: escrow.amount } }
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          amount: escrow.amount,
          coinType: 'AZR',
          usdEquivalent: escrow.amount,
          hash: `escrow-release-${escrowId}`,
          recipientId: freelancerWallet?.id,
          notes: `Escrow released for project ${escrow.projectId}`
        }
      })

      logger.info('Escrow released', { escrowId, releasedBy })
      return { success: true }
    } catch (error) {
      logger.error('Escrow release failed', { error, escrowId, releasedBy })
      throw error
    }
  }

  async disputeEscrow(escrowId: string, disputedBy: string, reason: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId }
      })

      if (!escrow || escrow.status !== 'PENDING') {
        throw new Error('Invalid escrow or already processed')
      }

      // Update escrow status
      await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'DISPUTED',
          disputedAt: new Date(),
          disputedBy,
          disputeReason: reason
        }
      })

      // Create dispute record for admin review
      await prisma.dispute.create({
        data: {
          escrowId,
          disputedBy,
          reason,
          status: 'OPEN',
          createdAt: new Date()
        }
      })

      logger.info('Escrow disputed', { escrowId, disputedBy, reason })
      return { success: true }
    } catch (error) {
      logger.error('Escrow dispute failed', { error, escrowId, disputedBy })
      throw error
    }
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    return user?.role === 'ADMIN'
  }
}