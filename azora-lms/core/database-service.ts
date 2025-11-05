/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

LMS Database Service
Provides Prisma-based data access layer for all LMS operations
*/

import { PrismaClient } from '@prisma/client';
import { Course, Module, Enrollment, User, Progress, AssessmentResult } from './graphql-unified-gateway';

const prisma = new PrismaClient();

export class LMSDatabaseService {
  /**
   * Course Operations
   */
  async getCourse(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                resources: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
        category: true,
      },
    });

    if (!course) return null;

    return this.mapCourseToGraphQL(course);
  }

  async getCourses(limit: number = 10, offset: number = 0, filters?: {
    status?: string;
    categoryId?: string;
    instructorId?: string;
    level?: string;
  }): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.instructorId && { instructorId: filters.instructorId }),
        ...(filters?.level && { level: filters.level as any }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
        category: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map(c => this.mapCourseToGraphQL(c));
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
              },
            },
            modules: {
              include: {
                lessons: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
            enrollments: {
              select: {
                id: true,
              },
            },
            category: true,
          },
        },
      },
    });

    return enrollments.map(e => this.mapCourseToGraphQL(e.course));
  }

  async createCourse(instructorId: string, input: {
    title: string;
    description: string;
    shortDescription?: string;
    categoryId?: string;
    level?: string;
    price?: number;
    thumbnail?: string;
    coverImage?: string;
    tags?: string[];
  }): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        title: input.title,
        slug: this.generateSlug(input.title),
        description: input.description,
        shortDescription: input.shortDescription,
        instructorId,
        categoryId: input.categoryId,
        level: input.level as any || 'BEGINNER',
        price: input.price || 0,
        thumbnail: input.thumbnail,
        coverImage: input.coverImage,
        tags: input.tags || [],
        status: 'DRAFT',
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        modules: true,
        enrollments: {
          select: {
            id: true,
          },
        },
        category: true,
      },
    });

    return this.mapCourseToGraphQL(course);
  }

  async updateCourse(id: string, input: Partial<{
    title: string;
    description: string;
    shortDescription: string;
    status: string;
    price: number;
    thumbnail: string;
    tags: string[];
  }>): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...input,
        ...(input.title && { slug: this.generateSlug(input.title) }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
        category: true,
      },
    });

    return this.mapCourseToGraphQL(course);
  }

  async getProjects(limit: number = 10, offset: number = 0): Promise<any[]> {
    const projects = await prisma.project.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return projects.map(p => this.mapProjectToGraphQL(p));
  }

  /**
   * Enrollment Operations
   */
  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      throw new Error('Already enrolled in this course');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
      },
      include: {
        user: true,
        course: true,
      },
    });

    return this.mapEnrollmentToGraphQL(enrollment);
  }

  async unenrollCourse(userId: string, courseId: string): Promise<boolean> {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return true;
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        user: true,
        course: true,
      },
    });

    if (!enrollment) return null;

    return this.mapEnrollmentToGraphQL(enrollment);
  }

  /**
   * Progress Operations
   */
  async getProgress(userId: string, courseId: string): Promise<Progress> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    const progressRecords = await prisma.courseProgress.findMany({
      where: {
        userId,
        courseId,
        completed: true,
      },
    });

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );
    const completedLessons = progressRecords.length;
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Find current module (first incomplete)
    let currentModule = null;
    let nextModule = null;

    for (const module of enrollment.course.modules) {
      const moduleCompleted = module.lessons.every(lesson =>
        progressRecords.some(p => p.lessonId === lesson.id)
      );

      if (!moduleCompleted) {
        currentModule = this.mapModuleToGraphQL(module);
        break;
      }
    }

    return {
      courseId,
      completionRate: Math.max(enrollment.progress, completionRate),
      pivcEarned: 0, // TODO: Calculate from PIVC engine
      currentModule,
      nextModule,
    };
  }

  async updateProgress(userId: string, courseId: string, lessonId: string): Promise<void> {
    // Update or create progress record
    await prisma.courseProgress.upsert({
      where: {
        userId_courseId_lessonId: {
          userId,
          courseId,
          lessonId,
        },
      },
      create: {
        userId,
        courseId,
        lessonId,
        completed: true,
        progress: 100,
        lastAccessed: new Date(),
      },
      update: {
        completed: true,
        progress: 100,
        lastAccessed: new Date(),
      },
    });

    // Recalculate course progress
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (enrollment) {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );
      const completedLessons = await prisma.courseProgress.count({
        where: {
          userId,
          courseId,
          completed: true,
        },
      });
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progress,
          ...(progress >= 100 && !enrollment.completedAt ? { completedAt: new Date() } : {}),
        },
      });
    }
  }

  /**
   * User Operations
   */
  async getUser(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
        certificates: true,
      },
    });

    if (!user) return null;

    return this.mapUserToGraphQL(user);
  }

  /**
   * Quiz Operations
   */
  async submitQuizAttempt(userId: string, quizId: string, responses: Array<{
    questionId: string;
    answer: string;
  }>): Promise<AssessmentResult> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    const quizResponses = await Promise.all(
      responses.map(async (response) => {
        const question = quiz.questions.find(q => q.id === response.questionId);
        if (!question) return null;

        totalPoints += question.points;

        let isCorrect = false;
        if (question.type === 'MULTIPLE_CHOICE') {
          const correctOption = question.options.find(o => o.isCorrect);
          isCorrect = correctOption?.text === response.answer;
        } else if (question.type === 'TRUE_FALSE') {
          isCorrect = question.options[0]?.text === response.answer;
        } else {
          // For other types, we'd need more sophisticated checking
          isCorrect = true; // Placeholder
        }

        if (isCorrect) {
          earnedPoints += question.points;
        }

        return {
          questionId: question.id,
          answer: response.answer,
          isCorrect,
          points: isCorrect ? question.points : 0,
        };
      })
    );

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        completedAt: new Date(),
        responses: {
          create: quizResponses.filter(Boolean).map(r => ({
            questionId: r!.questionId,
            answer: r!.answer,
            isCorrect: r!.isCorrect,
            points: r!.points,
          })),
        },
      },
    });

    return {
      score,
      pivcEarned: passed ? Math.floor(score * 0.1) : 0, // TODO: Integrate with PIVC engine
      passed,
      feedback: passed
        ? `Excellent work! You scored ${score.toFixed(1)}%.`
        : `You scored ${score.toFixed(1)}%. Review the material and try again.`,
    };
  }

  /**
   * Helper Methods
   */
  private mapCourseToGraphQL(course: any): Course {
    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      instructor: this.mapUserToGraphQL(course.instructor),
      modules: course.modules.map((m: any) => this.mapModuleToGraphQL(m)),
      enrollments: course.enrollments?.length || 0,
      pivcTarget: 100, // TODO: Calculate from course metadata
      constitutionalScore: 95, // TODO: Calculate from content vetting
      createdAt: course.createdAt.getTime(),
      updatedAt: course.updatedAt.getTime(),
    };
  }

  private mapModuleToGraphQL(module: any): Module {
    return {
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      description: module.description || '',
      order: module.order,
      duration: module.lessons?.reduce((sum: number, l: any) => sum + (l.duration || 0), 0) || 0,
      pivcWeight: 10, // TODO: Calculate from module metadata
      content: {
        type: 'text',
        data: module.description || '',
        resources: module.lessons?.flatMap((l: any) =>
          l.resources?.map((r: any) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            url: r.url,
          })) || []
        ) || [],
      },
      assessments: [], // TODO: Load assessments
    };
  }

  private mapEnrollmentToGraphQL(enrollment: any): Enrollment {
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      progress: enrollment.progress,
      pivcEarned: 0, // TODO: Calculate from PIVC engine
      completedModules: [], // TODO: Load from progress records
      enrolledAt: enrollment.createdAt.getTime(),
      completedAt: enrollment.completedAt?.getTime(),
    };
  }

  private mapUserToGraphQL(user: any): User {
    return {
      id: user.id,
      username: user.username || user.email,
      email: user.email,
      role: user.role.toLowerCase() as 'student' | 'instructor' | 'admin',
      profile: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || undefined,
        bio: user.bio || undefined,
        pivcScore: 0, // TODO: Calculate from PIVC engine
        constitutionalAlignment: 0.95, // TODO: Calculate from constitutional ranking
        achievements: user.badges?.map((b: any) => ({
          id: b.badge.id,
          type: b.badge.rarity,
          name: b.badge.name,
          earnedAt: b.earnedAt.getTime(),
        })) || [],
      },
      did: user.didIdentifier || undefined,
    };
  }

  private mapProjectToGraphQL(project: any): any {
    return { ...project, deadline: project.deadline?.toISOString() };
  }

  private mapStudyGroupToGraphQL(group: any): any {
    return {
      ...group,
      members: group.members.map(this.mapUserToGraphQL),
      course: group.course ? this.mapCourseToGraphQL(group.course) : null,
    };
  }

  private mapUserToGraphQL(user: any): any {
    return {
      id: user.id,
      username: user.username || user.email,
      email: user.email,
      role: user.role.toLowerCase() as 'student' | 'instructor' | 'admin',
      profile: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || undefined,
        bio: user.bio || undefined,
        pivcScore: 0, // TODO: Calculate from PIVC engine
        constitutionalAlignment: 0.95, // TODO: Calculate from constitutional ranking
        achievements: user.badges?.map((b: any) => ({
          id: b.badge.id,
          type: b.badge.rarity,
          name: b.badge.name,
          earnedAt: b.earnedAt.getTime(),
        })) || [],
      },
      did: user.didIdentifier || undefined,
    };
  }

  async getUserPortfolio(userId: string): Promise<any[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        participants: {
          some: {
            userId,
            status: 'completed',
          },
        },
      },
      include: {
        requiredSkills: true,
      },
    });

    return projects.map(this.mapProjectToGraphQL);
  }

  // Helper to generate a URL-friendly slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export const lmsDatabase = new LMSDatabaseService();


