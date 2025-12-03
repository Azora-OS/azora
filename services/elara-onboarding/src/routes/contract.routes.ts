/**
 * Contract Routes
 */

import { Router, Request, Response } from 'express';
import { ContractService } from '../services/contract.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new ContractService();
const logger = new ElaraLogger('ContractRoutes');

router.post('/contracts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userType } = req.body;
    const result = await service.generateContract(userId, userType);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/contracts/:contractId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractId } = req.params;
    const result = await service.getContract(contractId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/contracts/:contractId/sign', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractId } = req.params;
    const { signedBy, ipAddress } = req.body;
    const result = await service.signContract(contractId, signedBy, ipAddress);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/contracts/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const result = await service.getUserContracts(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
