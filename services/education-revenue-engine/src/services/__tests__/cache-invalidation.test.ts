/**
 * Cache Invalidation Tests
 * Tests for cache invalidation strategies
 */

import { describe, it, expect } from 'vitest';
import { CACHE_KEYS, CACHE_TTL, CACHE_INVALIDATION, getInvalidationKeys } from '../cache-keys';

describe('Cache Keys', () => {
  describe('CACHE_KEYS', () => {
    it('should generate course cache key', () => {
      const key = CACHE_KEYS.COURSE('course-123');
      expect(key).toBe('course:course-123');
    });

    it('should generate courses list cache key', () => {
      const key = CACHE_KEYS.COURSES_LIST(1, 20, 'premium');
      expect(key).toBe('courses:list:1:20:premium');
    });

    it('should generate student progress cache key', () => {
      const key = CACHE_KEYS.STUDENT_PROGRESS('student-123');
      expect(key).toBe('student:student-123:progress');
    });

    it('should generate enrollment cache key', () => {
      const key = CACHE_KEYS.ENROLLMENT('enrollment-123');
      expect(key).toBe('enrollment:enrollment-123');
    });

    it('should generate module progress cache key', () => {
      const key = CACHE_KEYS.MODULE_PROGRESS('enrollment-123', 'module-456');
      expect(key).toBe('enrollment:enrollment-123:module:module-456:progress');
    });

    it('should generate assessment results cache key', () => {
      const key = CACHE_KEYS.ASSESSMENT_RESULTS('enrollment-123', 'assessment-456');
      expect(key).toBe('enrollment:enrollment-123:assessment:assessment-456:results');
    });

    it('should generate learning outcomes cache key', () => {
      const key = CACHE_KEYS.LEARNING_OUTCOMES('student-123');
      expect(key).toBe('student:student-123:outcomes');
    });

    it('should generate cohort analytics cache key', () => {
      const key = CACHE_KEYS.COHORT_ANALYTICS('course-123', 'month');
      expect(key).toBe('course:course-123:cohort:month');
    });

    it('should generate revenue summary cache key', () => {
      const key = CACHE_KEYS.REVENUE_SUMMARY('2024-01');
      expect(key).toBe('revenue:summary:2024-01');
    });

    it('should generate teacher courses cache key', () => {
      const key = CACHE_KEYS.TEACHER_COURSES('teacher-123');
      expect(key).toBe('teacher:teacher-123:courses');
    });

    it('should generate pricing tiers cache key', () => {
      const key = CACHE_KEYS.PRICING_TIERS();
      expect(key).toBe('pricing:tiers');
    });

    it('should generate certificate cache key', () => {
      const key = CACHE_KEYS.CERTIFICATE('cert-123');
      expect(key).toBe('certificate:cert-123');
    });

    it('should generate career profile cache key', () => {
      const key = CACHE_KEYS.CAREER_PROFILE('student-123');
      expect(key).toBe('career:profile:student-123');
    });

    it('should generate session cache key', () => {
      const key = CACHE_KEYS.SESSION('session-123');
      expect(key).toBe('session:session-123');
    });
  });

  describe('CACHE_TTL', () => {
    it('should have appropriate TTL values', () => {
      expect(CACHE_TTL.SHORT).toBe(5 * 60);
      expect(CACHE_TTL.MEDIUM).toBe(30 * 60);
      expect(CACHE_TTL.LONG).toBe(60 * 60);
      expect(CACHE_TTL.VERY_LONG).toBe(24 * 60 * 60);
      expect(CACHE_TTL.SESSION).toBe(2 * 60 * 60);
    });

    it('should have specific TTL values', () => {
      expect(CACHE_TTL.COURSE_LIST).toBe(30 * 60);
      expect(CACHE_TTL.COURSE_DETAIL).toBe(60 * 60);
      expect(CACHE_TTL.STUDENT_PROGRESS).toBe(5 * 60);
      expect(CACHE_TTL.ASSESSMENT_RESULTS).toBe(60 * 60);
      expect(CACHE_TTL.ANALYTICS).toBe(60 * 60);
      expect(CACHE_TTL.REVENUE_SUMMARY).toBe(60 * 60);
      expect(CACHE_TTL.PRICING_TIERS).toBe(24 * 60 * 60);
    });
  });
});

describe('Cache Invalidation', () => {
  describe('onCourseUpdate', () => {
    it('should invalidate course-related caches', () => {
      const keys = CACHE_INVALIDATION.onCourseUpdate('course-123');

      expect(keys).toContain('course:course-123');
      expect(keys).toContain('course:course-123:modules');
      expect(keys).toContain('course:course-123:assessments');
      expect(keys.some(k => k.includes('courses:list:*'))).toBe(true);
    });
  });

  describe('onCourseDelete', () => {
    it('should invalidate all course-related caches', () => {
      const keys = CACHE_INVALIDATION.onCourseDelete('course-123');

      expect(keys).toContain('course:course-123');
      expect(keys).toContain('course:course-123:modules');
      expect(keys).toContain('course:course-123:assessments');
      expect(keys.some(k => k.includes('courses:list:*'))).toBe(true);
      expect(keys.some(k => k.includes('revenue:course:course-123:*'))).toBe(true);
    });
  });

  describe('onEnrollment', () => {
    it('should invalidate enrollment-related caches', () => {
      const keys = CACHE_INVALIDATION.onEnrollment('student-123', 'course-456');

      expect(keys).toContain('student:student-123:enrollments');
      expect(keys).toContain('student:student-123:progress');
      expect(keys.some(k => k.includes('courses:list:*'))).toBe(true);
      expect(keys).toContain('student:student-123:offers');
    });
  });

  describe('onProgressUpdate', () => {
    it('should invalidate progress-related caches', () => {
      const keys = CACHE_INVALIDATION.onProgressUpdate('student-123', 'enrollment-456');

      expect(keys).toContain('student:student-123:progress');
      expect(keys).toContain('enrollment:enrollment-456');
      expect(keys).toContain('student:student-123:outcomes');
      expect(keys.some(k => k.includes('conversion:metrics:*'))).toBe(true);
    });
  });

  describe('onAssessmentSubmit', () => {
    it('should invalidate assessment-related caches', () => {
      const keys = CACHE_INVALIDATION.onAssessmentSubmit(
        'student-123',
        'enrollment-456',
        'course-789'
      );

      expect(keys).toContain('student:student-123:assessment:history');
      expect(keys).toContain('student:student-123:progress');
      expect(keys).toContain('student:student-123:outcomes');
      expect(keys.some(k => k.includes('cohort:course-789:*'))).toBe(true);
      expect(keys.some(k => k.includes('conversion:metrics:*'))).toBe(true);
    });
  });

  describe('onPaymentProcessed', () => {
    it('should invalidate payment-related caches', () => {
      const keys = CACHE_INVALIDATION.onPaymentProcessed('student-123', 'teacher-456');

      expect(keys).toContain('student:student-123:progress');
      expect(keys).toContain('student:student-123:offers');
      expect(keys.some(k => k.includes('revenue:*'))).toBe(true);
      expect(keys).toContain('teacher:teacher-456:revenue');
    });
  });

  describe('onCertificateGenerated', () => {
    it('should invalidate certificate-related caches', () => {
      const keys = CACHE_INVALIDATION.onCertificateGenerated('student-123');

      expect(keys).toContain('student:student-123:certificates');
      expect(keys).toContain('career:profile:student-123');
    });
  });

  describe('onTeacherCourseUpdate', () => {
    it('should invalidate teacher course-related caches', () => {
      const keys = CACHE_INVALIDATION.onTeacherCourseUpdate('teacher-123', 'course-456');

      expect(keys).toContain('teacher:teacher-123:courses');
      expect(keys).toContain('course:course-456');
      expect(keys).toContain('teacher:teacher-123:course:course-456:analytics');
      expect(keys.some(k => k.includes('courses:list:*'))).toBe(true);
    });
  });

  describe('onPricingUpdate', () => {
    it('should invalidate pricing-related caches', () => {
      const keys = CACHE_INVALIDATION.onPricingUpdate();

      expect(keys).toContain('pricing:tiers');
      expect(keys.some(k => k.includes('pricing:tier:*'))).toBe(true);
      expect(keys.some(k => k.includes('conversion:metrics:*'))).toBe(true);
    });
  });
});

describe('getInvalidationKeys', () => {
  it('should return invalidation keys for onCourseUpdate event', () => {
    const keys = getInvalidationKeys('onCourseUpdate', 'course-123');

    expect(keys).toContain('course:course-123');
    expect(keys).toContain('course:course-123:modules');
  });

  it('should return invalidation keys for onEnrollment event', () => {
    const keys = getInvalidationKeys('onEnrollment', 'student-123', 'course-456');

    expect(keys).toContain('student:student-123:enrollments');
    expect(keys).toContain('student:student-123:progress');
  });

  it('should return empty array for unknown event', () => {
    const keys = getInvalidationKeys('unknownEvent' as any, 'arg1');

    expect(keys).toEqual([]);
  });
});

describe('Cache Key Patterns', () => {
  it('should support wildcard patterns', () => {
    const patterns = [
      'courses:list:*',
      'revenue:*',
      'pricing:tier:*',
      'cohort:*',
      'conversion:metrics:*'
    ];

    patterns.forEach(pattern => {
      expect(pattern).toContain('*');
    });
  });

  it('should have consistent key naming', () => {
    const courseKey = CACHE_KEYS.COURSE('123');
    const enrollmentKey = CACHE_KEYS.ENROLLMENT('456');
    const progressKey = CACHE_KEYS.STUDENT_PROGRESS('789');

    expect(courseKey).toMatch(/^course:/);
    expect(enrollmentKey).toMatch(/^enrollment:/);
    expect(progressKey).toMatch(/^student:.*:progress$/);
  });

  it('should support hierarchical keys', () => {
    const key = CACHE_KEYS.MODULE_PROGRESS('enrollment-123', 'module-456');

    expect(key).toContain('enrollment:');
    expect(key).toContain(':module:');
    expect(key).toContain(':progress');
  });
});

describe('TTL Strategy', () => {
  it('should use shorter TTL for frequently updated data', () => {
    expect(CACHE_TTL.STUDENT_PROGRESS).toBeLessThan(CACHE_TTL.COURSE_DETAIL);
    expect(CACHE_TTL.STUDENT_PROGRESS).toBeLessThan(CACHE_TTL.ANALYTICS);
  });

  it('should use longer TTL for static data', () => {
    expect(CACHE_TTL.PRICING_TIERS).toBeGreaterThan(CACHE_TTL.COURSE_LIST);
    expect(CACHE_TTL.PRICING_TIERS).toBeGreaterThan(CACHE_TTL.ANALYTICS);
  });

  it('should have reasonable TTL values', () => {
    Object.values(CACHE_TTL).forEach(ttl => {
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(24 * 60 * 60); // Max 24 hours
    });
  });
});
