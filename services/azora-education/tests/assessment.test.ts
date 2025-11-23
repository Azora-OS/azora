import { userFactory, courseFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Education Service - Assessment', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create assessment', async () => {
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const assessment = await prisma.assessment.create({
      data: {
        courseId: course.id,
        title: 'Quiz 1',
        type: 'QUIZ',
        userId: instructor.id,
        questions: JSON.stringify([{ question: 'What is 2+2?', answer: '4' }]),
        maxScore: 100,
      },
    });

    expect(assessment).toBeDefined();
    expect(assessment.title).toBe('Quiz 1');
    expect(assessment.maxScore).toBe(100);
  });

  it('should track progress', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        progress: 75,
        status: 'ACTIVE',
        enrolledAt: new Date(),
      }
    });

    expect(enrollment.progress).toBe(75);
  });
});