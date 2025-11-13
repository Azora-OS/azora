#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class AzoraAegis {
  constructor() {
    this.threats = [];
    this.vulnerabilities = new Map();
    this.auditLogs = [];
    this.complianceRules = new Map();
    this.initSecurity();
  }

  initSecurity() {
    this.complianceRules.set('constitutional', {
      name: 'Constitutional AI Compliance',
      rules: ['truth-as-currency', 'ubuntu-principles', 'no-mock-protocols'],
      status: 'active'
    });
  }

  detectThreat(request) {
    const threat = {
      id: `threat_${Date.now()}`,
      type: this.analyzeThreatType(request),
      severity: this.calculateSeverity(request),
      source: request.ip || 'unknown',
      timestamp: new Date(),
      blocked: false
    };

    if (threat.severity === 'high') {
      threat.blocked = true;
      this.blockThreat(threat);
    }

    this.threats.push(threat);
    return threat;
  }

  analyzeThreatType(request) {
    if (request.body && JSON.stringify(request.body).includes('script')) {
      return 'xss-attempt';
    }
    if (request.url.includes('..')) {
      return 'path-traversal';
    }
    if (request.headers['user-agent']?.includes('bot')) {
      return 'suspicious-bot';
    }
    return 'unknown';
  }

  calculateSeverity(request) {
    const suspiciousPatterns = ['script', 'eval', 'exec', 'system'];
    const content = JSON.stringify(request.body || '') + request.url;
    
    for (const pattern of suspiciousPatterns) {
      if (content.toLowerCase().includes(pattern)) {
        return 'high';
      }
    }
    return 'low';
  }

  blockThreat(threat) {
    this.auditLogs.push({
      id: `audit_${Date.now()}`,
      action: 'threat_blocked',
      threatId: threat.id,
      timestamp: new Date(),
      details: `Blocked ${threat.type} from ${threat.source}`
    });
  }

  checkCompliance(service, action) {
    const compliance = {
      id: `compliance_${Date.now()}`,
      service,
      action,
      status: 'compliant',
      checkedAt: new Date(),
      rules: []
    };

    // Check constitutional compliance
    if (action.includes('mock') || action.includes('fake')) {
      compliance.status = 'violation';
      compliance.rules.push('no-mock-protocols');
    }

    return compliance;
  }

  scanVulnerabilities(target) {
    const scan = {
      id: `scan_${Date.now()}`,
      target,
      startedAt: new Date(),
      vulnerabilities: [],
      status: 'completed'
    };

    // Simulate vulnerability scanning
    if (Math.random() > 0.8) {
      scan.vulnerabilities.push({
        type: 'outdated-dependency',
        severity: 'medium',
        description: 'Dependency version should be updated'
      });
    }

    this.vulnerabilities.set(scan.id, scan);
    return scan;
  }
}

const aegis = new AzoraAegis();

// Security middleware
app.use((req, res, next) => {
  const threat = aegis.detectThreat(req);
  if (threat.blocked) {
    return res.status(403).json({ 
      success: false, 
      error: 'Request blocked by security system',
      threatId: threat.id 
    });
  }
  next();
});

app.get('/api/threats', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const threats = aegis.threats.slice(-limit);
  res.json({ success: true, data: threats });
});

app.post('/api/compliance/check', (req, res) => {
  try {
    const { service, action } = req.body;
    const compliance = aegis.checkCompliance(service, action);
    res.json({ success: true, data: compliance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/scan', (req, res) => {
  try {
    const { target } = req.body;
    const scan = aegis.scanVulnerabilities(target);
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = aegis.auditLogs.slice(-limit);
  res.json({ success: true, data: logs });
});

app.get('/api/security-status', (req, res) => {
  res.json({
    success: true,
    data: {
      threatsDetected: aegis.threats.length,
      threatsBlocked: aegis.threats.filter(t => t.blocked).length,
      vulnerabilities: aegis.vulnerabilities.size,
      complianceStatus: 'active'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Azora Aegis Security',
    status: 'healthy',
    timestamp: new Date(),
    stats: { threats: aegis.threats.length, scans: aegis.vulnerabilities.size },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4018;
app.listen(PORT, () => {
  console.log(`🛡️ Azora Aegis Security running on port ${PORT}`);
});

module.exports = app;