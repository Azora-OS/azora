const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3009;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-studyspaces';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' });

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    description: 'Azora Study Spaces Service - Virtual study rooms, collaborative spaces',
    endpoints: {
      'POST /api/spaces': 'Create a new study space',
      'GET /api/spaces': 'Get all study spaces',
      'GET /api/spaces/:id': 'Get study space by ID',
      'PUT /api/spaces/:id': 'Update study space',
      'DELETE /api/spaces/:id': 'Delete study space',
      'POST /api/spaces/:id/members': 'Add member to study space',
      'GET /api/spembers': 'Get study space members',
      'DELETE /api/spaces/:id/members/:userId': 'Remove member from study space',
      'POST /api/spaces/:id/sessions': 'Create study session',
      'GET /api/spaces/:id/sessions': 'Get study space sessions',
      'GET /api/sessions/:id': 'Get session by ID',
      'PUT /api/sessions/:id': 'Update session',
      'PUT /api/sessions/:id/start': 'Start session',
      'PUT /api/sessions/:id/end': 'End session',
      'POST /api/sessions/:id/participants': 'Add participant to session',
      'GET /api/sessions/:id/participants': 'Get session participants',
      'POST /api/spaces/:id/resources': 'Upload resource to study space',
      'GET /api/spaces/:id/resources': 'Get study space resources',
      'GET /api/resources/:id': 'Get resource by ID',
      'PUT /api/resources/:id': 'Update resource',
      'DELETE /api/resources/:id': 'Delete resource',
      'POST /api/spaces/:id/tasks': 'Create task in study space',
      'GET /api/spaces/:id/tasks': 'Get study space tasks',
      'GET /api/tasks/:id': 'Get task by ID',
      'PUT /api/tasks/:id': 'Update task',
      'PUT /api/tasks/:id/complete': 'Mark task as complete',
      'POST /api/spaces/:id/messages': 'Send message in study space',
      'GET /api/spaces/:id/messages': 'Get study space messages',
      'POST /api/spaces/:id/progress': 'Update study progress',
      'GET /api/spaces/:id/progress/:userId': 'Get user progress in study space',
      'GET /api/users/:userId/spaces': 'Get study spaces for user',
      'GET /api/users/:userId/sessions': 'Get sessions for user'
    }
  });
});

// Create a new study space
app.post('/api/spaces', async (req, res) => {
  try {
    const spaceData = req.body;
    
    const space = await prisma.studySpace.create({
      data: spaceData
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Study space created successfully',
      data: space 
    });
  } catch (error) {
    console.error('Error creating study space:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create study space',
      message: error.message 
    });
  }
});

// Get all study spaces
app.get('/api/spaces', async (req, res) => {
  try {
    const { privacy, status, courseId, search } = req.query;
    const where = {};
    
    if (privacy) where.privacy = privacy;
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const spaces = await prisma.studySpace.findMany({
      where,
      include: {
        _count: {
          select: { 
            members: true, 
            sessions: true, 
            resources: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: spaces 
    });
  } catch (error) {
    console.error('Error fetching study spaces:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch study spaces',
      message: error.message 
    });
  }
});

// Get study space by ID
app.get('/api/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const space = await prisma.studySpace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            space: true
          }
        },
        sessions: {
          orderBy: { scheduledAt: 'asc' }
        },
        resources: {
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          orderBy: { dueDate: 'asc' }
        }
      }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: space 
    });
  } catch (error) {
    console.error('Error fetching study space:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch study space',
      message: error.message 
    });
  }
});

// Update study space
app.put('/api/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const space = await prisma.studySpace.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Study space updated successfully',
      data: space 
    });
  } catch (error) {
    console.error('Error updating study space:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update study space',
      message: error.message 
    });
  }
});

// Delete study space
app.delete('/api/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.studySpace.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Study space deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting study space:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete study space',
      message: error.message 
    });
  }
});

// Add member to study space
app.post('/api/spaces/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Check if user is already a member
    const existingMember = await prisma.studySpaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId: id,
          userId: userId
        }
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already a member of this study space' 
      });
    }
    
    // Add member
    const member = await prisma.studySpaceMember.create({
      data: {
        spaceId: id,
        userId,
        role: role || 'MEMBER'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Member added successfully',
      data: member 
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add member',
      message: error.message 
    });
  }
});

// Get study space members
app.get('/api/spaces/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const members = await prisma.studySpaceMember.findMany({
      where: { spaceId: id },
      include: {
        space: true
      }
    });
    
    res.json({ 
      success: true, 
      data: members 
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch members',
      message: error.message 
    });
  }
});

// Remove member from study space
app.delete('/api/spaces/:id/members/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Remove member
    await prisma.studySpaceMember.delete({
      where: {
        spaceId_userId: {
          spaceId: id,
          userId: userId
        }
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Member removed successfully' 
    });
  } catch (error) {
    console.error('Error removing member:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove member',
      message: error.message 
    });
  }
});

// Create study session
app.post('/api/spaces/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionData = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Create session
    const session = await prisma.studySession.create({
      data: {
        spaceId: id,
        ...sessionData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Study session created successfully',
      data: session 
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create study session',
      message: error.message 
    });
  }
});

// Get study space sessions
app.get('/api/spaces/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const sessions = await prisma.studySession.findMany({
      where: { spaceId: id },
      include: {
        space: true,
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: sessions 
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sessions',
      message: error.message 
    });
  }
});

// Get session by ID
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.studySession.findUnique({
      where: { id },
      include: {
        space: true,
        participants: {
          include: {
            session: true
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: session 
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch session',
      message: error.message 
    });
  }
});

// Update session
app.put('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const session = await prisma.studySession.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Study session updated successfully',
      data: session 
    });
  } catch (error) {
    console.error('Error updating session:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update session',
      message: error.message 
    });
  }
});

// Start session
app.put('/api/sessions/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.studySession.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    });
    
    // Emit socket event
    io.to(id).emit('sessionStarted', { sessionId: id, session });
    
    res.json({ 
      success: true, 
      message: 'Study session started',
      data: session 
    });
  } catch (error) {
    console.error('Error starting session:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start session',
      message: error.message 
    });
  }
});

// End session
app.put('/api/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.studySession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });
    
    // Emit socket event
    io.to(id).emit('sessionEnded', { sessionId: id, session });
    
    res.json({ 
      success: true, 
      message: 'Study session ended',
      data: session 
    });
  } catch (error) {
    console.error('Error ending session:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to end session',
      message: error.message 
    });
  }
});

// Add participant to session
app.post('/api/sessions/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if session exists
    const session = await prisma.studySession.findUnique({
      where: { id }
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    
    // Check if user is already a participant
    const existingParticipant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: userId
        }
      }
    });
    
    if (existingParticipant) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already a participant in this session' 
      });
    }
    
    // Add participant
    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId: id,
        userId
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Participant added successfully',
      data: participant 
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add participant',
      message: error.message 
    });
  }
});

// Get session participants
app.get('/api/sessions/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if session exists
    const session = await prisma.studySession.findUnique({
      where: { id }
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study session not found' 
      });
    }
    
    const participants = await prisma.sessionParticipant.findMany({
      where: { sessionId: id },
      include: {
        session: true
      }
    });
    
    res.json({ 
      success: true, 
      data: participants 
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch participants',
      message: error.message 
    });
  }
});

// Upload resource to study space
app.post('/api/spaces/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const resourceData = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Create resource
    const resource = await prisma.studyResource.create({
      data: {
        spaceId: id,
        ...resourceData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Resource uploaded successfully',
      data: resource 
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload resource',
      message: error.message 
    });
  }
});

// Get study space resources
app.get('/api/spaces/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const resources = await prisma.studyResource.findMany({
      where: { spaceId: id },
      include: {
        space: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: resources 
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resources',
      message: error.message 
    });
  }
});

// Get resource by ID
app.get('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.studyResource.findUnique({
      where: { id },
      include: {
        space: true
      }
    });
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        error: 'Resource not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: resource 
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resource',
      message: error.message 
    });
  }
});

// Update resource
app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const resource = await prisma.studyResource.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Resource updated successfully',
      data: resource 
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Resource not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update resource',
      message: error.message 
    });
  }
});

// Delete resource
app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.studyResource.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Resource deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Resource not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete resource',
      message: error.message 
    });
  }
});

// Create task in study space
app.post('/api/spaces/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Create task
    const task = await prisma.studyTask.create({
      data: {
        spaceId: id,
        ...taskData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Task created successfully',
      data: task 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create task',
      message: error.message 
    });
  }
});

// Get study space tasks
app.get('/api/spaces/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const tasks = await prisma.studyTask.findMany({
      where: { spaceId: id },
      include: {
        space: true
      },
      orderBy: { dueDate: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: tasks 
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tasks',
      message: error.message 
    });
  }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.studyTask.findUnique({
      where: { id },
      include: {
        space: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: task 
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch task',
      message: error.message 
    });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const task = await prisma.studyTask.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Task updated successfully',
      data: task 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update task',
      message: error.message 
    });
  }
});

// Mark task as complete
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.studyTask.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Task marked as complete',
      data: task 
    });
  } catch (error) {
    console.error('Error completing task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete task',
      message: error.message 
    });
  }
});

// Send message in study space
app.post('/api/spaces/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messageData = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Create message
    const message = await prisma.studyMessage.create({
      data: {
        spaceId: id,
        ...messageData
      }
    });
    
    // Emit socket event
    io.to(id).emit('newMessage', message);
    
    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: message 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message',
      message: error.message 
    });
  }
});

// Get study space messages
app.get('/api/spaces/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const messages = await prisma.studyMessage.findMany({
      where: { spaceId: id },
      include: {
        space: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: messages 
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages',
      message: error.message 
    });
  }
});

// Update study progress
app.post('/api/spaces/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, taskId, resourceId, progress, notes } = req.body;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    // Create or update progress
    const progressRecord = await prisma.studyProgress.upsert({
      where: {
        spaceId_userId_taskId: {
          spaceId: id,
          userId: userId,
          taskId: taskId || null
        }
      },
      update: {
        progress,
        notes,
        updatedAt: new Date()
      },
      create: {
        spaceId: id,
        userId,
        taskId: taskId || null,
        resourceId: resourceId || null,
        progress,
        notes
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Progress updated successfully',
      data: progressRecord 
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update progress',
      message: error.message 
    });
  }
});

// Get user progress in study space
app.get('/api/spaces/:id/progress/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Check if space exists
    const space = await prisma.studySpace.findUnique({
      where: { id }
    });
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        error: 'Study space not found' 
      });
    }
    
    const progressRecords = await prisma.studyProgress.findMany({
      where: { 
        spaceId: id,
        userId: userId
      },
      include: {
        space: true
      }
    });
    
    res.json({ 
      success: true, 
      data: progressRecords 
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch progress',
      message: error.message 
    });
  }
});

// Get study spaces for user
app.get('/api/users/:userId/spaces', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const spaces = await prisma.studySpace.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        _count: {
          select: { 
            members: true, 
            sessions: true, 
            resources: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: spaces 
    });
  } catch (error) {
    console.error('Error fetching user spaces:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user spaces',
      message: error.message 
    });
  }
});

// Get sessions for user
app.get('/api/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await prisma.studySession.findMany({
      where: {
        space: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        space: true,
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: sessions 
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user sessions',
      message: error.message 
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected to study spaces service:', socket.id);
  
  socket.on('joinSpace', (spaceId) => {
    socket.join(spaceId);
    console.log(`User ${socket.id} joined study space ${spaceId}`);
  });
  
  socket.on('leaveSpace', (spaceId) => {
    socket.leave(spaceId);
    console.log(`User ${socket.id} left study space ${spaceId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from study spaces service:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server };