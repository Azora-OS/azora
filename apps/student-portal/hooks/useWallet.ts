import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const useWallet = (userId: string) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await api.mint.getWallet(userId);
      setWallet(data);
    } catch (err: any) {
      if (err.message.includes('404')) {
        const newWallet = await api.mint.createWallet(userId);
        setWallet(newWallet);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchWallet();
  }, [userId]);

  const startMining = async (activity: string) => {
    try {
      const result = await api.mint.startMining(userId, activity);
      await fetchWallet();
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return { wallet, loading, error, startMining, refresh: fetchWallet };
};
