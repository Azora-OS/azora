/**
 * POST /api/tokens/withdraw
 * Withdraw earnings to bank account
 */

import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import { createWithdrawalRequest } from '@/services/azora-mint/src/withdrawals/withdrawal-service';
import { ReluctanceMessagingService } from '@/services/tokens/reluctance-messaging';
import { TokenRewardsService } from '@/services/tokens/token-rewards';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';
import { createBurnIntegrationService } from '@/services/tokens/burn-integration';

interface WithdrawRequest {
  amount: number;
  bankAccountId: string;
  reason?: string;
  includeReluctanceMessage?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: WithdrawRequest = await request.json();

    // Validate required fields
    if (!body.amount || !body.bankAccountId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, bankAccountId' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    logger.info('Processing withdrawal', { userId, amount: body.amount });

    // Get user balance for reluctance messaging
    const tokenService = new TokenRewardsService();
    const userBalance = await tokenService.getTokenBalance(userId);
    
    // Generate reluctance message if requested
    let reluctanceMessage = null;
    if (body.includeReluctanceMessage) {
      const reluctanceService = new ReluctanceMessagingService();
      reluctanceMessage = reluctanceService.generateReluctanceMessage(
        body.amount,
        'EARNINGS_WITHDRAWAL' as any,
        userBalance
      );
    }

    // Create withdrawal request
    const withdrawal = await createWithdrawalRequest({
      userId,
      amount: body.amount,
      currency: 'ZAR', // Default to South African Rand
      bankAccountId: body.bankAccountId,
      reason: body.reason || 'Earnings withdrawal',
    });

    // Process token burn on withdrawal (3% burn rate)
    let burnResult = null;
    try {
      const burnService = createBurnIntegrationService();
      const withdrawalAmount = new Decimal(body.amount);
      burnResult = await burnService.processWithdrawalBurn(userId, withdrawalAmount, withdrawal.id);

      logger.info('Token burn processed on withdrawal', {
        withdrawalId: withdrawal.id,
        burnTransactionId: burnResult.burnTransactionId,
        burnedAmount: burnResult.burnedAmount.toString(),
      });
    } catch (burnError) {
      logger.error('Failed to process token burn on withdrawal', {
        error: burnError,
        withdrawalId: withdrawal.id,
      });
      // Log the error but don't fail the withdrawal - burn is secondary to withdrawal
    }

    logger.info('Withdrawal created successfully', { withdrawalId: withdrawal.id });

    return NextResponse.json(
      {
        success: true,
        withdrawal: {
          id: withdrawal.id,
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
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
    logger.error('Failed to process withdrawal', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
