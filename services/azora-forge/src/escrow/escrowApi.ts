/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Request, Response } from 'express';
import { EscrowService } from './escrowService';

const router = express.Router();

/**
 * POST /api/escrow/create
 * Create a new escrow account
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { projectId, sellerId, buyerId, amount, currency, autoReleaseDays, milestones } = req.body;

    if (!projectId || !sellerId || !buyerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, sellerId, buyerId, amount'
      });
    }

    const escrow = await EscrowService.createEscrowAccount({
      projectId,
      sellerId,
      buyerId,
      amount,
      currency,
      autoReleaseDays,
      milestones
    });

    res.status(201).json({
      success: true,
      data: escrow,
      message: 'Escrow account created successfully'
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create escrow account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/escrow/:id/fund
 * Fund an escrow account
 */
router.post('/:id/fund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    const escrow = await EscrowService.fundEscrow(id, transactionHash);

    res.json({
      success: true,
      data: escrow,
      message: 'Escrow funded successfully'
    });
  } catch (error) {
    console.error('Error funding escrow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fund escrow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/escrow/:id/release
 * Release funds from escrow
 */
router.post('/:id/release', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, milestoneId, reason, approvedBy } = req.body;
    const userId = req.body.userId || 'system'; // TODO: Get from auth middleware

    if (!type || !approvedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, approvedBy'
      });
    }

    const escrow = await EscrowService.releaseFunds(
      id,
      { type, amount, milestoneId, reason, approvedBy },
      userId
    );

    res.json({
      success: true,
      data: escrow,
      message: 'Funds released successfully'
    });
  } catch (error) {
    console.error('Error releasing funds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to release funds',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/escrow/:id/refund
 * Refund escrow to buyer
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.body.userId || 'system'; // TODO: Get from auth middleware

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Refund reason is required'
      });
    }

    const escrow = await EscrowService.refundEscrow(id, reason, userId);

    res.json({
      success: true,
      data: escrow,
      message: 'Escrow refunded successfully'
    });
  } catch (error) {
    console.error('Error refunding escrow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund escrow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/escrow/:id/dispute
 * Open a dispute on escrow
 */
router.post('/:id/dispute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.body.userId || 'user'; // TODO: Get from auth middleware

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Dispute reason is required'
      });
    }

    await EscrowService.disputeEscrow(id, reason, userId);

    res.json({
      success: true,
      message: 'Dispute opened successfully'
    });
  } catch (error) {
    console.error('Error opening dispute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to open dispute',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/escrow/:id
 * Get escrow details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const escrow = await EscrowService.getEscrow(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: 'Escrow not found'
      });
    }

    res.json({
      success: true,
      data: escrow
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escrow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/escrow/user/:userId
 * Get all escrows for a user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const escrows = await EscrowService.getUserEscrows(userId);

    res.json({
      success: true,
      data: escrows,
      total: escrows.length
    });
  } catch (error) {
    console.error('Error fetching user escrows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user escrows',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/escrow/stats
 * Get escrow statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await EscrowService.getEscrowStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching escrow stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escrow statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
