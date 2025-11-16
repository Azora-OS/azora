/**
 * List Payment Methods API Endpoint
 * GET /api/payments/methods/list
 * Lists all payment methods for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';

/**
 * GET /api/payments/methods/list
 * List payment methods
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment methods list request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    logger.info('Fetching payment methods', { userId });

    // TODO: Implement payment method retrieval from database
    // For now, return empty list as placeholder
    // In production, this would query the database for user's payment methods

    const paymentMethods = [];

    logger.info('Payment methods retrieved', {
      userId,
      count: paymentMethods.length,
    });

    return NextResponse.json(
      {
        success: true,
        paymentMethods,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error fetching payment methods', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment methods',
      },
      { status: 500 }
    );
  }
}
