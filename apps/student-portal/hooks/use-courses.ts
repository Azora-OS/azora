"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/components/providers";

export function useCourses() {
  const api = useApi();
  
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.lms.getCourses(),
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