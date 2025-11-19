import { getPrismaClient } from '../utils/database';
import { NotFoundError, EnrollmentError, TierAccessError } from '../utils/errors';
import { Course, Enrollment } from '../types';

/**
 * Course model operations
 */
export const CourseModel = {
  /**
   * Creates a new course
   */
  async create(data: {
    title: string;
    description: string;
    instructorId: string;
    tier: 'free' | 'premium' | 'pro';
    language?: string;
    prerequisites?: string[];
  }) {
    const prisma = getPrismaClient();
    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        instructorId: data.instructorId,
        tier: data.tier,
        language: data.language || 'en',
        prerequisites: data.prerequisites || [],
      },
    });
  },

  /**
   * Finds a course by ID
   */
  async findById(id: string) {
    const prisma = getPrismaClient();
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: true,
        assessments: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course', id);
    }

    return course;
  },

  /**
   * Finds all courses with pagination
   */
  async findAll(options: { page?: number; pageSize?: number; tier?: string; language?: string } = {}) {
    const prisma = getPrismaClient();
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (options.tier) where.tier = options.tier;
    if (options.language) where.language = options.language;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          modules: true,
          assessments: true,
        },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Updates a course
   */
  async update(id: string, data: Partial<Course>) {
    const prisma = getPrismaClient();
    return prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.tier && { tier: data.tier }),
        ...(data.language && { language: data.language }),
        ...(data.prerequisites && { prerequisites: data.prerequisites }),
      },
      include: {
        modules: true,
        assessments: true,
      },
    });
  },

  /**
   * Deletes a course
   */
  async delete(id: string) {
    const prisma = getPrismaClient();
    return prisma.course.delete({
      where: { id },
    });
  },
};

/**
 * Enrollment model operations
 */
export const EnrollmentModel = {
  /**
   * Creates a new enrollment
   */
  async create(data: {
    studentId: string;
    courseId: string;
    tier: 'free' | 'premium' | 'pro';
  }) {
    const prisma = getPrismaClient();

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundError('Course', data.courseId);
    }

    // Check tier access
    if (course.tier !== 'free' && data.tier === 'free') {
      throw new TierAccessError(course.tier, data.tier);
    }

    // Check for duplicate enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        courseId: data.courseId,
        status: { in: ['active', 'completed'] },
      },
    });

    if (existingEnrollment) {
      throw new EnrollmentError('Student is already enrolled in this course', 'DUPLICATE_ENROLLMENT');
    }

    return prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        tier: data.tier,
        status: 'active',
        progress: 0,
      },
      include: {
        course: true,
        student: true,
      },
    });
  },

  /**
   * Finds an enrollment by ID
   */
  async findById(id: string) {
    const prisma = getPrismaClient();
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
        student: true,
        outcomes: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment', id);
    }

    return enrollment;
  },

  /**
   * Finds enrollments by student ID
   */
  async findByStudentId(studentId: string, options: { page?: number; pageSize?: number } = {}) {
    const prisma = getPrismaClient();
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId },
        skip,
        take: pageSize,
        include: {
          course: true,
          outcomes: true,
        },
      }),
      prisma.enrollment.count({ where: { studentId } }),
    ]);

    return {
      data: enrollments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Updates an enrollment
   */
  async update(id: string, data: Partial<Enrollment>) {
    const prisma = getPrismaClient();
    return prisma.enrollment.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.completionDate && { completionDate: data.completionDate }),
      },
      include: {
        course: true,
        student: true,
      },
    });
  },

  /**
   * Marks an enrollment as completed
   */
  async markCompleted(id: string) {
    const prisma = getPrismaClient();
    return prisma.enrollment.update({
      where: { id },
      data: {
        status: 'completed',
        progress: 100,
        completionDate: new Date(),
      },
    });
  },
};

/**
 * Assessment model operations
 */
export const AssessmentModel = {
  /**
   * Finds an assessment by ID
   */
  async findById(id: string) {
    const prisma = getPrismaClient();
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        module: true,
        course: true,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    return assessment;
  },

  /**
   * Finds assessments by course ID
   */
  async findByCourseId(courseId: string) {
    const prisma = getPrismaClient();
    return prisma.assessment.findMany({
      where: { courseId },
      include: {
        module: true,
      },
    });
  },

  /**
   * Finds assessments by module ID
   */
  async findByModuleId(moduleId: string) {
    const prisma = getPrismaClient();
    return prisma.assessment.findMany({
      where: { moduleId },
    });
  },
};

/**
 * Learning Outcome model operations
 */
export const LearningOutcomeModel = {
  /**
   * Records a learning outcome
   */
  async create(data: {
    enrollmentId: string;
    courseId: string;
    moduleId: string;
    assessmentScore: number;
    timeSpent: number;
    conceptMastery?: number;
  }) {
    const prisma = getPrismaClient();
    return prisma.learningOutcome.create({
      data: {
        enrollmentId: data.enrollmentId,
        courseId: data.courseId,
        moduleId: data.moduleId,
        assessmentScore: data.assessmentScore,
        timeSpent: data.timeSpent,
        conceptMastery: data.conceptMastery || 0,
      },
    });
  },

  /**
   * Finds learning outcomes by enrollment ID
   */
  async findByEnrollmentId(enrollmentId: string) {
    const prisma = getPrismaClient();
    return prisma.learningOutcome.findMany({
      where: { enrollmentId },
      include: {
        enrollment: true,
        course: true,
      },
    });
  },

  /**
   * Calculates average score for an enrollment
   */
  async calculateAverageScore(enrollmentId: string): Promise<number> {
    const prisma = getPrismaClient();
    const result = await prisma.learningOutcome.aggregate({
      where: { enrollmentId },
      _avg: { assessmentScore: true },
    });

    return result._avg.assessmentScore || 0;
  },
};
