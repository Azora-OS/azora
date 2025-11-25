/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Input Validation Schemas
 * 
 * Validation schemas for education services
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class Validator {
  /**
   * Validate email
   */
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(email);
    return {
      valid,
      errors: valid ? [] : ['Invalid email format'],
    };
  }

  /**
   * Validate student number
   */
  static validateStudentNumber(studentNumber: string): ValidationResult {
    const valid = /^[A-Z]{3}\d{4}\d{4}$/.test(studentNumber); // e.g., ASU2025001234
    return {
      valid,
      errors: valid ? [] : ['Invalid student number format. Expected format: XXXYYYYNNNN'],
    };
  }

  /**
   * Validate assessment submission
   */
  static validateSubmission(data: {
    assessmentId: string;
    studentId: string;
    answers: Array<{ questionId: string; answer: any }>;
  }): ValidationResult {
    const errors: string[] = [];

    if (!data.assessmentId || typeof data.assessmentId !== 'string') {
      errors.push('Assessment ID is required');
    }

    if (!data.studentId || typeof data.studentId !== 'string') {
      errors.push('Student ID is required');
    }

    if (!Array.isArray(data.answers) || data.answers.length === 0) {
      errors.push('At least one answer is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate course creation
   */
  static validateCourse(data: {
    title: string;
    code: string;
    instructorId: string;
    credits: number;
  }): ValidationResult {
    const errors: string[] = [];

    if (!data.title || data.title.length < 3) {
      errors.push('Course title must be at least 3 characters');
    }

    if (!data.code || !/^[A-Z]{2,4}\d{3}$/.test(data.code)) {
      errors.push('Course code must be in format: XXX### (e.g., CS101)');
    }

    if (!data.instructorId) {
      errors.push('Instructor ID is required');
    }

    if (typeof data.credits !== 'number' || data.credits < 0 || data.credits > 20) {
      errors.push('Credits must be between 0 and 20');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate payment
   */
  static validatePayment(data: {
    studentId: string;
    courseId: string;
    amount: number;
    paymentMethod: string;
  }): ValidationResult {
    const errors: string[] = [];

    if (!data.studentId) {
      errors.push('Student ID is required');
    }

    if (!data.courseId) {
      errors.push('Course ID is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    const validMethods = ['credit-card', 'azr-tokens', 'bank-transfer', 'scholarship'];
    if (!validMethods.includes(data.paymentMethod)) {
      errors.push(`Payment method must be one of: ${validMethods.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate UUID
   */
  static validateUUID(uuid: string): ValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const valid = uuidRegex.test(uuid);
    return {
      valid,
      errors: valid ? [] : ['Invalid UUID format'],
    };
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: Date, endDate: Date): ValidationResult {
    const errors: string[] = [];

    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    if (startDate < new Date()) {
      errors.push('Start date cannot be in the past');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
