/**
 * Token Redemption Eligibility Endpoint
 * Checks if user can redeem tokens based on proof of knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeIntegration } from '@/services/tokens/proof-of-knowledge-integration';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const integration = new ProofOfKnowledgeIntegration();

/**
 * GET /api/proof-of-knowledge/eligibility/:userId
 * Check token redemption eligibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    logger.info('Checking redemption eligibility', { userId });

    const eligibility = await integration.getRedemptionEligibility(userId);

    return NextResponse.json(eligibility);
  } catch (error) {
    logger.error('Failed to check eligibility', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
