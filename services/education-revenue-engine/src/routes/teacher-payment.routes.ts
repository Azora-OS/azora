import { Router, Request, Response } from 'express';
import { teacherPaymentService } from '../services/teacher-payment.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/teacher/revenue/:instructorId', async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const { period } = req.query;
    const revenue = await teacherPaymentService.calculateRevenue(instructorId, (period as string) || 'current');
    res.json({ success: true, data: revenue });
  } catch (error) {
    logger.error('Error fetching revenue', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch revenue' });
  }
});

router.post('/teacher/payments/withdraw', async (req: Request, res: Response) => {
  try {
    const { instructorId, amount } = req.body;
    const result = await teacherPaymentService.processWithdrawal(instructorId, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error processing withdrawal', { error });
    res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
  }
});

router.get('/teacher/payments/:instructorId', async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const history = await teacherPaymentService.getPaymentHistory(instructorId);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('Error fetching payment history', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
  }
});

export default router;
