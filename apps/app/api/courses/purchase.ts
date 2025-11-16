/**
 * POST /api/courses/purchase
 * Purchase a course from the marketplace
 */

import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { CoursePurchaseService } from '@/services/marketplace/course-purchase';
import { PaymentProcessor } from '@/services/payment/payment-processor';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';
import { createBurnIntegrationService } from '@/services/tokens/burn-integration';

interface CoursePurchaseRequest {
  courseId: string;
  paymentMethodId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CoursePurchaseRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, paymentMethodId' },
        { status: 400 }
      );
    }

    logger.info('Processing course purchase', { userId, courseId: body.courseId });

    // First, process the payment
    const paymentProcessor = new PaymentProcessor();
    const payment = await paymentProcessor.processPayment({
      userId,
      amount: 0, // Will be set by the course price
      currency: 'USD',
      paymentMethodId: body.paymentMethodId,
      description: `Course purchase: ${body.courseId}`,
      metadata: {
        type: 'course_purchase',
        courseId: body.courseId,
      },
    });

    // Then, create the course purchase record
    const coursePurchaseService = new CoursePurchaseService();
    const purchase = await coursePurchaseService.purchaseCourse({
      userId,
      courseId: body.courseId,
      paymentId: payment.id,
    });

    // Process token burn on course sale (5% burn rate)
    let burnResult = null;
    try {
      const burnService = createBurnIntegrationService();
      const saleAmount = new Decimal(purchase.price);
      burnResult = await burnService.processSaleBurn(userId, saleAmount, body.courseId);

      logger.info('Token burn processed on course sale', {
        purchaseId: purchase.id,
        burnTransactionId: burnResult.burnTransactionId,
        burnedAmount: burnResult.burnedAmount.toString(),
      });
    } catch (burnError) {
      logger.error('Failed to process token burn on course sale', {
        error: burnError,
        purchaseId: purchase.id,
      });
      // Log the error but don't fail the purchase - burn is secondary to purchase
    }

    logger.info('Course purchase completed', { purchaseId: purchase.id });

    return NextResponse.json(
      {
        success: true,
        purchase,
        payment,
        burn: burnResult ? {
          burnTransactionId: burnResult.burnTransactionId,
          burnedAmount: burnResult.burnedAmount.toString(),
          netAmount: burnResult.netAmount.toString(),
          success: burnResult.success,
        } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to purchase course', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
