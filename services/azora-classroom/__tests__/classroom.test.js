const request = require('supertest');
const { app, server } = require('../index');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

describe('Azora Classroom Service', () => {
  let testClassroomId;
  let testUserId;
  let testCourseId;

  beforeAll(() => {
    testClassroomId = uuidv4();
    testUserId = uuidv4();
    testCourseId = uuidv4();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.classroomMessage.deleteMany({
      where: { classroomId: testClassroomId }
    });
    
    await prisma.classroomEnrollment.deleteMany({
      where: { classroomId: testClassroomId }
    });
    
    await prisma.classroomSession.deleteMany({
      where: { classroomId: testClassroomId }
    });
    
    await prisma.classroom.deleteMany({
      where: { id: testClassroomId }
    });
    
    await prisma.$disconnect();
    server.close();
  });

  // Health check test
  describe('GET /health', () => {
    it('should return service health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-classroom');
    });
  });

  // API documentation test
  describe('GET /', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.service).toBe('azora-classroom');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  // Classroom creation tests
  describe('POST /api/classrooms', () => {
    it('should create a new classroom', async () => {
      const classroomData = {
        title: 'Test Classroom',
        description: 'A test classroom for unit tests',
        instructorId: testUserId,
        courseId: testCourseId,
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        maxStudents: 25
      };

      const response = await request(app)
        .post('/api/classrooms')
        .send(classroomData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(classroomData.title);
      expect(response.body.data.instructorId).toBe(classroomData.instructorId);
      
      testClassroomId = response.body.data.id;
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Classroom'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/classrooms')
        .send(incompleteData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Get classrooms tests
  describe('GET /api/classrooms', () => {
    it('should get all classrooms', async () => {
      const response = await request(app)
        .get('/api/classrooms')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter classrooms by status', async () => {
      const response = await request(app)
        .get('/api/classrooms?status=SCHEDULED')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // Get classroom by ID tests
  describe('GET /api/classrooms/:id', () => {
    it('should get classroom by ID', async () => {
      const response = await request(app)
        .get(`/api/classrooms/${testClassroomId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testClassroomId);
    });

    it('should return 404 for non-existent classroom', async () => {
      const response = await request(app)
        .get('/api/classrooms/non-existent-id')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Update classroom tests
  describe('PUT /api/classrooms/:id', () => {
    it('should update classroom', async () => {
      const updateData = {
        title: 'Updated Test Classroom',
        maxStudents: 30
      };

      const response = await request(app)
        .put(`/api/classrooms/${testClassroomId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.maxStudents).toBe(updateData.maxStudents);
    });

    it('should return 404 for non-existent classroom', async () => {
      const response = await request(app)
        .put('/api/classrooms/non-existent-id')
        .send({ title: 'Update' })
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Classroom enrollment tests
  describe('POST /api/classrooms/:id/enroll', () => {
    it('should enroll user in classroom', async () => {
      const enrollmentData = {
        userId: testUserId
      };

      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/enroll`)
        .send(enrollmentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.classroomId).toBe(testClassroomId);
    });

    it('should prevent duplicate enrollment', async () => {
      const enrollmentData = {
        userId: testUserId
      };

      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/enroll`)
        .send(enrollmentData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Get classroom enrollments tests
  describe('GET /api/classrooms/:id/enrollments', () => {
    it('should get classroom enrollments', async () => {
      const response = await request(app)
        .get(`/api/classrooms/${testClassroomId}/enrollments`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent classroom', async () => {
      const response = await request(app)
        .get('/api/classrooms/non-existent-id/enrollments')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Classroom session tests
  describe('POST /api/classrooms/:id/start', () => {
    it('should start classroom session', async () => {
      const sessionData = {
        sessionId: uuidv4()
      };

      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/start`)
        .send(sessionData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.classroom.status).toBe('IN_PROGRESS');
    });
  });

  describe('POST /api/classrooms/:id/end', () => {
    it('should end classroom session', async () => {
      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/end`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.classroom.status).toBe('COMPLETED');
    });
  });

  // Classroom messaging tests
  describe('POST /api/classrooms/:id/messages', () => {
    it('should send message in classroom', async () => {
      const messageData = {
        userId: testUserId,
        message: 'Hello, this is a test message!',
        messageType: 'TEXT'
      };

      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/messages`)
        .send(messageData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe(messageData.message);
      expect(response.body.data.userId).toBe(testUserId);
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        message: 'Missing userId'
        // Missing required userId
      };

      const response = await request(app)
        .post(`/api/classrooms/${testClassroomId}/messages`)
        .send(incompleteData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Get classroom messages tests
  describe('GET /api/classrooms/:id/messages', () => {
    it('should get classroom messages', async () => {
      const response = await request(app)
        .get(`/api/classrooms/${testClassroomId}/messages`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent classroom', async () => {
      const response = await request(app)
        .get('/api/classrooms/non-existent-id/messages')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  // Get user classrooms tests
  describe('GET /api/users/:userId/classrooms', () => {
    it('should get classrooms for user', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/classrooms`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Get course classrooms tests
  describe('GET /api/courses/:courseId/classrooms', () => {
    it('should get classrooms for course', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/classrooms`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Delete classroom tests
  describe('DELETE /api/classrooms/:id', () => {
    it('should delete classroom', async () => {
      const response = await request(app)
        .delete(`/api/classrooms/${testClassroomId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent classroom', async () => {
      const response = await request(app)
        .delete('/api/classrooms/non-existent-id')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });
});