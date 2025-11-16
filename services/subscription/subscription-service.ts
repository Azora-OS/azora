/**
 * Subscription Service
 * Manages user subscriptions, billing cycles, and tier management
 */

import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface CreateSubscriptionInput {
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UpdateSubscriptionInput {
  userId: string;
  newTier: SubscriptionTier;
  prorationBehavior?: 'create_prorations' | 'none';
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  renewalDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    try {
      logger.info('Creating subscription', { userId: input.userId, tier: input.tier });

      // Check if user already has a subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: input.userId },
      });

      if (existingSubscription) {
        throw new Error(`User ${input.userId} already has an active subscription`);
      }

      // Calculate renewal date (30 days from now)
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 30);

      const subscription = await prisma.subscription.create({
        data: {
          userId: input.userId,
          tier: input.tier,
          status: 'ACTIVE',
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: renewalDate,
          renewalDate,
        },
      });

      logger.info('Subscription created successfully', { subscriptionId: subscription.id });
      return this.mapSubscriptionResponse(subscription);
    } catch (error) {
      logger.error('Failed to create subscription', { error, userId: input.userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Update user subscription tier
   */
  async updateSubscription(input: UpdateSubscriptionInput): Promise<SubscriptionResponse> {
    try {
      logger.info('Updating subscription', { userId: input.userId, newTier: input.newTier });

      const subscription = await prisma.subscription.findUnique({
        where: { userId: input.userId },
      });

      if (!subscription) {
        throw new Error(`No subscription found for user ${input.userId}`);
      }

      if (subscription.tier === input.newTier) {
        throw new Error(`User is already on ${input.newTier} tier`);
      }

      // Update subscription tier
      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: input.newTier,
          updatedAt: new Date(),
        },
      });

      logger.info('Subscription updated successfully', {
        subscriptionId: subscription.id,
        oldTier: subscription.tier,
        newTier: input.newTier,
      });

      return this.mapSubscriptionResponse(updated);
    } catch (error) {
      logger.error('Failed to update subscription', { error, userId: input.userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, reason?: string): Promise<void> {
    try {
      logger.info('Cancelling subscription', { userId, reason });

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error(`No subscription found for user ${userId}`);
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      logger.info('Subscription cancelled successfully', { subscriptionId: subscription.id });
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user subscription
   */
  async getSubscription(userId: string): Promise<SubscriptionResponse | null> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return null;
      }

      return this.mapSubscriptionResponse(subscription);
    } catch (error) {
      logger.error('Failed to get subscription', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string): Promise<SubscriptionResponse | null> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        return null;
      }

      return this.mapSubscriptionResponse(subscription);
    } catch (error) {
      logger.error('Failed to get subscription by ID', { error, subscriptionId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(userId: string): Promise<SubscriptionResponse> {
    try {
      logger.info('Pausing subscription', { userId });

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error(`No subscription found for user ${userId}`);
      }

      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAUSED',
        },
      });

      logger.info('Subscription paused successfully', { subscriptionId: subscription.id });
      return this.mapSubscriptionResponse(updated);
    } catch (error) {
      logger.error('Failed to pause subscription', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(userId: string): Promise<SubscriptionResponse> {
    try {
      logger.info('Resuming subscription', { userId });

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error(`No subscription found for user ${userId}`);
      }

      if (subscription.status !== 'PAUSED') {
        throw new Error(`Subscription is not paused (current status: ${subscription.status})`);
      }

      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
        },
      });

      logger.info('Subscription resumed successfully', { subscriptionId: subscription.id });
      return this.mapSubscriptionResponse(updated);
    } catch (error) {
      logger.error('Failed to resume subscription', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get all subscriptions for a tier
   */
  async getSubscriptionsByTier(tier: SubscriptionTier): Promise<SubscriptionResponse[]> {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { tier },
      });

      return subscriptions.map((sub) => this.mapSubscriptionResponse(sub));
    } catch (error) {
      logger.error('Failed to get subscriptions by tier', { error, tier });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get subscriptions expiring soon
   */
  async getExpiringSubscriptions(daysUntilExpiry: number = 7): Promise<SubscriptionResponse[]> {
    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          renewalDate: {
            gte: now,
            lte: expiryDate,
          },
        },
      });

      return subscriptions.map((sub) => this.mapSubscriptionResponse(sub));
    } catch (error) {
      logger.error('Failed to get expiring subscriptions', { error, daysUntilExpiry });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Update subscription renewal date
   */
  async updateRenewalDate(userId: string, newRenewalDate: Date): Promise<SubscriptionResponse> {
    try {
      logger.info('Updating renewal date', { userId, newRenewalDate });

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error(`No subscription found for user ${userId}`);
      }

      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          renewalDate: newRenewalDate,
          currentPeriodEnd: newRenewalDate,
        },
      });

      logger.info('Renewal date updated successfully', { subscriptionId: subscription.id });
      return this.mapSubscriptionResponse(updated);
    } catch (error) {
      logger.error('Failed to update renewal date', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    byTier: Record<SubscriptionTier, number>;
    mrr: number; // Monthly Recurring Revenue
  }> {
    try {
      const subscriptions = await prisma.subscription.findMany();
      const tierConfigs = await prisma.subscriptionTierConfig.findMany();

      const stats = {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter((s) => s.status === 'ACTIVE').length,
        byTier: {
          FREE: subscriptions.filter((s) => s.tier === 'FREE').length,
          PRO: subscriptions.filter((s) => s.tier === 'PRO').length,
          ENTERPRISE: subscriptions.filter((s) => s.tier === 'ENTERPRISE').length,
        },
        mrr: 0,
      };

      // Calculate MRR
      for (const tier of ['PRO', 'ENTERPRISE'] as const) {
        const tierCount = stats.byTier[tier];
        const tierConfig = tierConfigs.find((c) => c.tier === tier);
        if (tierConfig) {
          stats.mrr += (tierConfig.monthlyPrice / 100) * tierCount;
        }
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get subscription stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map subscription to response format
   */
  private mapSubscriptionResponse(subscription: any): SubscriptionResponse {
    return {
      id: subscription.id,
      userId: subscription.userId,
      tier: subscription.tier,
      status: subscription.status,
      renewalDate: subscription.renewalDate,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}

export default new SubscriptionService();
