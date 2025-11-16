/**
 * POST /api/tokens/redeem
 * Redeem tokens for features or content
 */

import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { TokenRewardsService } from '@/services/tokens/token-rewards';
import { ReluctanceMessagingService } from '@/services/tokens/reluctance-messaging';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';
import { createBurnIntegrationService } from '@/services/tokens/burn-integration';
import { v4 as uuidv4 } from 'uuid';

interface RedeemTokensRequest {
  amount: number;
  feature: string;
  metadata?: any;
  includeReluctanceMessage?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RedeemTokensRequest = await request.json();

    // Validate required fields
    if (!body.amount || !body.feature) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, feature' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    logger.info('Redeeming tokens', { userId, amount: body.amount, feature: body.feature });

    const tokenService = new TokenRewardsService();
    
    // Get user balance for reluctance messaging
    const userBalance = await tokenService.getTokenBalance(userId);
    
    // Generate reluctance message if requested
    let reluctanceMessage = null;
    if (body.includeReluctanceMessage) {
      const reluctanceService = new ReluctanceMessagingService();
      reluctanceMessage = reluctanceService.generateReluctanceMessage(
        body.amount,
        'TOKEN_REDEMPTION' as any,
        userBalance
      );
    }
    
    const transaction = await tokenService.redeemTokens(
      userId,
      body.amount,
      body.feature,
      body.metadata
    );

    // Process token burn on redemption (2% burn rate)
    let burnResult = null;
    try {
      const burnService = createBurnIntegrationService();
      const redemptionAmount = new Decimal(body.amount);
      const redemptionId = uuidv4();
      burnResult = await burnService.processRedemptionBurn(userId, redemptionAmount, redemptionId);

      logger.info('Token burn processed on redemption', {
        transactionId: transaction.id,
        burnTransactionId: burnResult.burnTransactionId,
        burnedAmount: burnResult.burnedAmount.toString(),
      });
    } catch (burnError) {
      logger.error('Failed to process token burn on redemption', {
        error: burnError,
        transactionId: transaction.id,
      });
      // Log the error but don't fail the redemption - burn is secondary to redemption
    }

    logger.info('Tokens redeemed successfully', { transactionId: transaction.id });

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transaction.id,
          amount: transaction.amount.toString(),
          feature: body.feature,
          balance: transaction.balance.toString(),
          createdAt: transaction.createdAt,
        },
        burn: burnResult ? {
          burnTransactionId: burnResult.burnTransactionId,
          burnedAmount: burnResult.burnedAmount.toString(),
          netAmount: burnResult.netAmount.toString(),
          success: burnResult.success,
        } : null,
        reluctanceMessage: reluctanceMessage ? {
          effectiveSellPrice: reluctanceMessage.effectiveSellPrice.toString(),
          burnImpact: reluctanceMessage.burnImpact.toString(),
          percentageLoss: reluctanceMessage.percentageLoss,
          message: reluctanceMessage.message,
          educationalContent: reluctanceMessage.educationalContent,
        } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to redeem tokens', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
