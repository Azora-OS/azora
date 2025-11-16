'use client';

import React, { useState } from 'react';
import { ReluctanceModal } from './reluctance-modal';
import { useReluctanceMessaging } from '@/hooks/useReluctanceMessaging';

interface WithdrawWithReluctanceProps {
  userId: string;
  userBalance: number;
  currentTokenPrice?: number;
  onWithdrawSuccess?: () => void;
}

/**
 * Example: Withdraw Component with Reluctance Messaging
 * Shows how to integrate reluctance messaging into a withdrawal flow
 */
export const WithdrawWithReluctance: React.FC<WithdrawWithReluctanceProps> = ({
  userId,
  userBalance,
  currentTokenPrice = 0,
  onWithdrawSuccess,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [showReluctanceModal, setShowReluctanceModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { checkReluctance, reluctanceData, isLoading: isCheckingReluctance } = useReluctanceMessaging({
    userId,
    currentTokenPrice,
  });

  /**
   * Handle withdraw button click
   * First checks reluctance messaging before proceeding
   */
  const handleWithdrawClick = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    // Check reluctance messaging
    const result = await checkReluctance(withdrawAmount, 'EARNINGS_WITHDRAWAL');

    if (result) {
      setShowReluctanceModal(true);
    }
  };

  /**
   * Handle confirmed withdrawal
   */
  const handleConfirmWithdraw = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/tokens/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          includeReluctanceMessage: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Withdrawal failed');
      }

      const data = await response.json();

      // Success
      setShowReluctanceModal(false);
      setWithdrawAmount(0);
      onWithdrawSuccess?.();

      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Withdrawal Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Withdraw Earnings</h3>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AZR)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              placeholder="Enter amount"
              max={userBalance}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {userBalance} AZR
            </p>
          </div>

          {/* Burn Impact Preview */}
          {withdrawAmount > 0 && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Burn Impact:</span> 3% of your withdrawal will be burned
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">You'll receive:</span> ~{(withdrawAmount * 0.97).toFixed(2)} AZR
              </p>
            </div>
          )}

          {/* Withdraw Button */}
          <button
            onClick={handleWithdrawClick}
            disabled={isCheckingReluctance || !withdrawAmount || withdrawAmount <= 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isCheckingReluctance ? 'Checking...' : 'Proceed to Withdraw'}
          </button>
        </div>
      </div>

      {/* Reluctance Modal */}
      <ReluctanceModal
        isOpen={showReluctanceModal}
        amount={withdrawAmount}
        transactionType="EARNINGS_WITHDRAWAL"
        reluctanceMessage={reluctanceData?.reluctanceMessage || null}
        warningMessage={reluctanceData?.warningMessage || null}
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setShowReluctanceModal(false)}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default WithdrawWithReluctance;
