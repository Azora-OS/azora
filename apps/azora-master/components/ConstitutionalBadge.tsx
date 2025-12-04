import React from 'react';
import { DIVINE_LAW_PRINCIPLES } from '@azora/shared-ai';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConstitutionalBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
  score?: number;
}

export const ConstitutionalBadge: React.FC<ConstitutionalBadgeProps> = ({ status, score }) => {
  const colors = {
    approved: 'bg-green-900/20 text-green-400 border-green-900/50',
    pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50',
    rejected: 'bg-red-900/20 text-red-400 border-red-900/50'
  };

  const icons = {
    approved: CheckCircle,
    pending: Shield,
    rejected: AlertTriangle
  };

  const Icon = icons[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colors[status]} text-sm font-medium`}>
      <Icon className="w-4 h-4" />
      <span>Divine Law: {status.toUpperCase()}</span>
      {score !== undefined && (
        <span className="ml-1 text-xs opacity-75">({(score * 100).toFixed(0)}%)</span>
      )}
    </div>
  );
};
