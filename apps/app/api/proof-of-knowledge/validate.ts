/**
 * Proof-of-Knowledge Validation Endpoint
 * Validates course completion and generates certificates
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeValidator } from '@/services/tokens/proof-of-knowledge-validator';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const validator = new ProofOfKnowledgeValidator();

/**
 * POST /api/proof-of-knowledge/validate
 * Validate course completion for a user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId' },
        { status: 400 }
      );
    }

    logger.info('Validating course completion', { userId, courseId });

    const result = await validator.validateCompletion(userId, courseId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to validate completion', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/proof-of-knowledge/validate?userId=...&courseId=...
 * Get validation status for a course
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: userId, courseId' },
        { status: 400 }
      );
    }

    logger.info('Getting validation status', { userId, courseId });

    const result = await validator.validateCompletion(userId, courseId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to get validation status', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
