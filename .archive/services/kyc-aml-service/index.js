const express = require('express');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class KYCAMLService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3043;
    this.verifications = new Map();
    this.watchlist = new Set(['sanctioned-entity-1', 'sanctioned-entity-2']);
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
      res.json({ status: 'healthy', service: 'kyc-aml-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/kyc/verify', this.verifyKYC.bind(this));
    this.app.get('/api/kyc/:userId', this.getKYCStatus.bind(this));
    this.app.post('/api/aml/check', this.checkAML.bind(this));
    this.app.post('/api/aml/report', this.reportSuspicious.bind(this));
    this.app.get('/api/compliance/:userId', this.getComplianceStatus.bind(this));
  }

  async verifyKYC(req, res) {
    try {
      const { userId, firstName, lastName, dateOfBirth, idNumber, address, country } = req.body;

      if (!userId || !firstName || !lastName || !idNumber) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const verificationId = `KYC-${crypto.randomUUID()}`;
      const riskScore = this.calculateRiskScore({ country, idNumber });
      const status = riskScore < 50 ? 'approved' : riskScore < 75 ? 'review' : 'rejected';

      const verification = {
        verificationId,
        userId,
        firstName,
        lastName,
        dateOfBirth,
        idNumber: this.maskIdNumber(idNumber),
        address,
        country,
        riskScore,
        status,
        verifiedAt: new Date(),
        checks: {
          identity: true,
          address: true,
          sanctions: !this.watchlist.has(userId),
          pep: false
        }
      };

      this.verifications.set(userId, verification);

      res.json({ verification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getKYCStatus(req, res) {
    const verification = this.verifications.get(req.params.userId);
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    res.json({ verification });
  }

  async checkAML(req, res) {
    try {
      const { userId, transactionAmount, transactionType, counterparty } = req.body;

      if (!userId || !transactionAmount) {
        return res.status(400).json({ error: 'userId and transactionAmount required' });
      }

      const flags = [];
      let riskLevel = 'low';

      if (transactionAmount > 10000) {
        flags.push('Large transaction');
        riskLevel = 'medium';
      }

      if (this.watchlist.has(counterparty)) {
        flags.push('Sanctioned counterparty');
        riskLevel = 'high';
      }

      const checkId = `AML-${crypto.randomUUID()}`;
      const amlCheck = {
        checkId,
        userId,
        transactionAmount,
        transactionType,
        counterparty,
        riskLevel,
        flags,
        passed: riskLevel !== 'high',
        checkedAt: new Date()
      };

      res.json({ amlCheck });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async reportSuspicious(req, res) {
    try {
      const { userId, reason, details, transactionIds } = req.body;

      if (!userId || !reason) {
        return res.status(400).json({ error: 'userId and reason required' });
      }

      const reportId = `SAR-${crypto.randomUUID()}`;
      const report = {
        reportId,
        userId,
        reason,
        details,
        transactionIds: transactionIds || [],
        status: 'submitted',
        submittedAt: new Date()
      };

      res.json({ report, message: 'Suspicious activity report submitted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getComplianceStatus(req, res) {
    const verification = this.verifications.get(req.params.userId);
    
    res.json({
      userId: req.params.userId,
      kycStatus: verification ? verification.status : 'not_verified',
      kycVerifiedAt: verification ? verification.verifiedAt : null,
      riskScore: verification ? verification.riskScore : null,
      compliant: verification && verification.status === 'approved'
    });
  }

  calculateRiskScore(data) {
    let score = 0;
    
    const highRiskCountries = ['XX', 'YY'];
    if (highRiskCountries.includes(data.country)) {
      score += 30;
    }

    score += Math.floor(Math.random() * 40);
    
    return Math.min(100, score);
  }

  maskIdNumber(idNumber) {
    if (!idNumber || idNumber.length < 4) return '****';
    return `****${idNumber.slice(-4)}`;
  }

  start() {
    this.app.use(require('./routes'));

app.listen(this.port, () => {
      console.log(`KYC/AML Service running on port ${this.port}`);
    });
  }
}

const service = new KYCAMLService();
if (require.main === module) {
  service.start();
}

module.exports = service;
