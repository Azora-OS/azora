const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3020;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-careers' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for jobs, applications, and resources (in production, use a database)
const jobs = new Map();
const applications = new Map();
const resources = new Map();
const departments = new Map();

// Initialize with sample data
jobs.set('job_1', {
  id: 'job_1',
  title: 'Software Engineer',
  department: 'Engineering',
  location: 'Remote',
  type: 'Full-time',
  description: 'Build amazing software products',
  requirements: ['JavaScript', 'Node.js', 'React'],
  salary: '$80,000 - $120,000',
  postedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'open'
});

jobs.set('job_2', {
  id: 'job_2',
  title: 'Product Manager',
  department: 'Product',
  location: 'New York, NY',
  type: 'Full-time',
  description: 'Lead product development initiatives',
  requirements: ['Product Management', 'Agile', 'Strategic Thinking'],
  salary: '$90,000 - $140,000',
  postedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'open'
});

resources.set('res_1', {
  id: 'res_1',
  title: 'Leadership Development Program',
  type: 'course',
  duration: '8 weeks',
  description: 'Comprehensive leadership training program',
  category: 'leadership',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

resources.set('res_2', {
  id: 'res_2',
  title: 'Technical Skills Workshop',
  type: 'workshop',
  duration: '2 days',
  description: 'Hands-on technical skills development',
  category: 'technical',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

departments.set('Engineering', {
  id: 'Engineering',
  name: 'Engineering',
  description: 'Software development and engineering',
  head: 'John Smith',
  employeeCount: 50
});

departments.set('Product', {
  id: 'Product',
  name: 'Product',
  description: 'Product management and strategy',
  head: 'Jane Doe',
  employeeCount: 20
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-careers', 
    timestamp: new Date().toISOString() 
  });
});

// Get all job listings
app.get('/api/jobs', (req, res) => {
  try {
    const jobList = Array.from(jobs.values());
    
    res.json({
      success: true,
      data: jobList,
      count: jobList.length
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific job listing
app.get('/api/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new job listing
app.post('/api/jobs', (req, res) => {
  try {
    const { title, department, location, type, description, requirements, salary } = req.body;
    
    // Validate input
    if (!title || !department || !location || !type || !description) {
      return res.status(400).json({ error: 'Title, department, location, type, and description are required' });
    }
    
    const jobId = uuidv4();
    const job = {
      id: jobId,
      title,
      department,
      location,
      type,
      description,
      requirements: requirements || [],
      salary: salary || '',
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open'
    };
    
    jobs.set(jobId, job);
    
    logger.info(`Job listing ${jobId} created`);
    
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update job listing
app.put('/api/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, department, location, type, description, requirements, salary, status } = req.body;
    
    const job = jobs.get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update job
    job.title = title || job.title;
    job.department = department || job.department;
    job.location = location || job.location;
    job.type = type || job.type;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.salary = salary || job.salary;
    job.status = status || job.status;
    job.updatedAt = new Date().toISOString();
    
    jobs.set(jobId, job);
    
    logger.info(`Job listing ${jobId} updated`);
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Job application endpoint
app.post('/api/applications', (req, res) => {
  try {
    const { jobId, applicant } = req.body;
    
    // Validate input
    if (!jobId || !applicant) {
      return res.status(400).json({ error: 'Job ID and applicant information are required' });
    }
    
    // Check if job exists
    const job = jobs.get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const applicationId = uuidv4();
    const application = {
      id: applicationId,
      jobId,
      jobTitle: job.title,
      applicant,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    applications.set(applicationId, application);
    
    logger.info(`Job application ${applicationId} submitted for job ${jobId}`);
    
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error submitting application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all job applications
app.get('/api/applications', (req, res) => {
  try {
    const applicationList = Array.from(applications.values());
    
    res.json({
      success: true,
      data: applicationList,
      count: applicationList.length
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific job application
app.get('/api/applications/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = applications.get(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update application status
app.put('/api/applications/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    
    const application = applications.get(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Update application
    application.status = status || application.status;
    application.notes = notes || application.notes;
    application.updatedAt = new Date().toISOString();
    
    applications.set(applicationId, application);
    
    logger.info(`Job application ${applicationId} status updated to ${status}`);
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Career development resources endpoint
app.get('/api/resources', (req, res) => {
  try {
    const resourceList = Array.from(resources.values());
    
    res.json({
      success: true,
      data: resourceList,
      count: resourceList.length
    });
  } catch (error) {
    logger.error('Error fetching resources:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific resource
app.get('/api/resources/:resourceId', (req, res) => {
  try {
    const { resourceId } = req.params;
    const resource = resources.get(resourceId);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error('Error fetching resource:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new resource
app.post('/api/resources', (req, res) => {
  try {
    const { title, type, duration, description, category } = req.body;
    
    // Validate input
    if (!title || !type || !description) {
      return res.status(400).json({ error: 'Title, type, and description are required' });
    }
    
    const resourceId = uuidv4();
    const resource = {
      id: resourceId,
      title,
      type,
      duration: duration || '',
      description,
      category: category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    resources.set(resourceId, resource);
    
    logger.info(`Resource ${resourceId} created`);
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error('Error creating resource:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all departments
app.get('/api/departments', (req, res) => {
  try {
    const departmentList = Array.from(departments.values());
    
    res.json({
      success: true,
      data: departmentList,
      count: departmentList.length
    });
  } catch (error) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search jobs by department or location
app.get('/api/jobs/search', (req, res) => {
  try {
    const { department, location } = req.query;
    
    const filteredJobs = Array.from(jobs.values()).filter(job => {
      const departmentMatch = !department || job.department.toLowerCase().includes(department.toLowerCase());
      const locationMatch = !location || job.location.toLowerCase().includes(location.toLowerCase());
      return departmentMatch && locationMatch;
    });
    
    res.json({
      success: true,
      data: filteredJobs,
      count: filteredJobs.length
    });
  } catch (error) {
    logger.error('Error searching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Azora Careers Service running on port ${PORT}`);
});

module.exports = app;