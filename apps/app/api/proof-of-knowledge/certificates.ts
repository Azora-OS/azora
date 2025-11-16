/**
 * User Certificates Endpoint
 * Retrieves all certificates for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeIntegration } from '@/services/tokens/proof-of-knowledge-integration';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const integration = new ProofOfKnowledgeIntegration();

/**
 * GET /api/proof-of-knowledge/certificates/:userId
 * Get all certificates for a user
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

    logger.info('Getting user certificates', { userId });

    const result = await integration.getUserCertificates(userId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to get certificates', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
