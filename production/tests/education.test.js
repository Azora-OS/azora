const request = require('supertest');
const { app: authApp } = require('../auth-service');
const educationApp = require('../education-service');
const { getPrismaClient } = require('../shared/database');

const prisma = getPrismaClient();

describe('Education Service', () => {
  let authToken;
  let userId;
  let courseId;
  const testUser = {
    email: `education${Date.now()}@azora.world`,
    password: 'testpass123',
    name: 'Education Test User',
  };

  beforeAll(async () => {
    const registerRes = await request(authApp)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    // Create a test course
    const course = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'Test Description',
        instructor: userId,
        duration: 5,
        price: 50,
        status: 'PUBLISHED',
      },
    });
    courseId = course.id;
  });

  afterAll(async () => {
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('GET /api/courses', () => {
    it('should list published courses', async () => {
      const res = await request(educationApp).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should support limit parameter', async () => {
      const res = await request(educationApp).get('/api/courses?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should get course details', async () => {
      const res = await request(educationApp).get(`/api/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(courseId);
      expect(res.body.data).toHaveProperty('modules');
    });

    it('should return 404 for non-existent course', async () => {
      const res = await request(educationApp).get('/api/courses/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    it('should enroll user in course', async () => {
      const res = await request(educationApp)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courseId).toBe(courseId);
    });

    it('should prevent duplicate enrollment', async () => {
      const res = await request(educationApp)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Already enrolled');
    });

    it('should require authentication', async () => {
      const res = await request(educationApp)
        .post(`/api/courses/${courseId}/enroll`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/enrollments', () => {
    it('should list user enrollments', async () => {
      const res = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/enrollments/:id/progress', () => {
    it('should update enrollment progress', async () => {
      const enrollments = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      const enrollmentId = enrollments.body.data[0].id;

      const res = await request(educationApp)
        .patch(`/api/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 75 });

      expect(res.status).toBe(200);
      expect(res.body.data.progress).toBe(75);
    });

    it('should mark as completed at 100%', async () => {
      const enrollments = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      const enrollmentId = enrollments.body.data[0].id;

      const res = await request(educationApp)
        .patch(`/api/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 100 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should reject invalid progress values', async () => {
      const enrollments = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      const enrollmentId = enrollments.body.data[0].id;

      const res = await request(educationApp)
        .patch(`/api/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 150 });

      expect(res.status).toBe(400);
    });
  });
});
