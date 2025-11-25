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
const PORT = process.env.PORT || 3006;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-classroom';

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
    description: 'Azora Classroom Service - Live video lectures, screen sharing, whiteboard',
    endpoints: {
      'POST /api/classrooms': 'Create a new classroom',
      'GET /api/classrooms': 'Get all classrooms',
      'GET /api/classrooms/:id': 'Get classroom by ID',
      'PUT /api/classrooms/:id': 'Update classroom',
      'DELETE /api/classrooms/:id': 'Delete classroom',
      'POST /api/classrooms/:id/enroll': 'Enroll user in classroom',
      'GET /api/classrooms/:id/enrollments': 'Get classroom enrollments',
      'POST /api/classrooms/:id/start': 'Start classroom session',
      'POST /api/classrooms/:id/end': 'End classroom session',
      'POST /api/classrooms/:id/messages': 'Send message in classroom',
      'GET /api/classrooms/:id/messages': 'Get classroom messages',
      'GET /api/users/:userId/classrooms': 'Get classrooms for user',
      'GET /api/courses/:courseId/classrooms': 'Get classrooms for course'
    }
  });
});

// Create a new classroom
app.post('/api/classrooms', async (req, res) => {
  try {
    const { title, description, instructorId, courseId, startTime, endTime, maxStudents } = req.body;
    
    const classroom = await prisma.classroom.create({
      data: {
        title,
        description,
        instructorId,
        courseId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxStudents: maxStudents || 30
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Classroom created successfully',
      data: classroom 
    });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create classroom',
      message: error.message 
    });
  }
});

// Get all classrooms
app.get('/api/classrooms', async (req, res) => {
  try {
    const { status, instructorId, courseId } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (instructorId) where.instructorId = instructorId;
    if (courseId) where.courseId = courseId;
    
    const classrooms = await prisma.classroom.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: classrooms 
    });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch classrooms',
      message: error.message 
    });
  }
});

// Get classroom by ID
app.get('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: classroom 
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch classroom',
      message: error.message 
    });
  }
});

// Update classroom
app.put('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date strings to Date objects if provided
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
    
    const classroom = await prisma.classroom.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Classroom updated successfully',
      data: classroom 
    });
  } catch (error) {
    console.error('Error updating classroom:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update classroom',
      message: error.message 
    });
  }
});

// Delete classroom
app.delete('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.classroom.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Classroom deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete classroom',
      message: error.message 
    });
  }
});

// Enroll user in classroom
app.post('/api/classrooms/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await prisma.classroomEnrollment.findUnique({
      where: {
        classroomId_userId: {
          classroomId: id,
          userId: userId
        }
      }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already enrolled in this classroom' 
      });
    }
    
    // Create enrollment
    const enrollment = await prisma.classroomEnrollment.create({
      data: {
        classroomId: id,
        userId: userId,
        status: 'ENROLLED'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'User enrolled successfully',
      data: enrollment 
    });
  } catch (error) {
    console.error('Error enrolling user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to enroll user',
      message: error.message 
    });
  }
});

// Get classroom enrollments
app.get('/api/classrooms/:id/enrollments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    const enrollments = await prisma.classroomEnrollment.findMany({
      where: { classroomId: id },
      include: {
        classroom: true
      }
    });
    
    res.json({ 
      success: true, 
      data: enrollments 
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch enrollments',
      message: error.message 
    });
  }
});

// Start classroom session
app.post('/api/classrooms/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    // Create session
    const session = await prisma.classroomSession.create({
      data: {
        classroomId: id,
        sessionId: sessionId || `session_${Date.now()}`,
        startTime: new Date()
      }
    });
    
    // Update classroom status
    const updatedClassroom = await prisma.classroom.update({
      where: { id },
      data: { status: 'IN_PROGRESS' }
    });
    
    // Emit socket event
    io.to(id).emit('classroomStarted', { classroom: updatedClassroom, session });
    
    res.json({ 
      success: true, 
      message: 'Classroom session started successfully',
      data: {
        classroom: updatedClassroom,
        session
      }
    });
  } catch (error) {
    console.error('Error starting classroom session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start classroom session',
      message: error.message 
    });
  }
});

// End classroom session
app.post('/api/classrooms/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    // Find active session
    const session = await prisma.classroomSession.findFirst({
      where: {
        classroomId: id,
        endTime: null
      },
      orderBy: { startTime: 'desc' }
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'No active session found' 
      });
    }
    
    // End session
    const endedSession = await prisma.classroomSession.update({
      where: { id: session.id },
      data: { endTime: new Date() }
    });
    
    // Update classroom status
    const updatedClassroom = await prisma.classroom.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });
    
    // Emit socket event
    io.to(id).emit('classroomEnded', { classroom: updatedClassroom, session: endedSession });
    
    res.json({ 
      success: true, 
      message: 'Classroom session ended successfully',
      data: {
        classroom: updatedClassroom,
        session: endedSession
      }
    });
  } catch (error) {
    console.error('Error ending classroom session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to end classroom session',
      message: error.message 
    });
  }
});

// Send message in classroom
app.post('/api/classrooms/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, message, messageType } = req.body;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    // Create message
    const classroomMessage = await prisma.classroomMessage.create({
      data: {
        classroomId: id,
        userId,
        message,
        messageType: messageType || 'TEXT'
      }
    });
    
    // Emit socket event
    io.to(id).emit('newMessage', classroomMessage);
    
    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: classroomMessage 
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

// Get classroom messages
app.get('/api/classrooms/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });
    
    if (!classroom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Classroom not found' 
      });
    }
    
    const messages = await prisma.classroomMessage.findMany({
      where: { classroomId: id },
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

// Get classrooms for user
app.get('/api/users/:userId/classrooms', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const classrooms = await prisma.classroom.findMany({
      where: {
        OR: [
          { instructorId: userId },
          { enrollments: { some: { userId } } }
        ]
      },
      orderBy: { startTime: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: classrooms 
    });
  } catch (error) {
    console.error('Error fetching user classrooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user classrooms',
      message: error.message 
    });
  }
});

// Get classrooms for course
app.get('/api/courses/:courseId/classrooms', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const classrooms = await prisma.classroom.findMany({
      where: { courseId },
      orderBy: { startTime: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: classrooms 
    });
  } catch (error) {
    console.error('Error fetching course classrooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course classrooms',
      message: error.message 
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected to classroom service:', socket.id);
  
  socket.on('joinClassroom', (classroomId) => {
    socket.join(classroomId);
    console.log(`User ${socket.id} joined classroom ${classroomId}`);
  });
  
  socket.on('leaveClassroom', (classroomId) => {
    socket.leave(classroomId);
    console.log(`User ${socket.id} left classroom ${classroomId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from classroom service:', socket.id);
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