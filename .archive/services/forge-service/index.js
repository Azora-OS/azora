const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'forge-service' });
});

// Create project
app.post('/projects', async (req, res) => {
  try {
    const { title, description, creatorId, type, settings } = req.body;

    if (!title || !creatorId || !type) {
      return res.status(400).json({ error: 'Title, creatorId, and type are required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        creatorId,
        type,
        settings: settings ? JSON.parse(settings) : null
      }
    });

    res.json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get projects
app.get('/projects', async (req, res) => {
  try {
    const { creatorId, type, status } = req.query;
    const where = {};

    if (creatorId) where.creatorId = creatorId;
    if (type) where.type = type;
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { contents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get project details
app.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        contents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Generate text content
app.post('/generate/text', async (req, res) => {
  try {
    const { prompt, projectId, model = 'gpt-4' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        projectId,
        prompt,
        model,
        type: 'text',
        status: 'processing'
      }
    });

    try {
      // Generate content with OpenAI
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });

      const result = completion.choices[0].message.content;

      // Update generation record
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'completed',
          result: { content: result },
          tokens: completion.usage.total_tokens,
          completedAt: new Date()
        }
      });

      // If projectId provided, create content record
      if (projectId) {
        await prisma.content.create({
          data: {
            projectId,
            content: result,
            type: 'text'
          }
        });
      }

      res.json({
        success: true,
        content: result,
        generationId: generation.id
      });
    } catch (aiError) {
      // Update generation record with error
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'failed',
          error: aiError.message,
          completedAt: new Date()
        }
      });
      throw aiError;
    }
  } catch (error) {
    console.error('Generate text error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Generate image content
app.post('/generate/image', async (req, res) => {
  try {
    const { prompt, projectId, size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        projectId,
        prompt,
        model: 'dall-e-3',
        type: 'image',
        status: 'processing'
      }
    });

    try {
      // Generate image with DALL-E
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: size,
        quality: 'standard',
        n: 1
      });

      const imageUrl = imageResponse.data[0].url;

      // Update generation record
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'completed',
          result: { url: imageUrl },
          completedAt: new Date()
        }
      });

      // If projectId provided, create content record
      if (projectId) {
        await prisma.content.create({
          data: {
            projectId,
            title: prompt.substring(0, 100),
            url: imageUrl,
            type: 'image'
          }
        });
      }

      res.json({
        success: true,
        imageUrl,
        generationId: generation.id
      });
    } catch (aiError) {
      // Update generation record with error
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'failed',
          error: aiError.message,
          completedAt: new Date()
        }
      });
      throw aiError;
    }
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Get generation history
app.get('/generations', async (req, res) => {
  try {
    const { projectId, type, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (status) where.status = status;

    const generations = await prisma.generation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ generations });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Failed to get generations' });
  }
});

// Update project content
app.post('/projects/:projectId/content', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content, type, url, metadata } = req.body;

    const contentRecord = await prisma.content.create({
      data: {
        projectId,
        title,
        content,
        type,
        url,
        metadata: metadata ? JSON.parse(metadata) : null
      }
    });

    res.json({ success: true, content: contentRecord });
  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({ error: 'Failed to add content' });
  }
});

// Delete project
app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, async () => {
  console.log(`🔨 Azora Forge Service running on port ${PORT}`);
  console.log(`📝 Projects: GET/POST http://localhost:${PORT}/projects`);
  console.log(`🤖 Generate Text: POST http://localhost:${PORT}/generate/text`);
  console.log(`🎨 Generate Image: POST http://localhost:${PORT}/generate/image`);
  console.log(`📊 Generations: GET http://localhost:${PORT}/generations`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});