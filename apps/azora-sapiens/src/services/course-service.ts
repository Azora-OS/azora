import { ApiClient } from './api-client';

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    instructor: string;
    duration: string;
}

export interface EnrollmentResponse {
    success: boolean;
    enrollmentId: string;
    message: string;
}

export interface CourseProgress {
    courseId: string;
    progress: number; // 0-100
    completedLessons: string[];
    totalLessons: number;
    lastAccessed: string;
}

export class CourseService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = new ApiClient();
    }

    async enrollInCourse(courseId: string, paymentMethod: string = 'azr'): Promise<EnrollmentResponse> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ paymentMethod })
            });

            if (!response.ok) {
                throw new Error('Enrollment failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Enrollment error:', error);
            return {
                success: false,
                enrollmentId: '',
                message: 'Failed to enroll in course'
            };
        }
    }

    async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/courses/${courseId}/progress`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Progress fetch error:', error);
            return null;
        }
    }

    async getEnrolledCourses(): Promise<Course[]> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/courses/enrolled`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Enrolled courses fetch error:', error);
            return [];
        }
    }

    async updateProgress(courseId: string, lessonId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ lessonId, completed: true })
            });

            return response.ok;
        } catch (error) {
            console.error('Progress update error:', error);
            return false;
        }
    }
}
