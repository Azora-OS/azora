const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 🚀 AZORA PROJECT MARKETPLACE - COLLABORATIVE PROJECTS
console.log('🌟 Azora Project Marketplace - Initializing...');

const projects = new Map();
const applications = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'project-marketplace',
    ubuntu: 'I build because we create together',
    projects: projects.size,
    timestamp: new Date().toISOString()
  });
});

// Create project
app.post('/api/projects', (req, res) => {
  try {
    const { title, description, skills, budget, ownerId } = req.body;
    
    const project = {
      id: `proj_${Date.now()}`,
      title,
      description,
      skills: skills || [],
      budget: budget || 0,
      ownerId,
      status: 'OPEN',
      applicants: [],
      createdAt: new Date().toISOString()
    };
    
    projects.set(project.id, project);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get projects
app.get('/api/projects', (req, res) => {
  try {
    const { skills, budget } = req.query;
    let projectList = Array.from(projects.values());
    
    if (skills) {
      projectList = projectList.filter(p => 
        p.skills.some(skill => skill.includes(skills))
      );
    }
    
    res.json({
      success: true,
      data: projectList,
      total: projectList.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Apply to project
app.post('/api/projects/:id/apply', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, proposal, rate } = req.body;
    
    const project = projects.get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const application = {
      id: `app_${Date.now()}`,
      projectId: id,
      userId,
      proposal,
      rate,
      status: 'PENDING',
      appliedAt: new Date().toISOString()
    };
    
    applications.set(application.id, application);
    project.applicants.push(application.id);
    projects.set(id, project);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply to project' });
  }
});

const PORT = process.env.PORT || 3029;
app.listen(PORT, () => {
  console.log('🌟 Azora Project Marketplace running on port', PORT);
});

module.exports = app;