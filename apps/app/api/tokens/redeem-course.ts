/**
 * Course-Specific Token Redemption Endpoint
 * Redeems tokens for course completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeIntegration } from '@/services/tokens/proof-of-knowledge-integration';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const integration = new ProofOfKnowledgeIntegration();

/**
 * POST /api/tokens/redeem-course
 * Redeem tokens for course completion
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, amount, redemptionType } = await request.json();

    if (!userId || !courseId || !amount || !redemptionType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, amount, redemptionType' },
        { status: 400 }
      );
    }

    logger.info('Requesting course-specific token redemption', {
      userId,
      courseId,
      amount,
      redemptionType,
    });

    const response = await integration.verifyAndRedeemForCourse(
      userId,
      courseId,
      new Decimal(amount),
      redemptionType
    );

    const statusCode = response.success ? 200 : 403;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error('Failed to redeem tokens for course', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
