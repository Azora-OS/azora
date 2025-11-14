import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';
import { useAuth } from './use-auth';

export function useWallet() {
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wallet = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response: any = await api.mint.getWallet(user?.id);
      return response?.data;
    },
    enabled: !!user?.id,
  });

  const startMining = useMutation({
    mutationFn: async () => {
      const response: any = await api.mint.startMining(user?.id);
      return response?.data;
    },
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
