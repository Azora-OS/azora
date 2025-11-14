import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';

export function useTutoring(sessionId: string | null) {
  const api = useApi();

  const startSession = useMutation({
    mutationFn: (data: { studentId: string; subject: string; }) => 
      api.sapiens.startTutoring(data.studentId, data.subject),
  });

  const postMessage = useMutation({
    mutationFn: (data: { sessionId: string; message: string; }) => 
      api.sapiens.postMessage(data.sessionId, data.message),
  });

  const getHistory = useQuery({
    queryKey: ['tutoring', sessionId],
    queryFn: () => api.sapiens.getHistory(sessionId!),
    enabled: !!sessionId,
  });

  return { startSession, postMessage, getHistory };
}
