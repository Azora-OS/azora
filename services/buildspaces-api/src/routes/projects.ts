import { Router } from 'express';
import { prisma, broadcastAgentActivity, broadcastAgentCursor } from '../index';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const STORAGE_ROOT = path.join(process.env.USERPROFILE || '', 'Documents', 'azora', 'projects-storage');

// Ensure storage root exists
(async () => {
    try {
        await fs.mkdir(STORAGE_ROOT, { recursive: true });
        console.log(`📂 Projects storage initialized at: ${STORAGE_ROOT}`);
    } catch (error) {
        console.error('Failed to initialize projects storage:', error);
    }
})();

// Helper to get full file path
const getFilePath = (projectId: string, filePath: string) => {
    // Prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    return path.join(STORAGE_ROOT, projectId, safePath);
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createFileSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
    language: z.string().optional(),
});

const updateFileSchema = z.object({
    content: z.string(),
});

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
    try {
        const { status, createdBy, limit = '50', offset = '0' } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (createdBy) where.createdBy = createdBy;

        const projects = await prisma.project.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
            include: {
                _count: {
                    select: { tasks: true, files: true },
                },
            },
        });

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    where: { status: { not: 'COMPLETED' } },
                    orderBy: { priority: 'desc' },
                },
                deployments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// GET /api/projects/:id/files - List project files
router.get('/:id/files', async (req, res) => {
    try {
        const { id } = req.params;

        const files = await prisma.projectFile.findMany({
            where: { projectId: id },
            select: {
                id: true,
                path: true,
                language: true,
                updatedAt: true,
                lastModifiedBy: true,
            },
            orderBy: { path: 'asc' },
        });

        res.json(files);
    } catch (error) {
        console.error('Error fetching project files:', error);
        res.status(500).json({ error: 'Failed to fetch project files' });
    }
});

// GET /api/projects/:id/files/:path - Get file content
router.get('/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path } = req.params;

        const file = await prisma.projectFile.findFirst({
            where: {
                projectId: id,
                path: path,
            },
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json(file);
    } catch (error) {
        console.error('Error fetching file content:', error);
        res.status(500).json({ error: 'Failed to fetch file content' });
    }
});

// POST /api/projects/:id/files - Create file
router.post('/:id/files', async (req, res) => {
    try {
        const { id } = req.params;
        const data = createFileSchema.parse(req.body);

        // 1. Save to DB
        const file = await prisma.projectFile.create({
            data: {
                projectId: id,
                path: data.path,
                content: data.content,
                language: data.language || 'typescript',
                lastModifiedBy: 'user', // TODO: Get real user/agent
            },
        });

        // 2. Save to Disk
        try {
            const fullPath = getFilePath(id, data.path);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, data.content, 'utf-8');
        } catch (diskError) {
            console.error(`Failed to write file to disk: ${data.path}`, diskError);
        }

        // Broadcast file creation
        broadcastAgentActivity(id, {
            agentName: 'User',
            action: 'file_created',
            details: `Created file ${data.path}`,
            file: data.path,
        });

        res.status(201).json(file);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating file:', error);
        res.status(500).json({ error: 'Failed to create file' });
    }
});

// PUT /api/projects/:id/files/:path - Update file
router.put('/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const data = updateFileSchema.parse(req.body);
        const { agentName } = req.body; // Optional, if updated by agent

        // 1. Update DB
        const file = await prisma.projectFile.updateMany({
            where: {
                projectId: id,
                path: filePath,
            },
            data: {
                content: data.content,
                lastModifiedBy: agentName || 'user',
            },
        });

        if (file.count === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // 2. Update Disk
        try {
            const fullPath = getFilePath(id, filePath);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, data.content, 'utf-8');
        } catch (diskError) {
            console.error(`Failed to update file on disk: ${filePath}`, diskError);
        }

        // Broadcast file update
        broadcastAgentActivity(id, {
            agentName: agentName || 'User',
            action: 'file_modified',
            details: `Updated file ${filePath}`,
            file: filePath,
        });

        res.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// DELETE /api/projects/:id/files/:path - Delete file
router.delete('/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;

        // 1. Delete from DB
        await prisma.projectFile.deleteMany({
            where: {
                projectId: id,
                path: filePath,
            },
        });

        // 2. Delete from Disk
        try {
            const fullPath = getFilePath(id, filePath);
            await fs.unlink(fullPath);
        } catch (diskError) {
            console.warn(`Failed to delete file from disk: ${filePath}`);
        }

        // Broadcast file deletion
        broadcastAgentActivity(id, {
            agentName: 'User',
            action: 'file_deleted',
            details: `Deleted file ${filePath}`,
            file: filePath,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
