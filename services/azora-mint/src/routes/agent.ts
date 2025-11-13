/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { Router } from 'express';
import { MintAgent, TaskPriority, type AgentTask } from '../agents/index.js';
import winston from 'winston';

const router = Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const mintAgent = new MintAgent(logger);
mintAgent.initialize();

/**
 * @swagger
 * /api/v1/agent/execute:
 *   post:
 *     summary: Execute Mint Agent task
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               priority:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Task executed successfully
 */
router.post('/execute', async (req, res) => {
  try {
    const { type, priority = 'medium', parameters } = req.body;

    const task: AgentTask = {
      id: `task_${Date.now()}`,
      type,
      priority: priority as TaskPriority,
      parameters,
      timestamp: new Date()
    };

    const result = await mintAgent.executeTask(task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * @swagger
 * /api/v1/agent/metrics:
 *   get:
 *     summary: Get Mint Agent performance metrics
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Agent metrics retrieved successfully
 */
router.get('/metrics', (req, res) => {
  const metrics = mintAgent.getMetrics();
  res.json(metrics);
});

/**
 * @swagger
 * /api/v1/agent/health:
 *   get:
 *     summary: Get Mint Agent health status
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Agent health retrieved successfully
 */
router.get('/health', (req, res) => {
  const health = mintAgent.getHealth();
  res.json(health);
});

export default router;
