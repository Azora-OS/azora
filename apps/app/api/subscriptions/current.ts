/**
 * GET /api/subscriptions/current
 * Get current user's subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription/subscription-service';
import { FeatureAccessService } from '@/services/subscription/feature-access';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Fetching current subscription', { userId });

    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getSubscription(userId);

    // If no subscription exists, create a FREE tier subscription
    if (!subscription) {
      const newSubscription = await subscriptionService.createSubscription({
        userId,
        tier: 'FREE',
      });

      const featureService = new FeatureAccessService();
      const features = featureService.getFeaturesByTier('FREE');

      return NextResponse.json(
        {
          subscription: newSubscription,
          features,
        },
        { status: 200 }
      );
    }

    // Get features for the tier
    const featureService = new FeatureAccessService();
    const features = featureService.getFeaturesByTier(subscription.tier);

    logger.info('Subscription fetched successfully', { subscriptionId: subscription.id });

    return NextResponse.json(
      {
        subscription,
        features,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to fetch subscription', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
