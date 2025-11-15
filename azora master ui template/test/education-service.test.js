/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../index');
const EducationAI = require('../src/ai/EducationAI');
const { User, Student, Curriculum, Assessment } = require('../src/models');

describe('Azora Education Service Tests', () => {
  let testUser;
  let testStudent;
  let testCurriculum;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test');

    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'parent',
      profile: {
        name: 'Test Parent',
        phone: '+1234567890'
      }
    });

    // Generate auth token
    authToken = 'test-jwt-token';
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'parent',
          profile: {
            name: 'New User',
            phone: '+1234567890'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    test('should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('Student Management', () => {
    test('should create a student profile', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Student',
          grade: 5,
          dateOfBirth: '2015-01-01',
          subjects: ['Mathematics', 'English', 'Science'],
          learningStyle: 'visual',
          specialNeeds: [],
          parentId: testUser._id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.student.name).toBe('Test Student');
      testStudent = response.body.student;
    });

    test('should get all students for parent', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.students)).toBe(true);
      expect(response.body.students.length).toBeGreaterThan(0);
    });

    test('should update student information', async () => {
      const response = await request(app)
        .put(`/api/students/${testStudent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 6,
          subjects: ['Mathematics', 'English', 'Science', 'History']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.student.grade).toBe(6);
    });
  });

  describe('Curriculum Management', () => {
    test('should create a curriculum', async () => {
      const response = await request(app)
        .post('/api/curriculum')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Mathematics Grade 5',
          subject: 'Mathematics',
          grade: 5,
          description: 'Comprehensive mathematics curriculum for grade 5',
          standards: ['CCSS.Math.Content.5.OA.A.1'],
          units: [
            {
              title: 'Operations and Algebraic Thinking',
              lessons: [
                {
                  title: 'Order of Operations',
                  objectives: ['Understand order of operations'],
                  content: 'Learn PEMDAS rules',
                  activities: ['Practice worksheets', 'Interactive exercises']
                }
              ]
            }
          ],
          createdBy: testUser._id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.curriculum.title).toBe('Mathematics Grade 5');
      testCurriculum = response.body.curriculum;
    });

    test('should get curriculum by ID', async () => {
      const response = await request(app)
        .get(`/api/curriculum/${testCurriculum._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.curriculum.title).toBe('Mathematics Grade 5');
    });

    test('should get all curricula', async () => {
      const response = await request(app)
        .get('/api/curriculum')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.curricula)).toBe(true);
    });
  });

  describe('AI-Powered Features', () => {
    let educationAI;

    beforeAll(() => {
      educationAI = new EducationAI();
    });

    test('should generate lesson plan', async () => {
      const response = await request(app)
        .post('/api/ai/lesson-plan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Mathematics',
          grade: 5,
          studentLevel: 'intermediate',
          objectives: ['Master fractions', 'Understand decimals'],
          duration: 60,
          studentId: testStudent._id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.lessonPlan).toBeDefined();
      expect(response.body.lessonPlan.objectives).toBeDefined();
      expect(response.body.lessonPlan.activities).toBeDefined();
    });

    test('should analyze assessment', async () => {
      const response = await request(app)
        .post('/api/ai/assess')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          subject: 'Mathematics',
          grade: 5,
          scores: {
            'fractions': 85,
            'decimals': 92,
            'word_problems': 78
          },
          totalScore: 85
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toBeDefined();
      expect(response.body.analysis.strengths).toBeDefined();
      expect(response.body.analysis.improvements).toBeDefined();
    });

    test('should solve mathematical problems', async () => {
      const response = await request(app)
        .post('/api/math/solve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          problem: '2x + 3 = 7',
          type: 'algebra'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.solution).toBeDefined();
      expect(response.body.steps).toBeDefined();
    });
  });

  describe('Assessment System', () => {
    let testAssessment;

    test('should create an assessment', async () => {
      const response = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Mathematics Midterm',
          subject: 'Mathematics',
          grade: 5,
          type: 'midterm',
          questions: [
            {
              question: 'What is 2 + 2?',
              type: 'multiple_choice',
              options: ['3', '4', '5', '6'],
              correctAnswer: '4',
              points: 10
            },
            {
              question: 'Solve: x + 5 = 12',
              type: 'short_answer',
              correctAnswer: '7',
              points: 15
            }
          ],
          totalPoints: 25,
          timeLimit: 60,
          curriculumId: testCurriculum._id,
          createdBy: testUser._id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.assessment.title).toBe('Mathematics Midterm');
      testAssessment = response.body.assessment;
    });

    test('should submit assessment answers', async () => {
      const response = await request(app)
        .post(`/api/assessments/${testAssessment._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          answers: [
            { questionIndex: 0, answer: '4' },
            { questionIndex: 1, answer: '7' }
          ],
          timeSpent: 45
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.score).toBeDefined();
      expect(response.body.result.percentage).toBeDefined();
    });

    test('should get assessment results', async () => {
      const response = await request(app)
        .get(`/api/assessments/${testAssessment._id}/results?studentId=${testStudent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.score).toBeDefined();
    });
  });

  describe('Progress Reporting', () => {
    test('should generate progress report', async () => {
      const response = await request(app)
        .post('/api/progress-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          period: 'quarterly',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          includeAssessments: true,
          includeAttendance: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.report).toBeDefined();
      expect(response.body.report.studentInfo).toBeDefined();
      expect(response.body.report.academicProgress).toBeDefined();
    });

    test('should get progress reports list', async () => {
      const response = await request(app)
        .get('/api/progress-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ studentId: testStudent._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.reports)).toBe(true);
    });
  });

  describe('File Management', () => {
    test('should upload educational material', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('type', 'worksheet')
        .field('subject', 'Mathematics')
        .field('grade', 5)
        .field('description', 'Test worksheet');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.filename).toBe('test.pdf');
    });

    test('should get uploaded files', async () => {
      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ subject: 'Mathematics', grade: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });

  describe('Department of Education Compliance', () => {
    test('should validate curriculum standards', async () => {
      const response = await request(app)
        .post('/api/curriculum/validate-standards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: testCurriculum._id,
          standards: ['CCSS.Math.Content.5.OA.A.1', 'CCSS.Math.Content.5.NBT.A.1']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.validation).toBeDefined();
      expect(response.body.validation.compliant).toBe(true);
    });

    test('should generate compliance report', async () => {
      const response = await request(app)
        .post('/api/compliance/report')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          period: 'annual',
          year: 2024
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.report).toBeDefined();
      expect(response.body.report.standardsCoverage).toBeDefined();
    });
  });

  describe('Offline Functionality', () => {
    test('should cache curriculum for offline access', async () => {
      const response = await request(app)
        .post('/api/offline/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          curriculumIds: [testCurriculum._id],
          includeAssessments: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cacheInfo).toBeDefined();
    });

    test('should sync offline progress', async () => {
      const response = await request(app)
        .post('/api/offline/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent._id,
          offlineProgress: [
            {
              assessmentId: testAssessment._id,
              score: 90,
              completedAt: new Date()
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.syncResult).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid authentication', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should handle not found resources', async () => {
      const response = await request(app)
        .get('/api/students/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Invalid: empty name
          grade: 'invalid' // Invalid: not a number
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
