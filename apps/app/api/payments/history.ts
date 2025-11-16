/**
 * Payment History API Endpoint
 * GET /api/payments/history
 * Retrieves payment history for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentRepository } from '@/services/payment';
import { logger } from '@/services/shared/logging';
import { authenticateRequest } from '@/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Query parameters validation schema
const queryParamsSchema = z.object({
  limit: z.coerce.number().int().positive().default(20).catch(20),
  offset: z.coerce.number().int().nonnegative().default(0).catch(0),
  status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * GET /api/payments/history
 * Get payment history for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized payment history request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = queryParamsSchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    logger.info('Fetching payment history', {
      userId,
      limit: queryParams.limit,
      offset: queryParams.offset,
      status: queryParams.status,
    });

    // Initialize repository
    const paymentRepository = new PaymentRepository(prisma);

    let result;

    // Fetch payments based on filters
    if (queryParams.status) {
      result = await paymentRepository.getPaymentsByStatus(
        queryParams.status as any,
        queryParams.limit,
        queryParams.offset
      );
    } else if (queryParams.startDate && queryParams.endDate) {
      result = await paymentRepository.getPaymentsByDateRange(
        userId,
        new Date(queryParams.startDate),
        new Date(queryParams.endDate),
        queryParams.limit,
        queryParams.offset
      );
    } else {
      result = await paymentRepository.getPaymentHistory(
        userId,
        queryParams.limit,
        queryParams.offset
      );
    }

    logger.info('Payment history retrieved', {
      userId,
      count: result.payments.length,
      total: result.total,
    });

    // Format response
    const formattedPayments = result.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      courseId: payment.courseId,
      subscriptionTierId: payment.subscriptionTierId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        payments: formattedPayments,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error fetching payment history', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment history',
      },
      { status: 500 }
    );
  }
}
