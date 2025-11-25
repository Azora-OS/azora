const crypto = require('crypto');

class KYCComplianceSystem {
  constructor() {
    this.kycRecords = new Map();
    this.verificationLevels = {
      BASIC: { limit: 1000, requirements: ['email', 'phone'] },
      STANDARD: { limit: 10000, requirements: ['email', 'phone', 'identity_document'] },
      PREMIUM: { limit: 50000, requirements: ['email', 'phone', 'identity_document', 'address_proof'] },
      INSTITUTIONAL: { limit: 1000000, requirements: ['business_registration', 'tax_id', 'authorized_signatory'] }
    };
    this.riskScores = new Map();
    this.transactionLimits = new Map();
  }

  // Initialize KYC for user
  initializeKYC(userId, userType = 'individual') {
    if (this.kycRecords.has(userId)) {
      return this.kycRecords.get(userId);
    }

    const kycRecord = {
      userId,
      userType, // 'individual' or 'business'
      level: 'UNVERIFIED',
      status: 'pending',
      documents: new Map(),
      verificationHistory: [],
      riskScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      limits: {
        daily: 0,
        monthly: 0,
        annual: 0
      },
      flags: []
    };

    this.kycRecords.set(userId, kycRecord);
    return kycRecord;
  }

  // Submit KYC document
  submitDocument(userId, documentType, documentData) {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { success: false, error: 'KYC record not found' };
    }

    const document = {
      type: documentType,
      data: documentData,
      status: 'pending',
      submittedAt: new Date(),
      verifiedAt: null,
      rejectedAt: null,
      rejectionReason: null
    };

    kycRecord.documents.set(documentType, document);
    kycRecord.updatedAt = new Date();

    // Auto-verify basic documents (in production, this would be manual/AI review)
    if (['email', 'phone'].includes(documentType)) {
      document.status = 'verified';
      document.verifiedAt = new Date();
    }

    this.updateVerificationLevel(userId);

    return {
      success: true,
      document: {
        type: documentType,
        status: document.status,
        submittedAt: document.submittedAt
      }
    };
  }

  // Verify document (admin function)
  verifyDocument(userId, documentType, approved = true, reason = '') {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { success: false, error: 'KYC record not found' };
    }

    const document = kycRecord.documents.get(documentType);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (approved) {
      document.status = 'verified';
      document.verifiedAt = new Date();
    } else {
      document.status = 'rejected';
      document.rejectedAt = new Date();
      document.rejectionReason = reason;
    }

    kycRecord.verificationHistory.push({
      action: approved ? 'document_approved' : 'document_rejected',
      documentType,
      reason,
      timestamp: new Date()
    });

    kycRecord.updatedAt = new Date();
    this.updateVerificationLevel(userId);

    return {
      success: true,
      document: {
        type: documentType,
        status: document.status,
        reason
      }
    };
  }

  // Update verification level based on submitted documents
  updateVerificationLevel(userId) {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) return;

    const verifiedDocs = Array.from(kycRecord.documents.values())
      .filter(doc => doc.status === 'verified')
      .map(doc => doc.type);

    let newLevel = 'UNVERIFIED';
    
    // Check each level requirements
    for (const [level, config] of Object.entries(this.verificationLevels)) {
      const hasAllRequirements = config.requirements.every(req => 
        verifiedDocs.includes(req)
      );
      
      if (hasAllRequirements) {
        newLevel = level;
      }
    }

    if (newLevel !== kycRecord.level) {
      kycRecord.level = newLevel;
      kycRecord.limits = this.calculateLimits(newLevel);
      kycRecord.verificationHistory.push({
        action: 'level_updated',
        oldLevel: kycRecord.level,
        newLevel,
        timestamp: new Date()
      });
    }

    kycRecord.status = newLevel === 'UNVERIFIED' ? 'pending' : 'verified';
  }

  // Calculate transaction limits based on verification level
  calculateLimits(level) {
    const baseLimit = this.verificationLevels[level]?.limit || 0;
    
    return {
      daily: baseLimit,
      monthly: baseLimit * 30,
      annual: baseLimit * 365,
      perTransaction: baseLimit * 0.1
    };
  }

  // Check if transaction is allowed
  checkTransactionAllowed(userId, amount, transactionType = 'payment') {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { 
        allowed: false, 
        error: 'KYC verification required',
        requiredLevel: 'BASIC'
      };
    }

    // Check verification level
    if (kycRecord.level === 'UNVERIFIED') {
      return {
        allowed: false,
        error: 'Account verification required',
        requiredLevel: 'BASIC',
        currentLevel: kycRecord.level
      };
    }

    // Check transaction limits
    const limits = kycRecord.limits;
    if (amount > limits.perTransaction) {
      return {
        allowed: false,
        error: 'Transaction exceeds per-transaction limit',
        limit: limits.perTransaction,
        amount
      };
    }

    // Check daily limits (simplified - in production, track actual daily usage)
    if (amount > limits.daily) {
      return {
        allowed: false,
        error: 'Transaction exceeds daily limit',
        limit: limits.daily,
        amount
      };
    }

    // Check risk score
    const riskScore = this.calculateRiskScore(userId, amount, transactionType);
    if (riskScore > 80) {
      return {
        allowed: false,
        error: 'Transaction flagged for manual review',
        riskScore
      };
    }

    return {
      allowed: true,
      level: kycRecord.level,
      limits,
      riskScore
    };
  }

  // Calculate risk score for transaction
  calculateRiskScore(userId, amount, transactionType) {
    let riskScore = 0;
    const kycRecord = this.kycRecords.get(userId);
    
    if (!kycRecord) return 100; // Maximum risk if no KYC

    // Base risk by verification level
    const levelRisk = {
      'UNVERIFIED': 100,
      'BASIC': 30,
      'STANDARD': 15,
      'PREMIUM': 5,
      'INSTITUTIONAL': 2
    };
    riskScore += levelRisk[kycRecord.level] || 100;

    // Amount-based risk
    const limits = kycRecord.limits;
    const amountRatio = amount / limits.perTransaction;
    if (amountRatio > 0.8) riskScore += 20;
    if (amountRatio > 0.5) riskScore += 10;

    // Transaction type risk
    const typeRisk = {
      'payment': 0,
      'withdrawal': 10,
      'international': 15,
      'crypto': 20
    };
    riskScore += typeRisk[transactionType] || 0;

    // Account age risk (newer accounts are riskier)
    const accountAge = Date.now() - kycRecord.createdAt.getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) riskScore += 15;
    if (daysSinceCreation < 30) riskScore += 10;

    // Flags increase risk
    riskScore += kycRecord.flags.length * 25;

    return Math.min(riskScore, 100); // Cap at 100
  }

  // Add compliance flag
  addFlag(userId, flagType, reason, severity = 'medium') {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { success: false, error: 'KYC record not found' };
    }

    const flag = {
      type: flagType,
      reason,
      severity, // 'low', 'medium', 'high', 'critical'
      addedAt: new Date(),
      resolved: false
    };

    kycRecord.flags.push(flag);
    kycRecord.updatedAt = new Date();

    // Auto-actions based on severity
    if (severity === 'critical') {
      kycRecord.status = 'suspended';
    }

    return { success: true, flag };
  }

  // Resolve compliance flag
  resolveFlag(userId, flagIndex, resolution = '') {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { success: false, error: 'KYC record not found' };
    }

    if (flagIndex >= kycRecord.flags.length) {
      return { success: false, error: 'Flag not found' };
    }

    const flag = kycRecord.flags[flagIndex];
    flag.resolved = true;
    flag.resolvedAt = new Date();
    flag.resolution = resolution;

    // If all critical flags resolved, restore account
    const criticalFlags = kycRecord.flags.filter(f => 
      f.severity === 'critical' && !f.resolved
    );
    
    if (criticalFlags.length === 0 && kycRecord.status === 'suspended') {
      kycRecord.status = 'verified';
    }

    kycRecord.updatedAt = new Date();

    return { success: true, flag };
  }

  // Get KYC status
  getKYCStatus(userId) {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { 
        exists: false,
        level: 'UNVERIFIED',
        status: 'not_started'
      };
    }

    const documents = Array.from(kycRecord.documents.entries()).map(([type, doc]) => ({
      type,
      status: doc.status,
      submittedAt: doc.submittedAt,
      verifiedAt: doc.verifiedAt
    }));

    return {
      exists: true,
      userId: kycRecord.userId,
      level: kycRecord.level,
      status: kycRecord.status,
      limits: kycRecord.limits,
      documents,
      flags: kycRecord.flags.filter(f => !f.resolved),
      riskScore: this.calculateRiskScore(userId, 0, 'payment'),
      createdAt: kycRecord.createdAt,
      updatedAt: kycRecord.updatedAt
    };
  }

  // Get required documents for next level
  getRequiredDocuments(userId) {
    const kycRecord = this.kycRecords.get(userId);
    if (!kycRecord) {
      return { success: false, error: 'KYC record not found' };
    }

    const currentLevel = kycRecord.level;
    const verifiedDocs = Array.from(kycRecord.documents.values())
      .filter(doc => doc.status === 'verified')
      .map(doc => doc.type);

    const nextLevels = ['BASIC', 'STANDARD', 'PREMIUM', 'INSTITUTIONAL'];
    const currentIndex = nextLevels.indexOf(currentLevel);
    
    if (currentIndex === -1 || currentIndex >= nextLevels.length - 1) {
      return {
        success: true,
        currentLevel,
        nextLevel: null,
        required: [],
        message: 'Maximum verification level reached'
      };
    }

    const nextLevel = nextLevels[currentIndex + 1];
    const nextRequirements = this.verificationLevels[nextLevel].requirements;
    const missing = nextRequirements.filter(req => !verifiedDocs.includes(req));

    return {
      success: true,
      currentLevel,
      nextLevel,
      required: missing,
      benefits: {
        limit: this.verificationLevels[nextLevel].limit,
        features: this.getLevelFeatures(nextLevel)
      }
    };
  }

  // Get features available at each level
  getLevelFeatures(level) {
    const features = {
      'BASIC': ['Basic payments', 'Course enrollment', 'Token earning'],
      'STANDARD': ['Higher limits', 'Peer transfers', 'Staking rewards'],
      'PREMIUM': ['Premium features', 'Advanced trading', 'Priority support'],
      'INSTITUTIONAL': ['Bulk operations', 'API access', 'Custom integrations']
    };

    return features[level] || [];
  }

  // Generate compliance report
  generateComplianceReport() {
    const totalUsers = this.kycRecords.size;
    const levelCounts = {};
    const statusCounts = {};
    let totalFlags = 0;
    let resolvedFlags = 0;

    for (const record of this.kycRecords.values()) {
      levelCounts[record.level] = (levelCounts[record.level] || 0) + 1;
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
      totalFlags += record.flags.length;
      resolvedFlags += record.flags.filter(f => f.resolved).length;
    }

    return {
      timestamp: new Date(),
      totalUsers,
      levelDistribution: levelCounts,
      statusDistribution: statusCounts,
      compliance: {
        totalFlags,
        resolvedFlags,
        pendingFlags: totalFlags - resolvedFlags,
        resolutionRate: totalFlags > 0 ? (resolvedFlags / totalFlags) * 100 : 100
      },
      riskMetrics: {
        highRiskUsers: Array.from(this.kycRecords.values())
          .filter(r => this.calculateRiskScore(r.userId, 0, 'payment') > 70).length,
        suspendedUsers: Array.from(this.kycRecords.values())
          .filter(r => r.status === 'suspended').length
      }
    };
  }
}

module.exports = KYCComplianceSystem;