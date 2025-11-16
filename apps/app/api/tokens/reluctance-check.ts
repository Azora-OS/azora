/**
 * POST /api/tokens/reluctance-check
 * Get psychological reluctance messaging before token sale/withdrawal/redemption
 */

import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { ReluctanceMessagingService } from '@/services/tokens/reluctance-messaging';
import { TokenRewardsService } from '@/services/tokens/token-rewards';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface ReluctanceCheckRequest {
  amount: number;
  transactionType: 'COURSE_SALE' | 'EARNINGS_WITHDRAWAL' | 'TOKEN_REDEMPTION';
  currentTokenPrice?: number; // Optional: for financial impact calculation
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ReluctanceCheckRequest = await request.json();

    // Validate required fields
    if (!body.amount || !body.transactionType) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, transactionType' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['COURSE_SALE', 'EARNINGS_WITHDRAWAL', 'TOKEN_REDEMPTION'];
    if (!validTypes.includes(body.transactionType)) {
      return NextResponse.json(
        { error: `Invalid transaction type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    logger.info('Checking reluctance messaging', {
      userId,
      amount: body.amount,
      transactionType: body.transactionType,
    });

    // Get user's token balance
    const tokenService = new TokenRewardsService();
    const userBalance = await tokenService.getTokenBalance(userId);

    // Generate reluctance message
    const reluctanceService = new ReluctanceMessagingService();
    const reluctanceMessage = reluctanceService.generateReluctanceMessage(
      body.amount,
      body.transactionType as any,
      userBalance
    );

    // Generate warning if applicable
    const warningMessage = reluctanceService.generateWarningMessage(
      body.amount,
      body.transactionType as any
    );

    // Generate comprehensive report if token price provided
    let comprehensiveReport = null;
    if (body.currentTokenPrice && body.currentTokenPrice > 0) {
      comprehensiveReport = reluctanceService.generateComprehensiveReport(
        body.amount,
        body.transactionType as any,
        userBalance,
        body.currentTokenPrice
      );
    }

    logger.info('Reluctance check completed', {
      userId,
      burnImpact: reluctanceMessage.burnImpact.toString(),
      percentageLoss: reluctanceMessage.percentageLoss,
    });

    return NextResponse.json(
      {
        success: true,
        reluctanceMessage: {
          effectiveSellPrice: reluctanceMessage.effectiveSellPrice.toString(),
          burnImpact: reluctanceMessage.burnImpact.toString(),
          percentageLoss: reluctanceMessage.percentageLoss,
          message: reluctanceMessage.message,
          educationalContent: reluctanceMessage.educationalContent,
        },
        warningMessage,
        userBalance: userBalance.toString(),
        comprehensiveReport: comprehensiveReport ? {
          warningMessage: comprehensiveReport.warningMessage,
          financialImpact: {
            burnedTokens: comprehensiveReport.financialImpact.burnedTokens.toString(),
            netTokens: comprehensiveReport.financialImpact.netTokens.toString(),
            burnedUSD: comprehensiveReport.financialImpact.burnedUSD.toString(),
            netUSD: comprehensiveReport.financialImpact.netUSD.toString(),
            percentageLoss: comprehensiveReport.financialImpact.percentageLoss,
          },
          recommendations: comprehensiveReport.recommendations,
        } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to check reluctance messaging', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
