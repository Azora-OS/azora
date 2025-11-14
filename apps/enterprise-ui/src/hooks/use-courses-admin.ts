import { useQuery, useMutation, useQueryClient } from '@tantml:query';
import { useApi } from '../lib/api-provider';

export function useCoursesAdmin() {
  const api = useApi();

  return useQuery({
    queryKey: ['courses-admin'],
    queryFn: async () => {
      const response: any = await api.lms.getCourses();
      return response?.data || [];
    }
  });
}

export function useCreateCourse() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: any) => {
      const response: any = await api.courses.create(courseData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-admin'] });
    }
  });
}

export function useUpdateCourse() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response: any = await api.request(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-admin'] });
    }
  });
}
