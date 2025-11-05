/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes';
import marketplaceRoutes from './marketplaceApi';

const app = express();
const PORT = process.env.PORT || 12345;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-forge';

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-forge',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Azora Forge Marketplace',
    version: '1.0.0',
    description: 'Decentralized marketplace for skills and services',
    endpoints: {
      health: '/health',
      categories: '/api/categories',
      marketplace: '/api/marketplace'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Azora Forge Marketplace running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
});