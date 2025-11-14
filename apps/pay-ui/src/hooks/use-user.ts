import { useQuery } from '@tanstack/react-query';
import { useApi } from './use-api';

export function useUser() {
  const api = useApi();

  const getUser = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.getProfile(),
  });

  return { ...getUser };
}
