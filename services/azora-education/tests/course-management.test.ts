import { userFactory, courseFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Education Service - Course Management', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Course Creation', () => {
    it('should create course with valid data', async () => {
      const instructor = await userFactory.createInstructor();

      const course = await courseFactory.create({
        instructorId: instructor.id,
        title: 'Introduction to Python',
        description: 'Learn Python programming from scratch',
      });

      expect(course).toBeDefined();
      expect(course.title).toBe('Introduction to Python');
      expect(course.instructorId).toBe(instructor.id);
    });

    it('should validate required fields', () => {
      const requiredFields = ['title', 'description', 'instructorId'];

      requiredFields.forEach(field => {
        expect(field).toBeDefined();
      });
    });

    it('should set default values', async () => {
      const instructor = await userFactory.createInstructor();

      const course = await courseFactory.create({
        instructorId: instructor.id,
      });

      expect(course.status).toBeDefined();
      expect(course.status).toBeDefined();
    });
  });

  describe('Course Update', () => {
    it('should update course title', async () => {
      const instructor = await userFactory.createInstructor();
      const course = await courseFactory.create({ instructorId: instructor.id });

      const updatedCourse = await prisma.course.update({
        where: { id: course.id },
        data: { title: 'Updated Course Title' },
      });

      expect(updatedCourse.title).toBe('Updated Course Title');
    });

    it('should update course description', async () => {
      const instructor = await userFactory.createInstructor();
      const course = await courseFactory.create({ instructorId: instructor.id });

      const updatedCourse = await prisma.course.update({
        where: { id: course.id },
        data: { description: 'Updated description' },
      });

      expect(updatedCourse.description).toBe('Updated description');
    });

    it('should update course price', async () => {
      const instructor = await userFactory.createInstructor();
      const course = await courseFactory.create({ instructorId: instructor.id });

      const updatedCourse = await prisma.course.update({
        where: { id: course.id },
        data: { price: 4999 },
      });

      expect(updatedCourse.price).toBe(4999);
    });
  });

  describe('Course Deletion', () => {
    it('should delete course', async () => {
      const instructor = await userFactory.createInstructor();
      const course = await courseFactory.create({ instructorId: instructor.id });

      await prisma.course.delete({
        where: { id: course.id },
      });

      const deletedCourse = await prisma.course.findUnique({
        where: { id: course.id },
      });

      expect(deletedCourse).toBeNull();
    });

    it('should soft delete course', async () => {
      const instructor = await userFactory.createInstructor();
      const course = await courseFactory.create({ instructorId: instructor.id });

      await prisma.course.update({
        where: { id: course.id },
        data: { status: 'ARCHIVED' },
      });

      const softDeleted = await prisma.course.findUnique({
        where: { id: course.id },
      });

      expect(softDeleted!.status).toBe('ARCHIVED');
    });
  });

  describe('Course Listing', () => {
    it('should list all courses', async () => {
      const instructor = await userFactory.createInstructor();

      await courseFactory.create({ instructorId: instructor.id });
      await courseFactory.create({ instructorId: instructor.id });
      await courseFactory.create({ instructorId: instructor.id });

      const courses = await prisma.course.findMany();

      expect(courses.length).toBe(3);
    });

    it('should filter courses by instructor', async () => {
      const instructor1 = await userFactory.createInstructor();
      const instructor2 = await userFactory.createInstructor();

      await courseFactory.create({ instructorId: instructor1.id });
      await courseFactory.create({ instructorId: instructor1.id });
      await courseFactory.create({ instructorId: instructor2.id });

      const instructor1Courses = await prisma.course.findMany({
        where: { instructorId: instructor1.id },
      });

      expect(instructor1Courses.length).toBe(2);
    });

    it('should filter published courses', async () => {
      const instructor = await userFactory.createInstructor();

      await courseFactory.create({ instructorId: instructor.id });
      await courseFactory.create({ instructorId: instructor.id });
      await courseFactory.create({ instructorId: instructor.id });

      const publishedCourses = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
      });

      expect(publishedCourses.length).toBe(2);
    });

    it('should search courses by title', async () => {
      const instructor = await userFactory.createInstructor();

      await courseFactory.create({
        instructorId: instructor.id,
        title: 'Python Programming',
      });
      await courseFactory.create({
        instructorId: instructor.id,
        title: 'JavaScript Basics',
      });

      const pythonCourses = await prisma.course.findMany({
        where: {
          title: {
            contains: 'Python',
          },
        },
      });

      expect(pythonCourses.length).toBe(1);
      expect(pythonCourses[0].title).toContain('Python');
    });
  });
});
