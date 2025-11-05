/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

LMS Database Service - In-Memory Implementation
Simple in-memory database for development and testing
*/

import { Course, Module, Enrollment, User, Progress, AssessmentResult } from './graphql-unified-gateway';

// In-memory database
const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to AI',
    description: 'Learn the fundamentals of Artificial Intelligence',
    instructor: {
      id: 'user-1',
      username: 'ai-teacher',
      email: 'teacher@azora.os',
      role: 'instructor',
      profile: {
        firstName: 'Dr.',
        lastName: 'AI',
        pivcScore: 1000,
        constitutionalAlignment: 0.95,
        achievements: []
      }
    },
    modules: [],
    enrollments: 42,
    pivcTarget: 100,
    constitutionalScore: 0.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const users: User[] = [
  {
    id: 'user-1',
    username: 'ai-teacher',
    email: 'teacher@azora.os',
    role: 'instructor',
    profile: {
      firstName: 'Dr.',
      lastName: 'AI',
      pivcScore: 1000,
      constitutionalAlignment: 0.95,
      achievements: []
    }
  }
];

export class LMSDatabaseService {
  /**
   * Course Operations
   */
  async getCourse(id: string): Promise<Course | null> {
    return courses.find(c => c.id === id) || null;
  }

  async getCourses(limit: number = 10, offset: number = 0): Promise<Course[]> {
    return courses.slice(offset, offset + limit);
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    // For now, return all courses
    return courses;
  }

  async getUser(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  }

  async getMentors(limit: number = 10, offset: number = 0): Promise<User[]> {
    return users.filter(u => u.role === 'instructor').slice(offset, offset + limit);
  }

  async getStudyGroups(limit: number = 10, offset: number = 0): Promise<any[]> {
    // Mock study groups
    return [];
  }

  async getProgress(userId: string, courseId: string): Promise<Progress> {
    return {
      courseId,
      completionRate: 0.5,
      pivcEarned: 50,
      currentModule: null,
      nextModule: null
    };
  }

  async getUserPortfolio(userId: string): Promise<any[]> {
    // Mock portfolio
    return [];
  }

  async getProjects(limit: number = 10, offset: number = 0): Promise<any[]> {
    // Mock projects
    return [];
  }

  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
    return {
      id: `enrollment-${Date.now()}`,
      userId,
      courseId,
      progress: 0,
      pivcEarned: 0,
      completedModules: [],
      enrolledAt: new Date().toISOString(),
      completedAt: null
    };
  }

  async unenrollCourse(userId: string, courseId: string): Promise<boolean> {
    // Mock unenrollment
    return true;
  }

  async updateProgress(userId: string, courseId: string, moduleId: string): Promise<Progress> {
    return {
      courseId,
      completionRate: 0.6,
      pivcEarned: 60,
      currentModule: null,
      nextModule: null
    };
  }

  async submitQuizAttempt(userId: string, quizId: string, responses: any[]): Promise<AssessmentResult> {
    return {
      score: 0.85,
      pivcEarned: 25,
      passed: true,
      feedback: 'Great work!'
    };
  }

  async createCourse(userId: string, input: any): Promise<Course> {
    const course: Course = {
      id: `course-${Date.now()}`,
      title: input.title,
      description: input.description,
      instructor: users[0],
      modules: [],
      enrollments: 0,
      pivcTarget: input.pivcTarget || 100,
      constitutionalScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    courses.push(course);
    return course;
  }

  async updateCourse(id: string, input: any): Promise<Course> {
    const course = courses.find(c => c.id === id);
    if (!course) throw new Error('Course not found');

    if (input.title) course.title = input.title;
    if (input.description) course.description = input.description;
    course.updatedAt = new Date().toISOString();

    return course;
  }
}

export const lmsDatabase = new LMSDatabaseService();


