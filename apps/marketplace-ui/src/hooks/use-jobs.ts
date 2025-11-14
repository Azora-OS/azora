import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.marketplace.getJobs(),
  });
}

export function useJobApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, userId, coverLetter }: { jobId: string; userId: string; coverLetter?: string }) =>
      api.marketplace.applyToJob(jobId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useSkillsAssessment() {
  return useMutation({
    mutationFn: ({ userId, skills }: { userId: string; skills: any[] }) =>
      api.jobs.match({ userSkills: skills }),
  });
}