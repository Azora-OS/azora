const express = require('express');
const { getTutorResponse, generateLearningPath } = require('../src/ai-tutor-openai');

const router = express.Router();

router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    const response = await getTutorResponse(question, context);
    res.json({ answer: response, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/learning-path', async (req, res) => {
  try {
    const { subject, level, goals } = req.body;
    const path = await generateLearningPath(subject, level, goals);
    res.json({ path, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
