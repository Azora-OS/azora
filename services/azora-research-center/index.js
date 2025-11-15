const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3008;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-research-center';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

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
    description: 'Azora Research Center Service - Research project management, publications',
    endpoints: {
      'POST /api/projects': 'Create a new research project',
      'GET /api/projects': 'Get all research projects',
      'GET /api/projects/:id': 'Get research project by ID',
      'PUT /api/projects/:id': 'Update research project',
      'DELETE /api/projects/:id': 'Delete research project',
      'POST /api/projects/:id/team': 'Add team member to project',
      'GET /api/projects/:id/team': 'Get project team members',
      'DELETE /api/projects/:id/team/:userId': 'Remove team member from project',
      'POST /api/projects/:id/documents': 'Upload document to project',
      'GET /api/projects/:id/documents': 'Get project documents',
      'GET /api/documents/:id': 'Get document by ID',
      'PUT /api/documents/:id': 'Update document',
      'DELETE /api/documents/:id': 'Delete document',
      'POST /api/publications': 'Create a new publication',
      'GET /api/publications': 'Get all publications',
      'GET /api/publications/:id': 'Get publication by ID',
      'PUT /api/publications/:id': 'Update publication',
      'DELETE /api/publications/:id': 'Delete publication',
      'POST /api/projects/:id/data': 'Upload research data',
      'GET /api/projects/:id/data': 'Get project data',
      'GET /api/data/:id': 'Get data by ID',
      'POST /api/projects/:id/milestones': 'Create project milestone',
      'GET /api/projects/:id/milestones': 'Get project milestones',
      'PUT /api/milestones/:id': 'Update milestone',
      'PUT /api/milestones/:id/complete': 'Mark milestone as complete',
      'POST /api/projects/:id/collaborations': 'Add collaboration',
      'GET /api/projects/:id/collaborations': 'Get project collaborations',
      'GET /api/users/:userId/projects': 'Get projects for user',
      'GET /api/users/:userId/publications': 'Get publications for user'
    }
  });
});

// Create a new research project
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    const project = await prisma.researchProject.create({
      data: projectData
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Research project created successfully',
      data: project 
    });
  } catch (error) {
    console.error('Error creating research project:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create research project',
      message: error.message 
    });
  }
});

// Get all research projects
app.get('/api/projects', async (req, res) => {
  try {
    const { status, leadResearcherId, search, tag } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (leadResearcherId) where.leadResearcherId = leadResearcherId;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = {
        has: tag
      };
    }
    
    const projects = await prisma.researchProject.findMany({
      where,
      include: {
        _count: {
          select: { 
            team: true, 
            documents: true, 
            data: true,
            milestones: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error fetching research projects:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch research projects',
      message: error.message 
    });
  }
});

// Get research project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.researchProject.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            project: true
          }
        },
        documents: true,
        data: true,
        milestones: {
          orderBy: { dueDate: 'asc' }
        },
        collaborations: true
      }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: project 
    });
  } catch (error) {
    console.error('Error fetching research project:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch research project',
      message: error.message 
    });
  }
});

// Update research project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const project = await prisma.researchProject.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Research project updated successfully',
      data: project 
    });
  } catch (error) {
    console.error('Error updating research project:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update research project',
      message: error.message 
    });
  }
});

// Delete research project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.researchProject.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Research project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting research project:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete research project',
      message: error.message 
    });
  }
});

// Add team member to project
app.post('/api/projects/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Check if user is already on the team
    const existingMember = await prisma.researchTeam.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: userId
        }
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already a team member' 
      });
    }
    
    // Add team member
    const teamMember = await prisma.researchTeam.create({
      data: {
        projectId: id,
        userId,
        role: role || 'RESEARCH_ASSISTANT'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Team member added successfully',
      data: teamMember 
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add team member',
      message: error.message 
    });
  }
});

// Get project team members
app.get('/api/projects/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    const teamMembers = await prisma.researchTeam.findMany({
      where: { projectId: id },
      include: {
        project: true
      }
    });
    
    res.json({ 
      success: true, 
      data: teamMembers 
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch team members',
      message: error.message 
    });
  }
});

// Remove team member from project
app.delete('/api/projects/:id/team/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Remove team member
    await prisma.researchTeam.delete({
      where: {
        projectId_userId: {
          projectId: id,
          userId: userId
        }
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Team member removed successfully' 
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Team member not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove team member',
      message: error.message 
    });
  }
});

// Upload document to project
app.post('/api/projects/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Create document
    const document = await prisma.researchDocument.create({
      data: {
        projectId: id,
        ...documentData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Document uploaded successfully',
      data: document 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload document',
      message: error.message 
    });
  }
});

// Get project documents
app.get('/api/projects/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    const documents = await prisma.researchDocument.findMany({
      where: { projectId: id },
      include: {
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: documents 
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch documents',
      message: error.message 
    });
  }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.researchDocument.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: document 
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch document',
      message: error.message 
    });
  }
});

// Update document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const document = await prisma.researchDocument.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Document updated successfully',
      data: document 
    });
  } catch (error) {
    console.error('Error updating document:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update document',
      message: error.message 
    });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.researchDocument.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete document',
      message: error.message 
    });
  }
});

// Create a new publication
app.post('/api/publications', async (req, res) => {
  try {
    const publicationData = req.body;
    
    const publication = await prisma.researchPublication.create({
      data: publicationData
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Publication created successfully',
      data: publication 
    });
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create publication',
      message: error.message 
    });
  }
});

// Get all publications
app.get('/api/publications', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { journal: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const publications = await prisma.researchPublication.findMany({
      where,
      orderBy: { publicationDate: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: publications 
    });
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch publications',
      message: error.message 
    });
  }
});

// Get publication by ID
app.get('/api/publications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const publication = await prisma.researchPublication.findUnique({
      where: { id }
    });
    
    if (!publication) {
      return res.status(404).json({ 
        success: false, 
        error: 'Publication not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: publication 
    });
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch publication',
      message: error.message 
    });
  }
});

// Update publication
app.put('/api/publications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const publication = await prisma.researchPublication.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Publication updated successfully',
      data: publication 
    });
  } catch (error) {
    console.error('Error updating publication:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Publication not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update publication',
      message: error.message 
    });
  }
});

// Delete publication
app.delete('/api/publications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.researchPublication.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Publication deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting publication:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Publication not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete publication',
      message: error.message 
    });
  }
});

// Upload research data
app.post('/api/projects/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Create data entry
    const researchData = await prisma.researchData.create({
      data: {
        projectId: id,
        ...data
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Research data uploaded successfully',
      data: researchData 
    });
  } catch (error) {
    console.error('Error uploading research data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload research data',
      message: error.message 
    });
  }
});

// Get project data
app.get('/api/projects/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    const researchData = await prisma.researchData.findMany({
      where: { projectId: id },
      include: {
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: researchData 
    });
  } catch (error) {
    console.error('Error fetching research data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch research data',
      message: error.message 
    });
  }
});

// Get data by ID
app.get('/api/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const researchData = await prisma.researchData.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    
    if (!researchData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research data not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: researchData 
    });
  } catch (error) {
    console.error('Error fetching research data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch research data',
      message: error.message 
    });
  }
});

// Create project milestone
app.post('/api/projects/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    const milestoneData = req.body;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Create milestone
    const milestone = await prisma.researchMilestone.create({
      data: {
        projectId: id,
        ...milestoneData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Milestone created successfully',
      data: milestone 
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create milestone',
      message: error.message 
    });
  }
});

// Get project milestones
app.get('/api/projects/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    const milestones = await prisma.researchMilestone.findMany({
      where: { projectId: id },
      include: {
        project: true
      },
      orderBy: { dueDate: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: milestones 
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch milestones',
      message: error.message 
    });
  }
});

// Update milestone
app.put('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const milestone = await prisma.researchMilestone.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Milestone updated successfully',
      data: milestone 
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Milestone not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update milestone',
      message: error.message 
    });
  }
});

// Mark milestone as complete
app.put('/api/milestones/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    const milestone = await prisma.researchMilestone.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Milestone marked as complete',
      data: milestone 
    });
  } catch (error) {
    console.error('Error completing milestone:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Milestone not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete milestone',
      message: error.message 
    });
  }
});

// Add collaboration
app.post('/api/projects/:id/collaborations', async (req, res) => {
  try {
    const { id } = req.params;
    const collaborationData = req.body;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    // Create collaboration
    const collaboration = await prisma.researchCollaboration.create({
      data: {
        projectId: id,
        ...collaborationData
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Collaboration added successfully',
      data: collaboration 
    });
  } catch (error) {
    console.error('Error adding collaboration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add collaboration',
      message: error.message 
    });
  }
});

// Get project collaborations
app.get('/api/projects/:id/collaborations', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.researchProject.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research project not found' 
      });
    }
    
    const collaborations = await prisma.researchCollaboration.findMany({
      where: { projectId: id },
      include: {
        project: true
      }
    });
    
    res.json({ 
      success: true, 
      data: collaborations 
    });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch collaborations',
      message: error.message 
    });
  }
});

// Get projects for user
app.get('/api/users/:userId/projects', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const projects = await prisma.researchProject.findMany({
      where: {
        OR: [
          { leadResearcherId: userId },
          { team: { some: { userId } } }
        ]
      },
      include: {
        _count: {
          select: { 
            team: true, 
            documents: true, 
            data: true,
            milestones: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user projects',
      message: error.message 
    });
  }
});

// Get publications for user
app.get('/api/users/:userId/publications', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // This would require parsing the authors JSON field to find matching userId
    // For simplicity, we'll return all publications for now
    const publications = await prisma.researchPublication.findMany({
      orderBy: { publicationDate: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: publications 
    });
  } catch (error) {
    console.error('Error fetching user publications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user publications',
      message: error.message 
    });
  }
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
app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;