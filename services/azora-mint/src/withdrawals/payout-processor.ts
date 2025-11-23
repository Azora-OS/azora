/**
 * Payout Processor
 * Processes payouts to bank accounts via Stripe Connect
 */

import { WithdrawalRecord } from './withdrawal-service';
import { BankAccount } from './bank-verification';

export interface PayoutConfig {
  stripeConnectAccountId: string;
  stripeApiKey: string;
  currency: string;
  minPayout: number;
  maxPayout: number;
  processingTimeHours: number;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  error?: string;
  amount: number;
  fee: number;
  netAmount: number;
  estimatedArrival?: Date;
}

export interface PayoutStatus {
  payoutId: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  fee: number;
  netAmount: number;
  createdAt: Date;
  arrivedAt?: Date;
  failureReason?: string;
}

/**
 * In-memory payout storage (use database in production)
 */
const payouts = new Map<string, PayoutStatus>();
const userPayouts = new Map<string, PayoutStatus[]>();

/**
 * Process a payout to a bank account
 */
export async function processPayout(
  withdrawal: WithdrawalRecord,
  bankAccount: BankAccount,
  config: PayoutConfig
): Promise<PayoutResult> {
  try {
    // Validate payout amount
    if (withdrawal.amount < config.minPayout) {
      return {
        success: false,
        error: `Minimum payout amount is ${config.minPayout}`,
        amount: withdrawal.amount,
        fee: 0,
        netAmount: 0,
      };
    }

    if (withdrawal.amount > config.maxPayout) {
      return {
        success: false,
        error: `Maximum payout amount is ${config.maxPayout}`,
        amount: withdrawal.amount,
        fee: 0,
        netAmount: 0,
      };
    }

    // Calculate fees (2% standard)
    const fee = Math.round(withdrawal.amount * 0.02 * 100) / 100;
    const netAmount = withdrawal.amount - fee;

    // In production, use Stripe Connect API
    // For now, simulate payout creation
    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payout record
    const payout: PayoutStatus = {
      payoutId,
      status: 'pending',
      amount: withdrawal.amount,
      fee,
      netAmount,
      createdAt: new Date(),
    };

    // Calculate estimated arrival
    const estimatedArrival = new Date();
    estimatedArrival.setHours(estimatedArrival.getHours() + config.processingTimeHours);

    payouts.set(payoutId, payout);

    // Add to user payouts
    if (!userPayouts.has(withdrawal.userId)) {
      userPayouts.set(withdrawal.userId, []);
    }
    userPayouts.get(withdrawal.userId)!.push(payout);

    return {
      success: true,
      payoutId,
      amount: withdrawal.amount,
      fee,
      netAmount,
      estimatedArrival,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      amount: withdrawal.amount,
      fee: 0,
      netAmount: 0,
    };
  }
}

/**
 * Get payout status
 */
export function getPayoutStatus(payoutId: string): PayoutStatus | null {
  return payouts.get(payoutId) || null;
}

/**
 * Get user's payouts
 */
export function getUserPayouts(userId: string): PayoutStatus[] {
  return userPayouts.get(userId) || [];
}

/**
 * Update payout status
 */
export function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus['status'],
  arrivedAt?: Date,
  failureReason?: string
): PayoutStatus | null {
  const payout = getPayoutStatus(payoutId);
  if (!payout) {return null;}

  payout.status = status;
  if (arrivedAt) {payout.arrivedAt = arrivedAt;}
  if (failureReason) {payout.failureReason = failureReason;}

  return payout;
}

/**
 * Simulate payout completion (for testing)
 */
export function simulatePayoutCompletion(payoutId: string): PayoutStatus | null {
  const payout = getPayoutStatus(payoutId);
  if (!payout) {return null;}

  payout.status = 'paid';
  payout.arrivedAt = new Date();

  return payout;
}

/**
 * Simulate payout failure (for testing)
 */
export function simulatePayoutFailure(payoutId: string, reason: string): PayoutStatus | null {
  const payout = getPayoutStatus(payoutId);
  if (!payout) {return null;}

  payout.status = 'failed';
  payout.failureReason = reason;

  return payout;
}

/**
 * Get payout statistics
 */
export function getPayoutStats(userId: string) {
  const payouts = getUserPayouts(userId);

  return {
    totalPayouts: payouts.length,
    totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
    totalFees: payouts.reduce((sum, p) => sum + p.fee, 0),
    totalNetAmount: payouts.reduce((sum, p) => sum + p.netAmount, 0),
    completedPayouts: payouts.filter((p) => p.status === 'paid').length,
    pendingPayouts: payouts.filter((p) => p.status === 'pending' || p.status === 'in_transit').length,
    failedPayouts: payouts.filter((p) => p.status === 'failed').length,
    averagePayout: payouts.length > 0 ? payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length : 0,
  };
}

/**
 * Batch process payouts
 */
export async function batchProcessPayouts(
  withdrawals: WithdrawalRecord[],
  bankAccounts: Map<string, BankAccount>,
  config: PayoutConfig
): Promise<PayoutResult[]> {
  const results: PayoutResult[] = [];

  for (const withdrawal of withdrawals) {
    const bankAccount = bankAccounts.get(withdrawal.bankAccountId);
    if (!bankAccount) {
      results.push({
        success: false,
        error: 'Bank account not found',
        amount: withdrawal.amount,
        fee: 0,
        netAmount: 0,
      });
      continue;
    }

    const result = await processPayout(withdrawal, bankAccount, config);
    results.push(result);
  }

  return results;
}

/**
 * Get payout fee breakdown
 */
export function getPayoutFeeBreakdown(amount: number) {
  const stripeFee = Math.round(amount * 0.01 * 100) / 100; // 1% Stripe fee
  const processingFee = Math.round(amount * 0.01 * 100) / 100; // 1% processing fee
  const totalFee = stripeFee + processingFee;
  const netAmount = amount - totalFee;

  return {
    amount,
    stripeFee,
    processingFee,
    totalFee,
    netAmount,
    feePercentage: (totalFee / amount) * 100,
  };
}

/**
 * Estimate payout arrival time
 */
export function estimatePayoutArrival(createdAt: Date, processingTimeHours: number): Date {
  const arrival = new Date(createdAt);
  arrival.setHours(arrival.getHours() + processingTimeHours);
  return arrival;
}

/**
 * Check if payout is overdue
 */
export function isPayoutOverdue(payout: PayoutStatus, processingTimeHours: number): boolean {
  if (payout.status === 'paid' || payout.status === 'failed' || payout.status === 'cancelled') {
    return false;
  }

  const expectedArrival = estimatePayoutArrival(payout.createdAt, processingTimeHours);
  return new Date() > expectedArrival;
}

export default {
  processPayout,
  getPayoutStatus,
  getUserPayouts,
  updatePayoutStatus,
  simulatePayoutCompletion,
  simulatePayoutFailure,
  getPayoutStats,
  batchProcessPayouts,
  getPayoutFeeBreakdown,
  estimatePayoutArrival,
  isPayoutOverdue,
};
