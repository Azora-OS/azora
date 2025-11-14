import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await api.education.getCourses();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const enrollInCourse = async (courseId: string, userId: string) => {
    try {
      const result = await api.education.enroll(courseId, userId);
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return { courses, loading, error, enrollInCourse };
};

export const useProgress = (studentId: string) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await api.education.getProgress(studentId);
        setProgress(data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchProgress();
  }, [studentId]);

  return { progress, loading };
};
