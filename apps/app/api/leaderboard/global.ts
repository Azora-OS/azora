/**
 * GET /api/leaderboard/global
 * Get global leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { LeaderboardService } from '@/services/tokens/leaderboard';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    logger.info('Getting global leaderboard', { limit });

    const leaderboardService = new LeaderboardService();
    const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);

    logger.info('Global leaderboard retrieved', { entryCount: leaderboard.entries.length });

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    logger.error('Failed to get global leaderboard', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
