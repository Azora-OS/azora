const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class ShieldService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3058;
    this.threats = new Map();
    this.blockedIPs = new Set();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'shield', threats: this.threats.size, blocked: this.blockedIPs.size });
    });

    this.app.post('/api/threats/detect', this.detectThreat.bind(this));
    this.app.post('/api/threats/block', this.blockThreat.bind(this));
    this.app.get('/api/threats', this.getThreats.bind(this));
    this.app.post('/api/ip/block', this.blockIP.bind(this));
    this.app.get('/api/ip/check/:ip', this.checkIP.bind(this));
  }

  detectThreat(req, res) {
    const { type, source, severity, details } = req.body;
    const threatId = `threat_${Date.now()}`;
    
    const threat = {
      id: threatId,
      type,
      source,
      severity: severity || 'medium',
      details,
      detected: new Date(),
      status: 'active'
    };

    this.threats.set(threatId, threat);
    
    if (severity === 'critical' || severity === 'high') {
      this.blockIP.call(this, { body: { ip: source, reason: `Threat detected: ${type}` } }, res);
    } else {
      res.json({ success: true, threat });
    }
  }

  blockThreat(req, res) {
    const { threatId } = req.body;
    const threat = this.threats.get(threatId);
    
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    
    threat.status = 'blocked';
    threat.blockedAt = new Date();
    this.blockedIPs.add(threat.source);
    
    res.json({ success: true, threat });
  }

  getThreats(req, res) {
    const { status, severity } = req.query;
    let threats = Array.from(this.threats.values());
    
    if (status) threats = threats.filter(t => t.status === status);
    if (severity) threats = threats.filter(t => t.severity === severity);
    
    res.json({ threats, count: threats.length });
  }

  blockIP(req, res) {
    const { ip, reason } = req.body;
    this.blockedIPs.add(ip);
    res.json({ success: true, ip, reason, blocked: true });
  }

  checkIP(req, res) {
    const { ip } = req.params;
    const blocked = this.blockedIPs.has(ip);
    res.json({ ip, blocked, status: blocked ? 'blocked' : 'allowed' });
  }

  listen() {
    this.app.listen(this.port, () => console.log(`Shield Service on port ${this.port}`));
  }
}

const service = new ShieldService();
if (require.main === module) service.listen();
module.exports = service.app;
