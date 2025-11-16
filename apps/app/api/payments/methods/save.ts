/**
 * Save Payment Method API Endpoint
 * POST /api/payments/methods/save
 * Saves a new payment method for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodService } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';
import { z } from 'zod';
import StripeClientService from '@/services/payment/stripe-client';

// Request validation schema
const savePaymentMethodSchema = z.object({
  type: z.enum(['card', 'us_bank_account']),
  card: z
    .object({
      number: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
      exp_month: z.number().int().min(1).max(12),
      exp_year: z.number().int().min(2024).max(2099),
      cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
    })
    .optional(),
  us_bank_account: z
    .object({
      account_number: z.string(),
      routing_number: z.string(),
      account_holder_name: z.string(),
    })
    .optional(),
});

type SavePaymentMethodRequest = z.infer<typeof savePaymentMethodSchema>;

/**
 * POST /api/payments/methods/save
 * Save a payment method
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment method save request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Parse and validate request body
    let body: SavePaymentMethodRequest;
    try {
      const rawBody = await request.json();
      body = savePaymentMethodSchema.parse(rawBody);
    } catch (error) {
      logger.warn('Invalid payment method request', { error });
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error instanceof z.ZodError ? error.errors : 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    logger.info('Saving payment method', { userId, type: body.type });

    // Initialize services
    const stripeClient = new StripeClientService(
      process.env.STRIPE_SECRET_KEY || ''
    );
    const paymentMethodService = new PaymentMethodService(stripeClient);

    // Validate payment method details
    const details =
      body.type === 'card'
        ? { card: body.card }
        : { us_bank_account: body.us_bank_account };

    if (!paymentMethodService.validatePaymentMethodDetails(body.type, details)) {
      logger.warn('Invalid payment method details', { type: body.type });
      return NextResponse.json(
        { error: 'Invalid payment method details' },
        { status: 400 }
      );
    }

    // Create payment method
    const paymentMethod = await paymentMethodService.createPaymentMethod(
      userId,
      body.type,
      details
    );

    logger.info('Payment method saved successfully', {
      userId,
      paymentMethodId: paymentMethod.id,
    });

    return NextResponse.json(
      {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
          expiryMonth: paymentMethod.expiryMonth,
          expiryYear: paymentMethod.expiryYear,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error saving payment method', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save payment method',
      },
      { status: 500 }
    );
  }
}
