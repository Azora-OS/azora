import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';
import { useAuth } from './use-auth';

export function useWallet() {
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wallet = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => api.mint.getWallet(user?.id),
    enabled: !!user?.id,
  });

  const startMining = useMutation({
    mutationFn: () => api.mint.startMining(user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
    },
  });

  return {
    wallet: wallet.data,
    isLoading: wallet.isLoading,
    error: wallet.error,
    startMining,
  };
}
