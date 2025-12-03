const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3027;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'arbiter-system' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for disputes and mediation sessions (in production, use a database)
const disputes = new Map();
const mediationSessions = new Map();
const arbitrators = new Map();

// Initialize with sample data
disputes.set('dispute_1', {
  id: 'dispute_1',
  parties: ['party_a', 'party_b'],
  type: 'contractual',
  description: 'Contract terms disagreement',
  status: 'mediation',
  submittedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

disputes.set('dispute_2', {
  id: 'dispute_2',
  parties: ['party_c', 'party_d'],
  type: 'technical',
  description: 'API integration issue',
  status: 'resolved',
  submittedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  resolution: 'Parties agreed to modify API specification'
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'arbiter-system',
    timestamp: new Date().toISOString()
  });
});

// Get all disputes
app.get('/api/disputes', (req, res) => {
  try {
    const disputeList = Array.from(disputes.values());

    res.json({
      success: true,
      data: disputeList,
      count: disputeList.length
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific dispute
app.get('/api/disputes/:disputeId', (req, res) => {
  try {
    const { disputeId } = req.params;
    const dispute = disputes.get(disputeId);

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    logger.error('Error fetching dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit a new dispute
app.post('/api/disputes', (req, res) => {
  try {
    const { parties, type, description } = req.body;

    // Validate input
    if (!parties || !Array.isArray(parties) || parties.length < 2) {
      return res.status(400).json({ error: 'At least two parties are required' });
    }

    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description are required' });
    }

    const disputeId = uuidv4();
    const dispute = {
      id: disputeId,
      parties,
      type,
      description,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    disputes.set(disputeId, dispute);

    logger.info(`Dispute ${disputeId} submitted`);

    res.status(201).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    logger.error('Error submitting dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update dispute status
app.put('/api/disputes/:disputeId', (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, resolution } = req.body;

    const dispute = disputes.get(disputeId);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Update dispute
    dispute.status = status || dispute.status;
    dispute.resolution = resolution || dispute.resolution;
    dispute.updatedAt = new Date().toISOString();

    disputes.set(disputeId, dispute);

    logger.info(`Dispute ${disputeId} updated`);

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    logger.error('Error updating dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule a mediation session
app.post('/api/mediation', (req, res) => {
  try {
    const { disputeId, mediator, scheduledTime } = req.body;

    // Validate input
    if (!disputeId || !mediator) {
      return res.status(400).json({ error: 'Dispute ID and mediator are required' });
    }

    // Check if dispute exists
    const dispute = disputes.get(disputeId);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      disputeId,
      mediator,
      scheduledTime: scheduledTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    mediationSessions.set(sessionId, session);

    // Update dispute status
    dispute.status = 'mediation_scheduled';
    dispute.updatedAt = new Date().toISOString();
    disputes.set(disputeId, dispute);

    logger.info(`Mediation session ${sessionId} scheduled for dispute ${disputeId}`);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error scheduling mediation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all mediation sessions
app.get('/api/mediation', (req, res) => {
  try {
    const sessionList = Array.from(mediationSessions.values());

    res.json({
      success: true,
      data: sessionList,
      count: sessionList.length
    });
  } catch (error) {
    logger.error('Error fetching mediation sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific mediation session
app.get('/api/mediation/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = mediationSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Mediation session not found' });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error fetching mediation session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update mediation session status
app.put('/api/mediation/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, notes } = req.body;

    const session = mediationSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Mediation session not found' });
    }

    // Update session
    session.status = status || session.status;
    session.notes = notes || session.notes;
    session.updatedAt = new Date().toISOString();

    mediationSessions.set(sessionId, session);

    // Update associated dispute if needed
    if (status === 'completed' || status === 'cancelled') {
      const dispute = disputes.get(session.disputeId);
      if (dispute) {
        dispute.status = status === 'completed' ? 'resolved' : 'mediation_cancelled';
        dispute.updatedAt = new Date().toISOString();
        disputes.set(session.disputeId, dispute);
      }
    }

    logger.info(`Mediation session ${sessionId} updated`);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error updating mediation session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available arbitrators
app.get('/api/arbitrators', (req, res) => {
  try {
    const arbitratorList = Array.from(arbitrators.values());

    res.json({
      success: true,
      data: arbitratorList,
      count: arbitratorList.length
    });
  } catch (error) {
    logger.error('Error fetching arbitrators:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register a new arbitrator
app.post('/api/arbitrators', (req, res) => {
  try {
    const { name, expertise, credentials } = req.body;

    if (!name || !expertise) {
      return res.status(400).json({ error: 'Name and expertise are required' });
    }

    const arbitratorId = uuidv4();
    const arbitrator = {
      id: arbitratorId,
      name,
      expertise,
      credentials: credentials || [],
      registeredAt: new Date().toISOString(),
      active: true
    };

    arbitrators.set(arbitratorId, arbitrator);

    logger.info(`Arbitrator ${arbitratorId} registered`);

    res.status(201).json({
      success: true,
      data: arbitrator
    });
  } catch (error) {
    logger.error('Error registering arbitrator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Arbiter System running on port ${PORT}`);
});

module.exports = app;
