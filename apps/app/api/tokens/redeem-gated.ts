/**
 * Gated Token Redemption Endpoint
 * Redeems tokens with proof-of-knowledge validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeIntegration } from '@/services/tokens/proof-of-knowledge-integration';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const integration = new ProofOfKnowledgeIntegration();

/**
 * POST /api/tokens/redeem-gated
 * Request token redemption with proof-of-knowledge gating
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, amount, type, requireProofOfKnowledge, courseId, metadata } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, type' },
        { status: 400 }
      );
    }

    logger.info('Requesting gated token redemption', {
      userId,
      amount,
      type,
      requireProofOfKnowledge,
    });

    const response = await integration.requestGatedRedemption({
      userId,
      amount: new Decimal(amount),
      type,
      requireProofOfKnowledge,
      courseId,
      metadata,
    });

    const statusCode = response.success ? 200 : 403;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error('Failed to request gated redemption', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
