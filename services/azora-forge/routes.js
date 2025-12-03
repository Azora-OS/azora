const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/jobs', async (req, res) => {
  const { status = 'OPEN' } = req.query;
  const jobs = await prisma.job.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json({ success: true, data: jobs });
});

router.post('/api/jobs/:id/apply', async (req, res) => {
  const { userId, coverLetter } = req.body;
  const application = await prisma.jobApplication.create({
    data: { jobId: req.params.id, applicantId: userId, coverLetter, status: 'PENDING' }
  });
  res.json({ success: true, data: application });
});

router.get('/api/skills/assessment', async (req, res) => {
  const { userId } = req.query;
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true }
  });
  res.json({ success: true, data: skills });
});

router.post('/api/jobs', async (req, res) => {
  const { title, description, employerId, salary } = req.body;
  const job = await prisma.job.create({
    data: { title, description, employerId, salary, status: 'OPEN' }
  });
  res.json({ success: true, data: job });
});

module.exports = router;
