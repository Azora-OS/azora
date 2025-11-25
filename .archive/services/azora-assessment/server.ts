/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Assessment & Grading API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { gradingEngine, Assessment, Submission, Grade } from './grading-engine';
import { gradebookService, CourseGradebook, StudentTranscript } from './gradebook-service';
import { connectAzoraDatabase, azoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.ASSESSMENT_PORT || 4202;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Assessment & Grading System',
    timestamp: new Date(),
  });
});

// ========== ASSESSMENTS ==========

app.post('/api/assessments', async (req, res) => {
  try {
    const assessment = await gradingEngine.createAssessment(req.body);
    res.json(assessment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/assessments/:id', async (req, res) => {
  try {
    const assessment = await gradingEngine.getAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SUBMISSIONS ==========

app.post('/api/submissions', async (req, res) => {
  try {
    const submission = await gradingEngine.submitAssessment(req.body);
    res.json(submission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/submissions/:id', async (req, res) => {
  try {
    const submission = await gradingEngine.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GRADING ==========

app.post('/api/submissions/:id/auto-grade', async (req, res) => {
  try {
    const grade = await gradingEngine.autoGrade(req.params.id);
    res.json(grade);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/submissions/:id/manual-grade', async (req, res) => {
  try {
    const { graderId, questionGrades, rubricScores, feedback } = req.body;
    const grade = await gradingEngine.manualGrade(
      req.params.id,
      graderId,
      questionGrades,
      rubricScores,
      feedback
    );
    res.json(grade);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/grades/:id', async (req, res) => {
  try {
    const grade = await gradingEngine.getGrade(req.params.id);
    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    res.json(grade);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:studentId/grades', async (req, res) => {
  try {
    const { courseId } = req.query;
    const grades = await gradingEngine.getStudentGrades(req.params.studentId, courseId as string);
    res.json({ grades });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GRADEBOOK ==========

app.get('/api/courses/:courseId/gradebook', async (req, res) => {
  try {
    const { courseName } = req.query;
    const gradebook = await gradebookService.getCourseGradebook(
      req.params.courseId,
      courseName as string
    );
    res.json(gradebook);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:studentId/transcript', async (req, res) => {
  try {
    const { studentNumber } = req.query;
    const transcript = await gradebookService.getStudentTranscript(
      req.params.studentId,
      studentNumber as string || req.params.studentId
    );
    res.json(transcript);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId/gradebook/export', async (req, res) => {
  try {
    const csv = await gradebookService.exportToCSV(req.params.courseId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gradebook-${req.params.courseId}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`\n📊 AZORA ASSESSMENT & GRADING SYSTEM running on port ${PORT}\n`);
  console.log(`   📝 Assessments: http://localhost:${PORT}/api/assessments`);
  console.log(`   📤 Submissions: http://localhost:${PORT}/api/submissions`);
  console.log(`   ✅ Grading: http://localhost:${PORT}/api/submissions/:id/auto-grade`);
  console.log(`   📋 Gradebook: http://localhost:${PORT}/api/courses/:courseId/gradebook`);
  console.log(`   📜 Transcripts: http://localhost:${PORT}/api/students/:studentId/transcript`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
