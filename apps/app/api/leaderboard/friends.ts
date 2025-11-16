/**
 * GET /api/leaderboard/friends
 * Get friend leaderboard for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { LeaderboardService } from '@/services/tokens/leaderboard';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    logger.info('Getting friend leaderboard', { userId, limit });

    const leaderboardService = new LeaderboardService();
    const leaderboard = await leaderboardService.getFriendLeaderboard(userId, limit);

    logger.info('Friend leaderboard retrieved', { userId, entryCount: leaderboard.entries.length });

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    logger.error('Failed to get friend leaderboard', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
