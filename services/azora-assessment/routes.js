// This file is kept for backward compatibility but the main routes are now in index.js
// All new development should use the routes defined in index.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Legacy route for creating assessments (now in index.js)
router.post('/api/assessments', async (req, res) => {
  try {
    console.warn('⚠️  Using legacy route. Please use the new API at POST /api/assessments');
    const assessment = await prisma.assessment.create({ data: req.body });
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy route for submitting assessments (now in index.js)
router.post('/api/assessments/:id/submit', async (req, res) => {
  try {
    console.warn('⚠️  Using legacy route. Please use the new API at POST /api/assessments/:id/submit');
    const submission = await prisma.submission.create({ data: { ...req.body, assessmentId: req.params.id } });
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy route for getting results (now in index.js)
router.get('/api/assessments/:id/results', async (req, res) => {
  try {
    console.warn('⚠️  Using legacy route. Please use the new API at GET /api/assessments/:id/results');
    const results = await prisma.submission.findMany({ where: { assessmentId: req.params.id } });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;