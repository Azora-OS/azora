/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Job Board REST API
 * Express server exposing career services endpoints
 */

import express, { Request, Response } from 'express';
import { CareerServicesSystem } from './career-services';

const app = express();
app.use(express.json());

const careerServices = new CareerServicesSystem();

// ===== JOB ENDPOINTS =====

// Get all jobs (with filters)
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const criteria = {
      keywords: req.query.keywords ? (req.query.keywords as string).split(',') : undefined,
      categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
      employmentTypes: req.query.employmentTypes ? (req.query.employmentTypes as string).split(',') : undefined,
      locations: req.query.locations ? (req.query.locations as string).split(',') : undefined,
      remote: req.query.remote === 'true',
      salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await careerServices.searchJobs(criteria, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job
app.get('/api/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const job = await careerServices.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new job
app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const job = await careerServices.postJob(req.body);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== APPLICATION ENDPOINTS =====

// Submit application
app.post('/api/applications', async (req: Request, res: Response) => {
  try {
    const application = await careerServices.submitApplication(req.body);
    res.status(201).json(application);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update application status
app.patch('/api/applications/:applicationId/status', async (req: Request, res: Response) => {
  try {
    await careerServices.updateApplicationStatus(
      req.params.applicationId,
      req.body.status,
      req.body.updatedBy,
      req.body.notes
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Schedule interview
app.post('/api/applications/:applicationId/interviews', async (req: Request, res: Response) => {
  try {
    const interview = await careerServices.scheduleInterview(
      req.params.applicationId,
      req.body
    );
    res.status(201).json(interview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== RESUME ENDPOINTS =====

// Create resume
app.post('/api/resumes', async (req: Request, res: Response) => {
  try {
    const resume = await careerServices.createResume(req.body.studentNumber, req.body);
    res.status(201).json(resume);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Generate PDF
app.post('/api/resumes/:resumeId/pdf', async (req: Request, res: Response) => {
  try {
    const pdfUrl = await careerServices.generatePDF(req.params.resumeId);
    res.json({ pdfUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== PORTFOLIO ENDPOINTS =====

// Create portfolio
app.post('/api/portfolios', async (req: Request, res: Response) => {
  try {
    const portfolio = await careerServices.createPortfolio(req.body.studentNumber, req.body);
    res.status(201).json(portfolio);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== MATCHING ENDPOINTS =====

// Match student to jobs
app.get('/api/match/:studentNumber', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const matches = await careerServices.matchStudentToJobs(req.params.studentNumber, limit);
    res.json(matches);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== CAREER PROFILE ENDPOINTS =====

// Create career profile
app.post('/api/career-profiles', async (req: Request, res: Response) => {
  try {
    const profile = await careerServices.createCareerProfile(req.body);
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update career profile
app.patch('/api/career-profiles/:studentNumber', async (req: Request, res: Response) => {
  try {
    const profile = await careerServices.updateCareerProfile(req.params.studentNumber, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== ANALYTICS ENDPOINTS =====

// Get career analytics
app.get('/api/analytics/:studentNumber', async (req: Request, res: Response) => {
  try {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const analytics = await careerServices.getCareerAnalytics(
      req.params.studentNumber,
      startDate,
      endDate
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== HEALTH CHECK =====

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'azora-careers', timestamp: new Date() });
});

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`✅ Azora Career Services API running on port ${PORT}`);
});

export default app;
