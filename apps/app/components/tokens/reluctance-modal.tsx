'use client';

import React, { useState } from 'react';
import { Decimal } from '@prisma/client/runtime/library';
import { AlertCircle, TrendingDown, BookOpen } from 'lucide-react';

interface ReluctanceMessage {
  effectiveSellPrice: string;
  burnImpact: string;
  percentageLoss: number;
  message: string;
  educationalContent: string;
}

interface ReluctanceModalProps {
  isOpen: boolean;
  amount: number;
  transactionType: 'COURSE_SALE' | 'EARNINGS_WITHDRAWAL' | 'TOKEN_REDEMPTION';
  reluctanceMessage: ReluctanceMessage | null;
  warningMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Reluctance Modal Component
 * Displays psychological messaging to discourage token sales
 * Shows burn impact, effective price, and educational content
 */
export const ReluctanceModal: React.FC<ReluctanceModalProps> = ({
  isOpen,
  amount,
  transactionType,
  reluctanceMessage,
  warningMessage,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [showEducation, setShowEducation] = useState(false);

  if (!isOpen || !reluctanceMessage) {
    return null;
  }

  const percentageLoss = (reluctanceMessage.percentageLoss * 100).toFixed(1);
  const isSignificantLoss = reluctanceMessage.percentageLoss >= 0.05;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${isSignificantLoss ? 'bg-red-50 border-b-2 border-red-200' : 'bg-blue-50 border-b-2 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            {isSignificantLoss ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-blue-600" />
            )}
            <h2 className={`text-lg font-bold ${isSignificantLoss ? 'text-red-900' : 'text-blue-900'}`}>
              {isSignificantLoss ? 'Significant Loss Warning' : 'Transaction Impact'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Warning Message */}
          {warningMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm text-red-800" dangerouslySetInnerHTML={{ __html: warningMessage }} />
            </div>
          )}

          {/* Burn Impact Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">BURN IMPACT</p>
              <p className="text-lg font-bold text-red-600">{percentageLoss}%</p>
              <p className="text-xs text-gray-500">{reluctanceMessage.burnImpact} tokens</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 font-semibold">YOU'LL RECEIVE</p>
              <p className="text-lg font-bold text-green-600">{reluctanceMessage.effectiveSellPrice}</p>
              <p className="text-xs text-gray-500">tokens</p>
            </div>
          </div>

          {/* Main Message */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <div
              className="text-sm text-gray-700 space-y-2"
              dangerouslySetInnerHTML={{ __html: reluctanceMessage.message }}
            />
          </div>

          {/* Educational Content Toggle */}
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Learn about token economics</span>
            </div>
            <span className="text-gray-400">{showEducation ? '−' : '+'}</span>
          </button>

          {/* Educational Content */}
          {showEducation && (
            <div className="bg-amber-50 p-4 rounded border border-amber-200">
              <div
                className="text-sm text-gray-700 space-y-2"
                dangerouslySetInnerHTML={{ __html: reluctanceMessage.educationalContent }}
              />
            </div>
          )}

          {/* Transaction Details */}
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
            <p>
              <span className="font-semibold">Transaction Type:</span> {transactionType.replace(/_/g, ' ')}
            </p>
            <p>
              <span className="font-semibold">Original Amount:</span> {amount} tokens
            </p>
            <p>
              <span className="font-semibold">Burn Rate:</span>{' '}
              {transactionType === 'COURSE_SALE'
                ? '5%'
                : transactionType === 'EARNINGS_WITHDRAWAL'
                  ? '3%'
                  : '2%'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isSignificantLoss
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Proceed with Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReluctanceModal;
