const request = require('supertest');
const { app: authApp } = require('../auth-service');
const educationApp = require('../education-service');
const paymentApp = require('../payment-service');
const { getPrismaClient } = require('../shared/database');

const prisma = getPrismaClient();

describe('Integration Tests', () => {
  let authToken;
  let userId;
  let courseId;

  const testUser = {
    email: `integration${Date.now()}@azora.world`,
    password: 'testpass123',
    name: 'Integration Test User',
  };

  beforeAll(async () => {
    // Register and login
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
        duration: 10,
        price: 99,
        status: 'PUBLISHED',
      },
    });
    courseId = course.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('Complete User Flow', () => {
    it('should complete: earn tokens -> view courses -> enroll -> track progress', async () => {
      // 1. Earn tokens
      const earnRes = await request(paymentApp)
        .post('/api/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 200,
          description: 'Completed tutorial',
        });

      expect(earnRes.status).toBe(201);
      expect(earnRes.body.success).toBe(true);

      // 2. Check wallet balance
      const walletRes = await request(paymentApp)
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(walletRes.status).toBe(200);
      expect(walletRes.body.data.balance).toBeGreaterThan(0);

      // 3. List courses
      const coursesRes = await request(educationApp)
        .get('/api/courses');

      expect(coursesRes.status).toBe(200);
      expect(Array.isArray(coursesRes.body.data)).toBe(true);

      // 4. Enroll in course
      const enrollRes = await request(educationApp)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(enrollRes.status).toBe(201);
      expect(enrollRes.body.data.courseId).toBe(courseId);

      // 5. View enrollments
      const enrollmentsRes = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(enrollmentsRes.status).toBe(200);
      expect(enrollmentsRes.body.data.length).toBeGreaterThan(0);

      // 6. Update progress
      const enrollmentId = enrollmentsRes.body.data[0].id;
      const progressRes = await request(educationApp)
        .patch(`/api/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 50 });

      expect(progressRes.status).toBe(200);
      expect(progressRes.body.data.progress).toBe(50);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent unauthorized access', async () => {
      const res = await request(educationApp)
        .get('/api/enrollments');

      expect(res.status).toBe(401);
    });

    it('should prevent access with invalid token', async () => {
      const res = await request(educationApp)
        .get('/api/enrollments')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
