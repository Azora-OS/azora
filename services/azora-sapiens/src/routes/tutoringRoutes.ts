import { Router } from 'express';
import { TutoringEngine } from '../engines/TutoringEngine';
import { LearningPathEngine } from '../engines/LearningPathEngine';
import { AssessmentEngine } from '../engines/AssessmentEngine';

const router = Router();
const tutoringEngine = new TutoringEngine();
const learningPathEngine = new LearningPathEngine();
const assessmentEngine = new AssessmentEngine();

router.post('/sessions', (req, res) => {
  const { studentId, subject } = req.body;
  const session = tutoringEngine.createSession(studentId, subject);
  res.json({ success: true, session });
});

router.post('/sessions/:sessionId/message', (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;
  const message = tutoringEngine.sendMessage(sessionId, content, 'student');
  const session = tutoringEngine.getSession(sessionId);
  res.json({ success: true, message, session });
});

router.get('/sessions/:sessionId', (req, res) => {
  const session = tutoringEngine.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ success: true, session });
});

router.get('/students/:studentId/sessions', (req, res) => {
  const sessions = tutoringEngine.getStudentSessions(req.params.studentId);
  res.json({ success: true, sessions });
});

router.post('/learning-paths', (req, res) => {
  const { studentId, subject, difficulty } = req.body;
  const path = learningPathEngine.createPath(studentId, subject, difficulty);
  res.json({ success: true, path });
});

router.post('/learning-paths/:pathId/steps/:stepId/complete', (req, res) => {
  const { pathId, stepId } = req.params;
  learningPathEngine.completeStep(pathId, stepId);
  const path = learningPathEngine.getPath(pathId);
  res.json({ success: true, path });
});

router.get('/learning-paths/:pathId', (req, res) => {
  const path = learningPathEngine.getPath(req.params.pathId);
  if (!path) return res.status(404).json({ error: 'Path not found' });
  res.json({ success: true, path });
});

router.get('/students/:studentId/learning-paths', (req, res) => {
  const paths = learningPathEngine.getStudentPaths(req.params.studentId);
  res.json({ success: true, paths });
});

router.post('/assessments', (req, res) => {
  const { studentId, subject, difficulty } = req.body;
  const assessment = assessmentEngine.createAssessment(studentId, subject, difficulty);
  res.json({ success: true, assessment });
});

router.post('/assessments/:assessmentId/answers', (req, res) => {
  const { assessmentId } = req.params;
  const { questionId, answer } = req.body;
  assessmentEngine.submitAnswer(assessmentId, questionId, answer);
  res.json({ success: true });
});

router.post('/assessments/:assessmentId/complete', (req, res) => {
  const result = assessmentEngine.completeAssessment(req.params.assessmentId);
  res.json({ success: true, result });
});

router.get('/assessments/:assessmentId', (req, res) => {
  const assessment = assessmentEngine.getAssessment(req.params.assessmentId);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  res.json({ success: true, assessment });
});

router.get('/students/:studentId/assessments', (req, res) => {
  const assessments = assessmentEngine.getStudentAssessments(req.params.studentId);
  res.json({ success: true, assessments });
});

export default router;
