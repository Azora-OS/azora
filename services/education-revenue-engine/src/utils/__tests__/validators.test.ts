import {
  validateCourse,
  validateEnrollment,
  validateAssessmentResponse,
  validateAssessment,
  validateEmail,
  validateUUID,
  validatePaginationParams,
  ValidationError,
} from '../validators';

describe('Validators', () => {
  describe('validateCourse', () => {
    it('should pass validation for valid course data', () => {
      const courseData = {
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'free' as const,
        language: 'en',
        prerequisites: [],
      };

      const errors = validateCourse(courseData);
      expect(errors).toHaveLength(0);
    });

    it('should fail when title is missing', () => {
      const courseData = {
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'free' as const,
      };

      const errors = validateCourse(courseData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
      expect(errors[0].code).toBe('COURSE_TITLE_REQUIRED');
    });

    it('should fail when title exceeds 255 characters', () => {
      const courseData = {
        title: 'a'.repeat(256),
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'free' as const,
      };

      const errors = validateCourse(courseData);
      expect(errors.some((e) => e.code === 'COURSE_TITLE_TOO_LONG')).toBe(true);
    });

    it('should fail when description is too short', () => {
      const courseData = {
        title: 'TypeScript Course',
        description: 'Short',
        instructorId: 'instructor-123',
        tier: 'free' as const,
      };

      const errors = validateCourse(courseData);
      expect(errors.some((e) => e.code === 'COURSE_DESCRIPTION_TOO_SHORT')).toBe(true);
    });

    it('should fail when tier is invalid', () => {
      const courseData = {
        title: 'TypeScript Course',
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'invalid' as any,
      };

      const errors = validateCourse(courseData);
      expect(errors.some((e) => e.code === 'INVALID_TIER')).toBe(true);
    });

    it('should fail when language code is invalid', () => {
      const courseData = {
        title: 'TypeScript Course',
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'free' as const,
        language: 'invalid-lang',
      };

      const errors = validateCourse(courseData);
      expect(errors.some((e) => e.code === 'INVALID_LANGUAGE_CODE')).toBe(true);
    });

    it('should accept valid language codes', () => {
      const courseData = {
        title: 'TypeScript Course',
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-123',
        tier: 'free' as const,
        language: 'en-US',
      };

      const errors = validateCourse(courseData);
      expect(errors.filter((e) => e.code === 'INVALID_LANGUAGE_CODE')).toHaveLength(0);
    });
  });

  describe('validateEnrollment', () => {
    it('should pass validation for valid enrollment data', () => {
      const enrollmentData = {
        studentId: 'student-123',
        courseId: 'course-456',
        tier: 'free' as const,
        status: 'active' as const,
        progress: 50,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors).toHaveLength(0);
    });

    it('should fail when studentId is missing', () => {
      const enrollmentData = {
        courseId: 'course-456',
        tier: 'free' as const,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors.some((e) => e.code === 'STUDENT_ID_REQUIRED')).toBe(true);
    });

    it('should fail when courseId is missing', () => {
      const enrollmentData = {
        studentId: 'student-123',
        tier: 'free' as const,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors.some((e) => e.code === 'COURSE_ID_REQUIRED')).toBe(true);
    });

    it('should fail when tier is invalid', () => {
      const enrollmentData = {
        studentId: 'student-123',
        courseId: 'course-456',
        tier: 'invalid' as any,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors.some((e) => e.code === 'INVALID_TIER')).toBe(true);
    });

    it('should fail when status is invalid', () => {
      const enrollmentData = {
        studentId: 'student-123',
        courseId: 'course-456',
        tier: 'free' as const,
        status: 'invalid' as any,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors.some((e) => e.code === 'INVALID_STATUS')).toBe(true);
    });

    it('should fail when progress is out of range', () => {
      const enrollmentData = {
        studentId: 'student-123',
        courseId: 'course-456',
        tier: 'free' as const,
        progress: 150,
      };

      const errors = validateEnrollment(enrollmentData);
      expect(errors.some((e) => e.code === 'INVALID_PROGRESS')).toBe(true);
    });
  });

  describe('validateAssessmentResponse', () => {
    it('should pass validation for valid assessment response', () => {
      const responseData = {
        assessmentId: 'assessment-123',
        enrollmentId: 'enrollment-456',
        responses: {
          question1: 'answer1',
          question2: 'answer2',
        },
      };

      const errors = validateAssessmentResponse(responseData);
      expect(errors).toHaveLength(0);
    });

    it('should fail when assessmentId is missing', () => {
      const responseData = {
        enrollmentId: 'enrollment-456',
        responses: { question1: 'answer1' },
      };

      const errors = validateAssessmentResponse(responseData);
      expect(errors.some((e) => e.code === 'ASSESSMENT_ID_REQUIRED')).toBe(true);
    });

    it('should fail when enrollmentId is missing', () => {
      const responseData = {
        assessmentId: 'assessment-123',
        responses: { question1: 'answer1' },
      };

      const errors = validateAssessmentResponse(responseData);
      expect(errors.some((e) => e.code === 'ENROLLMENT_ID_REQUIRED')).toBe(true);
    });

    it('should fail when responses are missing', () => {
      const responseData = {
        assessmentId: 'assessment-123',
        enrollmentId: 'enrollment-456',
      };

      const errors = validateAssessmentResponse(responseData);
      expect(errors.some((e) => e.code === 'RESPONSES_REQUIRED')).toBe(true);
    });

    it('should fail when responses are empty', () => {
      const responseData = {
        assessmentId: 'assessment-123',
        enrollmentId: 'enrollment-456',
        responses: {},
      };

      const errors = validateAssessmentResponse(responseData);
      expect(errors.some((e) => e.code === 'RESPONSES_REQUIRED')).toBe(true);
    });
  });

  describe('validateAssessment', () => {
    it('should pass validation for valid assessment data', () => {
      const assessmentData = {
        title: 'TypeScript Basics Quiz',
        courseId: 'course-123',
        moduleId: 'module-456',
        questions: ['What is TypeScript?', 'What is a type?'],
        passingScore: 70,
      };

      const errors = validateAssessment(assessmentData);
      expect(errors).toHaveLength(0);
    });

    it('should fail when title is missing', () => {
      const assessmentData = {
        courseId: 'course-123',
        moduleId: 'module-456',
        questions: ['What is TypeScript?'],
      };

      const errors = validateAssessment(assessmentData);
      expect(errors.some((e) => e.code === 'ASSESSMENT_TITLE_REQUIRED')).toBe(true);
    });

    it('should fail when questions are missing', () => {
      const assessmentData = {
        title: 'TypeScript Basics Quiz',
        courseId: 'course-123',
        moduleId: 'module-456',
      };

      const errors = validateAssessment(assessmentData);
      expect(errors.some((e) => e.code === 'QUESTIONS_REQUIRED')).toBe(true);
    });

    it('should fail when passingScore is out of range', () => {
      const assessmentData = {
        title: 'TypeScript Basics Quiz',
        courseId: 'course-123',
        moduleId: 'module-456',
        questions: ['What is TypeScript?'],
        passingScore: 150,
      };

      const errors = validateAssessment(assessmentData);
      expect(errors.some((e) => e.code === 'INVALID_PASSING_SCORE')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should validate valid UUID format', () => {
      expect(validateUUID('abc123def456')).toBe(true);
      expect(validateUUID('clh1234567890abcdef')).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(validateUUID('')).toBe(false);
      expect(validateUUID('   ')).toBe(false);
    });
  });

  describe('validatePaginationParams', () => {
    it('should pass validation for valid pagination params', () => {
      const errors = validatePaginationParams(1, 10);
      expect(errors).toHaveLength(0);
    });

    it('should fail when page is less than 1', () => {
      const errors = validatePaginationParams(0, 10);
      expect(errors.some((e) => e.code === 'INVALID_PAGE')).toBe(true);
    });

    it('should fail when pageSize exceeds 100', () => {
      const errors = validatePaginationParams(1, 150);
      expect(errors.some((e) => e.code === 'INVALID_PAGE_SIZE')).toBe(true);
    });

    it('should fail when pageSize is less than 1', () => {
      const errors = validatePaginationParams(1, 0);
      expect(errors.some((e) => e.code === 'INVALID_PAGE_SIZE')).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with correct properties', () => {
      const error = new ValidationError('email', 'Invalid email format', 'INVALID_EMAIL');
      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid email format');
      expect(error.code).toBe('INVALID_EMAIL');
      expect(error.name).toBe('ValidationError');
    });
  });
});
