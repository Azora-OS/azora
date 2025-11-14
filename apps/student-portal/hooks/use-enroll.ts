import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';

export function useEnroll() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const studentId = localStorage.getItem('studentId') || 'demo-student';
      return await api.lms.enroll(courseId, studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
