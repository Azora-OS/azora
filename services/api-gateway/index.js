const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken, requireRole, rateLimiter } = require('@azora/shared-auth');
const { csrfProtection, secureCors, errorHandler } = require('../../packages/security-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(secureCors);
app.use(compression());
app.use(express.json());
app.use(rateLimiter());
app.use(csrfProtection);

// Service registry
const services = {
  auth: process.env.AUTH_URL || 'http://localhost:3001',
  education: process.env.EDUCATION_URL || 'http://localhost:3074',
  mint: process.env.MINT_URL || 'http://localhost:3080',
  forge: process.env.FORGE_URL || 'http://localhost:3200',
  nexus: process.env.NEXUS_URL || 'http://localhost:3000',
  aiFamily: process.env.AI_FAMILY_URL || 'http://localhost:4010'
};

// Auth routes (public)
app.use('/api/auth', createProxyMiddleware({ 
  target: services.auth, 
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

// Health check (public)
app.get('/api/health', async (req, res) => {
  const axios = require('axios');
  const health = { status: 'healthy', gateway: 'operational', services: {} };
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 2000 });
      health.services[name] = { status: 'healthy', url, data: response.data };
    } catch (error) {
      health.services[name] = { status: 'unhealthy', url, error: error.message };
    }
  }
  
  res.json(health);
});

// Protected routes - require authentication
app.use('/api/education', authenticateToken, createProxyMiddleware({ 
  target: services.education, 
  changeOrigin: true,
  pathRewrite: { '^/api/education': '/api' }
}));

app.use('/api/mint', authenticateToken, createProxyMiddleware({ 
  target: services.mint, 
  changeOrigin: true,
  pathRewrite: { '^/api/mint': '/api' }
}));

app.use('/api/forge', authenticateToken, createProxyMiddleware({ 
  target: services.forge, 
  changeOrigin: true,
  pathRewrite: { '^/api/forge': '/api' }
}));

app.use('/api/nexus', authenticateToken, createProxyMiddleware({ 
  target: services.nexus, 
  changeOrigin: true,
  pathRewrite: { '^/api/nexus': '/api' }
}));

app.use('/api/ai-family', authenticateToken, createProxyMiddleware({ 
  target: services.aiFamily, 
  changeOrigin: true,
  pathRewrite: { '^/api/ai-family': '/api' }
}));

// Unified endpoints
app.post('/api/students/enroll', authenticateToken, async (req, res) => {
  const axios = require('axios');
  const { studentId, courseId, userId } = req.body;
  
  try {
    // Enroll in education service
    const enrollment = await axios.post(`${services.education}/api/enrollments`, { studentId, courseId });
    
    // Create wallet in mint service
    await axios.post(`${services.mint}/api/wallet/create`, { userId });
    
    // Publish event to nexus
    await axios.post(`${services.nexus}/api/events`, {
      type: 'student.enrolled',
      data: { studentId, courseId, userId }
    });
    
    res.json({ success: true, enrollment: enrollment.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/courses/complete', authenticateToken, async (req, res) => {
  const axios = require('axios');
  const { studentId, courseId, score } = req.body;
  
  try {
    // Update progress
    await axios.post(`${services.education}/api/progress`, {
      studentId,
      moduleId: courseId,
      completed: true,
      score
    });
    
    // Issue mining reward
    const reward = await axios.post(`${services.mint}/api/mining/submit`, {
      challenge: { id: courseId },
      answers: { score },
      address: `student_${studentId}`,
      studentLevel: 1
    });
    
    // Publish event
    await axios.post(`${services.nexus}/api/events`, {
      type: 'course.completed',
      data: { studentId, courseId, score }
    });
    
    res.json({ success: true, reward: reward.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📡 Routing to ${Object.keys(services).length} services`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
