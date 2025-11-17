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
const PORT = process.env.PORT || 3025;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'constitutional-court-service' },
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

// In-memory storage for constitutional cases and violations (in production, use a database)
const constitutionalCases = new Map();
const constitutionalViolations = new Map();

// Initialize with sample data
constitutionalCases.set('case_1', {
  id: 'case_1',
  title: 'AI Ethics Compliance Review',
  description: 'Review of AI system compliance with ethical guidelines',
  status: 'open',
  priority: 'high',
  filedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  parties: ['AI Development Team', 'Ethics Committee']
});

constitutionalCases.set('case_2', {
  id: 'case_2',
  title: 'Data Privacy Violation',
  description: 'Investigation of potential data privacy violations',
  status: 'resolved',
  priority: 'medium',
  filedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  resolution: 'Violations addressed with updated privacy policies',
  parties: ['Data Protection Officer', 'Legal Team']
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'constitutional-court-service', 
    timestamp: new Date().toISOString() 
  });
});

// Get all constitutional cases
app.get('/api/cases', (req, res) => {
  try {
    const caseList = Array.from(constitutionalCases.values());
    
    res.json({
      success: true,
      data: caseList,
      count: caseList.length
    });
  } catch (error) {
    logger.error('Error fetching cases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific constitutional case
app.get('/api/cases/:caseId', (req, res) => {
  try {
    const { caseId } = req.params;
    const caseRecord = constitutionalCases.get(caseId);
    
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json({
      success: true,
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error fetching case:', error);
    res.status(500).json({ error: error.message });
  }
});

// File a new constitutional case
app.post('/api/cases', (req, res) => {
  try {
    const { title, description, priority, parties } = req.body;
    
    // Validate input
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const caseId = uuidv4();
    const caseRecord = {
      id: caseId,
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
      parties: parties || [],
      filedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    constitutionalCases.set(caseId, caseRecord);
    
    logger.info(`Constitutional case ${caseId} filed`);
    
    res.status(201).json({
      success: true,
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error filing case:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update constitutional case status
app.put('/api/cases/:caseId', (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, resolution, priority } = req.body;
    
    const caseRecord = constitutionalCases.get(caseId);
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // Update case
    caseRecord.status = status || caseRecord.status;
    caseRecord.resolution = resolution || caseRecord.resolution;
    caseRecord.priority = priority || caseRecord.priority;
    caseRecord.updatedAt = new Date().toISOString();
    
    constitutionalCases.set(caseId, caseRecord);
    
    logger.info(`Constitutional case ${caseId} updated`);
    
    res.json({
      success: true,
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error updating case:', error);
    res.status(500).json({ error: error.message });
  }
});

// Constitutional compliance check endpoint
app.post('/api/compliance/check', (req, res) => {
  try {
    const { action, context, userId } = req.body;
    
    // Validate input
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    // Simulate compliance check
    const isCompliant = Math.random() > 0.2; // 80% compliant
    const violations = [];
    const recommendations = [];
    
    // If not compliant, generate some violations and recommendations
    if (!isCompliant) {
      violations.push({
        id: uuidv4(),
        type: 'privacy_violation',
        description: 'Action may violate user privacy rights',
        severity: 'medium'
      });
      
      recommendations.push('Review privacy policy compliance');
      recommendations.push('Implement additional user consent mechanisms');
    }
    
    const complianceResult = {
      id: uuidv4(),
      action,
      context: context || {},
      userId: userId || 'anonymous',
      compliant: isCompliant,
      violations,
      recommendations,
      checkedAt: new Date().toISOString()
    };
    
    // Record violations if any
    if (violations.length > 0) {
      violations.forEach(violation => {
        constitutionalViolations.set(violation.id, {
          ...violation,
          complianceCheckId: complianceResult.id,
          recordedAt: new Date().toISOString()
        });
      });
    }
    
    logger.info(`Compliance check completed for action: ${action}`);
    
    res.json({
      success: true,
      data: complianceResult
    });
  } catch (error) {
    logger.error('Error checking compliance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all constitutional violations
app.get('/api/compliance/violations', (req, res) => {
  try {
    const violationList = Array.from(constitutionalViolations.values());
    
    res.json({
      success: true,
      data: violationList,
      count: violationList.length
    });
  } catch (error) {
    logger.error('Error fetching violations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific constitutional violation
app.get('/api/compliance/violations/:violationId', (req, res) => {
  try {
    const { violationId } = req.params;
    const violation = constitutionalViolations.get(violationId);
    
    if (!violation) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    res.json({
      success: true,
      data: violation
    });
  } catch (error) {
    logger.error('Error fetching violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search cases by status or priority
app.get('/api/cases/search', (req, res) => {
  try {
    const { status, priority } = req.query;
    
    const filteredCases = Array.from(constitutionalCases.values()).filter(caseRecord => {
      const statusMatch = !status || caseRecord.status === status;
      const priorityMatch = !priority || caseRecord.priority === priority;
      return statusMatch && priorityMatch;
    });
    
    res.json({
      success: true,
      data: filteredCases,
      count: filteredCases.length
    });
  } catch (error) {
    logger.error('Error searching cases:', error);
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
  logger.info(`Constitutional Court Service running on port ${PORT}`);
});

module.exports = app;