/**
 * Certificate Generation Endpoint
 * Generates certificates for completed courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProofOfKnowledgeValidator } from '@/services/tokens/proof-of-knowledge-validator';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

const validator = new ProofOfKnowledgeValidator();

/**
 * POST /api/proof-of-knowledge/certificate
 * Generate certificate for completed course
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

    logger.info('Generating certificate', { userId, courseId });

    const certificate = await validator.generateCertificate(userId, courseId);

    return NextResponse.json(certificate);
  } catch (error) {
    logger.error('Failed to generate certificate', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/proof-of-knowledge/certificate?userId=...&courseId=...
 * Get certificate for a course
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

    logger.info('Getting certificate', { userId, courseId });

    const certificate = await validator.generateCertificate(userId, courseId);

    return NextResponse.json(certificate);
  } catch (error) {
    logger.error('Failed to get certificate', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
