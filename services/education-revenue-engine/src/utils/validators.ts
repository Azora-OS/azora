import { Course, Enrollment, Assessment } from '../types';

/**
 * Validation error class for structured error handling
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates course data
 */
export function validateCourse(data: Partial<Course>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push(new ValidationError('title', 'Course title is required', 'COURSE_TITLE_REQUIRED'));
  }

  if (data.title && data.title.length > 255) {
    errors.push(new ValidationError('title', 'Course title must not exceed 255 characters', 'COURSE_TITLE_TOO_LONG'));
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push(new ValidationError('description', 'Course description is required', 'COURSE_DESCRIPTION_REQUIRED'));
  }

  if (data.description && data.description.length < 10) {
    errors.push(new ValidationError('description', 'Course description must be at least 10 characters', 'COURSE_DESCRIPTION_TOO_SHORT'));
  }

  if (!data.instructorId || data.instructorId.trim().length === 0) {
    errors.push(new ValidationError('instructorId', 'Instructor ID is required', 'INSTRUCTOR_ID_REQUIRED'));
  }

  if (!data.tier || !['free', 'premium', 'pro'].includes(data.tier)) {
    errors.push(new ValidationError('tier', 'Course tier must be one of: free, premium, pro', 'INVALID_TIER'));
  }

  if (data.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(data.language)) {
    errors.push(new ValidationError('language', 'Invalid language code format', 'INVALID_LANGUAGE_CODE'));
  }

  if (data.prerequisites && !Array.isArray(data.prerequisites)) {
    errors.push(new ValidationError('prerequisites', 'Prerequisites must be an array', 'INVALID_PREREQUISITES_FORMAT'));
  }

  return errors;
}

/**
 * Validates enrollment data
 */
export function validateEnrollment(data: Partial<Enrollment>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.studentId || data.studentId.trim().length === 0) {
    errors.push(new ValidationError('studentId', 'Student ID is required', 'STUDENT_ID_REQUIRED'));
  }

  if (!data.courseId || data.courseId.trim().length === 0) {
    errors.push(new ValidationError('courseId', 'Course ID is required', 'COURSE_ID_REQUIRED'));
  }

  if (!data.tier || !['free', 'premium', 'pro'].includes(data.tier)) {
    errors.push(new ValidationError('tier', 'Enrollment tier must be one of: free, premium, pro', 'INVALID_TIER'));
  }

  if (data.status && !['active', 'completed', 'dropped'].includes(data.status)) {
    errors.push(new ValidationError('status', 'Enrollment status must be one of: active, completed, dropped', 'INVALID_STATUS'));
  }

  if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
    errors.push(new ValidationError('progress', 'Progress must be between 0 and 100', 'INVALID_PROGRESS'));
  }

  return errors;
}

/**
 * Validates assessment response data
 */
export function validateAssessmentResponse(data: {
  assessmentId?: string;
  enrollmentId?: string;
  responses?: Record<string, any>;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.assessmentId || data.assessmentId.trim().length === 0) {
    errors.push(new ValidationError('assessmentId', 'Assessment ID is required', 'ASSESSMENT_ID_REQUIRED'));
  }

  if (!data.enrollmentId || data.enrollmentId.trim().length === 0) {
    errors.push(new ValidationError('enrollmentId', 'Enrollment ID is required', 'ENROLLMENT_ID_REQUIRED'));
  }

  if (!data.responses || typeof data.responses !== 'object' || Object.keys(data.responses).length === 0) {
    errors.push(new ValidationError('responses', 'Assessment responses are required and must not be empty', 'RESPONSES_REQUIRED'));
  }

  return errors;
}

/**
 * Validates assessment data
 */
export function validateAssessment(data: Partial<Assessment>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push(new ValidationError('title', 'Assessment title is required', 'ASSESSMENT_TITLE_REQUIRED'));
  }

  if (!data.courseId || data.courseId.trim().length === 0) {
    errors.push(new ValidationError('courseId', 'Course ID is required', 'COURSE_ID_REQUIRED'));
  }

  if (!data.moduleId || data.moduleId.trim().length === 0) {
    errors.push(new ValidationError('moduleId', 'Module ID is required', 'MODULE_ID_REQUIRED'));
  }

  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push(new ValidationError('questions', 'Assessment must have at least one question', 'QUESTIONS_REQUIRED'));
  }

  if (data.passingScore !== undefined && (data.passingScore < 0 || data.passingScore > 100)) {
    errors.push(new ValidationError('passingScore', 'Passing score must be between 0 and 100', 'INVALID_PASSING_SCORE'));
  }

  return errors;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates UUID format
 */
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[a-z0-9]+$/i;
  return uuidRegex.test(id) && id.length > 0;
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(page?: number, pageSize?: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    errors.push(new ValidationError('page', 'Page must be a positive integer', 'INVALID_PAGE'));
  }

  if (pageSize !== undefined && (pageSize < 1 || pageSize > 100 || !Number.isInteger(pageSize))) {
    errors.push(new ValidationError('pageSize', 'Page size must be between 1 and 100', 'INVALID_PAGE_SIZE'));
  }

  return errors;
}
