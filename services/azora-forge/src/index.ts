/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { JobMatchingService } from './services/jobMatchingService';
import { DisputeService } from './services/disputeService';
import { PortfolioService } from './services/portfolioService';

const app = express();
const prisma = new PrismaClient();
const matching = new JobMatchingService();
const disputes = new DisputeService();
const portfolios = new PortfolioService();

app.use(cors());
app.use(express.json());

// Jobs
app.post('/api/jobs', async (req, res) => {
  try {
    const job = await prisma.job.create({ data: req.body });
    res.json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  const { status, skills } = req.query;
  const jobs = await prisma.job.findMany({
    where: { status: status as any, skills: skills ? { hasSome: [skills as string] } : undefined },
    include: { client: true, applications: true }
  });
  res.json(jobs);
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { client: true, freelancer: true, applications: true, milestones: true }
  });
  res.json(job);
});

// Applications
app.post('/api/applications', async (req, res) => {
  try {
    const app = await prisma.application.create({ data: req.body });
    res.json(app);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  const app = await prisma.application.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(app);
});

// Escrow
app.post('/api/escrow', async (req, res) => {
  try {
    const escrow = await prisma.escrow.create({ data: req.body });
    res.json(escrow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/escrow/:id/release', async (req, res) => {
  const escrow = await prisma.escrow.update({
    where: { id: req.params.id },
    data: { status: 'RELEASED', releasedAt: new Date() }
  });
  res.json(escrow);
});

// Milestones
app.post('/api/milestones', async (req, res) => {
  const milestone = await prisma.milestone.create({ data: req.body });
  res.json(milestone);
});

app.put('/api/milestones/:id', async (req, res) => {
  const milestone = await prisma.milestone.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(milestone);
});

// Reviews
app.post('/api/reviews', async (req, res) => {
  const review = await prisma.review.create({ data: req.body });
  await prisma.user.update({
    where: { id: req.body.revieweeId },
    data: {
      rating: { increment: req.body.rating },
      completedJobs: { increment: 1 }
    }
  });
  res.json(review);
});

// Skills
app.post('/api/skills/verify', async (req, res) => {
  const skill = await prisma.skillVerification.create({ data: req.body });
  res.json(skill);
});

app.get('/api/users/:id/skills', async (req, res) => {
  const skills = await prisma.skillVerification.findMany({
    where: { userId: req.params.id }
  });
  res.json(skills);
});

// AI Matching
app.post('/api/match/freelancers', async (req, res) => {
  try {
    const { jobId, limit } = req.body;
    const matches = await matching.matchFreelancersToJob(jobId, limit);
    res.json(matches);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Disputes
app.post('/api/disputes', async (req, res) => {
  try {
    const { jobId, raisedBy, reason } = req.body;
    const dispute = await disputes.createDispute(jobId, raisedBy, reason);
    res.json(dispute);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/disputes/:jobId/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const result = await disputes.resolveDispute(req.params.jobId, resolution);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Portfolios
app.post('/api/portfolios', async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const portfolio = await portfolios.createPortfolio(userId, data);
    res.json(portfolio);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/portfolios/:userId', async (req, res) => {
  try {
    const portfolio = await portfolios.getPortfolio(req.params.userId);
    res.json(portfolio);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/portfolios/:userId/projects', async (req, res) => {
  try {
    const portfolio = await portfolios.addProject(req.params.userId, req.body);
    res.json(portfolio);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-forge', features: ['jobs', 'escrow', 'matching', 'disputes', 'portfolios'] });
});

const PORT = process.env.PORT || 4700;
app.listen(PORT, () => console.log(`🔨 Azora Forge on port ${PORT}`));
