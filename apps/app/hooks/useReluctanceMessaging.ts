'use client';

import { useState, useCallback } from 'react';
import { Decimal } from '@prisma/client/runtime/library';

interface ReluctanceMessage {
  effectiveSellPrice: string;
  burnImpact: string;
  percentageLoss: number;
  message: string;
  educationalContent: string;
}

interface ReluctanceCheckResponse {
  success: boolean;
  reluctanceMessage: ReluctanceMessage;
  warningMessage: string | null;
  comprehensiveReport?: {
    reluctanceMessage: ReluctanceMessage;
    warningMessage: string | null;
    financialImpact: {
      burnedTokens: string;
      netTokens: string;
      burnedUSD: string;
      netUSD: string;
      percentageLoss: number;
    };
    recommendations: string[];
  };
}

interface UseReluctanceMessagingOptions {
  userId: string;
  currentTokenPrice?: number;
}

/**
 * Hook for managing reluctance messaging
 * Fetches and manages reluctance messages for token transactions
 */
export const useReluctanceMessaging = ({ userId, currentTokenPrice = 0 }: UseReluctanceMessagingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reluctanceData, setReluctanceData] = useState<ReluctanceCheckResponse | null>(null);

  /**
   * Check reluctance messaging before transaction
   */
  const checkReluctance = useCallback(
    async (
      amount: number,
      transactionType: 'COURSE_SALE' | 'EARNINGS_WITHDRAWAL' | 'TOKEN_REDEMPTION'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens/reluctance-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            transactionType,
            currentTokenPrice,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reluctance messaging');
        }

        const data: ReluctanceCheckResponse = await response.json();
        setReluctanceData(data);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Reluctance check error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTokenPrice]
  );

  /**
   * Clear reluctance data
   */
  const clearReluctanceData = useCallback(() => {
    setReluctanceData(null);
    setError(null);
  }, []);

  /**
   * Get effective price after burn
   */
  const getEffectivePrice = useCallback(() => {
    return reluctanceData?.reluctanceMessage?.effectiveSellPrice || null;
  }, [reluctanceData]);

  /**
   * Get burn impact
   */
  const getBurnImpact = useCallback(() => {
    return reluctanceData?.reluctanceMessage?.burnImpact || null;
  }, [reluctanceData]);

  /**
   * Get percentage loss
   */
  const getPercentageLoss = useCallback(() => {
    return reluctanceData?.reluctanceMessage?.percentageLoss || 0;
  }, [reluctanceData]);

  /**
   * Check if loss is significant (>2%)
   */
  const isSignificantLoss = useCallback(() => {
    return (reluctanceData?.reluctanceMessage?.percentageLoss || 0) >= 0.05;
  }, [reluctanceData]);

  /**
   * Get warning message if applicable
   */
  const getWarningMessage = useCallback(() => {
    return reluctanceData?.warningMessage || null;
  }, [reluctanceData]);

  /**
   * Get comprehensive report with financial impact
   */
  const getComprehensiveReport = useCallback(() => {
    return reluctanceData?.comprehensiveReport || null;
  }, [reluctanceData]);

  return {
    // State
    isLoading,
    error,
    reluctanceData,

    // Methods
    checkReluctance,
    clearReluctanceData,

    // Getters
    getEffectivePrice,
    getBurnImpact,
    getPercentageLoss,
    isSignificantLoss,
    getWarningMessage,
    getComprehensiveReport,
  };
};

export default useReluctanceMessaging;
