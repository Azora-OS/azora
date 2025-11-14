"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api-provider";

export function useCourses() {
  const api = useApi();
  
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.lms.getCourses();
      return response.success ? response.courses : [];
    },
  });
}

export function useCourse(id: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => api.lms.getCourse(id),
    enabled: !!id,
  });
}