import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const logDecisionSchema = z.object({
    projectId: z.string(),
    agentName: z.string(),
    decision: z.string(),
    impact: z.string(),
    reasoning: z.string().optional(),
});

const updateContextSchema = z.object({
    vision: z.record(z.any()).optional(),
    requirements: z.record(z.any()).optional(),
    designChoices: z.record(z.any()).optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/genesis/:projectId - Get full Genesis Station context
router.get('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                vision: true,
                requirements: true,
                designChoices: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get recent logs
        const logs = await prisma.genesisLog.findMany({
            where: { projectId },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        // Get active blockers (from tasks)
        const blockers = await prisma.agentTask.findMany({
            where: {
                projectId,
                status: 'BLOCKED',
            },
            select: {
                id: true,
                title: true,
                agentName: true,
                error: true,
            },
        });

        res.json({
            context: project,
            logs,
            blockers,
        });
    } catch (error) {
        console.error('Error fetching Genesis context:', error);
        res.status(500).json({ error: 'Failed to fetch Genesis context' });
    }
});

// POST /api/genesis/log - Log an implementation decision
router.post('/log', async (req, res) => {
    try {
        const data = logDecisionSchema.parse(req.body);

        const log = await prisma.genesisLog.create({
            data: {
                projectId: data.projectId,
                agentName: data.agentName,
                decision: data.decision,
                impact: data.impact,
                reasoning: data.reasoning,
            },
        });

        res.status(201).json(log);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error logging decision:', error);
        res.status(500).json({ error: 'Failed to log decision' });
    }
});

// PUT /api/genesis/:projectId/context - Update project context (Vision/Requirements/Design)
router.put('/:projectId/context', async (req, res) => {
    try {
        const { projectId } = req.params;
        const data = updateContextSchema.parse(req.body);

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                vision: data.vision ? data.vision : undefined,
                requirements: data.requirements ? data.requirements : undefined,
                designChoices: data.designChoices ? data.designChoices : undefined,
            },
        });

        res.json(project);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating context:', error);
        res.status(500).json({ error: 'Failed to update context' });
    }
});

export default router;
