const request = require('supertest');
const express = require('express');
const router = require('../api/lms');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('LMS API', () => {
  it('should return courses list', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create course', async () => {
    const res = await request(app).post('/api/courses').send({
      title: 'Test Course',
      instructor: 'Test',
      level: 'beginner'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Course');
  });

  it('should enroll student', async () => {
    const course = await request(app).post('/api/courses').send({
      title: 'Test',
      instructor: 'Test',
      level: 'beginner'
    });
    
    const res = await request(app).post('/api/enroll').send({
      courseId: course.body.data.id,
      studentId: 'student-123'
    });
    
    expect(res.status).toBe(201);
    expect(res.body.data.progress).toBe(0);
  });
});
