import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';
import { useAuth } from './use-auth';
import { toast } from '@/components/ui/use-toast';

export function useEnroll() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error('Must be logged in to enroll');
      const response: any = await api.lms.enroll(courseId, user.id);
      return response?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Enrolled successfully!', description: 'You can now access the course.' });
    },
    onError: (error: any) => {
      toast({ title: 'Enrollment failed', description: error.message, variant: 'destructive' });
    }
  });
}
