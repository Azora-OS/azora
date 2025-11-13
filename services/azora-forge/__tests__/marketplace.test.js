const request = require('supertest');
const express = require('express');
const router = require('../api/marketplace');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Marketplace API', () => {
  it('should return jobs list', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create job posting', async () => {
    const res = await request(app).post('/api/jobs').send({
      title: 'Software Engineer',
      company: 'Test Co',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 50000, max: 80000 },
      skills: ['JavaScript', 'React']
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Software Engineer');
  });

  it('should apply to job', async () => {
    const job = await request(app).post('/api/jobs').send({
      title: 'Test Job',
      company: 'Test',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 50000, max: 80000 },
      skills: ['Test']
    });
    
    const res = await request(app).post(`/api/jobs/${job.body.data.id}/apply`).send({
      userId: 'user-123',
      coverLetter: 'Test letter'
    });
    
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('should match jobs', async () => {
    await request(app).post('/api/jobs').send({
      title: 'JS Developer',
      company: 'Test',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 60000, max: 90000 },
      skills: ['JavaScript', 'Node.js'],
      experience: 3,
      remote: true
    });
    
    const res = await request(app).post('/api/match').send({
      userId: 'user-1',
      skills: ['JavaScript', 'Node.js'],
      experience: 3,
      location: 'Remote'
    });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
