/**
 * Token Burn System - Type Definitions
 * Interfaces for burn calculations and blockchain interactions
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Burn transaction types
 */
export enum BurnTransactionType {
  COURSE_SALE = 'COURSE_SALE',
  EARNINGS_WITHDRAWAL = 'EARNINGS_WITHDRAWAL',
  TOKEN_REDEMPTION = 'TOKEN_REDEMPTION',
}

/**
 * Blockchain transaction status
 */
export enum BlockchainStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

/**
 * Burn rate configuration
 */
export interface BurnRateConfig {
  courseSale: number; // 0.05 for 5%
  earningsWithdrawal: number; // 0.03 for 3%
  tokenRedemption: number; // 0.02 for 2%
}

/**
 * Burn calculation result
 */
export interface BurnCalculation {
  originalAmount: Decimal;
  burnRate: number;
  burnedAmount: Decimal;
  netAmount: Decimal;
}

/**
 * Burn transaction record
 */
export interface BurnTransactionRecord {
  id: string;
  userId: string;
  amount: Decimal;
  burnRate: number;
  burnedAmount: Decimal;
  transactionType: BurnTransactionType;
  reason: string;
  blockchainTxHash?: string;
  blockchainStatus: BlockchainStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Token supply tracking
 */
export interface TokenSupplyData {
  id: string;
  totalSupply: Decimal;
  circulatingSupply: Decimal;
  burnedSupply: Decimal;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Proof of Knowledge record
 */
export interface ProofOfKnowledgeRecord {
  id: string;
  userId: string;
  courseId: string;
  completionDate: Date;
  certificateId: string;
  verificationHash: string;
  expiryDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blockchain burn execution request
 */
export interface BlockchainBurnRequest {
  userId: string;
  burnAmount: Decimal;
  transactionType: BurnTransactionType;
  reason: string;
  metadata?: Record<string, any>;
}

/**
 * Blockchain burn execution result
 */
export interface BlockchainBurnResult {
  success: boolean;
  transactionHash?: string;
  status: BlockchainStatus;
  error?: string;
  timestamp: Date;
}

/**
 * Burn history query result
 */
export interface BurnHistoryResult {
  transactions: BurnTransactionRecord[];
  total: number;
  page: number;
  limit: number;
  totalBurned: Decimal;
}

/**
 * Burn statistics
 */
export interface BurnStatistics {
  totalBurned: Decimal;
  burnsByType: {
    courseSale: Decimal;
    earningsWithdrawal: Decimal;
    tokenRedemption: Decimal;
  };
  averageBurnPerTransaction: Decimal;
  transactionCount: number;
  successRate: number; // 0-1
}

/**
 * System buy-order configuration
 */
export interface SystemBuyOrderConfig {
  revenuePercentage: number; // 0.10 for 10%
  executionSchedule: 'daily' | 'weekly' | 'monthly';
  minBuyAmount: Decimal;
  maxBuyAmount: Decimal;
}

/**
 * System buy-order execution result
 */
export interface SystemBuyOrderResult {
  success: boolean;
  tokensAcquired: Decimal;
  randSpent: Decimal;
  executionTime: Date;
  transactionHash?: string;
  error?: string;
}

/**
 * Revenue tracking record
 */
export interface RevenueTrackingRecord {
  id: string;
  source: 'course_sale' | 'subscription' | 'other';
  amount: Decimal;
  currency: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * System buy-order history record
 */
export interface SystemBuyOrderHistoryRecord {
  id: string;
  revenueUsed: Decimal;
  tokensAcquired: Decimal;
  pricePerToken: Decimal;
  executionTime: Date;
  blockchainTxHash?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * System buy-order metrics
 */
export interface SystemBuyOrderMetrics {
  totalRevenueTracked: Decimal;
  totalTokensAcquired: Decimal;
  totalRandSpent: Decimal;
  averagePricePerToken: Decimal;
  executionCount: number;
  successRate: number; // 0-1
  lastExecutionTime?: Date;
}

/**
 * Leaderboard ranking update
 */
export interface LeaderboardRankingUpdate {
  userId: string;
  ownershipPercentage: number;
  rank: number;
  previousRank?: number;
  totalSupply: Decimal;
  userTokens: Decimal;
}

/**
 * Psychological reluctance messaging
 */
export interface ReluctanceMessage {
  effectiveSellPrice: Decimal;
  burnImpact: Decimal;
  percentageLoss: number;
  message: string;
  educationalContent: string;
}

/**
 * Burn validation result
 */
export interface BurnValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Burn transaction filter options
 */
export interface BurnTransactionFilter {
  userId?: string;
  transactionType?: BurnTransactionType;
  blockchainStatus?: BlockchainStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
