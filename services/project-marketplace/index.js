const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3023;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'project-marketplace', 
    timestamp: new Date().toISOString() 
  });
});

// Projects endpoint
app.get('/api/projects', (req, res) => {
  const projects = [
    {
      id: 'proj_1',
      title: 'Mobile App Development',
      category: 'Technology',
      budget: 50000,
      status: 'open'
    },
    {
      id: 'proj_2',
      title: 'Marketing Campaign',
      category: 'Marketing',
      budget: 25000,
      status: 'in_progress'
    }
  ];
  
  res.json({ projects, count: projects.length });
});

// Project submission endpoint
app.post('/api/projects', (req, res) => {
  const { title, description, category, budget } = req.body;
  
  const project = {
    id: `proj_${Date.now()}`,
    title,
    description,
    category,
    budget,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(project);
});

// Freelancer matching endpoint
app.get('/api/match/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  const matches = [
    {
      freelancerId: 'freelancer_1',
      name: 'John Developer',
      skills: ['React', 'Node.js'],
      rating: 4.8
    },
    {
      freelancerId: 'freelancer_2',
      name: 'Jane Designer',
      skills: ['UI/UX', 'Figma'],
      rating: 4.9
    }
  ];
  
  res.json({ matches, projectId });
});

app.listen(PORT, () => {
  console.log(`Project Marketplace Service running on port ${PORT}`);
});

module.exports = app;