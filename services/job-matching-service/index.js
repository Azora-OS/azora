const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class JobMatchingService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3056;
    this.jobs = new Map();
    this.applications = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'job-matching-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/jobs', this.postJob.bind(this));
    this.app.get('/api/jobs', this.getJobs.bind(this));
    this.app.post('/api/jobs/:id/apply', this.applyJob.bind(this));
    this.app.post('/api/match', this.matchJobs.bind(this));
    this.app.get('/api/applications/:userId', this.getApplications.bind(this));
  }

  postJob(req, res) {
    const { title, company, description, skills, salary, location } = req.body;
    const id = `JOB-${Date.now()}`;
    const job = { id, title, company, description, skills, salary, location, postedAt: new Date() };
    this.jobs.set(id, job);
    res.status(201).json(job);
  }

  getJobs(req, res) {
    res.json({ jobs: Array.from(this.jobs.values()) });
  }

  applyJob(req, res) {
    const { userId, resume, coverLetter } = req.body;
    const job = this.jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const applicationId = `APP-${Date.now()}`;
    const application = { applicationId, jobId: job.id, userId, resume, coverLetter, status: 'pending', appliedAt: new Date() };
    this.applications.set(applicationId, application);
    res.json({ application });
  }

  matchJobs(req, res) {
    const { skills, experience, location } = req.body;
    const matches = Array.from(this.jobs.values()).map(job => {
      const skillMatch = job.skills.filter(s => skills.includes(s)).length / job.skills.length;
      const score = skillMatch * 100;
      return { job, score };
    }).filter(m => m.score > 50).sort((a, b) => b.score - a.score);
    res.json({ matches });
  }

  getApplications(req, res) {
    const applications = Array.from(this.applications.values()).filter(a => a.userId === req.params.userId);
    res.json({ applications });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Job Matching Service running on port ${this.port}`));
  }
}

const service = new JobMatchingService();
if (require.main === module) service.start();
module.exports = service;
