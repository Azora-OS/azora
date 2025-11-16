/**
 * DELETE /api/subscriptions/cancel
 * Cancel user's subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription/subscription-service';
import { FeatureAccessService } from '@/services/subscription/feature-access';
import { StripeClientService } from '@/services/payment/stripe-client';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface CancelSubscriptionRequest {
  reason?: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CancelSubscriptionRequest = await request.json();

    logger.info('Cancelling subscription', { userId, reason: body.reason });

    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Cancel Stripe subscription if it exists
    if (subscription.tier !== 'FREE' && subscription.id) {
      const stripeService = new StripeClientService();
      await stripeService.cancelSubscription(subscription.id);
    }

    // Cancel subscription in database
    await subscriptionService.cancelSubscription(userId, body.reason);

    // Invalidate feature access cache
    const featureService = new FeatureAccessService();
    featureService.invalidateCache(userId);

    logger.info('Subscription cancelled successfully', { userId });

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription cancelled successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to cancel subscription', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
