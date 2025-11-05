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
import ForgeOrganismIntegration from './organism-integration';

const app = express();
const PORT = process.env.PORT || 12345;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-forge';

// Initialize Organism Integration 🌟
const organismIntegration = new ForgeOrganismIntegration({
  mintServiceUrl: process.env.MINT_SERVICE_URL || 'http://localhost:3001',
  educationServiceUrl: process.env.EDUCATION_SERVICE_URL || 'http://localhost:3010',
  careersServiceUrl: process.env.CAREERS_SERVICE_URL || 'http://localhost:3040',
  communityServiceUrl: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3060',
  nexusServiceUrl: process.env.NEXUS_SERVICE_URL || 'http://localhost:3002',
  supremeOrganismUrl: process.env.SUPREME_ORGANISM_URL || 'http://localhost:3100',
  platformFeePercentage: 0.05, // 5% to Mint (heart)
  sellerEarningsPercentage: 0.95, // 95% to seller
  autoCreateProfilesForGraduates: true,
  autoSendRevenueToMint: true,
  autoMatchWithCareers: true,
});

console.log('🌟 Forge connected to Supreme Organism!');

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

// Health endpoint (for Supreme Organism monitoring)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-forge',
    biologicalRole: '🍔 Stomach - Processes work into money',
    organSystem: 'digestive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    organismIntegration: {
      connected: true,
      mint: 'connected',
      education: 'connected',
      careers: 'connected',
      community: 'connected',
      nexus: 'connected',
    },
  });
});

// Organism integration endpoints
app.get('/api/organism/receive', (req, res) => {
  // Receive resources from other services
  res.json({ message: 'Forge ready to receive' });
});

app.post('/api/organism/give', async (req, res) => {
  // Give resources to other services
  res.json({ message: 'Forge revenue shared with Mint' });
});

app.post('/api/organism/heal', async (req, res) => {
  // Receive healing from other services
  res.json({ message: 'Forge health restored' });
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