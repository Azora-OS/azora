/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import qualificationRoutes from './routes/qualificationRoutes';
import tutoringRoutes from './routes/tutoringRoutes';

const app: express.Application = express();
const PORT = process.env.PORT || 4011;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/tutoring', tutoringRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-sapiens',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Azora Sapiens - Universal Education Platform',
    version: '1.0.0',
    description: 'Global qualifications database and education management system',
    endpoints: {
      health: '/health',
      qualifications: '/api/qualifications',
      tutoring: '/api/tutoring',
      sessions: '/api/tutoring/sessions',
      learningPaths: '/api/tutoring/learning-paths',
      assessments: '/api/tutoring/assessments'
    },
    features: [
      'AI-powered tutoring with Elara',
      'Personalized learning paths',
      'Real-time Q&A assistance',
      'Adaptive assessments',
      'Progress tracking',
      'Subject-specific guidance',
      'Global qualifications database',
      'Blockchain-based verification',
      'AZR token rewards for achievements'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n🎓 Azora Sapiens - Universal Education Platform`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Global Qualifications Database: http://localhost:${PORT}/api/qualifications`);
  console.log(`🔍 Search Qualifications: http://localhost:${PORT}/api/qualifications/search`);
  console.log(`✅ Verify Credentials: http://localhost:${PORT}/api/qualifications/verify\n`);
});

export default app;
