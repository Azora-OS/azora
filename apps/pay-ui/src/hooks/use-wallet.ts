import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';

export function useWallet() {
  const api = useApi();

  const getWallet = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.mint.getWallet(),
  });

  return { ...getWallet };
}
