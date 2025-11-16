/**
 * Withdrawal Service
 * Handles user withdrawals, bank transfers, and payout processing
 */

import { v4 as uuidv4 } from 'uuid';

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  currency: string;
  bankAccountId: string;
  reason?: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  bankAccountId: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  transactionId?: string;
}

export interface WithdrawalLimits {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  minAmount: number;
  maxAmount: number;
  processingFee: number; // percentage
}

/**
 * Default withdrawal limits
 */
const DEFAULT_LIMITS: WithdrawalLimits = {
  dailyLimit: 5000,
  weeklyLimit: 20000,
  monthlyLimit: 100000,
  minAmount: 10,
  maxAmount: 50000,
  processingFee: 0.02, // 2%
};

/**
 * In-memory withdrawal storage (use database in production)
 */
const withdrawals = new Map<string, WithdrawalRecord>();
const userWithdrawalHistory = new Map<string, WithdrawalRecord[]>();

/**
 * Create a withdrawal request
 */
export async function createWithdrawalRequest(
  request: WithdrawalRequest,
  limits: WithdrawalLimits = DEFAULT_LIMITS
): Promise<WithdrawalRecord> {
  // Validate amount
  if (request.amount < limits.minAmount) {
    throw new Error(`Minimum withdrawal amount is ${limits.minAmount}`);
  }

  if (request.amount > limits.maxAmount) {
    throw new Error(`Maximum withdrawal amount is ${limits.maxAmount}`);
  }

  // Check daily limit
  const dailyTotal = await getDailyWithdrawalTotal(request.userId);
  if (dailyTotal + request.amount > limits.dailyLimit) {
    throw new Error(`Daily withdrawal limit exceeded. Remaining: ${limits.dailyLimit - dailyTotal}`);
  }

  // Check weekly limit
  const weeklyTotal = await getWeeklyWithdrawalTotal(request.userId);
  if (weeklyTotal + request.amount > limits.weeklyLimit) {
    throw new Error(`Weekly withdrawal limit exceeded. Remaining: ${limits.weeklyLimit - weeklyTotal}`);
  }

  // Check monthly limit
  const monthlyTotal = await getMonthlyWithdrawalTotal(request.userId);
  if (monthlyTotal + request.amount > limits.monthlyLimit) {
    throw new Error(`Monthly withdrawal limit exceeded. Remaining: ${limits.monthlyLimit - monthlyTotal}`);
  }

  // Create withdrawal record
  const withdrawal: WithdrawalRecord = {
    id: uuidv4(),
    userId: request.userId,
    amount: request.amount,
    currency: request.currency,
    bankAccountId: request.bankAccountId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  withdrawals.set(withdrawal.id, withdrawal);

  // Add to user history
  if (!userWithdrawalHistory.has(request.userId)) {
    userWithdrawalHistory.set(request.userId, []);
  }
  userWithdrawalHistory.get(request.userId)!.push(withdrawal);

  return withdrawal;
}

/**
 * Get withdrawal by ID
 */
export function getWithdrawal(withdrawalId: string): WithdrawalRecord | null {
  return withdrawals.get(withdrawalId) || null;
}

/**
 * Get user's withdrawal history
 */
export function getUserWithdrawalHistory(userId: string): WithdrawalRecord[] {
  return userWithdrawalHistory.get(userId) || [];
}

/**
 * Get pending withdrawals for a user
 */
export function getPendingWithdrawals(userId: string): WithdrawalRecord[] {
  const history = getUserWithdrawalHistory(userId);
  return history.filter((w) => w.status === 'pending');
}

/**
 * Approve a withdrawal
 */
export async function approveWithdrawal(withdrawalId: string): Promise<WithdrawalRecord> {
  const withdrawal = getWithdrawal(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error(`Cannot approve withdrawal with status: ${withdrawal.status}`);
  }

  withdrawal.status = 'approved';
  withdrawal.updatedAt = new Date();

  return withdrawal;
}

/**
 * Reject a withdrawal
 */
export async function rejectWithdrawal(
  withdrawalId: string,
  reason: string
): Promise<WithdrawalRecord> {
  const withdrawal = getWithdrawal(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error(`Cannot reject withdrawal with status: ${withdrawal.status}`);
  }

  withdrawal.status = 'cancelled';
  withdrawal.failureReason = reason;
  withdrawal.updatedAt = new Date();

  return withdrawal;
}

/**
 * Process a withdrawal (move to processing status)
 */
export async function processWithdrawal(withdrawalId: string): Promise<WithdrawalRecord> {
  const withdrawal = getWithdrawal(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'approved') {
    throw new Error(`Cannot process withdrawal with status: ${withdrawal.status}`);
  }

  withdrawal.status = 'processing';
  withdrawal.updatedAt = new Date();
  withdrawal.transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return withdrawal;
}

/**
 * Complete a withdrawal
 */
export async function completeWithdrawal(withdrawalId: string): Promise<WithdrawalRecord> {
  const withdrawal = getWithdrawal(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  if (withdrawal.status !== 'processing') {
    throw new Error(`Cannot complete withdrawal with status: ${withdrawal.status}`);
  }

  withdrawal.status = 'completed';
  withdrawal.completedAt = new Date();
  withdrawal.updatedAt = new Date();

  return withdrawal;
}

/**
 * Fail a withdrawal
 */
export async function failWithdrawal(
  withdrawalId: string,
  reason: string
): Promise<WithdrawalRecord> {
  const withdrawal = getWithdrawal(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }

  withdrawal.status = 'failed';
  withdrawal.failureReason = reason;
  withdrawal.updatedAt = new Date();

  return withdrawal;
}

/**
 * Calculate processing fee
 */
export function calculateProcessingFee(amount: number, feePercentage: number): number {
  return Math.round(amount * feePercentage * 100) / 100;
}

/**
 * Calculate net amount after fees
 */
export function calculateNetAmount(amount: number, feePercentage: number): number {
  const fee = calculateProcessingFee(amount, feePercentage);
  return amount - fee;
}

/**
 * Get daily withdrawal total
 */
export async function getDailyWithdrawalTotal(userId: string): Promise<number> {
  const history = getUserWithdrawalHistory(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return history
    .filter((w) => {
      const wDate = new Date(w.createdAt);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() === today.getTime() && w.status !== 'cancelled' && w.status !== 'failed';
    })
    .reduce((sum, w) => sum + w.amount, 0);
}

/**
 * Get weekly withdrawal total
 */
export async function getWeeklyWithdrawalTotal(userId: string): Promise<number> {
  const history = getUserWithdrawalHistory(userId);
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return history
    .filter((w) => {
      const wDate = new Date(w.createdAt);
      return wDate >= weekAgo && w.status !== 'cancelled' && w.status !== 'failed';
    })
    .reduce((sum, w) => sum + w.amount, 0);
}

/**
 * Get monthly withdrawal total
 */
export async function getMonthlyWithdrawalTotal(userId: string): Promise<number> {
  const history = getUserWithdrawalHistory(userId);
  const today = new Date();
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  return history
    .filter((w) => {
      const wDate = new Date(w.createdAt);
      return wDate >= monthAgo && w.status !== 'cancelled' && w.status !== 'failed';
    })
    .reduce((sum, w) => sum + w.amount, 0);
}

/**
 * Get withdrawal statistics for a user
 */
export async function getWithdrawalStats(userId: string) {
  const history = getUserWithdrawalHistory(userId);

  return {
    totalWithdrawals: history.length,
    totalAmount: history
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0),
    pendingAmount: history
      .filter((w) => w.status === 'pending' || w.status === 'approved' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0),
    completedCount: history.filter((w) => w.status === 'completed').length,
    failedCount: history.filter((w) => w.status === 'failed').length,
    cancelledCount: history.filter((w) => w.status === 'cancelled').length,
    dailyTotal: await getDailyWithdrawalTotal(userId),
    weeklyTotal: await getWeeklyWithdrawalTotal(userId),
    monthlyTotal: await getMonthlyWithdrawalTotal(userId),
  };
}

export default {
  createWithdrawalRequest,
  getWithdrawal,
  getUserWithdrawalHistory,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  processWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  calculateProcessingFee,
  calculateNetAmount,
  getDailyWithdrawalTotal,
  getWeeklyWithdrawalTotal,
  getMonthlyWithdrawalTotal,
  getWithdrawalStats,
};
