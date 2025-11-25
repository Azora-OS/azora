import { faker } from '@faker-js/faker';
import { Course, Enrollment, EnrollmentStatus } from '@prisma/client';
import { BaseFactory } from './base.factory';

export interface CreateCourseOptions {
  title?: string;
  description?: string;
  instructorId?: string;
  price?: number;
  duration?: number;
  level?: string;
  isPublished?: boolean;
}

export interface CreateEnrollmentOptions {
  userId: string;
  courseId: string;
  status?: EnrollmentStatus;
  progress?: number;
  enrolledAt?: Date;
}

/**
 * Factory for creating test courses
 */
export class CourseFactory extends BaseFactory<Course> {
  /**
   * Create a test course
   */
  async create(overrides?: CreateCourseOptions): Promise<Course> {
    const course = await this.prisma.course.create({
      data: {
        title: overrides?.title || faker.lorem.words(3),
        description: overrides?.description || faker.lorem.paragraph(),
        instructorId: overrides?.instructorId || faker.string.uuid(),
        price: overrides?.price ?? faker.number.int({ min: 0, max: 500 }),
        duration: overrides?.duration ?? faker.number.int({ min: 1, max: 100 }),
        level: overrides?.level || this.pickRandom(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        status: overrides?.isPublished === false ? 'DRAFT' : 'PUBLISHED',
        category: 'General',
      },
    });

    this.trackRecord('course', course.id);
    return course;
  }

  /**
   * Create a free course
   */
  async createFree(overrides?: CreateCourseOptions): Promise<Course> {
    return this.create({
      ...overrides,
      price: 0,
    });
  }

  /**
   * Create a premium course
   */
  async createPremium(overrides?: CreateCourseOptions): Promise<Course> {
    return this.create({
      ...overrides,
      price: faker.number.int({ min: 100, max: 500 }),
    });
  }

  /**
   * Create an unpublished course
   */
  async createDraft(overrides?: CreateCourseOptions): Promise<Course> {
    return this.create({
      ...overrides,
      isPublished: false,
    });
  }
}

/**
 * Factory for creating test enrollments
 */
export class EnrollmentFactory extends BaseFactory<Enrollment> {
  /**
   * Create a test enrollment
   */
  async create(overrides: CreateEnrollmentOptions): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: overrides.userId,
        studentId: overrides.userId, // Set studentId same as userId
        courseId: overrides.courseId,
        status: overrides.status || EnrollmentStatus.ACTIVE,
        progress: overrides.progress ?? 0,
        enrolledAt: overrides.enrolledAt || new Date(),
      },
    });

    this.trackRecord('enrollment', enrollment.id);
    return enrollment;
  }

  /**
   * Create completed enrollment
   */
  async createCompleted(userId: string, courseId: string): Promise<Enrollment> {
    return this.create({
      userId,
      courseId,
      status: EnrollmentStatus.COMPLETED,
      progress: 100,
    });
  }

  /**
   * Create in-progress enrollment
   */
  async createInProgress(userId: string, courseId: string, progress?: number): Promise<Enrollment> {
    return this.create({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
      progress: progress ?? faker.number.int({ min: 1, max: 99 }),
    });
  }

  /**
   * Create cancelled enrollment
   */
  async createCancelled(userId: string, courseId: string): Promise<Enrollment> {
    return this.create({
      userId,
      courseId,
      status: EnrollmentStatus.DROPPED,
    });
  }
}

/**
 * Factory for creating test assessments
 */
export class AssessmentFactory extends BaseFactory<any> {
  /**
   * Create a test assessment
   */
  async create(overrides?: any): Promise<any> {
    const assessment = await this.prisma.assessment.create({
      data: {
        userId: overrides?.userId || faker.string.uuid(),
        type: overrides?.type || 'QUIZ',
        title: overrides?.title || faker.lorem.words(3),
        questions: overrides?.questions || [],
        answers: overrides?.answers || null,
        score: overrides?.score ?? faker.number.int({ min: 0, max: 100 }),
        maxScore: overrides?.maxScore ?? 100,
        status: overrides?.status || 'COMPLETED',
        startedAt: overrides?.startedAt || new Date(),
        completedAt: overrides?.completedAt || new Date(),
      },
    });

    this.trackRecord('assessment', assessment.id);
    return assessment;
  }

  /**
   * Create passing assessment
   */
  async createPassing(userId: string, courseId?: string): Promise<any> {
    return this.create({
      userId,
      score: faker.number.int({ min: 70, max: 100 }),
      status: 'GRADED',
    });
  }

  /**
   * Create failing assessment
   */
  async createFailing(userId: string, courseId?: string): Promise<any> {
    return this.create({
      userId,
      score: faker.number.int({ min: 0, max: 69 }),
      status: 'GRADED',
    });
  }
}

// Export singleton instances
export const courseFactory = new CourseFactory();
export const enrollmentFactory = new EnrollmentFactory();
export const assessmentFactory = new AssessmentFactory();
