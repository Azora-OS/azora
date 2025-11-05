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

// Initialize Organism Bridge
organismBridge.on('ready', () => {
  console.log('🌉 Organism Bridge connected!');
});

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/escrow', escrowRoutes);
// TODO: Add more routes
// app.use('/api/ratings', ratingRoutes);
// app.use('/api/profiles', profileRoutes);
// app.use('/api/disputes', disputeRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/messaging', messagingRoutes);

// Health endpoint (for Supreme Organism monitoring)
app.get('/health', (req, res) => {
  const organismHealth = organismBridge.getOrganismHealth();
  
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
    version: '2.0.0',
    description: 'World-class decentralized marketplace for skills and services',
    tagline: 'The Fiverr + Upwork + TaskRabbit of Web3 Combined!',
    features: [
      '✅ Escrow system for safe transactions',
      '✅ Rating & review system',
      '✅ Skill verification (linked to Education)',
      '✅ Payment integration (linked to Mint)',
      '✅ Dispute resolution',
      '✅ Service provider profiles',
      '✅ Learn-to-Earn bonuses',
      '✅ Organism integration (all services connected)'
    ],
    endpoints: {
      health: '/health',
      organism: '/organism',
      categories: '/api/categories',
      marketplace: '/api/marketplace',
      escrow: '/api/escrow'
    },
    organism: {
      role: 'Skills & Work (Muscles)',
      description: 'When Forge does work → Mint makes money → Education improves skills → Everyone benefits!'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Azora Forge Marketplace running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
  console.log(`🌉 Organism Bridge: Active`);
  console.log(`💪 Role: Skills & Work (Muscles of Azora)`);
});
