import { Router } from 'express';
import { prisma, broadcastTaskUpdate, broadcastAgentActivity } from '../index';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const assignTaskSchema = z.object({
    projectId: z.string(),
    agentName: z.string(),
    taskType: z.string(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.number().min(1).max(10).optional(),
    input: z.any().optional(),
});

const updateTaskSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'BLOCKED']),
    output: z.any().optional(),
    error: z.string().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/agents/:projectId/status - Get status of all agents in a project
router.get('/:projectId/status', async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get active tasks for each agent
        const activeTasks = await prisma.agentTask.findMany({
            where: {
                projectId,
                status: { in: ['PROCESSING', 'PENDING'] },
            },
            orderBy: { priority: 'desc' },
        });

        // Group by agent
        const agentStatus: Record<string, any> = {
            Elara: { status: 'idle', currentTask: null },
            Zola: { status: 'idle', currentTask: null },
            Jabari: { status: 'idle', currentTask: null },
            Kofi: { status: 'idle', currentTask: null },
            Abeni: { status: 'idle', currentTask: null },
            Nexus: { status: 'idle', currentTask: null },
        };

        for (const task of activeTasks) {
            if (agentStatus[task.agentName]) {
                if (task.status === 'PROCESSING') {
                    agentStatus[task.agentName].status = 'working';
                    agentStatus[task.agentName].currentTask = task;
                } else if (agentStatus[task.agentName].status === 'idle') {
                    agentStatus[task.agentName].status = 'assigned'; // Has pending tasks
                }
            }
        }

        res.json(agentStatus);
    } catch (error) {
        console.error('Error fetching agent status:', error);
        res.status(500).json({ error: 'Failed to fetch agent status' });
    }
});

// POST /api/agents/tasks - Assign task to agent
router.post('/tasks', async (req, res) => {
    try {
        const data = assignTaskSchema.parse(req.body);

        const task = await prisma.agentTask.create({
            data: {
                projectId: data.projectId,
                agentName: data.agentName,
                taskType: data.taskType,
                title: data.title,
                description: data.description,
                priority: data.priority || 5,
                input: data.input,
                status: 'PENDING',
            },
        });

        // Broadcast update
        broadcastTaskUpdate(data.projectId, {
            id: task.id,
            status: 'PENDING',
        });

        res.status(201).json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error assigning task:', error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});

// PUT /api/agents/tasks/:id - Update task status
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = updateTaskSchema.parse(req.body);

        const task = await prisma.agentTask.update({
            where: { id },
            data: {
                status: data.status,
                output: data.output,
                error: data.error,
                startedAt: data.status === 'PROCESSING' ? new Date() : undefined,
                completedAt: data.status === 'COMPLETED' || data.status === 'FAILED' ? new Date() : undefined,
            },
        });

        // Broadcast update
        broadcastTaskUpdate(task.projectId, {
            id: task.id,
            status: task.status,
        });

        // Log activity if completed
        if (data.status === 'COMPLETED') {
            broadcastAgentActivity(task.projectId, {
                agentName: task.agentName,
                action: 'task_completed',
                details: `Completed task: ${task.title}`,
            });
        }

        res.json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// GET /api/agents/:projectId/tasks - Get all tasks for a project
router.get('/:projectId/tasks', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.query;

        const where: any = { projectId };
        if (status) where.status = status;

        const tasks = await prisma.agentTask.findMany({
            where,
            orderBy: [
                { status: 'asc' }, // PENDING first
                { priority: 'desc' },
            ],
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

export default router;
