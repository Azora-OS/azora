/**
 * POST /api/tokens/award
 * Award tokens to a user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenRewardsService } from '@/services/tokens/token-rewards';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface AwardTokensRequest {
  userId: string;
  amount: number;
  reason: string;
  metadata?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const adminUserId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!adminUserId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body: AwardTokensRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.amount || !body.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, reason' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    logger.info('Awarding tokens', { adminUserId, userId: body.userId, amount: body.amount });

    const tokenService = new TokenRewardsService();
    const transaction = await tokenService.awardTokens(
      body.userId,
      body.amount,
      body.reason,
      body.metadata
    );

    logger.info('Tokens awarded successfully', { transactionId: transaction.id });

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transaction.id,
          amount: transaction.amount.toString(),
          reason: transaction.reason,
          balance: transaction.balance.toString(),
          createdAt: transaction.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to award tokens', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
