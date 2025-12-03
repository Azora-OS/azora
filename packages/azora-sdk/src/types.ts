export interface AzoraConfig {
  apiKey: string;
  environment?: 'development' | 'staging' | 'production';
  baseURL?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  };
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'educator' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  price: number;
  currency: string;
  topics?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  enrollmentCount?: number;
}

export interface EnrollmentResponse {
  success: boolean;
  enrollmentId?: string;
  courseId?: string;
  userId?: string;
  startDate?: string;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface SafetyIncident {
  id: string;
  type: 'crime' | 'accident' | 'emergency';
  severity: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  timestamp: string;
  reportedBy?: string;
  status?: 'open' | 'investigating' | 'resolved';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  tokens?: {
    AZR: number;
    [key: string]: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  timestamp: string;
}
