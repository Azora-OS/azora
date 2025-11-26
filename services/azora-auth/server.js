const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('./src/middleware/compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4004;

// Ubuntu Middleware
app.use(helmet());
app.use(compression);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-auth',
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-auth',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes
const authRoutes = require('./src/routes/auth');
const oauthRoutes = require('./src/routes/oauth');
const tokenRoutes = require('./src/routes/token');
const gdprRoutes = require('./src/routes/gdpr');
const { authenticateToken } = require('./src/middleware/jwt');
const { requireRole, requirePermission, ROLES } = require('./src/middleware/rbac');
const { auditMiddleware } = require('./src/middleware/audit');

app.use(auditMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/gdpr', gdprRoutes);

// Protected route examples
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    ubuntu: 'Ubuntu profile access'
  });
});

app.get('/api/admin/users', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
  res.json({
    message: 'Admin users endpoint',
    ubuntu: 'Ubuntu admin access granted'
  });
});

app.get('/api/courses', authenticateToken, requirePermission('courses:read'), (req, res) => {
  res.json({
    message: 'Courses endpoint',
    ubuntu: 'Ubuntu course access granted'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🚀 azora-auth running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});