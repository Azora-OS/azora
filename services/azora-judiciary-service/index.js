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
const PORT = process.env.PORT || 3026;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-judiciary-service' },
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

// In-memory storage for cases and documents (in production, use a database)
const legalCases = new Map();
const legalDocuments = new Map();

// Initialize with sample data
legalCases.set('legal_1', {
  id: 'legal_1',
  title: 'Contract Dispute Resolution',
  type: 'contract',
  status: 'open',
  priority: 'high',
  description: 'Dispute over terms of service agreement',
  parties: ['Party A', 'Party B'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

legalDocuments.set('doc_1', {
  id: 'doc_1',
  title: 'Contract Terms Agreement',
  type: 'contract',
  version: '1.0',
  status: 'active',
  content: 'Standard terms and conditions for service agreements',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-judiciary-service',
    timestamp: new Date().toISOString()
  });
});

// Get all legal cases
app.get('/api/cases', (req, res) => {
  try {
    const caseList = Array.from(legalCases.values());
    
    res.json({
      success: true,
      data: caseList,
      count: caseList.length
    });
  } catch (error) {
    logger.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific legal case
app.get('/api/cases/:caseId', (req, res) => {
  try {
    const { caseId } = req.params;
    const legalCase = legalCases.get(caseId);
    
    if (!legalCase) {
      return res.status(404).json({ error: 'Legal case not found' });
    }
    
    res.json({
      success: true,
      data: legalCase
    });
  } catch (error) {
    logger.error('Error fetching case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File a new legal case
app.post('/api/cases', (req, res) => {
  try {
    const { title, type, description, priority, parties } = req.body;
    
    // Validate input
    if (!title || !type || !description) {
      return res.status(400).json({ error: 'Title, type, and description are required' });
    }
    
    const caseId = uuidv4();
    const legalCase = {
      id: caseId,
      title,
      type,
      status: 'filed',
      priority: priority || 'medium',
      description: description || '',
      parties: parties || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    legalCases.set(caseId, legalCase);
    
    logger.info(`Legal case ${caseId} filed`, { caseId, title });
    
    res.status(201).json({
      success: true,
      data: legalCase
    });
  } catch (error) {
    logger.error('Error filing case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update case status
app.put('/api/cases/:caseId', (req, res) => {
  try {
    const { caseId } = req.params;
    const updates = req.body;
    
    const legalCase = legalCases.get(caseId);
    if (!legalCase) {
      return res.status(404).json({ error: 'Legal case not found' });
    }
    
    // Update case fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        legalCase[key] = updates[key];
      }
    });
    
    legalCase.updatedAt = new Date().toISOString();
    
    legalCases.set(caseId, legalCase);
    
    logger.info(`Legal case ${caseId} updated`, { caseId, updates });
    
    res.json({
      success: true,
      data: legalCase
    });
  } catch (error) {
    logger.error('Error updating case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search cases
app.get('/api/cases/search', (req, res) => {
  try {
    const { type, status } = req.query;
    let filteredCases = Array.from(legalCases.values());
    
    if (type) {
      filteredCases = filteredCases.filter(c => c.type === type);
    }
    
    if (status) {
      filteredCases = filteredCases.filter(c => c.status === status);
    }
    
    res.json({
      success: true,
      data: filteredCases,
      count: filteredCases.length
    });
  } catch (error) {
    logger.error('Error searching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all legal documents
app.get('/api/documents', (req, res) => {
  try {
    const documentList = Array.from(legalDocuments.values());
    
    res.json({
      success: true,
      data: documentList,
      count: documentList.length
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific legal document
app.get('/api/documents/:documentId', (req, res) => {
  try {
    const { documentId } = req.params;
    const document = legalDocuments.get(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Legal document not found' });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload a new legal document
app.post('/api/documents', (req, res) => {
  try {
    const { title, type, version, content } = req.body;
    
    // Validate input
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    
    const documentId = uuidv4();
    const document = {
      id: documentId,
      title,
      type,
      version: version || '1.0',
      status: 'active',
      content: content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    legalDocuments.set(documentId, document);
    
    logger.info(`Legal document ${documentId} uploaded`, { documentId, title });
    
    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document metadata
app.put('/api/documents/:documentId', (req, res) => {
  try {
    const { documentId } = req.params;
    const updates = req.body;
    
    const document = legalDocuments.get(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Legal document not found' });
    }
    
    // Update document fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        document[key] = updates[key];
      }
    });
    
    document.updatedAt = new Date().toISOString();
    
    legalDocuments.set(documentId, document);
    
    logger.info(`Legal document ${documentId} updated`, { documentId, updates });
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search documents
app.get('/api/documents/search', (req, res) => {
  try {
    const { type, title } = req.query;
    let filteredDocuments = Array.from(legalDocuments.values());
    
    if (type) {
      filteredDocuments = filteredDocuments.filter(d => d.type === type);
    }
    
    if (title) {
      filteredDocuments = filteredDocuments.filter(d => 
        d.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredDocuments,
      count: filteredDocuments.length
    });
  } catch (error) {
    logger.error('Error searching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Azora Judiciary Service running on port ${PORT}`);
  });
}

module.exports = app;