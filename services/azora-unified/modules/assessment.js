const router = require('express').Router();

// In-memory storage
const assessments = new Map();
const submissions = new Map();

router.get('/', (req, res) => {
  res.json({ success: true, data: Array.from(assessments.values()) });
});

router.post('/', (req, res) => {
  const { title, questions, passingScore = 70 } = req.body;
  const id = Date.now().toString();
  const assessment = { id, title, questions, passingScore, createdAt: new Date() };
  assessments.set(id, assessment);
  res.json({ success: true, data: assessment });
});

router.post('/:id/submit', (req, res) => {
  const { studentId, answers } = req.body;
  const assessment = assessments.get(req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  
  const score = calculateScore(assessment.questions, answers);
  const submission = {
    id: Date.now().toString(),
    assessmentId: req.params.id,
    studentId,
    score,
    passed: score >= assessment.passingScore,
    submittedAt: new Date()
  };
  
  submissions.set(submission.id, submission);
  res.json({ success: true, data: submission });
});

function calculateScore(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correct) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}

module.exports = router;
