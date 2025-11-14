import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';
import { useAuth } from './use-auth';

export function useTransactions() {
  const api = useApi();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const response: any = await api.mint.getTransactions(user?.id);
      return response?.data || [];
    },
    enabled: !!user?.id,
  });
}
