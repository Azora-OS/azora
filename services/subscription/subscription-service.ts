import { subscriptionRepository } from './src/subscription-repository';
import { logger } from '../shared/logging';

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
}

export interface UpdateSubscriptionInput {
  userId: string;
  newPlanId: string;
}

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  async createSubscription(input: CreateSubscriptionInput) {
    try {
      logger.info('Creating subscription', { userId: input.userId, planId: input.planId });

      // Check if user already has a subscription
      const existingSubscription = await subscriptionRepository.getUserSubscription(input.userId);

      if (existingSubscription && existingSubscription.status === 'ACTIVE') {
        throw new Error(`User ${input.userId} already has an active subscription`);
      }

      // Calculate period end (e.g., 30 days)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const subscription = await subscriptionRepository.createSubscription({
        userId: input.userId,
        planId: input.planId,
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate
      });

      logger.info('Subscription created successfully', { subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', { error, userId: input.userId });
      throw error;
    }
  }

  /**
   * Get user subscription
   */
  async getSubscription(userId: string) {
    try {
      return await subscriptionRepository.getUserSubscription(userId);
    } catch (error) {
      logger.error('Failed to get subscription', { error, userId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    try {
      const subscription = await subscriptionRepository.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      return await subscriptionRepository.cancelSubscription(subscription.id);
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, userId });
      throw error;
    }
  }

  /**
   * Get all plans
   */
  async getPlans() {
    return await subscriptionRepository.getPlans();
  }
}

export default new SubscriptionService();
