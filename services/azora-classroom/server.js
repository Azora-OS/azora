const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'azora-classroom',
    timestamp: new Date().toISOString()
  });
});

// Get all classrooms
app.get('/api/classrooms', (req, res) => {
  // In a real implementation, this would fetch from a database
  res.status(200).json({
    success: true,
    data: [],
    count: 0
  });
});

// Create a new classroom
app.post('/api/classrooms', (req, res) => {
  const { name, description, courseId } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Classroom name is required' 
    });
  }
  
  // Simulate classroom creation
  res.status(201).json({
    success: true,
    data: {
      id: `class_${Date.now()}`,
      name,
      description: description || '',
      courseId: courseId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Get specific classroom
app.get('/api/classrooms/:classroomId', (req, res) => {
  const { classroomId } = req.params;
  
  // Simulate fetching classroom
  res.status(200).json({
    success: true,
    data: {
      id: classroomId,
      name: 'Sample Classroom',
      description: 'A sample classroom for testing',
      courseId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Update classroom
app.put('/api/classrooms/:classroomId', (req, res) => {
  const { classroomId } = req.params;
  const { name, description } = req.body;
  
  // Simulate updating classroom
  res.status(200).json({
    success: true,
    data: {
      id: classroomId,
      name: name || 'Sample Classroom',
      description: description || 'A sample classroom for testing',
      courseId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete classroom
app.delete('/api/classrooms/:classroomId', (req, res) => {
  const { classroomId } = req.params;
  
  // Simulate deleting classroom
  res.status(200).json({
    success: true,
    message: `Classroom ${classroomId} deleted successfully`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Azora Classroom service running on port ${PORT}`);
});

module.exports = app;