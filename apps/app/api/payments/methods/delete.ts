/**
 * Delete Payment Method API Endpoint
 * DELETE /api/payments/methods/[id]
 * Deletes a payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodService } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';
import StripeClientService from '@/services/payment/stripe-client';
import { z } from 'zod';

// Request validation schema
const deletePaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

type DeletePaymentMethodRequest = z.infer<typeof deletePaymentMethodSchema>;

/**
 * DELETE /api/payments/methods/delete
 * Delete a payment method
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment method delete request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Parse and validate request body
    let body: DeletePaymentMethodRequest;
    try {
      const rawBody = await request.json();
      body = deletePaymentMethodSchema.parse(rawBody);
    } catch (error) {
      logger.warn('Invalid delete payment method request', { error });
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error instanceof z.ZodError ? error.errors : 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    logger.info('Deleting payment method', {
      userId,
      paymentMethodId: body.paymentMethodId,
    });

    // Initialize services
    const stripeClient = new StripeClientService(
      process.env.STRIPE_SECRET_KEY || ''
    );
    const paymentMethodService = new PaymentMethodService(stripeClient);

    // Delete payment method
    await paymentMethodService.deletePaymentMethod(body.paymentMethodId);

    logger.info('Payment method deleted successfully', {
      userId,
      paymentMethodId: body.paymentMethodId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment method deleted',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error deleting payment method', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete payment method',
      },
      { status: 500 }
    );
  }
}
