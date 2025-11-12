/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { ApiResponse } from './api-client';

// Mock data for when APIs are unavailable
// All apps can run with this data immediately

export interface MockComplianceData {
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
  metrics: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    lastUpdated: string;
  };
  reports: Array<{
    id: string;
    title: string;
    status: 'completed' | 'pending' | 'failed';
    generatedAt: string;
  }>;
}

export interface MockLearningData {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    enrolled: number;
    rating: number;
    thumbnail?: string;
  }>;
  progress: {
    overallProgress: number;
    weeklyProgress: number;
    monthlyProgress: number;
    completedCourses: number;
    totalCourses: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
  }>;
}

export interface MockPaymentData {
  balance: number;
  transactions: Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
  wallet: {
    address: string;
    balance: number;
    currency: string;
  };
}

export interface MockMarketplaceData {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    seller: string;
    rating: number;
    image?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface MockAnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    growth: number;
  };
  charts: {
    userGrowth: Array<{ date: string; users: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
}

export interface MockAuthData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  session: {
    token: string;
    expiresAt: string;
  };
}

// Mock data store
export const mockData = {
  compliance: {
    dashboard: (): MockComplianceData => ({
      alerts: [
        {
          id: '1',
          type: 'info',
          message: 'System running in demo mode - no APIs configured',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'warning',
          message: 'Configure API endpoints in Settings to enable real data',
          timestamp: new Date().toISOString()
        }
      ],
      metrics: {
        totalChecks: 25,
        passedChecks: 23,
        failedChecks: 2,
        lastUpdated: new Date().toISOString()
      },
      reports: [
        {
          id: '1',
          title: 'Monthly Compliance Report',
          status: 'completed',
          generatedAt: new Date().toISOString()
        }
      ]
    })
  },

  learning: {
    courses: (): MockLearningData['courses'] => [
      {
        id: '1',
        title: 'Introduction to Azora OS',
        description: 'Learn the fundamentals of the Azora Operating System',
        instructor: 'Azora Team',
        duration: '2 hours',
        enrolled: 1250,
        rating: 4.8
      },
      {
        id: '2',
        title: 'Advanced API Integration',
        description: 'Master API integration patterns in Azora',
        instructor: 'Dev Team',
        duration: '4 hours',
        enrolled: 890,
        rating: 4.9
      },
      {
        id: '3',
        title: 'Payment Systems Architecture',
        description: 'Understanding payment processing in distributed systems',
        instructor: 'Finance Team',
        duration: '3 hours',
        enrolled: 650,
        rating: 4.7
      }
    ],
    progress: (): MockLearningData['progress'] => ({
      overallProgress: 65,
      weeklyProgress: 15,
      monthlyProgress: 45,
      completedCourses: 2,
      totalCourses: 5
    }),
    achievements: (): MockLearningData['achievements'] => [
      {
        id: '1',
        title: 'First Steps',
        description: 'Completed your first course',
        earnedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },

  payments: {
    balance: (): number => 1250.50,
    transactions: (): MockPaymentData['transactions'] => [
      {
        id: '1',
        type: 'credit',
        amount: 500,
        description: 'Course completion bonus',
        date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'debit',
        amount: 50,
        description: 'Premium subscription',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      }
    ],
    wallet: (): MockPaymentData['wallet'] => ({
      address: 'azora_demo_wallet_123',
      balance: 1250.50,
      currency: 'ZAR'
    })
  },

  marketplace: {
    products: (): MockMarketplaceData['products'] => [
      {
        id: '1',
        name: 'Azora Development Kit',
        description: 'Complete toolkit for Azora OS development',
        price: 299,
        currency: 'ZAR',
        category: 'Development',
        seller: 'Azora Store',
        rating: 4.9
      },
      {
        id: '2',
        name: 'API Integration Course',
        description: 'Learn to integrate with Azora APIs',
        price: 149,
        currency: 'ZAR',
        category: 'Education',
        seller: 'Azora Academy',
        rating: 4.8
      }
    ],
    categories: (): MockMarketplaceData['categories'] => [
      { id: '1', name: 'Development', count: 15 },
      { id: '2', name: 'Education', count: 8 },
      { id: '3', name: 'Services', count: 12 }
    ]
  },

  analytics: {
    overview: (): MockAnalyticsData['overview'] => ({
      totalUsers: 15420,
      activeUsers: 8920,
      revenue: 125000,
      growth: 12.5
    }),
    charts: (): MockAnalyticsData['charts'] => ({
      userGrowth: [
        { date: '2025-10-01', users: 12000 },
        { date: '2025-11-01', users: 15420 }
      ],
      revenue: [
        { date: '2025-10-01', amount: 100000 },
        { date: '2025-11-01', amount: 125000 }
      ]
    })
  },

  auth: {
    user: (): MockAuthData['user'] => ({
      id: 'demo_user_123',
      email: 'demo@azora.os',
      name: 'Demo User',
      role: 'user'
    }),
    session: (): MockAuthData['session'] => ({
      token: 'demo_token_123',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    })
  }
};

// Helper function to get mock data for any endpoint
export function getMockData(service: string, endpoint: string): any {
  const serviceData = mockData[service as keyof typeof mockData];
  if (!serviceData) return null;

  if (typeof serviceData === 'object' && endpoint in serviceData) {
    const endpointValue = serviceData[endpoint as keyof typeof serviceData];
    return typeof endpointValue === 'function' ? (endpointValue as any)() : endpointValue;
  }

  return null;
}

// Helper to simulate API response format
export function createMockApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

// Helper to simulate API error response
export function createMockApiError(message: string): ApiResponse<any> {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
}
