import { useEffect, useState } from 'react';
import { OfflineSyncService, setupNetworkListener } from '../services/offlineSync';

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update pending count on mount
    updatePendingCount();

    // Set up network listener for auto-sync
    const unsubscribe = setupNetworkListener(async () => {
      setIsSyncing(true);
      await updatePendingCount();
      setIsSyncing(false);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const updatePendingCount = async () => {
    const count = await OfflineSyncService.getPendingCount();
    setPendingCount(count);
  };

  const manualSync = async () => {
    setIsSyncing(true);
    try {
      await OfflineSyncService.syncAll();
      await updatePendingCount();
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    pendingCount,
    isSyncing,
    manualSync,
    updatePendingCount,
  };
}
