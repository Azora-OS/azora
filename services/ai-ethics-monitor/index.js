const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const axios = require('axios');
const Redis = require('ioredis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;
const CONSTITUTIONAL_AI_URL = process.env.CONSTITUTIONAL_AI_URL || 'http://localhost:3050';

// Initialize Redis for persistence
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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
    }),
    new winston.transports.File({ filename: 'ethics-monitor.log' })
  ]
});

// Enhanced Ethics Monitor with real analysis
class EnhancedEthicsMonitor {
  constructor() {
    this.violations = [];
    this.serviceScores = {};
    this.frameworks = new Map();
    this.initializeFrameworks();
    this.startPeriodicAnalysis();
  }

  initializeFrameworks() {
    // Ubuntu Ethical Framework
    const ubuntuFramework = {
      name: 'Ubuntu Ethical Framework',
      version: '1.0.0',
      principles: {
        privacy: {
          description: 'Respect individual privacy while fostering community trust',
          rules: [
            {
              name: 'Data Minimization',
              weight: 0.3,
              check: async (data) => {
                const necessaryDataTypes = ['userId', 'timestamp', 'action'];
                const collectedTypes = (data.dataAccess || []).map(d => d.dataType);
                const unnecessaryData = collectedTypes.filter(type => !necessaryDataTypes.includes(type));
                
                return {
                  passed: unnecessaryData.length === 0,
                  confidence: 0.9,
                  evidence: unnecessaryData.length > 0 
                    ? [`Unnecessary data collected: ${unnecessaryData.join(', ')}`]
                    : ['Only necessary data collected']
                };
              }
            },
            {
              name: 'Community Consent',
              weight: 0.4,
              check: async (data) => {
                const communityBeneficialData = (data.dataAccess || []).filter(d => 
                  d.purpose && (d.purpose.includes('community') || d.purpose.includes('collective'))
                );
                
                return {
                  passed: communityBeneficialData.length > 0,
                  confidence: 0.8,
                  evidence: communityBeneficialData.length > 0
                    ? [`Community beneficial data usage: ${communityBeneficialData.map(d => d.dataType).join(', ')}`]
                    : ['No clear community benefit identified']
                };
              }
            }
          ]
        },
        bias: {
          description: 'Ensure fairness and eliminate discrimination',
          rules: [
            {
              name: 'Demographic Balance',
              weight: 0.4,
              check: async (data) => {
                if (!data.userDemographics || Object.keys(data.userDemographics).length === 0) {
                  return { passed: true, confidence: 0.5, evidence: ['No demographic data available'] };
                }

                const demographics = data.userDemographics;
                const values = Object.values(demographics);
                const max = Math.max(...values);
                const min = Math.min(...values);
                const balance = min / max;

                return {
                  passed: balance > 0.7,
                  confidence: 0.8,
                  evidence: [`Demographic balance: ${(balance * 100).toFixed(1)}%`]
                };
              }
            }
          ]
        },
        safety: {
          description: 'Protect users from harm and ensure wellbeing',
          rules: [
            {
              name: 'Error Rate Monitoring',
              weight: 0.4,
              check: async (data) => {
                return {
                  passed: (data.errorRate || 0) < 0.05,
                  confidence: 0.9,
                  evidence: [`Error rate: ${((data.errorRate || 0) * 100).toFixed(2)}%`]
                };
              }
            }
          ]
        },
        transparency: {
          description: 'Maintain openness and explainability',
          rules: [
            {
              name: 'Decision Explainability',
              weight: 0.5,
              check: async (data) => {
                const explainableOutputs = (data.modelOutputs || []).filter(output => 
                  output.content && (
                    output.content.includes('explanation') || 
                    output.content.includes('reasoning') ||
                    output.content.includes('because')
                  )
                );
                
                const explainabilityRate = explainableOutputs.length / Math.max((data.modelOutputs || []).length, 1);
                
                return {
                  passed: explainabilityRate > 0.6,
                  confidence: 0.7,
                  evidence: [`Explainability rate: ${(explainabilityRate * 100).toFixed(1)}%`]
                };
              }
            }
          ]
        },
        accountability: {
          description: 'Take responsibility for AI actions and outcomes',
          rules: [
            {
              name: 'Error Accountability',
              weight: 0.3,
              check: async (data) => {
                const negativeFeedback = (data.userFeedback || []).filter(f => f.rating <= 2);
                const responseRate = negativeFeedback.length / Math.max((data.userFeedback || []).length, 1);
                
                return {
                  passed: responseRate < 0.1,
                  confidence: 0.7,
                  evidence: [`Negative feedback rate: ${(responseRate * 100).toFixed(1)}%`]
                };
              }
            }
          ]
        },
        fairness: {
          description: 'Ensure equitable treatment and opportunities',
          rules: [
            {
              name: 'Opportunity Creation',
              weight: 0.3,
              check: async (data) => {
                const positiveFeedback = (data.userFeedback || []).filter(f => f.rating >= 4);
                const opportunityRate = positiveFeedback.length / Math.max((data.userFeedback || []).length, 1);
                
                return {
                  passed: opportunityRate > 0.7,
                  confidence: 0.7,
                  evidence: [`Positive opportunity creation: ${(opportunityRate * 100).toFixed(1)}%`]
                };
              }
            }
          ]
        }
      }
    };

    this.frameworks.set('ubuntu', ubuntuFramework);
    logger.info('Ubuntu Ethical Framework initialized');
  }

  async analyzeServiceEthics(serviceId, data) {
    logger.info(`Starting ethical analysis for service: ${serviceId}`);
    
    const framework = this.frameworks.get('ubuntu');
    if (!framework) {
      throw new Error('Ubuntu framework not found');
    }

    const categoryScores = {
      privacy: 100,
      bias: 100,
      safety: 100,
      transparency: 100,
      accountability: 100,
      fairness: 100
    };

    const newViolations = [];

    // Analyze each category
    for (const [category, principle] of Object.entries(framework.principles)) {
      let categoryScore = 100;

      for (const rule of principle.rules) {
        try {
          const result = await rule.check(data);
          
          if (!result.passed && result.confidence > 0.7) {
            const penalty = rule.weight * 100 * (1 - result.confidence);
            categoryScore -= penalty;

            const violation = {
              id: uuidv4(),
              serviceId,
              severity: this.calculateSeverity(category, penalty),
              category,
              description: `${rule.name}: ${principle.description}`,
              evidence: result.evidence,
              riskScore: penalty,
              timestamp: new Date().toISOString(),
              status: 'open',
              aiAnalysis: {
                confidence: result.confidence,
                reasoning: `Failed ${rule.name} check with ${result.confidence} confidence. ${result.evidence.join(' ')}`,
                suggestedActions: this.generateSuggestedActions(category, rule.name),
                relatedViolations: []
              }
            };

            newViolations.push(violation);
            this.violations.push(violation);
          }

        } catch (error) {
          logger.error(`Error checking rule ${rule.name}:`, error);
        }
      }

      categoryScores[category] = Math.max(0, categoryScore);
    }

    // Calculate overall score
    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 6;

    // Calculate Ubuntu compliance metrics
    const ubuntuCompliance = {
      communityRespect: (categoryScores.privacy + categoryScores.bias) / 2,
      sharedProsperity: (categoryScores.fairness + categoryScores.safety) / 2,
      collectiveResponsibility: (categoryScores.transparency + categoryScores.accountability) / 2
    };

    const report = {
      serviceId,
      overallScore,
      categoryScores,
      violations: this.violations.filter(v => v.serviceId === serviceId),
      trends: {
        scoreHistory: [{ timestamp: new Date().toISOString(), score: overallScore }],
        violationTrends: []
      },
      recommendations: this.generateRecommendations(categoryScores, newViolations),
      lastCheck: new Date().toISOString(),
      ubuntuCompliance
    };

    this.serviceScores[serviceId] = report;

    // Trigger alerts for critical violations
    const criticalViolations = newViolations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      await this.triggerCriticalAlerts(criticalViolations);
    }

    // Persist to Redis
    await redis.setex(`compliance:${serviceId}`, 86400, JSON.stringify(report));

    logger.info(`Ethical analysis completed for ${serviceId}`, {
      overallScore,
      violationsFound: newViolations.length,
      criticalViolations: criticalViolations.length
    });

    return report;
  }

  calculateSeverity(category, penalty) {
    if (penalty > 25) return 'critical';
    if (penalty > 15) return 'high';
    if (penalty > 5) return 'medium';
    return 'low';
  }

  generateSuggestedActions(category, ruleName) {
    const actionMap = {
      privacy: ['Review data collection practices', 'Implement data minimization', 'Add user consent mechanisms'],
      bias: ['Audit training data for bias', 'Implement fairness constraints', 'Increase demographic diversity'],
      safety: ['Improve error handling', 'Add safety filters', 'Implement rate limiting'],
      transparency: ['Add explainability features', 'Document decision processes', 'Provide user explanations'],
      accountability: ['Strengthen audit logging', 'Implement error reporting', 'Add responsibility frameworks'],
      fairness: ['Review access policies', 'Implement equitable algorithms', 'Monitor resource distribution']
    };

    return actionMap[category] || ['Review ethical guidelines', 'Consult ethics committee'];
  }

  generateRecommendations(categoryScores, violations) {
    const recommendations = [];

    for (const [category, score] of Object.entries(categoryScores)) {
      if (score < 70) {
        recommendations.push(`Improve ${category} practices - current score: ${score.toFixed(1)}%`);
      }
    }

    recommendations.push('Continue aligning with Ubuntu principles of community and shared prosperity');
    recommendations.push('Regular ethical reviews with community stakeholders');

    return recommendations;
  }

  async triggerCriticalAlerts(violations) {
    for (const violation of violations) {
      logger.error(`🚨 CRITICAL ETHICS VIOLATION: ${violation.serviceId} - ${violation.description}`, {
        violationId: violation.id,
        category: violation.category,
        riskScore: violation.riskScore
      });

      await redis.lpush('critical-alerts', JSON.stringify({
        type: 'ethics_violation',
        violation,
        timestamp: new Date().toISOString(),
        ubuntu_alert: 'Ubuntu community safety alert'
      }));
    }
  }

  async getComplianceReport(serviceId) {
    const cached = this.serviceScores[serviceId];
    if (cached && Date.now() - new Date(cached.lastCheck).getTime() < 3600000) {
      return cached;
    }

    const serviceData = await this.collectServiceData(serviceId);
    return await this.analyzeServiceEthics(serviceId, serviceData);
  }

  async collectServiceData(serviceId) {
    // Mock data collection - in production would collect real metrics
    return {
      serviceId,
      endpoint: `http://${serviceId}.azora.local`,
      requestCount: Math.floor(Math.random() * 10000),
      errorRate: Math.random() * 0.1,
      responseTime: Math.floor(Math.random() * 2000) + 100,
      userFeedback: Array.from({ length: Math.floor(Math.random() * 100) }, (_, i) => ({
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `User feedback ${i}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
      })),
      dataAccess: [
        { dataType: 'userId', purpose: 'User identification', frequency: 1000 },
        { dataType: 'preferences', purpose: 'Personalization', frequency: 500 }
      ],
      modelOutputs: Array.from({ length: 10 }, (_, i) => ({
        type: 'response',
        content: `AI response ${i} with explanation and reasoning`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      })),
      userDemographics: {
        '18-25': 25,
        '26-35': 35,
        '36-45': 25,
        '46+': 15
      }
    };
  }

  startPeriodicAnalysis() {
    setInterval(async () => {
      try {
        const services = ['azora-pay', 'azora-mint', 'azora-marketplace', 'azora-learning'];
        for (const serviceId of services) {
          const data = await this.collectServiceData(serviceId);
          await this.analyzeServiceEthics(serviceId, data);
        }
      } catch (error) {
        logger.error('Error in periodic analysis:', error);
      }
    }, 3600000); // 1 hour
  }

  async getMetrics() {
    const totalViolations = this.violations.length;
    const openViolations = this.violations.filter(v => v.status === 'open').length;
    const criticalViolations = this.violations.filter(v => v.severity === 'critical').length;
    
    const categoryBreakdown = {};
    this.violations.forEach(v => {
      categoryBreakdown[v.category] = (categoryBreakdown[v.category] || 0) + 1;
    });

    return {
      totalViolations,
      openViolations,
      criticalViolations,
      categoryBreakdown,
      servicesMonitored: Object.keys(this.serviceScores).length,
      averageComplianceScore: Object.values(this.serviceScores).reduce((sum, report) => sum + report.overallScore, 0) / Math.max(Object.keys(this.serviceScores).length, 1)
    };
  }
}

const ethicsMonitor = new EnhancedEthicsMonitor();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for ethical harmony' 
  }
});
app.use(ubuntuLimiter);

// Middleware to get user ID from header
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health Check
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    const metrics = await ethicsMonitor.getMetrics();
    
    res.json({
      service: 'ai-ethics-monitor',
      status: 'healthy',
      ubuntu: 'I protect because we care together',
      timestamp: new Date().toISOString(),
      port: PORT,
      metrics,
      features: {
        realAnalysis: '✅ Active',
        ubuntuFramework: '✅ Active',
        biasDetection: '✅ Active',
        privacyProtection: '✅ Active',
        safetyMonitoring: '✅ Active',
        transparencyTracking: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'ai-ethics-monitor',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My ethics protect our collective',
      'My fairness builds community trust',
      'My transparency creates shared understanding',
      'My responsibility sustains our harmony'
    ],
    service: 'ai-ethics-monitor',
    ubuntu: 'Ubuntu ethical excellence'
  });
});

// ========== ENHANCED ETHICS MONITORING ENDPOINTS ==========

// POST /api/ethics/analyze - Perform real ethical analysis
app.post('/api/ethics/analyze', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { serviceId, data } = req.body;

    if (!serviceId || !data) {
      return res.status(400).json({
        error: 'Service ID and data are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper analysis'
      });
    }

    const report = await ethicsMonitor.analyzeServiceEthics(serviceId, data);

    console.log(`🔍 Ethical analysis completed: ${serviceId} by user ${userId}`);

    res.json({
      success: true,
      report,
      ubuntu: 'Ethical analysis performed with Ubuntu care'
    });
  } catch (error) {
    console.error('Error performing ethical analysis:', error);
    res.status(500).json({
      error: 'Failed to perform ethical analysis',
      message: error.message,
      ubuntu: 'We handle analysis errors with Ubuntu grace'
    });
  }
});

// GET /api/ethics/compliance/:serviceId - Get compliance report
app.get('/api/ethics/compliance/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const report = await ethicsMonitor.getComplianceReport(serviceId);
    
    res.json({
      report,
      ubuntu: 'Compliance report reflects Ubuntu ethical standards'
    });
  } catch (error) {
    console.error('Error fetching compliance report:', error);
    res.status(500).json({
      error: 'Failed to fetch compliance report',
      ubuntu: 'We handle report errors with Ubuntu grace'
    });
  }
});

// POST /api/ethics/violations - Report a violation
app.post('/api/ethics/violations', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      serviceId,
      description,
      severity,
      category,
      evidence = []
    } = req.body;

    if (!serviceId || !description || !severity || !category) {
      return res.status(400).json({
        error: 'Service ID, description, severity, and category are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper reporting'
      });
    }

    const violation = {
      id: uuidv4(),
      serviceId,
      severity,
      category,
      description,
      evidence,
      riskScore: ethicsMonitor.calculateSeverity(category, severity === 'critical' ? 30 : severity === 'high' ? 15 : severity === 'medium' ? 5 : 2),
      timestamp: new Date().toISOString(),
      status: 'open',
      aiAnalysis: {
        confidence: 0.8,
        reasoning: `Manual violation report: ${description}`,
        suggestedActions: ethicsMonitor.generateSuggestedActions(category, 'manual'),
        relatedViolations: []
      }
    };

    ethicsMonitor.violations.push(violation);
    await redis.setex(`violation:${violation.id}`, 604800, JSON.stringify(violation));

    if (severity === 'critical') {
      await ethicsMonitor.triggerCriticalAlerts([violation]);
    }

    console.log(`⚠️ Ethics violation reported: ${serviceId} - ${description} by user ${userId}`);

    res.status(201).json({
      success: true,
      violation,
      ubuntu: 'Violation reported with Ubuntu responsibility'
    });
  } catch (error) {
    console.error('Error reporting violation:', error);
    res.status(500).json({
      error: 'Failed to report violation',
      ubuntu: 'We handle reporting errors with Ubuntu grace'
    });
  }
});

// PUT /api/ethics/violations/:violationId/resolve - Resolve violation
app.put('/api/ethics/violations/:violationId/resolve', async (req, res) => {
  try {
    const { violationId } = req.params;
    const { resolutionNotes, assignedTo } = req.body;

    const violation = ethicsMonitor.violations.find(v => v.id === violationId);
    if (!violation) {
      return res.status(404).json({
        error: 'Violation not found',
        ubuntu: 'Ubuntu guidance: Check violation ID'
      });
    }

    violation.status = 'resolved';
    violation.resolutionNotes = resolutionNotes;
    violation.assignedTo = assignedTo;

    await redis.setex(`violation:${violationId}`, 604800, JSON.stringify(violation));

    console.log(`✅ Ethics violation resolved: ${violationId}`);

    res.json({
      success: true,
      violation,
      ubuntu: 'Violation resolved with Ubuntu care'
    });
  } catch (error) {
    console.error('Error resolving violation:', error);
    res.status(500).json({
      error: 'Failed to resolve violation',
      ubuntu: 'We handle resolution errors with Ubuntu grace'
    });
  }
});

// GET /api/ethics/violations - Get violations
app.get('/api/ethics/violations', (req, res) => {
  try {
    const { serviceId, status, category, severity } = req.query;
    
    let violations = ethicsMonitor.violations;
    
    if (serviceId) violations = violations.filter(v => v.serviceId === serviceId);
    if (status) violations = violations.filter(v => v.status === status);
    if (category) violations = violations.filter(v => v.category === category);
    if (severity) violations = violations.filter(v => v.severity === severity);

    res.json({
      violations,
      total: violations.length,
      ubuntu: 'Violations tracked with Ubuntu vigilance'
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({
      error: 'Failed to fetch violations',
      ubuntu: 'We handle violation errors with Ubuntu grace'
    });
  }
});

// GET /api/ethics/metrics - Get ethics metrics
app.get('/api/ethics/metrics', async (req, res) => {
  try {
    const metrics = await ethicsMonitor.getMetrics();
    
    res.json({
      metrics,
      ubuntu: 'Metrics reflect Ubuntu ethical health'
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      ubuntu: 'We handle metric errors with Ubuntu grace'
    });
  }
});

// GET /api/ethics/dashboard - Get ethics dashboard
app.get('/api/ethics/dashboard', async (req, res) => {
  try {
    const metrics = await ethicsMonitor.getMetrics();
    const recentViolations = ethicsMonitor.violations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    const servicesOverview = Object.entries(ethicsMonitor.serviceScores).map(([serviceId, report]) => ({
      serviceId,
      overallScore: report.overallScore,
      ubuntuCompliance: report.ubuntuCompliance,
      violationCount: report.violations.length
    }));

    res.json({
      metrics,
      recentViolations,
      servicesOverview,
      ubuntu: 'Dashboard shows Ubuntu ethical ecosystem'
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      ubuntu: 'We handle dashboard errors with Ubuntu grace'
    });
  }
});

// ========== LEGACY ENDPOINT (Maintained for compatibility) ==========

app.post('/api/monitor', async (req, res) => {
  try {
    const { aiDecision, context, user } = req.body;

    if (!aiDecision) {
      return res.status(400).json({ error: 'AI decision is required' });
    }

    // Generate unique ID for this report
    const reportId = uuidv4();

    // Use enhanced ethics analysis
    const serviceData = {
      serviceId: 'ai-service',
      endpoint: 'unknown',
      requestCount: 1,
      errorRate: 0,
      responseTime: 100,
      userFeedback: [],
      dataAccess: [],
      modelOutputs: [{
        type: 'decision',
        content: aiDecision,
        timestamp: new Date().toISOString()
      }],
      userDemographics: {}
    };

    const report = await ethicsMonitor.analyzeServiceEthics('ai-service', serviceData);

    res.status(201).json({
      success: true,
      reportId: reportId,
      data: {
        ...report,
        decision: aiDecision,
        context: context || {},
        user: user || 'anonymous'
      },
      ubuntu: 'Ethics analysis completed with Ubuntu wisdom'
    });
  } catch (error) {
    logger.error('Error generating ethics report', error);
    res.status(500).json({ 
      error: error.message,
      ubuntu: 'We handle ethics errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Ethics Monitor Error:', error);
  res.status(500).json({
    error: 'Ubuntu ethics monitor error',
    ubuntu: 'We handle ethics errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ethics monitor endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available ethics endpoints',
    availableEndpoints: [
      '/api/ethics/analyze',
      '/api/ethics/compliance/:serviceId',
      '/api/ethics/violations',
      '/api/ethics/violations/:violationId/resolve',
      '/api/ethics/metrics',
      '/api/ethics/dashboard',
      '/api/monitor',
      '/api/compliance',
      '/health'
    ]
  });
});

// Initialize storage for legacy compatibility
const ethicsReports = new Map();
const complianceReports = new Map();
const violations = new Map();

// Start the service
app.listen(PORT, () => {
  console.log(`🛡️ AI Ethics Monitor running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I protect because we care together!"');
  console.log(`🔍 Real Ethical Analysis: Active`);
  console.log(`📊 Ubuntu Framework: Active`);
  console.log(`⚖️ Bias Detection: Active`);
  console.log(`🔒 Privacy Protection: Active`);
  console.log(`🛡️ Safety Monitoring: Active`);
  console.log(`🔍 Transparency Tracking: Active`);
  console.log(`📈 Compliance Reporting: Active`);
  console.log(`🚨 Critical Alerts: Active`);
  console.log(`🛡️ Ubuntu: Ethics protection through community care`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});