const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.post('/api/assessments', async (req, res) => {
  const assessment = await prisma.assessment.create({ data: req.body });
  res.json({ success: true, data: assessment });
});

router.post('/api/assessments/:id/submit', async (req, res) => {
  const submission = await prisma.submission.create({ data: { ...req.body, assessmentId: req.params.id } });
  res.json({ success: true, data: submission });
});

router.get('/api/assessments/:id/results', async (req, res) => {
  const results = await prisma.submission.findMany({ where: { assessmentId: req.params.id } });
  res.json({ success: true, data: results });
});

module.exports = router;
