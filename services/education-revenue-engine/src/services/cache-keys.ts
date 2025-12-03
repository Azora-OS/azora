/**
 * Cache Keys and Invalidation Strategies
 * Defines all cache key patterns and invalidation logic
 */

/**
 * Cache key patterns for different data types
 */
export const CACHE_KEYS = {
  // Course caching
  COURSE: (courseId: string) => `course:${courseId}`,
  COURSES_LIST: (page: number, limit: number, tier?: string) => 
    `courses:list:${page}:${limit}${tier ? `:${tier}` : ''}`,
  COURSE_MODULES: (courseId: string) => `course:${courseId}:modules`,
  COURSE_LESSONS: (courseId: string, moduleId: string) => 
    `course:${courseId}:module:${moduleId}:lessons`,
  COURSE_ASSESSMENTS: (courseId: string) => `course:${courseId}:assessments`,

  // Student progress caching
  STUDENT_PROGRESS: (studentId: string) => `student:${studentId}:progress`,
  ENROLLMENT: (enrollmentId: string) => `enrollment:${enrollmentId}`,
  STUDENT_ENROLLMENTS: (studentId: string) => `student:${studentId}:enrollments`,
  MODULE_PROGRESS: (enrollmentId: string, moduleId: string) => 
    `enrollment:${enrollmentId}:module:${moduleId}:progress`,
  LESSON_PROGRESS: (enrollmentId: string, lessonId: string) => 
    `enrollment:${enrollmentId}:lesson:${lessonId}:progress`,

  // Assessment caching
  ASSESSMENT: (assessmentId: string) => `assessment:${assessmentId}`,
  ASSESSMENT_RESULTS: (enrollmentId: string, assessmentId: string) => 
    `enrollment:${enrollmentId}:assessment:${assessmentId}:results`,
  STUDENT_ASSESSMENT_HISTORY: (studentId: string) => 
    `student:${studentId}:assessment:history`,

  // Analytics caching
  LEARNING_OUTCOMES: (studentId: string) => `student:${studentId}:outcomes`,
  COHORT_ANALYTICS: (courseId: string, period: string) => 
    `course:${courseId}:cohort:${period}`,
  CONVERSION_METRICS: (period: string) => `conversion:metrics:${period}`,
  REVENUE_SUMMARY: (period: string) => `revenue:summary:${period}`,
  REVENUE_BY_COURSE: (courseId: string, period: string) => 
    `revenue:course:${courseId}:${period}`,
  REVENUE_BY_INSTRUCTOR: (instructorId: string, period: string) => 
    `revenue:instructor:${instructorId}:${period}`,

  // Teacher data caching
  TEACHER_COURSES: (instructorId: string) => `teacher:${instructorId}:courses`,
  TEACHER_ANALYTICS: (instructorId: string, courseId: string) => 
    `teacher:${instructorId}:course:${courseId}:analytics`,
  TEACHER_REVENUE: (instructorId: string) => `teacher:${instructorId}:revenue`,

  // Pricing and conversion caching
  PRICING_TIERS: () => 'pricing:tiers',
  PRICING_TIER: (tier: string) => `pricing:tier:${tier}`,
  CONVERSION_OFFERS: (studentId: string) => `student:${studentId}:offers`,

  // Certificate caching
  CERTIFICATE: (certificateId: string) => `certificate:${certificateId}`,
  STUDENT_CERTIFICATES: (studentId: string) => `student:${studentId}:certificates`,

  // Career services caching
  CAREER_PROFILE: (studentId: string) => `career:profile:${studentId}`,
  JOB_MATCHES: (studentId: string) => `career:matches:${studentId}`,

  // Session caching
  SESSION: (sessionId: string) => `session:${sessionId}`,
  USER_SESSION: (userId: string) => `user:${userId}:session`,
};

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  // Short-lived cache (5 minutes)
  SHORT: 5 * 60,

  // Medium-lived cache (30 minutes)
  MEDIUM: 30 * 60,

  // Long-lived cache (1 hour)
  LONG: 60 * 60,

  // Very long-lived cache (24 hours)
  VERY_LONG: 24 * 60 * 60,

  // Session cache (2 hours)
  SESSION: 2 * 60 * 60,

  // Specific cache durations
  COURSE_LIST: 30 * 60, // 30 minutes
  COURSE_DETAIL: 60 * 60, // 1 hour
  STUDENT_PROGRESS: 5 * 60, // 5 minutes (frequently updated)
  ASSESSMENT_RESULTS: 60 * 60, // 1 hour
  ANALYTICS: 60 * 60, // 1 hour
  REVENUE_SUMMARY: 60 * 60, // 1 hour
  PRICING_TIERS: 24 * 60 * 60, // 24 hours
  CONVERSION_OFFERS: 30 * 60, // 30 minutes
  CERTIFICATES: 24 * 60 * 60, // 24 hours
  CAREER_PROFILE: 60 * 60, // 1 hour
};

/**
 * Cache invalidation patterns
 */
export const CACHE_INVALIDATION = {
  // When a course is updated
  onCourseUpdate: (courseId: string) => [
    CACHE_KEYS.COURSE(courseId),
    CACHE_KEYS.COURSE_MODULES(courseId),
    CACHE_KEYS.COURSE_ASSESSMENTS(courseId),
    `courses:list:*`, // Invalidate all course lists
  ],

  // When a course is deleted
  onCourseDelete: (courseId: string) => [
    CACHE_KEYS.COURSE(courseId),
    CACHE_KEYS.COURSE_MODULES(courseId),
    CACHE_KEYS.COURSE_ASSESSMENTS(courseId),
    `courses:list:*`,
    `revenue:course:${courseId}:*`,
  ],

  // When a student enrolls
  onEnrollment: (studentId: string, courseId: string) => [
    CACHE_KEYS.STUDENT_ENROLLMENTS(studentId),
    CACHE_KEYS.STUDENT_PROGRESS(studentId),
    `courses:list:*`, // Course enrollment count changed
    CACHE_KEYS.CONVERSION_OFFERS(studentId),
  ],

  // When progress is updated
  onProgressUpdate: (studentId: string, enrollmentId: string) => [
    CACHE_KEYS.STUDENT_PROGRESS(studentId),
    CACHE_KEYS.ENROLLMENT(enrollmentId),
    `student:${studentId}:outcomes`,
    `conversion:metrics:*`,
  ],

  // When assessment is submitted
  onAssessmentSubmit: (studentId: string, enrollmentId: string, courseId: string) => [
    CACHE_KEYS.STUDENT_ASSESSMENT_HISTORY(studentId),
    CACHE_KEYS.STUDENT_PROGRESS(studentId),
    CACHE_KEYS.LEARNING_OUTCOMES(studentId),
    `cohort:${courseId}:*`,
    `conversion:metrics:*`,
  ],

  // When payment is processed
  onPaymentProcessed: (studentId: string, instructorId: string) => [
    CACHE_KEYS.STUDENT_PROGRESS(studentId),
    CACHE_KEYS.CONVERSION_OFFERS(studentId),
    `revenue:*`,
    CACHE_KEYS.TEACHER_REVENUE(instructorId),
  ],

  // When certificate is generated
  onCertificateGenerated: (studentId: string) => [
    CACHE_KEYS.STUDENT_CERTIFICATES(studentId),
    CACHE_KEYS.CAREER_PROFILE(studentId),
  ],

  // When teacher updates course
  onTeacherCourseUpdate: (instructorId: string, courseId: string) => [
    CACHE_KEYS.TEACHER_COURSES(instructorId),
    CACHE_KEYS.COURSE(courseId),
    CACHE_KEYS.TEACHER_ANALYTICS(instructorId, courseId),
    `courses:list:*`,
  ],

  // When pricing is updated
  onPricingUpdate: () => [
    CACHE_KEYS.PRICING_TIERS(),
    `pricing:tier:*`,
    `conversion:metrics:*`,
  ],
};

/**
 * Get cache invalidation keys for an event
 */
export function getInvalidationKeys(
  event: keyof typeof CACHE_INVALIDATION,
  ...args: string[]
): string[] {
  const invalidationFn = CACHE_INVALIDATION[event];
  if (!invalidationFn) {
    return [];
  }
  return (invalidationFn as any)(...args);
}
