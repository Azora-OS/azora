/**
 * POST /api/subscriptions/create
 * Create a new subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription/subscription-service';
import { FeatureAccessService } from '@/services/subscription/feature-access';
import { StripeClientService } from '@/services/payment/stripe-client';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface CreateSubscriptionRequest {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  paymentMethodId?: string; // Required for PRO and ENTERPRISE
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateSubscriptionRequest = await request.json();

    // Validate tier
    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(body.tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    // Validate payment method for paid tiers
    if ((body.tier === 'PRO' || body.tier === 'ENTERPRISE') && !body.paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method required for paid tiers' },
        { status: 400 }
      );
    }

    logger.info('Creating subscription', { userId, tier: body.tier });

    let stripeCustomerId: string | undefined;
    let stripeSubscriptionId: string | undefined;

    // Create Stripe subscription for paid tiers
    if (body.tier !== 'FREE' && body.paymentMethodId) {
      const stripeService = new StripeClientService();
      const stripeResult = await stripeService.createSubscription({
        customerId: userId,
        paymentMethodId: body.paymentMethodId,
        tier: body.tier,
      });

      stripeCustomerId = stripeResult.customerId;
      stripeSubscriptionId = stripeResult.subscriptionId;
    }

    // Create subscription in database
    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.createSubscription({
      userId,
      tier: body.tier as any,
      stripeCustomerId,
      stripeSubscriptionId,
    });

    // Invalidate feature access cache
    const featureService = new FeatureAccessService();
    featureService.invalidateCache(userId);

    logger.info('Subscription created successfully', { subscriptionId: subscription.id });

    return NextResponse.json(
      {
        success: true,
        subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create subscription', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
