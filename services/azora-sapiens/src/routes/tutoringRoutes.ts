import { Router, Request, Response } from 'express';
import TutorEngine from '../engines/tutor-engine';
import LearningPathEngine from '../engines/learning-paths';
import AssessmentEngine from '../engines/assessment-engine';

const router = Router();

// Auth middleware types
interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

// Tutoring Routes
router.post('/tutor', async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        const { subject, question, context } = req.body;
        const result = await TutorEngine.tutorSession(studentId, subject, question, context);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in tutor session:', error);
        res.status(500).json({ success: false, error: 'Failed to get tutor response' });
    }
});

router.post('/explain', async (req: Request, res: Response) => {
    try {
        const { concept, level } = req.body;
        const explanation = await TutorEngine.explainConcept(concept, level);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        console.error('Error explaining concept:', error);
        res.status(500).json({ success: false, error: 'Failed to get explanation' });
    }
});


// Learning Path Routes
router.post('/learning-path', (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        const { goal } = req.body;
        const studentProfile = { ...req.body.studentProfile, studentId };
        const path = LearningPathEngine.generatePath(studentProfile, goal);
        res.json({ success: true, data: path });
    } catch (error) {
        console.error('Error generating learning path:', error);
        res.status(500).json({ success: false, error: 'Failed to generate learning path' });
    }
});

// Assessment Routes
router.post('/assessment', (req: Request, res: Response) => {
    try {
        const { subject, level, questionCount } = req.body;
        const assessment = AssessmentEngine.createAssessment(subject, level, questionCount);
        res.json({ success: true, data: assessment });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ success: false, error: 'Failed to create assessment' });
    }
});

router.post('/grade', (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.userId;
        const { answers, assessment } = req.body;
        const result = AssessmentEngine.gradeAssessment(answers, assessment);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error grading assessment:', error);
        res.status(500).json({ success: false, error: 'Failed to grade assessment' });
    }
});

export default router;
