/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { StudentInformationSystem } from './student-information-system';

const app = express();
const PORT = process.env.PORT || 3021;

const sis = new StudentInformationSystem();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'azora-erp' }));

// Student records
app.post('/api/students', async (req, res) => {
  try {
    const record = await sis.createStudentRecord(req.body);
    res.status(201).json({ success: true, record });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/students/:studentNumber', async (req, res) => {
  try {
    const record = await sis.getStudentRecord(req.params.studentNumber);
    res.json({ success: true, record });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Course registration
app.post('/api/registration/enroll', async (req, res) => {
  try {
    const { studentNumber, courseId } = req.body;
    await sis.enrollInCourse(studentNumber, courseId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Degree audit
app.get('/api/students/:studentNumber/degree-audit', async (req, res) => {
  try {
    const audit = await sis.performDegreeAudit(req.params.studentNumber);
    res.json({ success: true, audit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Grades
app.post('/api/grades', async (req, res) => {
  try {
    await sis.recordGrade(req.body.studentNumber, req.body.courseId, req.body.grade);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/students/:studentNumber/transcript', async (req, res) => {
  try {
    const transcript = await sis.generateTranscript(req.params.studentNumber);
    res.json({ success: true, transcript });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`🎓 ERP System on port ${PORT}`));
export default app;
