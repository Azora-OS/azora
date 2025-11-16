/**
 * Refund API Endpoint
 * POST /api/payments/refund
 * Processes a refund for a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StripeClientService, PaymentProcessor, PaymentRepository } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Request validation schema
const refundRequestSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

type RefundRequestBody = z.infer<typeof refundRequestSchema>;

/**
 * POST /api/payments/refund
 * Process a refund
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized refund request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (optional - adjust based on your auth system)
    // For now, we'll allow any authenticated user to request refunds for their own payments
    const userId = authResult.userId;

    // Parse and validate request body
    let body: RefundRequestBody;
    try {
      const rawBody = await request.json();
      body = refundRequestSchema.parse(rawBody);
    } catch (error) {
      logger.warn('Invalid refund request', { error });
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error instanceof z.ZodError ? error.errors : 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    logger.info('Processing refund', {
      userId,
      paymentId: body.paymentId,
      amount: body.amount,
    });

    // Initialize services
    const stripeClient = new StripeClientService(
      process.env.STRIPE_SECRET_KEY || ''
    );
    const paymentRepository = new PaymentRepository(prisma);
    const paymentProcessor = new PaymentProcessor(stripeClient, paymentRepository);

    // Verify payment belongs to user
    const payment = await paymentRepository.getPaymentById(body.paymentId);
    if (!payment) {
      logger.warn('Payment not found', { paymentId: body.paymentId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.userId !== userId) {
      logger.warn('Unauthorized refund attempt', {
        paymentId: body.paymentId,
        userId,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Process refund
    const result = await paymentProcessor.refundPayment(
      body.paymentId,
      body.amount,
      body.reason
    );

    if (!result.success) {
      logger.error('Refund processing failed', {
        paymentId: body.paymentId,
        error: result.error?.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Refund processing failed',
          code: result.error?.code,
        },
        { status: result.error?.statusCode || 400 }
      );
    }

    logger.info('Refund processed successfully', {
      paymentId: body.paymentId,
      amount: body.amount,
    });

    return NextResponse.json(
      {
        success: true,
        paymentId: result.paymentId,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Unexpected error in refund processing', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
