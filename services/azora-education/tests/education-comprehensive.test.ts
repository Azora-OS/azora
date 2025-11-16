import { describe, it, expect, beforeEach } from '@jest/globals';
import { userFactory, courseFactory, authHelper } from '@azora/test-utils';
import request from 'supertest';

const API_URL = process.env.EDUCATION_SERVICE_URL || 'http://localhost:4002';

describe('Education Service - Comprehensive Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    testUser = userFactory.buildStudent();
    authToken = authHelper.generateToken({
      userId: testUser.id!,
      email: testUser.email,
      role: testUser.role,
    });
  });

  describe('Course Management', () => {
    it('should create new course', async () => {
      const courseData = courseFactory.build();
      
      const res = await request(API_URL)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      
      expect(res.status).toBe(201);
      expect(res.body.course.title).toBe(courseData.title);
    });

    it('should list all courses', async () => {
      const res = await request(API_URL)
        .get('/api/courses')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.courses)).toBe(true);
    });

    it('should get course by ID', async () => {
      const courseData = courseFactory.build();
      const createRes = await request(API_URL)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      
      const courseId = createRes.body.course.id;
      
      const res = await request(API_URL)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.course.id).toBe(courseId);
    });
  });

  describe('Course Enrollment', () => {
    let courseId: string;

    beforeEach(async () => {
      const courseData = courseFactory.build();
      const res = await request(API_URL)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      courseId = res.body.course.id;
    });

    it('should enroll student in course', async () => {
      const res = await request(API_URL)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(201);
      expect(res.body.enrollment.courseId).toBe(courseId);
      expect(res.body.enrollment.studentId).toBe(testUser.id);
    });

    it('should prevent duplicate enrollment', async () => {
      await request(API_URL)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);
      
      const res = await request(API_URL)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(409);
    });

    it('should get student enrollments', async () => {
      await request(API_URL)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);
      
      const res = await request(API_URL)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.enrollments.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Tracking', () => {
    let courseId: string;
    let lessonId: string;

    beforeEach(async () => {
      const courseData = courseFactory.build();
      const courseRes = await request(API_URL)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      courseId = courseRes.body.course.id;
      
      await request(API_URL)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);
      
      lessonId = 'lesson-1'; // Mock lesson ID
    });

    it('should mark lesson as complete', async () => {
      const res = await request(API_URL)
        .post(`/api/progress/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.progress.completed).toBe(true);
    });

    it('should calculate course progress', async () => {
      await request(API_URL)
        .post(`/api/progress/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);
      
      const res = await request(API_URL)
        .get(`/api/progress/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.progress.percentage).toBeGreaterThan(0);
    });

    it('should award AZR tokens on lesson completion', async () => {
      const res = await request(API_URL)
        .post(`/api/progress/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.body.reward).toBeDefined();
      expect(res.body.reward.amount).toBeGreaterThan(0);
    });
  });

  describe('AI Tutor Integration', () => {
    it('should ask question to AI tutor', async () => {
      const res = await request(API_URL)
        .post('/api/ai-tutor/ask')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'Explain variables in Python',
          context: 'Python Basics Course',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.answer).toBeDefined();
      expect(res.body.answer.length).toBeGreaterThan(50);
    });

    it('should get personalized learning recommendations', async () => {
      const res = await request(API_URL)
        .get('/api/ai-tutor/recommendations')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.recommendations)).toBe(true);
    });
  });

  describe('Assessments', () => {
    let courseId: string;

    beforeEach(async () => {
      const courseData = courseFactory.build();
      const res = await request(API_URL)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      courseId = res.body.course.id;
    });

    it('should submit assessment', async () => {
      const res = await request(API_URL)
        .post(`/api/assessments/${courseId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { questionId: 'q1', answer: 'A' },
            { questionId: 'q2', answer: 'B' },
          ],
        });
      
      expect(res.status).toBe(200);
      expect(res.body.score).toBeDefined();
    });

    it('should get assessment results', async () => {
      const submitRes = await request(API_URL)
        .post(`/api/assessments/${courseId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: [] });
      
      const assessmentId = submitRes.body.assessmentId;
      
      const res = await request(API_URL)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.assessment).toBeDefined();
    });
  });
});
