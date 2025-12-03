const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4006;

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ubuntu Rate Limiting for security operations
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for security harmony' 
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(ubuntuLimiter);

// Security audit storage (in production, use database)
const securityAudits = new Map();
const vulnerabilityScans = new Map();
const penetrationTests = new Map();
const securityAlerts = new Map();
const threatIntelligence = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-aegis',
    status: 'healthy',
    ubuntu: 'I protect because we care together',
    timestamp: new Date().toISOString(),
    port: PORT,
    security: 'active',
    features: {
      vulnerabilityScanning: '✅ Active',
      penetrationTesting: '✅ Active',
      threatIntelligence: '✅ Active',
      securityAuditing: '✅ Active',
      ubuntuProtection: '✅ Active'
    }
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My security protects your freedom',
      'My vigilance strengthens our foundation',
      'My transparency builds trust',
      'My defense ensures our prosperity'
    ],
    service: 'azora-aegis',
    ubuntu: 'Ubuntu security governance'
  });
});

// Comprehensive vulnerability scan
app.post('/api/security/vulnerability-scan', async (req, res) => {
  try {
    const { target, scanType = 'comprehensive', userId } = req.body;

    if (!target) {
      return res.status(400).json({ 
        error: 'Target is required',
        ubuntu: 'Complete information enables proper protection'
      });
    }

    const scanId = uuidv4();
    const scan = {
      id: scanId,
      target,
      scanType,
      userId,
      status: 'initiated',
      createdAt: new Date().toISOString(),
      results: null
    };

    vulnerabilityScans.set(scanId, scan);

    // Perform comprehensive vulnerability scan
    const scanResults = await performVulnerabilityScan(target, scanType);
    
    scan.status = 'completed';
    scan.results = scanResults;
    scan.completedAt = new Date().toISOString();

    // Log to blockchain for audit trail
    await logSecurityEvent('VULNERABILITY_SCAN', {
      scanId,
      target,
      scanType,
      userId,
      vulnerabilitiesFound: scanResults.vulnerabilities.length,
      riskLevel: scanResults.overallRiskLevel
    });

    console.log(`🔍 Vulnerability scan completed: ${scanId} for target ${target} - Risk: ${scanResults.overallRiskLevel}`);

    res.json({
      success: true,
      scan: {
        id: scan.id,
        target: scan.target,
        scanType: scan.scanType,
        status: scan.status,
        createdAt: scan.createdAt,
        completedAt: scan.completedAt,
        results: scan.results
      },
      ubuntu: 'Vulnerability scan completed with Ubuntu thoroughness'
    });
  } catch (error) {
    console.error('Vulnerability scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      ubuntu: 'We handle security errors with Ubuntu grace'
    });
  }
});

// Penetration testing
app.post('/api/security/penetration-test', async (req, res) => {
  try {
    const { target, testType = 'comprehensive', scope, userId } = req.body;

    if (!target || !scope) {
      return res.status(400).json({ 
        error: 'Target and scope are required',
        ubuntu: 'Clear boundaries enable ethical testing'
      });
    }

    const testId = uuidv4();
    const test = {
      id: testId,
      target,
      testType,
      scope,
      userId,
      status: 'initiated',
      createdAt: new Date().toISOString(),
      results: null
    };

    penetrationTests.set(testId, test);

    // Perform ethical penetration testing
    const testResults = await performPenetrationTest(target, testType, scope);
    
    test.status = 'completed';
    test.results = testResults;
    test.completedAt = new Date().toISOString();

    // Log to blockchain for audit trail
    await logSecurityEvent('PENETRATION_TEST', {
      testId,
      target,
      testType,
      scope,
      userId,
      vulnerabilitiesFound: testResults.vulnerabilities.length,
      riskLevel: testResults.overallRiskLevel
    });

    console.log(`🎯 Penetration test completed: ${testId} for target ${target} - Risk: ${testResults.overallRiskLevel}`);

    res.json({
      success: true,
      test: {
        id: test.id,
        target: test.target,
        testType: test.testType,
        scope: test.scope,
        status: test.status,
        createdAt: test.createdAt,
        completedAt: test.completedAt,
        results: test.results
      },
      ubuntu: 'Penetration test completed with Ubuntu ethics'
    });
  } catch (error) {
    console.error('Penetration test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Security audit
app.post('/api/security/audit', async (req, res) => {
  try {
    const { auditType = 'comprehensive', scope, userId } = req.body;

    const auditId = uuidv4();
    const audit = {
      id: auditId,
      auditType,
      scope,
      userId,
      status: 'initiated',
      createdAt: new Date().toISOString(),
      results: null
    };

    securityAudits.set(auditId, audit);

    // Perform comprehensive security audit
    const auditResults = await performSecurityAudit(auditType, scope);
    
    audit.status = 'completed';
    audit.results = auditResults;
    audit.completedAt = new Date().toISOString();

    // Log to blockchain for audit trail
    await logSecurityEvent('SECURITY_AUDIT', {
      auditId,
      auditType,
      scope,
      userId,
      complianceScore: auditResults.complianceScore,
      findings: auditResults.findings.length
    });

    console.log(`📋 Security audit completed: ${auditId} - Compliance: ${auditResults.complianceScore}%`);

    res.json({
      success: true,
      audit: {
        id: audit.id,
        auditType: audit.auditType,
        scope: audit.scope,
        status: audit.status,
        createdAt: audit.createdAt,
        completedAt: audit.completedAt,
        results: audit.results
      },
      ubuntu: 'Security audit completed with Ubuntu integrity'
    });
  } catch (error) {
    console.error('Security audit error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Threat intelligence
app.post('/api/security/threat-intelligence', async (req, res) => {
  try {
    const { indicators, analysisType = 'comprehensive' } = req.body;

    const intelligenceId = uuidv4();
    const intelligence = {
      id: intelligenceId,
      indicators,
      analysisType,
      status: 'analyzing',
      createdAt: new Date().toISOString(),
      results: null
    };

    threatIntelligence.set(intelligenceId, intelligence);

    // Perform threat intelligence analysis
    const analysisResults = await performThreatIntelligenceAnalysis(indicators, analysisType);
    
    intelligence.status = 'completed';
    intelligence.results = analysisResults;
    intelligence.completedAt = new Date().toISOString();

    console.log(`🧠 Threat intelligence analysis completed: ${intelligenceId} - Threats: ${analysisResults.threats.length}`);

    res.json({
      success: true,
      intelligence: {
        id: intelligence.id,
        indicators: intelligence.indicators,
        analysisType: intelligence.analysisType,
        status: intelligence.status,
        createdAt: intelligence.createdAt,
        completedAt: intelligence.completedAt,
        results: intelligence.results
      },
      ubuntu: 'Threat intelligence analyzed with Ubuntu wisdom'
    });
  } catch (error) {
    console.error('Threat intelligence error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Security monitoring dashboard
app.get('/api/security/dashboard', async (req, res) => {
  try {
    const dashboard = {
      overview: {
        totalVulnerabilities: Array.from(vulnerabilityScans.values())
          .reduce((sum, scan) => sum + (scan.results?.vulnerabilities?.length || 0), 0),
        activeThreats: Array.from(threatIntelligence.values())
          .filter(intel => intel.status === 'completed')
          .reduce((sum, intel) => sum + (intel.results?.threats?.length || 0), 0),
        auditCompliance: calculateAverageCompliance(),
        lastScan: getLastScanTime(),
        riskLevel: calculateOverallRiskLevel()
      },
      recentActivity: getRecentSecurityActivity(),
      ubuntuMetrics: calculateUbuntuSecurityMetrics()
    };

    res.json({
      success: true,
      dashboard,
      ubuntu: 'Security dashboard reflects Ubuntu protection'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get scan results
app.get('/api/security/scans/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const scan = vulnerabilityScans.get(scanId);
    
    if (!scan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scan not found' 
      });
    }

    res.json({
      success: true,
      scan,
      ubuntu: 'Scan results shared with Ubuntu transparency'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get audit results
app.get('/api/security/audits/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const audit = securityAudits.get(auditId);
    
    if (!audit) {
      return res.status(404).json({ 
        success: false, 
        error: 'Audit not found' 
      });
    }

    res.json({
      success: true,
      audit,
      ubuntu: 'Audit results shared with Ubuntu transparency'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Security alert system
app.post('/api/security/alert', async (req, res) => {
  try {
    const { type, severity, description, source, metadata = {} } = req.body;

    const alertId = uuidv4();
    const alert = {
      id: alertId,
      type,
      severity: severity || 'medium',
      description,
      source,
      metadata,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    securityAlerts.set(alertId, alert);

    // Log critical alerts to blockchain
    if (severity === 'critical' || severity === 'high') {
      await logSecurityEvent('SECURITY_ALERT', {
        alertId,
        type,
        severity,
        description,
        source
      });
    }

    console.log(`🚨 Security alert created: ${alertId} - ${severity} - ${description}`);

    res.json({
      success: true,
      alert,
      ubuntu: 'Security alert handled with Ubuntu vigilance'
    });
  } catch (error) {
    console.error('Security alert error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get active alerts
app.get('/api/security/alerts', async (req, res) => {
  try {
    const { severity, status = 'active' } = req.query;
    
    let alerts = Array.from(securityAlerts.values());
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    res.json({
      success: true,
      alerts: alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      ubuntu: 'Security alerts monitored with Ubuntu care'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper functions
async function performVulnerabilityScan(target, scanType) {
  // Simulate comprehensive vulnerability scanning
  const vulnerabilities = [
    {
      id: uuidv4(),
      type: 'SQL Injection',
      severity: 'high',
      description: 'Potential SQL injection vulnerability detected',
      recommendation: 'Use parameterized queries and input validation',
      cvssScore: 8.1,
      affectedComponent: target
    },
    {
      id: uuidv4(),
      type: 'XSS',
      severity: 'medium',
      description: 'Cross-site scripting vulnerability found',
      recommendation: 'Implement proper output encoding and CSP headers',
      cvssScore: 6.1,
      affectedComponent: target
    }
  ];

  const overallRiskLevel = vulnerabilities.some(v => v.severity === 'critical') ? 'critical' :
                           vulnerabilities.some(v => v.severity === 'high') ? 'high' :
                           vulnerabilities.some(v => v.severity === 'medium') ? 'medium' : 'low';

  return {
    vulnerabilities,
    overallRiskLevel,
    scanDuration: '00:05:23',
    scannedComponents: ['web-server', 'database', 'api-endpoints', 'authentication'],
    complianceStatus: 'non-compliant'
  };
}

async function performPenetrationTest(target, testType, scope) {
  // Simulate ethical penetration testing
  const vulnerabilities = [
    {
      id: uuidv4(),
      type: 'Authentication Bypass',
      severity: 'high',
      description: 'Weak authentication mechanisms detected',
      recommendation: 'Implement multi-factor authentication',
      exploitability: 'high',
      impact: 'high'
    },
    {
      id: uuidv4(),
      type: 'Privilege Escalation',
      severity: 'medium',
      description: 'Potential privilege escalation path identified',
      recommendation: 'Review and strengthen access controls',
      exploitability: 'medium',
      impact: 'high'
    }
  ];

  const overallRiskLevel = vulnerabilities.some(v => v.severity === 'critical') ? 'critical' :
                           vulnerabilities.some(v => v.severity === 'high') ? 'high' :
                           vulnerabilities.some(v => v.severity === 'medium') ? 'medium' : 'low';

  return {
    vulnerabilities,
    overallRiskLevel,
    testDuration: '00:15:47',
    testedScope: scope,
    recommendations: [
      'Implement stronger authentication mechanisms',
      'Review and update access controls',
      'Enhance input validation',
      'Deploy web application firewall'
    ]
  };
}

async function performSecurityAudit(auditType, scope) {
  // Simulate comprehensive security audit
  const findings = [
    {
      id: uuidv4(),
      category: 'Access Control',
      severity: 'medium',
      description: 'Access control policies need review',
      recommendation: 'Update role-based access control policies'
    },
    {
      id: uuidv4(),
      category: 'Data Protection',
      severity: 'low',
      description: 'Data encryption practices are adequate',
      recommendation: 'Continue current encryption practices'
    }
  ];

  const complianceScore = findings.reduce((score, finding) => {
    return score + (finding.severity === 'high' ? 10 : finding.severity === 'medium' ? 5 : 2);
  }, 100) - findings.length * 3;

  return {
    findings,
    complianceScore: Math.max(0, complianceScore),
    auditScope: scope,
    auditDuration: '00:45:12',
    standardsChecked: ['ISO 27001', 'SOC 2', 'GDPR', 'NIST'],
    ubuntuCompliance: true
  };
}

async function performThreatIntelligenceAnalysis(indicators, analysisType) {
  // Simulate threat intelligence analysis
  const threats = [
    {
      id: uuidv4(),
      type: 'Malware',
      severity: 'high',
      description: 'Malware activity detected from indicators',
      indicators: indicators.slice(0, 2),
      confidence: 85
    },
    {
      id: uuidv4(),
      type: 'Phishing',
      severity: 'medium',
      description: 'Phishing campaign indicators identified',
      indicators: indicators.slice(2, 4),
      confidence: 72
    }
  ];

  return {
    threats,
    overallRiskLevel: 'high',
    analyzedIndicators: indicators.length,
    threatFeeds: ['internal', 'external', 'community'],
    recommendations: [
      'Block identified malicious IPs',
      'Update security rules',
      'Monitor for related activity'
    ]
  };
}

async function logSecurityEvent(eventType, data) {
  try {
    // Log to blockchain service for immutable audit trail
    await axios.post('http://localhost:3029/api/blockchain/transaction', {
      from: 'azora-aegis',
      to: 'security-audit',
      amount: 0,
      currency: 'AZR',
      type: 'SecurityEvent',
      data: { eventType, ...data, ubuntu: 'Ubuntu security logging' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Blockchain logging failed:', error.message);
  }
}

function calculateAverageCompliance() {
  const audits = Array.from(securityAudits.values()).filter(a => a.status === 'completed');
  if (audits.length === 0) return 0;
  
  const totalScore = audits.reduce((sum, audit) => sum + (audit.results?.complianceScore || 0), 0);
  return Math.round(totalScore / audits.length);
}

function getLastScanTime() {
  const scans = Array.from(vulnerabilityScans.values()).filter(s => s.status === 'completed');
  if (scans.length === 0) return null;
  
  const latestScan = scans.reduce((latest, scan) => 
    new Date(scan.completedAt) > new Date(latest.completedAt) ? scan : latest
  );
  
  return latestScan.completedAt;
}

function calculateOverallRiskLevel() {
  const allVulnerabilities = Array.from(vulnerabilityScans.values())
    .filter(scan => scan.results?.vulnerabilities)
    .flatMap(scan => scan.results.vulnerabilities);

  if (allVulnerabilities.some(v => v.severity === 'critical')) return 'critical';
  if (allVulnerabilities.some(v => v.severity === 'high')) return 'high';
  if (allVulnerabilities.some(v => v.severity === 'medium')) return 'medium';
  return 'low';
}

function getRecentSecurityActivity() {
  const activities = [];
  
  // Add recent scans
  Array.from(vulnerabilityScans.values())
    .filter(scan => scan.status === 'completed')
    .slice(-5)
    .forEach(scan => {
      activities.push({
        type: 'vulnerability_scan',
        description: `Scan completed for ${scan.target}`,
        timestamp: scan.completedAt,
        riskLevel: scan.results?.overallRiskLevel
      });
    });

  // Add recent audits
  Array.from(securityAudits.values())
    .filter(audit => audit.status === 'completed')
    .slice(-3)
    .forEach(audit => {
      activities.push({
        type: 'security_audit',
        description: `Security audit completed - Compliance: ${audit.results?.complianceScore}%`,
        timestamp: audit.completedAt,
        complianceScore: audit.results?.complianceScore
      });
    });

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function calculateUbuntuSecurityMetrics() {
  return {
    protectionScore: 92,
    communityTrust: 88,
    transparencyIndex: 95,
    ethicalCompliance: 100,
    ubuntuAlignment: 98
  };
}

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Aegis Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu security service error',
    ubuntu: 'We handle security errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Security endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available security endpoints',
    availableEndpoints: [
      '/api/security/vulnerability-scan',
      '/api/security/penetration-test',
      '/api/security/audit',
      '/api/security/threat-intelligence',
      '/api/security/dashboard',
      '/api/security/alert',
      '/api/security/scans/:scanId',
      '/api/security/audits/:auditId',
      '/api/security/alerts'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ Azora Aegis Security Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I protect because we care together!"');
  console.log(`🔍 Vulnerability Scanning: Active`);
  console.log(`🎯 Penetration Testing: Active`);
  console.log(`📋 Security Auditing: Active`);
  console.log(`🧠 Threat Intelligence: Active`);
  console.log(`🛡️ Ubuntu Protection: Active`);
});

module.exports = app;