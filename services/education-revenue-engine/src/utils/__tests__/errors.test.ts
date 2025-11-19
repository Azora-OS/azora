import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
  BusinessLogicError,
  TierAccessError,
  EnrollmentError,
  AssessmentError,
  isAppError,
  toAppError,
  createErrorResponse,
} from '../errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error message', { field: 'test' });
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.name).toBe('AppError');
    });
  });

  describe('BadRequestError', () => {
    it('should create a BadRequestError with 400 status', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('BadRequestError');
    });

    it('should use default code if not provided', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should include details if provided', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should use default message if not provided', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('ForbiddenError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with 404 status', () => {
      const error = new NotFoundError('Course', 'course-123');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Course with ID course-123 not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle resource without ID', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError with 409 status', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Email already exists');
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('InternalServerError', () => {
    it('should create an InternalServerError with 500 status', () => {
      const error = new InternalServerError('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Database connection failed');
      expect(error.name).toBe('InternalServerError');
    });

    it('should use default message if not provided', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create a ServiceUnavailableError with 503 status', () => {
      const error = new ServiceUnavailableError('Payment Service');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('Payment Service is currently unavailable');
      expect(error.name).toBe('ServiceUnavailableError');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create a BusinessLogicError with 422 status', () => {
      const error = new BusinessLogicError('Cannot enroll in course', 'ENROLLMENT_FAILED');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('ENROLLMENT_FAILED');
      expect(error.message).toBe('Cannot enroll in course');
      expect(error.name).toBe('BusinessLogicError');
    });

    it('should include details if provided', () => {
      const error = new BusinessLogicError('Cannot enroll', 'ENROLLMENT_FAILED', { reason: 'tier_mismatch' });
      expect(error.details).toEqual({ reason: 'tier_mismatch' });
    });
  });

  describe('TierAccessError', () => {
    it('should create a TierAccessError with 403 status', () => {
      const error = new TierAccessError('premium', 'free');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('TIER_ACCESS_DENIED');
      expect(error.message).toBe('This feature requires premium tier. You have free tier.');
      expect(error.details).toEqual({ requiredTier: 'premium', userTier: 'free' });
      expect(error.name).toBe('TierAccessError');
    });
  });

  describe('EnrollmentError', () => {
    it('should create an EnrollmentError with 422 status', () => {
      const error = new EnrollmentError('Student already enrolled', 'DUPLICATE_ENROLLMENT');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('DUPLICATE_ENROLLMENT');
      expect(error.message).toBe('Student already enrolled');
      expect(error.name).toBe('EnrollmentError');
    });
  });

  describe('AssessmentError', () => {
    it('should create an AssessmentError with 422 status', () => {
      const error = new AssessmentError('Invalid assessment response', 'INVALID_RESPONSE');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('INVALID_RESPONSE');
      expect(error.message).toBe('Invalid assessment response');
      expect(error.name).toBe('AssessmentError');
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new BadRequestError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for non-AppError instances', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });
  });

  describe('toAppError', () => {
    it('should return AppError as-is', () => {
      const error = new BadRequestError('Test');
      const result = toAppError(error);
      expect(result).toBe(error);
    });

    it('should convert Error to InternalServerError', () => {
      const error = new Error('Test error');
      const result = toAppError(error);
      expect(result).toBeInstanceOf(InternalServerError);
      expect(result.message).toBe('Test error');
    });

    it('should convert unknown error to InternalServerError', () => {
      const result = toAppError('unknown error');
      expect(result).toBeInstanceOf(InternalServerError);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('createErrorResponse', () => {
    it('should create a properly formatted error response', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT', { field: 'email' });
      const response = createErrorResponse(error, 'req-123');

      expect(response.success).toBe(false);
      expect(response.code).toBe('INVALID_INPUT');
      expect(response.message).toBe('Invalid input');
      expect(response.details).toEqual({ field: 'email' });
      expect(response.requestId).toBe('req-123');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('should create error response without requestId', () => {
      const error = new NotFoundError('Course', 'course-123');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.code).toBe('NOT_FOUND');
      expect(response.requestId).toBeUndefined();
    });
  });
});
