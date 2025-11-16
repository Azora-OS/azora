/**
 * Payment Details API Endpoint
 * GET /api/payments/[id]
 * Retrieves details for a specific payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentRepository } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';

const prisma = new PrismaClient();

/**
 * GET /api/payments/[id]
 * Get payment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment details request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    const paymentId = params.id;

    logger.info('Fetching payment details', { paymentId, userId });

    // Initialize repository
    const paymentRepository = new PaymentRepository(prisma);

    // Get payment
    const payment = await paymentRepository.getPaymentById(paymentId);

    if (!payment) {
      logger.warn('Payment not found', { paymentId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify user owns this payment
    if (payment.userId !== userId) {
      logger.warn('Unauthorized payment access', { paymentId, userId });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    logger.info('Payment details retrieved', { paymentId });

    // Format response
    const response = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethodId: payment.paymentMethodId,
      courseId: payment.courseId,
      subscriptionTierId: payment.subscriptionTierId,
      metadata: payment.metadata,
      refundedAmount: payment.refundedAmount,
      refundReason: payment.refundReason,
      errorCode: payment.errorCode,
      errorMessage: payment.errorMessage,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        payment: response,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error fetching payment details', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment details',
      },
      { status: 500 }
    );
  }
}
