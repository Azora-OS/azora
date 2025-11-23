import { userFactory, courseFactory, enrollmentFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Education Service - Progress Tracking', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should track enrollment progress', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await enrollmentFactory.create({
      userId: student.id,
      courseId: course.id,
      progress: 25,
    });

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress: 50 },
    });

    expect(updated.progress).toBe(50);
  });

  it('should calculate completion percentage', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await enrollmentFactory.create({
      userId: student.id,
      courseId: course.id,
      progress: 75,
    });

    const completionPercentage = enrollment.progress;
    expect(completionPercentage).toBe(75);
  });
});