/**
 * Compliance Routes
 */

import { Router, Request, Response } from 'express';
import { ComplianceService } from '../services/compliance.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new ComplianceService();
const logger = new ElaraLogger('ComplianceRoutes');

router.post('/compliance/kyc', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, data } = req.body;
    const result = await service.performKYC(userId, data);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/compliance/aml', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, data } = req.body;
    const result = await service.performAML(userId, data);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/compliance/status/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const result = await service.getComplianceStatus(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/compliance/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, reviewedBy } = req.body;
    const result = await service.approveCompliance(userId, reviewedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/compliance/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, reason, reviewedBy } = req.body;
    const result = await service.rejectCompliance(userId, reason, reviewedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
