import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export function useEnroll() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => api.lms.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
