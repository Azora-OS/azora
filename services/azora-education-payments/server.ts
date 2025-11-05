/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Education Payments API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { educationPaymentsService } from './payments-service';
import { connectAzoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.PAYMENTS_PORT || 4207;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Education Payments & Rewards',
    timestamp: new Date(),
  });
});

// ========== PAYMENTS ==========

app.post('/api/payments', async (req, res) => {
  try {
    const payment = await educationPaymentsService.processPayment(req.body);
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/payments/:id', (req, res) => {
  const payment = educationPaymentsService.getPayment(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json(payment);
});

app.get('/api/payments/student/:studentId', (req, res) => {
  const payments = educationPaymentsService.getStudentPayments(req.params.studentId);
  res.json({ payments });
});

// ========== SCHOLARSHIPS ==========

app.post('/api/scholarships', async (req, res) => {
  try {
    const scholarship = await educationPaymentsService.createScholarship(req.body);
    res.json(scholarship);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/scholarships', (req, res) => {
  const { status } = req.query;
  const scholarships = educationPaymentsService.getAllScholarships(status as any);
  res.json({ scholarships });
});

app.post('/api/scholarships/:id/apply', async (req, res) => {
  try {
    const application = await educationPaymentsService.applyForScholarship({
      ...req.body,
      scholarshipId: req.params.id,
    });
    res.json(application);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/applications/:id/review', async (req, res) => {
  try {
    const { decision, reviewedBy } = req.body;
    const application = await educationPaymentsService.reviewScholarshipApplication(
      req.params.id,
      decision,
      reviewedBy
    );
    res.json(application);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== REWARDS ==========

app.post('/api/rewards', async (req, res) => {
  try {
    const reward = await educationPaymentsService.awardReward(req.body);
    res.json(reward);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/rewards/student/:studentId', (req, res) => {
  const rewards = educationPaymentsService.getStudentRewards(req.params.studentId);
  res.json({ rewards });
});

app.listen(PORT, () => {
  console.log(`\n💳 AZORA EDUCATION PAYMENTS & REWARDS running on port ${PORT}\n`);
  console.log(`   💰 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`   🎓 Scholarships: http://localhost:${PORT}/api/scholarships`);
  console.log(`   🏆 Rewards: http://localhost:${PORT}/api/rewards`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
