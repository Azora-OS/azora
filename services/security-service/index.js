const express = require('express');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class SecurityService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3044;
    this.threats = new Map();
    this.sessions = new Map();
    this.blocklist = new Set();
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
      res.json({ status: 'healthy', service: 'security-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/security/scan', this.scanThreat.bind(this));
    this.app.post('/api/security/validate-session', this.validateSession.bind(this));
    this.app.post('/api/security/block', this.blockEntity.bind(this));
    this.app.post('/api/security/unblock', this.unblockEntity.bind(this));
    this.app.get('/api/security/threats', this.getThreats.bind(this));
    this.app.post('/api/security/encrypt', this.encryptData.bind(this));
    this.app.post('/api/security/decrypt', this.decryptData.bind(this));
  }

  async scanThreat(req, res) {
    try {
      const { userId, ipAddress, userAgent, action } = req.body;

      if (!userId || !ipAddress) {
        return res.status(400).json({ error: 'userId and ipAddress required' });
      }

      const threatId = `THREAT-${crypto.randomUUID()}`;
      const riskScore = this.calculateThreatScore({ ipAddress, userAgent, action });
      const threatLevel = riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high';

      const threat = {
        threatId,
        userId,
        ipAddress,
        userAgent,
        action,
        riskScore,
        threatLevel,
        blocked: threatLevel === 'high',
        scannedAt: new Date()
      };

      if (threat.blocked) {
        this.blocklist.add(ipAddress);
      }

      this.threats.set(threatId, threat);

      res.json({ threat });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async validateSession(req, res) {
    try {
      const { sessionId, userId, ipAddress } = req.body;

      if (!sessionId || !userId) {
        return res.status(400).json({ error: 'sessionId and userId required' });
      }

      const session = this.sessions.get(sessionId);

      if (!session) {
        return res.json({ valid: false, reason: 'Session not found' });
      }

      if (session.userId !== userId) {
        return res.json({ valid: false, reason: 'User mismatch' });
      }

      if (new Date() > session.expiresAt) {
        this.sessions.delete(sessionId);
        return res.json({ valid: false, reason: 'Session expired' });
      }

      if (this.blocklist.has(ipAddress)) {
        return res.json({ valid: false, reason: 'IP blocked' });
      }

      res.json({ valid: true, session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  blockEntity(req, res) {
    const { entity, reason } = req.body;

    if (!entity) {
      return res.status(400).json({ error: 'entity required' });
    }

    this.blocklist.add(entity);

    res.json({
      message: 'Entity blocked',
      entity,
      reason,
      blockedAt: new Date()
    });
  }

  unblockEntity(req, res) {
    const { entity } = req.body;

    if (!entity) {
      return res.status(400).json({ error: 'entity required' });
    }

    this.blocklist.delete(entity);

    res.json({
      message: 'Entity unblocked',
      entity,
      unblockedAt: new Date()
    });
  }

  getThreats(req, res) {
    const { level, limit = 100 } = req.query;
    
    let threats = Array.from(this.threats.values());

    if (level) {
      threats = threats.filter(t => t.threatLevel === level);
    }

    threats = threats.slice(0, parseInt(limit));

    res.json({ threats, total: threats.length });
  }

  async encryptData(req, res) {
    try {
      const { data, key } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'data required' });
      }

      const encryptionKey = key || crypto.randomBytes(32).toString('hex');
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32)), iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      res.json({
        encrypted,
        iv: iv.toString('hex'),
        key: encryptionKey
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async decryptData(req, res) {
    try {
      const { encrypted, key, iv } = req.body;

      if (!encrypted || !key || !iv) {
        return res.status(400).json({ error: 'encrypted, key, and iv required' });
      }

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key.slice(0, 32)),
        Buffer.from(iv, 'hex')
      );
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      res.json({ decrypted: JSON.parse(decrypted) });
    } catch (error) {
      res.status(500).json({ error: 'Decryption failed' });
    }
  }

  calculateThreatScore(data) {
    let score = 0;

    const suspiciousIPs = ['192.168.1.1', '10.0.0.1'];
    if (suspiciousIPs.includes(data.ipAddress)) {
      score += 40;
    }

    if (data.action && data.action.includes('admin')) {
      score += 20;
    }

    score += Math.floor(Math.random() * 30);

    return Math.min(100, score);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Security Service running on port ${this.port}`);
    });
  }
}

const service = new SecurityService();
if (require.main === module) {
  service.start();
}

module.exports = service;
