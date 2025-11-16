/**
 * Stripe Webhook API Endpoint
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { WebhookHandler, StripeClientService, PaymentRepository } from '@/services/payment';
import { logger } from '@/services/shared/logging';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    logger.info('Received Stripe webhook', { signature: signature.substring(0, 20) });

    // Initialize services
    const stripeClient = new StripeClientService(
      process.env.STRIPE_SECRET_KEY || ''
    );
    const paymentRepository = new PaymentRepository(prisma);
    const webhookHandler = new WebhookHandler(stripeClient, paymentRepository);

    // Verify webhook signature
    let event;
    try {
      event = webhookHandler.verifyWebhookSignature(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    logger.info('Webhook signature verified', { eventType: event.type });

    // Process webhook event
    try {
      await webhookHandler.processWebhookEvent(event);
      logger.info('Webhook event processed successfully', { eventType: event.type });
    } catch (error) {
      logger.error('Failed to process webhook event', { error, eventType: event.type });
      // Still return 200 to acknowledge receipt
      // Stripe will retry if we return an error
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Unexpected error in webhook handler', { error });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
