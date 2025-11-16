/**
 * Payment Processing API Endpoint
 * POST /api/payments/process
 * Processes a payment through Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StripeClientService, PaymentProcessor, PaymentRepository } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { z } from 'zod';

const prisma = new PrismaClient();

// Request validation schema
const paymentRequestSchema = z.object({
  amount: z.number().int().positive('Amount must be greater than 0'),
  currency: z.string().default('usd').refine((val) => /^[a-z]{3}$/.test(val), {
    message: 'Currency must be a valid ISO 4217 code',
  }),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  courseId: z.string().optional(),
  subscriptionTierId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

type PaymentRequestBody = z.infer<typeof paymentRequestSchema>;

/**
 * POST /api/payments/process
 * Process a payment
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Parse and validate request body
    let body: PaymentRequestBody;
    try {
      const rawBody = await request.json();
      body = paymentRequestSchema.parse(rawBody);
    } catch (error) {
      logger.warn('Invalid payment request', { error });
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error instanceof z.ZodError ? error.errors : 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    logger.info('Processing payment', {
      userId,
      amount: body.amount,
      currency: body.currency,
    });

    // Initialize services
    const stripeClient = new StripeClientService(
      process.env.STRIPE_SECRET_KEY || ''
    );
    const paymentRepository = new PaymentRepository(prisma);
    const paymentProcessor = new PaymentProcessor(stripeClient, paymentRepository);

    // Process payment
    const result = await paymentProcessor.processPayment({
      userId,
      amount: body.amount,
      currency: body.currency,
      paymentMethodId: body.paymentMethodId,
      courseId: body.courseId,
      subscriptionTierId: body.subscriptionTierId,
      metadata: body.metadata,
    });

    if (!result.success) {
      logger.error('Payment processing failed', {
        userId,
        error: result.error?.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Payment processing failed',
          code: result.error?.code,
        },
        { status: result.error?.statusCode || 400 }
      );
    }

    logger.info('Payment processed successfully', {
      userId,
      paymentId: result.paymentId,
      stripePaymentIntentId: result.stripePaymentIntentId,
    });

    return NextResponse.json(
      {
        success: true,
        paymentId: result.paymentId,
        stripePaymentIntentId: result.stripePaymentIntentId,
        status: result.status,
        clientSecret: result.clientSecret,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Unexpected error in payment processing', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
