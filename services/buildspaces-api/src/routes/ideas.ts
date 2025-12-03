import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createIdeaSchema = z.object({
    title: z.string().min(5).max(255),
    description: z.string().min(20),
    authorId: z.string(),
    tags: z.array(z.string()).optional(),
});

const updateIdeaSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().min(20).optional(),
    status: z.enum(['GENESIS', 'VALIDATING', 'APPROVED', 'ARCHIVED']).optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/ideas - List all ideas
router.get('/', async (req, res) => {
    try {
        const { status, authorId, limit = '50', offset = '0' } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (authorId) where.authorId = authorId;

        const ideas = await prisma.idea.findMany({
            where,
            include: {
                tags: true,
                comments: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
        });

        const total = await prisma.idea.count({ where });

        res.json({
            ideas,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

// GET /api/ideas/:id - Get single idea
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const idea = await prisma.idea.findUnique({
            where: { id },
            include: {
                tags: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                },
                project: true,
            },
        });

        if (!idea) {
            return res.status(404).json({ error: 'Idea not found' });
        }

        res.json(idea);
    } catch (error) {
        console.error('Error fetching idea:', error);
        res.status(500).json({ error: 'Failed to fetch idea' });
    }
});

// POST /api/ideas - Create new idea
router.post('/', async (req, res) => {
    try {
        const data = createIdeaSchema.parse(req.body);

        const idea = await prisma.idea.create({
            data: {
                title: data.title,
                description: data.description,
                authorId: data.authorId,
                status: 'GENESIS',
                tags: data.tags
                    ? {
                        create: data.tags.map((tag) => ({ tag })),
                    }
                    : undefined,
            },
            include: {
                tags: true,
            },
        });

        // Trigger AI validation asynchronously
        validateIdeaAsync(idea.id);

        res.status(201).json(idea);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating idea:', error);
        res.status(500).json({ error: 'Failed to create idea' });
    }
});

// PUT /api/ideas/:id - Update idea
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = updateIdeaSchema.parse(req.body);

        const idea = await prisma.idea.update({
            where: { id },
            data,
            include: {
                tags: true,
                comments: true,
            },
        });

        res.json(idea);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating idea:', error);
        res.status(500).json({ error: 'Failed to update idea' });
    }
});

// DELETE /api/ideas/:id - Archive idea
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.idea.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error archiving idea:', error);
        res.status(500).json({ error: 'Failed to archive idea' });
    }
});

// POST /api/ideas/:id/validate - Trigger AI validation
router.post('/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;

        // Update status to VALIDATING
        await prisma.idea.update({
            where: { id },
            data: { status: 'VALIDATING' },
        });

        // Trigger validation
        const analysis = await validateIdea(id);

        res.json(analysis);
    } catch (error) {
        console.error('Error validating idea:', error);
        res.status(500).json({ error: 'Failed to validate idea' });
    }
});

// POST /api/ideas/:id/vote - Upvote/downvote
router.post('/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const { direction } = req.body; // 'up' or 'down'

        const idea = await prisma.idea.update({
            where: { id },
            data: {
                votes: {
                    increment: direction === 'up' ? 1 : -1,
                },
            },
        });

        res.json({ votes: idea.votes });
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// POST /api/ideas/:id/comment - Add comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { authorId, content } = req.body;

        const comment = await prisma.ideaComment.create({
            data: {
                ideaId: id,
                authorId,
                content,
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// POST /api/ideas/:id/deploy - Deploy to Code Chamber
router.post('/:id/deploy', async (req, res) => {
    try {
        const { id } = req.params;

        const idea = await prisma.idea.findUnique({
            where: { id },
            include: { tags: true },
        });

        if (!idea) {
            return res.status(404).json({ error: 'Idea not found' });
        }

        // Create project from idea
        const project = await prisma.project.create({
            data: {
                name: idea.title,
                description: idea.description,
                createdBy: idea.authorId,
                status: 'ACTIVE',
                vision: {
                    title: idea.title,
                    description: idea.description,
                    goals: [],
                    successCriteria: [],
                },
            },
        });

        // Link idea to project
        await prisma.idea.update({
            where: { id },
            data: {
                projectId: project.id,
                status: 'APPROVED',
            },
        });

        // Initialize project with Elara
        await initializeProject(project.id);

        res.json({ project });
    } catch (error) {
        console.error('Error deploying idea:', error);
        res.status(500).json({ error: 'Failed to deploy idea' });
    }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function validateIdea(ideaId: string) {
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new Error('Idea not found');

    try {
        // Call AI Family Service for Elara's analysis
        const response = await axios.post(
            `${process.env.AI_FAMILY_URL || 'http://localhost:3030'}/api/chat`,
            {
                personality: 'elara',
                message: `Analyze this project idea and provide a viability score (0-100), feasibility assessment (high/medium/low), and a brief summary:

Title: ${idea.title}
Description: ${idea.description}

Please respond in JSON format with: { score, feasibility, summary, estimatedTime, requiredAgents, techStack }`,
                context: { userId: idea.authorId },
            }
        );

        // Parse Elara's response (assuming it returns JSON)
        let analysis;
        try {
            analysis = JSON.parse(response.data.message);
        } catch {
            // If not JSON, create a default analysis
            analysis = {
                score: 75,
                feasibility: 'medium',
                summary: response.data.message,
                estimatedTime: '2-4 weeks',
                requiredAgents: ['Zola', 'Jabari'],
                techStack: ['TypeScript', 'React', 'PostgreSQL'],
            };
        }

        // Update idea with analysis
        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                aiAnalysis: analysis,
                status: analysis.score >= 70 ? 'APPROVED' : 'GENESIS',
            },
        });

        return analysis;
    } catch (error) {
        console.error('AI validation error:', error);

        // Fallback analysis if AI service is unavailable
        const fallbackAnalysis = {
            score: 65,
            feasibility: 'medium',
            summary: 'AI service unavailable. Manual review recommended.',
            estimatedTime: 'Unknown',
            requiredAgents: [],
            techStack: [],
        };

        await prisma.idea.update({
            where: { id: ideaId },
            data: {
                aiAnalysis: fallbackAnalysis,
                status: 'GENESIS',
            },
        });

        return fallbackAnalysis;
    }
}

async function validateIdeaAsync(ideaId: string) {
    // Run validation in background
    setTimeout(async () => {
        await validateIdea(ideaId);
    }, 1000);
}

async function initializeProject(projectId: string) {
    // Create initial tasks with Elara
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return;

    // Call Elara to decompose project into tasks
    try {
        const response = await axios.post(
            `${process.env.AI_FAMILY_URL || 'http://localhost:3030'}/api/chat`,
            {
                personality: 'elara',
                message: `Break down this project into specific tasks for our AI agents:

Project: ${project.name}
Description: ${project.description}

Available agents: Zola (Backend/Data), Jabari (Security), Kofi (DevOps), Abeni (UI/UX), Nexus (Orchestration)

Return a JSON array of tasks with: { agent, taskType, title, description, priority }`,
                context: { projectId },
            }
        );

        // Parse tasks and create them
        let tasks = [];
        try {
            tasks = JSON.parse(response.data.message);
        } catch {
            // Default tasks if parsing fails
            tasks = [
                {
                    agent: 'Zola',
                    taskType: 'setup',
                    title: 'Initialize project structure',
                    description: 'Set up basic project scaffolding',
                    priority: 10,
                },
            ];
        }

        // Create tasks in database
        for (const task of tasks) {
            await prisma.agentTask.create({
                data: {
                    projectId,
                    agentName: task.agent,
                    taskType: task.taskType,
                    title: task.title,
                    description: task.description,
                    priority: task.priority || 5,
                    status: 'PENDING',
                },
            });
        }
    } catch (error) {
        console.error('Error initializing project:', error);
    }
}

export default router;
