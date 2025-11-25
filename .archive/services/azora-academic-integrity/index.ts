/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * ACADEMIC INTEGRITY SYSTEM - MAIN SERVER
 * 
 * Comprehensive anti-cheating and academic integrity system
 */

import express from 'express';
import cors from 'cors';
import { plagiarismDetectorService } from './plagiarism-detector';
import { liveProctoringService } from './live-proctoring';
import { browserLockdownService } from './browser-lockdown';

const app = express();
const PORT = process.env.PORT || 4300;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-academic-integrity' });
});

// Plagiarism Detection Routes
app.post('/api/plagiarism/check', async (req, res) => {
  try {
    const report = await plagiarismDetectorService.checkPlagiarism(req.body);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/plagiarism/report/:reportId', (req, res) => {
  try {
    const report = plagiarismDetectorService.getReport(req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/plagiarism/student/:studentNumber', (req, res) => {
  try {
    const reports = plagiarismDetectorService.getReportsByStudent(req.params.studentNumber);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/plagiarism/suspicious', (req, res) => {
  try {
    const reports = plagiarismDetectorService.getSuspiciousReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Live Proctoring Routes
app.post('/api/proctoring/start', async (req, res) => {
  try {
    const session = await liveProctoringService.startSession(
      req.body.examId,
      req.body.studentNumber,
      req.body.config
    );
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/event', async (req, res) => {
  try {
    await liveProctoringService.recordEvent(
      req.body.sessionId,
      req.body.type,
      req.body.description,
      req.body.severity,
      req.body.evidence
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/webcam', async (req, res) => {
  try {
    const analysis = await liveProctoringService.monitorWebcam(
      req.body.sessionId,
      Buffer.from(req.body.frameData, 'base64')
    );
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proctoring/end', async (req, res) => {
  try {
    const session = await liveProctoringService.endSession(req.body.sessionId);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proctoring/session/:sessionId', (req, res) => {
  try {
    const session = liveProctoringService.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/proctoring/flagged', (req, res) => {
  try {
    const sessions = liveProctoringService.getFlaggedSessions();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Browser Lockdown Routes
app.post('/api/lockdown/initialize', async (req, res) => {
  try {
    const result = await browserLockdownService.initializeLockdown(
      req.body.examId,
      req.body.studentNumber,
      req.body.config
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lockdown/violation', async (req, res) => {
  try {
    await browserLockdownService.recordViolation(
      req.body.sessionId,
      req.body.violation.type,
      req.body.violation.details
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lockdown/heartbeat', async (req, res) => {
  try {
    await browserLockdownService.receiveHeartbeat(req.body.sessionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lockdown/end', async (req, res) => {
  try {
    const session = await browserLockdownService.endSession(req.body.sessionId);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Academic Integrity System running on port ${PORT}`);
  console.log(`   - Plagiarism Detection: /api/plagiarism/*`);
  console.log(`   - Live Proctoring: /api/proctoring/*`);
  console.log(`   - Browser Lockdown: /api/lockdown/*`);
});

export default app;
