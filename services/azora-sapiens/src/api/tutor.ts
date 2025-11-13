const express = require('express');
const router = express.Router();
const tutorEngine = require('../engines/tutor-engine');
const learningPaths = require('../engines/learning-paths');
const assessmentEngine = require('../engines/assessment-engine');
const progressTracker = require('../engines/progress-tracker');

router.post('/session', async (req, res) => {
  try {
    const { studentId, subject, question, context } = req.body;
    const response = await tutorEngine.tutorSession(studentId, subject, question, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/explain', async (req, res) => {
  try {
    const { concept, level } = req.body;
    const explanation = await tutorEngine.explainConcept(concept, level);
    res.json({ concept, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/learning-path', (req, res) => {
  const { studentProfile, goal } = req.body;
  const path = learningPaths.generatePath(studentProfile, goal);
  res.json(path);
});

router.post('/assessment/create', (req, res) => {
  const { subject, level, questionCount } = req.body;
  const assessment = assessmentEngine.createAssessment(subject, level, questionCount);
  res.json(assessment);
});

router.post('/assessment/grade', (req, res) => {
  const { answers, assessment } = req.body;
  const result = assessmentEngine.gradeAssessment(answers, assessment);
  res.json(result);
});

router.get('/progress/:studentId', (req, res) => {
  const { studentId } = req.params;
  const activities = req.app.locals.activities || [];
  const progress = progressTracker.getStudentProgress(studentId, activities);
  res.json(progress);
});

module.exports = router;
