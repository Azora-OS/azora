/**
 * Certificate Verification Endpoint
 * Verifies certificates using verification hash
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeIntegration } from '@/services/tokens/proof-of-knowledge-integration';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const integration = new ProofOfKnowledgeIntegration();

/**
 * POST /api/proof-of-knowledge/verify
 * Verify a certificate using verification hash
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, verificationHash } = await request.json();

    if (!userId || !courseId || !verificationHash) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, verificationHash' },
        { status: 400 }
      );
    }

    logger.info('Verifying certificate', { userId, courseId });

    const result = await integration.verifyCertificateExternal(userId, courseId, verificationHash);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to verify certificate', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/proof-of-knowledge/verify?userId=...&courseId=...&verificationHash=...
 * Verify a certificate using query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const verificationHash = searchParams.get('verificationHash');

    if (!userId || !courseId || !verificationHash) {
      return NextResponse.json(
        { error: 'Missing required query parameters: userId, courseId, verificationHash' },
        { status: 400 }
      );
    }

    logger.info('Verifying certificate', { userId, courseId });

    const result = await integration.verifyCertificateExternal(userId, courseId, verificationHash);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to verify certificate', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
