/**
 * Notification Routes
 */

import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new NotificationService();
const logger = new ElaraLogger('NotificationRoutes');

router.post('/notifications/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, type, name } = req.body;
    let result;
    
    if (type === 'welcome') {
      result = await service.sendWelcomeEmail(userId, email, name);
    } else if (type === 'completion') {
      result = await service.sendOnboardingCompleteEmail(userId, email);
    } else if (type === 'contract_ready') {
      result = await service.sendContractReadyEmail(userId, email);
    } else {
      result = await service.sendWelcomeEmail(userId, email, name || 'User');
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/notifications/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const result = await service.getUserNotifications(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
