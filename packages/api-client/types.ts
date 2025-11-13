/**
 * TypeScript types for Azora API Client
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolled: number;
  rating: number;
  price: number;
  currency: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: Date;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  type: 'quiz' | 'test' | 'exam';
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
  correct: string | number;
}

export interface Grade {
  assessmentId: string;
  score: number;
  percentage: number;
  passed: boolean;
  date: Date;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  address: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: { min: number; max: number; currency: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
