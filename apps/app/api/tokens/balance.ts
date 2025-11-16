/**
 * GET /api/tokens/balance
 * Get user's token balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenRewardsService } from '@/services/tokens/token-rewards';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Getting token balance', { userId });

    const tokenService = new TokenRewardsService();
    const balance = await tokenService.getTokenBalance(userId);

    logger.info('Token balance retrieved', { userId, balance: balance.toString() });

    return NextResponse.json(
      {
        balance: balance.toString(),
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to get token balance', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
