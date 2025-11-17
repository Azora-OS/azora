const request = require('supertest');
const app = require('../index.js');

describe('Azora Careers Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-careers');
    });
  });

  // Get all job listings test
  describe('GET /api/jobs', () => {
    it('should return all job listings', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific job listing test
  describe('GET /api/jobs/:jobId', () => {
    it('should return specific job listing', async () => {
      const response = await request(app)
        .get('/api/jobs/job_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('job_1');
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/jobs/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Job not found');
    });
  });

  // Create a new job listing test
  describe('POST /api/jobs', () => {
    it('should create a new job listing', async () => {
      const jobData = {
        title: 'Data Scientist',
        department: 'Analytics',
        location: 'San Francisco, CA',
        type: 'Full-time',
        description: 'Analyze complex data sets',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        salary: '$100,000 - $150,000'
      };

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Data Scientist');
      expect(response.body.data.department).toBe('Analytics');
      expect(response.body.data.status).toBe('open');
    });

    it('should return 400 for missing required fields', async () => {
      const jobData = {
        title: 'Data Scientist',
        department: 'Analytics'
        // Missing location, type, and description
      };

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, department, location, type, and description are required');
    });
  });

  // Update job listing test
  describe('PUT /api/jobs/:jobId', () => {
    let jobId;

    beforeAll(async () => {
      // Create a job listing first
      const jobData = {
        title: 'UX Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        description: 'Create beautiful user experiences'
      };

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData);

      jobId = response.body.data.id;
    });

    it('should update job listing', async () => {
      const updateData = {
        title: 'Senior UX Designer',
        salary: '$90,000 - $130,000',
        status: 'closed'
      };

      const response = await request(app)
        .put(`/api/jobs/${jobId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Senior UX Designer');
      expect(response.body.data.salary).toBe('$90,000 - $130,000');
      expect(response.body.data.status).toBe('closed');
    });

    it('should return 404 for non-existent job', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/jobs/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Job not found');
    });
  });

  // Job application test
  describe('POST /api/applications', () => {
    it('should submit a job application', async () => {
      const applicationData = {
        jobId: 'job_1',
        applicant: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          resume: 'https://example.com/resume.pdf'
        }
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.jobId).toBe('job_1');
      expect(response.body.data.status).toBe('submitted');
    });

    it('should return 400 for missing required fields', async () => {
      const applicationData = {
        jobId: 'job_1'
        // Missing applicant
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(400);
      
      expect(response.body.error).toBe('Job ID and applicant information are required');
    });

    it('should return 404 for non-existent job', async () => {
      const applicationData = {
        jobId: 'non-existent',
        applicant: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(404);
      
      expect(response.body.error).toBe('Job not found');
    });
  });

  // Get all job applications test
  describe('GET /api/applications', () => {
    it('should return all job applications', async () => {
      const response = await request(app)
        .get('/api/applications')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific job application test
  describe('GET /api/applications/:applicationId', () => {
    let applicationId;

    beforeAll(async () => {
      // Create an application first
      const applicationData = {
        jobId: 'job_2',
        applicant: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData);

      applicationId = response.body.data.id;
    });

    it('should return specific job application', async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(applicationId);
    });

    it('should return 404 for non-existent application', async () => {
      const response = await request(app)
        .get('/api/applications/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Application not found');
    });
  });

  // Update application status test
  describe('PUT /api/applications/:applicationId', () => {
    let applicationId;

    beforeAll(async () => {
      // Create an application first
      const applicationData = {
        jobId: 'job_1',
        applicant: {
          name: 'Bob Johnson',
          email: 'bob@example.com'
        }
      };

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData);

      applicationId = response.body.data.id;
    });

    it('should update application status', async () => {
      const updateData = {
        status: 'interview',
        notes: 'Scheduled for technical interview'
      };

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('interview');
      expect(response.body.data.notes).toBe('Scheduled for technical interview');
    });

    it('should return 404 for non-existent application', async () => {
      const updateData = {
        status: 'reviewed'
      };

      const response = await request(app)
        .put('/api/applications/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Application not found');
    });
  });

  // Career development resources test
  describe('GET /api/resources', () => {
    it('should return all career resources', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific resource test
  describe('GET /api/resources/:resourceId', () => {
    it('should return specific resource', async () => {
      const response = await request(app)
        .get('/api/resources/res_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('res_1');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .get('/api/resources/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Resource not found');
    });
  });

  // Create a new resource test
  describe('POST /api/resources', () => {
    it('should create a new resource', async () => {
      const resourceData = {
        title: 'Public Speaking Workshop',
        type: 'workshop',
        duration: '1 day',
        description: 'Improve your public speaking skills',
        category: 'communication'
      };

      const response = await request(app)
        .post('/api/resources')
        .send(resourceData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Public Speaking Workshop');
      expect(response.body.data.type).toBe('workshop');
    });

    it('should return 400 for missing required fields', async () => {
      const resourceData = {
        title: 'Public Speaking Workshop',
        type: 'workshop'
        // Missing description
      };

      const response = await request(app)
        .post('/api/resources')
        .send(resourceData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, type, and description are required');
    });
  });

  // Get all departments test
  describe('GET /api/departments', () => {
    it('should return all departments', async () => {
      const response = await request(app)
        .get('/api/departments')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Search jobs test
  describe('GET /api/jobs/search', () => {
    it('should search jobs by department', async () => {
      const response = await request(app)
        .get('/api/jobs/search?department=Engineering')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search jobs by location', async () => {
      const response = await request(app)
        .get('/api/jobs/search?location=Remote')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});