/**
 * Test Data Fixtures for E2E Tests
 * 
 * Provides consistent test data for E2E test scenarios
 */

export const testUsers = {
  student: {
    firstName: 'Test',
    lastName: 'Student',
    email: `student-${Date.now()}@test.azora`,
    password: 'SecureTest123!@#',
  },
  instructor: {
    firstName: 'Test',
    lastName: 'Instructor',
    email: `instructor-${Date.now()}@test.azora`,
    password: 'SecureTest123!@#',
  },
  admin: {
    firstName: 'Test',
    lastName: 'Admin',
    email: `admin-${Date.now()}@test.azora`,
    password: 'SecureTest123!@#',
  },
};

export const testCourses = {
  python: {
    title: 'Python Programming Basics',
    description: 'Learn Python from scratch',
    category: 'Technology',
    level: 'Beginner',
    price: 49.99,
  },
  javascript: {
    title: 'JavaScript Fundamentals',
    description: 'Master JavaScript essentials',
    category: 'Technology',
    level: 'Beginner',
    price: 39.99,
  },
  business: {
    title: 'Business Fundamentals',
    description: 'Core business concepts',
    category: 'Business',
    level: 'Intermediate',
    price: 59.99,
  },
};

export const testPayments = {
  validCard: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
  },
  invalidCard: {
    number: '4000000000000002',
    expiry: '12/25',
    cvc: '123',
  },
};

export const testBankAccounts = {
  primary: {
    accountNumber: '1234567890',
    routingNumber: '021000021',
    accountType: 'checking',
  },
  secondary: {
    accountNumber: '0987654321',
    routingNumber: '021000021',
    accountType: 'savings',
  },
};

export const testWithdrawals = {
  small: {
    amount: 50,
    method: 'bank_transfer',
  },
  medium: {
    amount: 500,
    method: 'bank_transfer',
  },
  large: {
    amount: 5000,
    method: 'bank_transfer',
  },
};

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.azora`;
}

/**
 * Generate unique test username
 */
export function generateTestUsername(prefix: string = 'user'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Get test user by role
 */
export function getTestUser(role: 'student' | 'instructor' | 'admin' = 'student') {
  return {
    ...testUsers[role],
    email: generateTestEmail(role),
  };
}

/**
 * Get test course by type
 */
export function getTestCourse(type: 'python' | 'javascript' | 'business' = 'python') {
  return testCourses[type];
}
