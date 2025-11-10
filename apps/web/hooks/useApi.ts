/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

HOOKS WRAPPER - COMPATIBILITY LAYER
Provides compatibility for existing code expecting @/hooks/useApi
*/

// Re-export from @azora/shared-design for compatibility
export {
  useWalletBalance,
  useStudentProgress,
  useHealthCheck,
  useDashboardData,
  useApi,
} from '@azora/shared-design/hooks';

// Also provide the expected interface
export function useApi(userId: string | null) {
  const { useWalletBalance, useStudentProgress, useHealthCheck } = require('@azora/shared-design/hooks');
  
  return {
    useWalletBalance: () => useWalletBalance(userId),
    useStudentProgress: () => useStudentProgress(userId),
    useHealthCheck: () => useHealthCheck(),
  };
}

export default {
  useWalletBalance,
  useStudentProgress,
  useHealthCheck,
  useDashboardData,
  useApi,
};
