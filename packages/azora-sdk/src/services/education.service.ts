import { AxiosInstance } from 'axios';
import { ApiResponse, Course, EnrollmentResponse, Progress } from '../types';

export class EducationService {
  constructor(private axios: AxiosInstance) {}

  async getCourses(filters?: { 
    difficulty?: string; 
    topic?: string; 
    limit?: number 
  }): Promise<ApiResponse<Course[]>> {
    try {
      const response = await this.axios.get('/courses', { params: filters });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getCourse(courseId: string): Promise<ApiResponse<Course>> {
    try {
      const response = await this.axios.get(`/courses/${courseId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async enrollInCourse(courseId: string, userId: string): Promise<EnrollmentResponse> {
    try {
      const response = await this.axios.post(`/courses/${courseId}/enroll`, { userId });
      return { 
        success: true, 
        enrollmentId: response.data.enrollmentId,
        courseId,
        userId,
        startDate: response.data.startDate
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getProgress(userId: string, courseId: string): Promise<ApiResponse<Progress>> {
    try {
      const response = await this.axios.get(`/progress/${userId}/${courseId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async updateProgress(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<ApiResponse<Progress>> {
    try {
      const response = await this.axios.post(`/progress/${userId}/${courseId}`, { lessonId });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getEnrollments(userId: string): Promise<ApiResponse<Course[]>> {
    try {
      const response = await this.axios.get(`/users/${userId}/enrollments`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async createCourse(course: Omit<Course, 'id'>): Promise<ApiResponse<Course>> {
    try {
      const response = await this.axios.post('/courses', course);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
}
