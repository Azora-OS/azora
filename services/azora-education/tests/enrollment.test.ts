import { userFactory, courseFactory, enrollmentFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Education Service - Enrollment', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create enrollment', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await enrollmentFactory.create({
      userId: student.id,
      courseId: course.id,
    });

    expect(enrollment).toBeDefined();
    expect(enrollment.userId).toBe(student.id);
    expect(enrollment.courseId).toBe(course.id);
  });

  it('should update enrollment progress', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await enrollmentFactory.create({
      userId: student.id,
      courseId: course.id,
      progress: 50,
    });

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress: 75 },
    });

    expect(updated.progress).toBe(75);
  });

  it('should complete enrollment', async () => {
    const student = await userFactory.createStudent();
    const instructor = await userFactory.createInstructor();
    const course = await courseFactory.create({ instructorId: instructor.id });

    const enrollment = await enrollmentFactory.create({
      userId: student.id,
      courseId: course.id,
    });

    const completed = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    expect(completed.status).toBe('COMPLETED');
    expect(completed.progress).toBe(100);
    expect(completed.completedAt).toBeDefined();
  });
});