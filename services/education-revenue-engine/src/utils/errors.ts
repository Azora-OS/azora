/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string, code: string = 'BAD_REQUEST', details?: Record<string, any>) {
    super(400, code, message, details);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(401, code, message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Authorization error - 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    super(403, code, message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(409, code, message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Internal server error - 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code: string = 'INTERNAL_SERVER_ERROR') {
    super(500, code, message);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Service unavailable error - 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(503, 'SERVICE_UNAVAILABLE', `${service} is currently unavailable`);
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Business logic error - 422 Unprocessable Entity
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR', details?: Record<string, any>) {
    super(422, code, message, details);
    this.name = 'BusinessLogicError';
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * Tier access error - 403 Forbidden
 */
export class TierAccessError extends AppError {
  constructor(requiredTier: string, userTier: string) {
    const message = `This feature requires ${requiredTier} tier. You have ${userTier} tier.`;
    super(403, 'TIER_ACCESS_DENIED', message, { requiredTier, userTier });
    this.name = 'TierAccessError';
    Object.setPrototypeOf(this, TierAccessError.prototype);
  }
}

/**
 * Enrollment error - 422 Unprocessable Entity
 */
export class EnrollmentError extends AppError {
  constructor(message: string, code: string = 'ENROLLMENT_ERROR') {
    super(422, code, message);
    this.name = 'EnrollmentError';
    Object.setPrototypeOf(this, EnrollmentError.prototype);
  }
}

/**
 * Assessment error - 422 Unprocessable Entity
 */
export class AssessmentError extends AppError {
  constructor(message: string, code: string = 'ASSESSMENT_ERROR') {
    super(422, code, message);
    this.name = 'AssessmentError';
    Object.setPrototypeOf(this, AssessmentError.prototype);
  }
}

/**
 * Checks if an error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Converts any error to an AppError
 */
export function toAppError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError('An unexpected error occurred');
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: AppError,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date(),
    requestId,
  };
}
