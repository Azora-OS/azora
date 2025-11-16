/**
 * PUT /api/subscriptions/update
 * Update user's subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription/subscription-service';
import { FeatureAccessService } from '@/services/subscription/feature-access';
import { StripeClientService } from '@/services/payment/stripe-client';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface UpdateSubscriptionRequest {
  newTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  prorationBehavior?: 'create_prorations' | 'none';
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSubscriptionRequest = await request.json();

    // Validate tier
    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(body.newTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    logger.info('Updating subscription', { userId, newTier: body.newTier });

    const subscriptionService = new SubscriptionService();
    const currentSubscription = await subscriptionService.getSubscription(userId);

    if (!currentSubscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Update Stripe subscription if it exists
    if (currentSubscription.tier !== 'FREE' && body.newTier !== 'FREE') {
      const stripeService = new StripeClientService();
      await stripeService.updateSubscription({
        subscriptionId: currentSubscription.id,
        newTier: body.newTier,
        prorationBehavior: body.prorationBehavior || 'create_prorations',
      });
    }

    // Update subscription in database
    const updated = await subscriptionService.updateSubscription({
      userId,
      newTier: body.newTier as any,
      prorationBehavior: body.prorationBehavior,
    });

    // Invalidate feature access cache
    const featureService = new FeatureAccessService();
    featureService.invalidateCache(userId);

    logger.info('Subscription updated successfully', { subscriptionId: updated.id });

    return NextResponse.json(
      {
        success: true,
        subscription: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to update subscription', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
