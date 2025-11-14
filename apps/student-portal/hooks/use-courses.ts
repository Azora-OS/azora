"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api-provider";

export function useCourses() {
  const api = useApi();
  
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response: any = await api.lms.getCourses();
      return response?.data || [];
    },
  });
}

export function useCourse(id: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response: any = await api.lms.getCourse(id);
      return response?.data;
    },
    enabled: !!id,
  });
}