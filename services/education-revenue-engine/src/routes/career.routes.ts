import { Router, Request, Response } from 'express';
import { careerService } from '../services/career.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/career/profile/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const profile = await careerService.getCareerProfile(studentId);
    res.json({ success: true, data: profile });
  } catch (error) {
    logger.error('Error fetching career profile', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch career profile' });
  }
});

router.post('/career/job-matches', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const matches = await careerService.matchStudentWithJobs(studentId);
    res.json({ success: true, data: matches });
  } catch (error) {
    logger.error('Error matching jobs', { error });
    res.status(500).json({ success: false, error: 'Failed to match jobs' });
  }
});

router.get('/career/opportunities', async (req: Request, res: Response) => {
  try {
    const { studentId, limit } = req.query;
    const opportunities = await careerService.getJobOpportunities(
      studentId as string,
      parseInt(limit as string) || 10
    );
    res.json({ success: true, data: opportunities });
  } catch (error) {
    logger.error('Error fetching opportunities', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch opportunities' });
  }
});

router.post('/career/coaching', async (req: Request, res: Response) => {
  try {
    const { studentId, topic } = req.body;
    const coaching = await careerService.getCareerCoaching(studentId, topic);
    res.json({ success: true, data: { coaching } });
  } catch (error) {
    logger.error('Error providing coaching', { error });
    res.status(500).json({ success: false, error: 'Failed to provide coaching' });
  }
});

export default router;
