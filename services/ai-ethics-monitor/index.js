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
const PORT = process.env.PORT || 3010;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-ethics-monitor' },
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
app.post('/api/monitor', (req, res) => {
  try {
    const { aiDecision, context, user } = req.body;

    // Validate input
    if (!aiDecision) {
      return res.status(400).json({ error: 'AI decision is required' });
    }

    // Generate unique ID for this report
    const reportId = uuidv4();

    // Perform comprehensive ethics analysis
    const ethicsReport = {
      id: reportId,
      decision: aiDecision,
      context: context || {},
      user: user || 'anonymous',
      ethicalScore: calculateEthicalScore(aiDecision, context),
      violations: detectEthicalViolations(aiDecision, context),
      recommendations: generateEthicalRecommendations(aiDecision, context),
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store the report
    ethicsReports.set(reportId, ethicsReport);

    // Log any violations
    if (ethicsReport.violations.length > 0) {
      logger.warn(`Ethical violations detected in AI decision`, {
        reportId,
        violations: ethicsReport.violations.length
      });

      // Store violations for tracking
      violations.set(reportId, ethicsReport.violations);
    }

    logger.info(`AI ethics report generated`, { reportId, ethicalScore: ethicsReport.ethicalScore });

    res.status(201).json({
      success: true,
      data: ethicsReport
    });
  } catch (error) {
    logger.error('Error generating ethics report', error);
    res.status(500).json({ error: error.message });
  }
});

// Constitutional AI compliance check
app.post('/api/compliance', (req, res) => {
  try {
    const { action, context } = req.body;

    // Validate input
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    // Generate unique ID for this report
    const reportId = uuidv4();

    // Perform constitutional compliance analysis
    const complianceReport = {
      id: reportId,
      action,
      context: context || {},
      compliant: checkConstitutionalCompliance(action, context),
      violations: detectConstitutionalViolations(action, context),
      recommendations: generateComplianceRecommendations(action, context),
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store the report
    complianceReports.set(reportId, complianceReport);

    // Log any violations
    if (!complianceReport.compliant || complianceReport.violations.length > 0) {
      logger.warn(`Constitutional compliance violations detected`, {
        reportId,
        violations: complianceReport.violations.length
      });
    }

    logger.info(`Constitutional compliance report generated`, {
      reportId,
      compliant: complianceReport.compliant
    });

    res.status(201).json({
      success: true,
      data: complianceReport
    });
  } catch (error) {
    logger.error('Error generating compliance report', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all ethics reports
app.get('/api/reports', (req, res) => {
  try {
    const reportList = Array.from(ethicsReports.values());

    res.json({
      success: true,
      data: reportList,
      count: reportList.length
    });
  } catch (error) {
    logger.error('Error fetching ethics reports', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific ethics report
app.get('/api/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = ethicsReports.get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Ethics report not found' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error fetching ethics report', error);
    res.status(500).json({ error: error.message });
  }
});

// Get compliance reports
app.get('/api/compliance-reports', (req, res) => {
  try {
    const reportList = Array.from(complianceReports.values());

    res.json({
      success: true,
      data: reportList,
      count: reportList.length
    });
  } catch (error) {
    logger.error('Error fetching compliance reports', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific compliance report
app.get('/api/compliance-reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = complianceReports.get(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Compliance report not found' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error fetching compliance report', error);
    res.status(500).json({ error: error.message });
  }
});

// Get violations
app.get('/api/violations', (req, res) => {
  try {
    const violationList = Array.from(violations.values()).flat();

    res.json({
      success: true,
      data: violationList,
      count: violationList.length
    });
  } catch (error) {
    logger.error('Error fetching violations', error);
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
  logger.info(`AI Ethics Monitor Service running on port ${PORT}`);
});

// Helper functions for ethical analysis
function calculateEthicalScore(decision, context) {
  // In a real implementation, this would use sophisticated ethical frameworks
  // For now, we'll simulate a score based on various factors
  const baseScore = 85; // Start with a good baseline

  // Adjust based on context factors
  let adjustment = 0;

  if (context && context.sensitivity) {
    if (context.sensitivity === 'high') { adjustment -= 10; }
    else if (context.sensitivity === 'medium') { adjustment -= 5; }
  }

  if (context && context.impact) {
    if (context.impact === 'high') { adjustment -= 15; }
    else if (context.impact === 'medium') { adjustment -= 7; }
  }

  // Ensure score stays within bounds
  const score = Math.max(0, Math.min(100, baseScore + adjustment));
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

function detectEthicalViolations(decision, context) {
  const violations = [];

  // In a real implementation, this would check against specific ethical guidelines
  // For now, we'll simulate violation detection

  if (context && context.sensitivity === 'high' && Math.random() > 0.7) {
    violations.push({
      type: 'Privacy Violation',
      severity: 'High',
      description: 'Decision may expose sensitive personal information'
    });
  }

  if (context && context.biasRisk && Math.random() > 0.8) {
    violations.push({
      type: 'Potential Bias',
      severity: 'Medium',
      description: 'Decision may exhibit bias against protected groups'
    });
  }

  return violations;
}

function generateEthicalRecommendations(decision, context) {
  const recommendations = [];

  // In a real implementation, this would generate specific recommendations
  // For now, we'll simulate recommendations

  recommendations.push({
    type: 'Review',
    priority: 'High',
    description: 'Human review recommended for ethical oversight'
  });

  if (context && context.sensitivity === 'high') {
    recommendations.push({
      type: 'Privacy',
      priority: 'High',
      description: 'Ensure data minimization principles are applied'
    });
  }

  return recommendations;
}

function checkConstitutionalCompliance(action, context) {
  // In a real implementation, this would check against constitutional AI principles
  // For now, we'll simulate compliance checking
  return Math.random() > 0.1; // 90% chance of compliance
}

function detectConstitutionalViolations(action, context) {
  const violations = [];

  // In a real implementation, this would check against specific constitutional principles
  // For now, we'll simulate violation detection

  if (Math.random() > 0.9) {
    violations.push({
      type: 'Transparency Violation',
      severity: 'Medium',
      description: 'Decision-making process lacks sufficient transparency'
    });
  }

  if (Math.random() > 0.85) {
    violations.push({
      type: 'Accountability Gap',
      severity: 'High',
      description: 'Lack of clear accountability for decision outcomes'
    });
  }

  return violations;
}

function generateComplianceRecommendations(action, context) {
  const recommendations = [];

  // In a real implementation, this would generate specific recommendations
  // For now, we'll simulate recommendations

  recommendations.push({
    type: 'Documentation',
    priority: 'High',
    description: 'Document decision rationale for audit purposes'
  });

  recommendations.push({
    type: 'Review',
    priority: 'Medium',
    description: 'Schedule periodic compliance review'
  });

  return recommendations;
}

module.exports = app;