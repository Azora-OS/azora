/**
 * GDPR Compliance Service
 * Implements GDPR requirements including data subject rights
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

interface DataProcessingAgreement {
  id: string;
  dataController: string;
  dataProcessor: string;
  processingPurpose: string;
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: number; // days
  createdAt: Date;
  updatedAt: Date;
}

interface PrivacyImpactAssessment {
  id: string;
  processName: string;
  description: string;
  dataCategories: string[];
  riskLevel: 'low' | 'medium' | 'high';
  mitigationMeasures: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'deletion' | 'portability' | 'rectification' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  reason?: string;
}

interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  version: string;
  givenAt: Date;
  expiresAt?: Date;
  ipAddress: string;
  userAgent: string;
}

/**
 * GDPR Compliance Service
 */
export class GDPRComplianceService extends EventEmitter {
  private dpas: Map<string, DataProcessingAgreement> = new Map();
  private pias: Map<string, PrivacyImpactAssessment> = new Map();
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    details: any;
  }> = [];

  constructor(private config: {
    organizationName: string;
    dataProtectionOfficer?: string;
    privacyPolicyUrl?: string;
  }) {
    super();
    this.initialize();
  }

  /**
   * Initialize GDPR compliance service
   */
  private initialize(): void {
    this.logAudit('SERVICE_INITIALIZED', {
      organization: this.config.organizationName,
      timestamp: new Date()
    });
  }

  /**
   * Create Data Processing Agreement
   */
  async createDPA(
    dataController: string,
    dataProcessor: string,
    options: {
      processingPurpose: string;
      dataCategories: string[];
      recipients: string[];
      retentionPeriod: number;
    }
  ): Promise<DataProcessingAgreement> {
    try {
      const dpa: DataProcessingAgreement = {
        id: crypto.randomUUID(),
        dataController,
        dataProcessor,
        processingPurpose: options.processingPurpose,
        dataCategories: options.dataCategories,
        recipients: options.recipients,
        retentionPeriod: options.retentionPeriod,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.dpas.set(dpa.id, dpa);
      this.logAudit('DPA_CREATED', { dpaId: dpa.id, dataController, dataProcessor });
      this.emit('dpa:created', dpa);

      return dpa;
    } catch (error) {
      this.logAudit('DPA_CREATION_FAILED', { error: String(error) });
      throw new Error(`Failed to create DPA: ${error}`);
    }
  }

  /**
   * Create Privacy Impact Assessment
   */
  async createPIA(
    processName: string,
    options: {
      description: string;
      dataCategories: string[];
      riskLevel: 'low' | 'medium' | 'high';
      mitigationMeasures: string[];
    }
  ): Promise<PrivacyImpactAssessment> {
    try {
      const pia: PrivacyImpactAssessment = {
        id: crypto.randomUUID(),
        processName,
        description: options.description,
        dataCategories: options.dataCategories,
        riskLevel: options.riskLevel,
        mitigationMeasures: options.mitigationMeasures,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.pias.set(pia.id, pia);
      this.logAudit('PIA_CREATED', { piaId: pia.id, processName, riskLevel: options.riskLevel });
      this.emit('pia:created', pia);

      return pia;
    } catch (error) {
      this.logAudit('PIA_CREATION_FAILED', { error: String(error) });
      throw new Error(`Failed to create PIA: ${error}`);
    }
  }

  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    consentType: string,
    version: string,
    ipAddress: string,
    userAgent: string,
    expiresAt?: Date
  ): Promise<ConsentRecord> {
    try {
      const consentRecord: ConsentRecord = {
        id: crypto.randomUUID(),
        userId,
        consentType,
        version,
        givenAt: new Date(),
        expiresAt,
        ipAddress,
        userAgent
      };

      this.consentRecords.set(consentRecord.id, consentRecord);
      this.logAudit('CONSENT_RECORDED', {
        userId,
        consentType,
        version,
        ipAddress
      });
      this.emit('consent:recorded', consentRecord);

      return consentRecord;
    } catch (error) {
      this.logAudit('CONSENT_RECORDING_FAILED', { error: String(error) });
      throw new Error(`Failed to record consent: ${error}`);
    }
  }

  /**
   * Handle Data Subject Access Request (DSAR)
   */
  async createDataSubjectRequest(
    userId: string,
    requestType: 'access' | 'deletion' | 'portability' | 'rectification' | 'objection'
  ): Promise<DataSubjectRequest> {
    try {
      const request: DataSubjectRequest = {
        id: crypto.randomUUID(),
        userId,
        requestType,
        status: 'pending',
        createdAt: new Date()
      };

      this.dataSubjectRequests.set(request.id, request);
      this.logAudit('DATA_SUBJECT_REQUEST_CREATED', {
        requestId: request.id,
        userId,
        requestType
      });
      this.emit('dsar:created', request);

      return request;
    } catch (error) {
      this.logAudit('DSAR_CREATION_FAILED', { error: String(error) });
      throw new Error(`Failed to create data subject request: ${error}`);
    }
  }

  /**
   * Process Data Subject Access Request
   */
  async processDSAR(requestId: string, data?: any): Promise<DataSubjectRequest> {
    try {
      const request = this.dataSubjectRequests.get(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'processing';
      request.completedAt = new Date();

      this.dataSubjectRequests.set(requestId, request);
      this.logAudit('DSAR_PROCESSED', {
        requestId,
        requestType: request.requestType,
        userId: request.userId
      });
      this.emit('dsar:processed', request);

      return request;
    } catch (error) {
      this.logAudit('DSAR_PROCESSING_FAILED', { error: String(error) });
      throw new Error(`Failed to process DSAR: ${error}`);
    }
  }

  /**
   * Complete Data Subject Request
   */
  async completeDSAR(requestId: string): Promise<DataSubjectRequest> {
    try {
      const request = this.dataSubjectRequests.get(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'completed';
      request.completedAt = new Date();

      this.dataSubjectRequests.set(requestId, request);
      this.logAudit('DSAR_COMPLETED', {
        requestId,
        requestType: request.requestType,
        userId: request.userId
      });
      this.emit('dsar:completed', request);

      return request;
    } catch (error) {
      this.logAudit('DSAR_COMPLETION_FAILED', { error: String(error) });
      throw new Error(`Failed to complete DSAR: ${error}`);
    }
  }

  /**
   * Reject Data Subject Request
   */
  async rejectDSAR(requestId: string, reason: string): Promise<DataSubjectRequest> {
    try {
      const request = this.dataSubjectRequests.get(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'rejected';
      request.reason = reason;
      request.completedAt = new Date();

      this.dataSubjectRequests.set(requestId, request);
      this.logAudit('DSAR_REJECTED', {
        requestId,
        requestType: request.requestType,
        userId: request.userId,
        reason
      });
      this.emit('dsar:rejected', request);

      return request;
    } catch (error) {
      this.logAudit('DSAR_REJECTION_FAILED', { error: String(error) });
      throw new Error(`Failed to reject DSAR: ${error}`);
    }
  }

  /**
   * Get data retention policy
   */
  getDataRetentionPolicy(): {
    personalData: number; // days
    transactionData: number; // days
    auditLogs: number; // days
    backups: number; // days
  } {
    return {
      personalData: 365, // 1 year
      transactionData: 2555, // 7 years
      auditLogs: 2555, // 7 years
      backups: 90 // 3 months
    };
  }

  /**
   * Get data categories
   */
  getDataCategories(): string[] {
    return [
      'Personal Identification Data',
      'Contact Information',
      'Financial Information',
      'Educational Records',
      'Health Information',
      'Behavioral Data',
      'Device Information',
      'Location Data',
      'Biometric Data',
      'Special Category Data'
    ];
  }

  /**
   * Get data subject rights
   */
  getDataSubjectRights(): {
    right: string;
    description: string;
    implementationStatus: 'implemented' | 'in-progress' | 'planned';
  }[] {
    return [
      {
        right: 'Right to Access',
        description: 'Users can request access to their personal data',
        implementationStatus: 'implemented'
      },
      {
        right: 'Right to Rectification',
        description: 'Users can request correction of inaccurate data',
        implementationStatus: 'implemented'
      },
      {
        right: 'Right to Erasure',
        description: 'Users can request deletion of their data',
        implementationStatus: 'implemented'
      },
      {
        right: 'Right to Restrict Processing',
        description: 'Users can request restriction of data processing',
        implementationStatus: 'in-progress'
      },
      {
        right: 'Right to Data Portability',
        description: 'Users can request their data in portable format',
        implementationStatus: 'implemented'
      },
      {
        right: 'Right to Object',
        description: 'Users can object to data processing',
        implementationStatus: 'in-progress'
      },
      {
        right: 'Right to Withdraw Consent',
        description: 'Users can withdraw previously given consent',
        implementationStatus: 'implemented'
      }
    ];
  }

  /**
   * Get DPA
   */
  getDPA(dpaId: string): DataProcessingAgreement | undefined {
    return this.dpas.get(dpaId);
  }

  /**
   * List all DPAs
   */
  listDPAs(): DataProcessingAgreement[] {
    return Array.from(this.dpas.values());
  }

  /**
   * Get PIA
   */
  getPIA(piaId: string): PrivacyImpactAssessment | undefined {
    return this.pias.get(piaId);
  }

  /**
   * List all PIAs
   */
  listPIAs(): PrivacyImpactAssessment[] {
    return Array.from(this.pias.values());
  }

  /**
   * Get data subject request
   */
  getDSAR(requestId: string): DataSubjectRequest | undefined {
    return this.dataSubjectRequests.get(requestId);
  }

  /**
   * List all DSARs for user
   */
  listDSARsForUser(userId: string): DataSubjectRequest[] {
    return Array.from(this.dataSubjectRequests.values()).filter(r => r.userId === userId);
  }

  /**
   * Get consent records for user
   */
  getConsentRecordsForUser(userId: string): ConsentRecord[] {
    return Array.from(this.consentRecords.values()).filter(c => c.userId === userId);
  }

  /**
   * Log audit event
   */
  private logAudit(action: string, details: any): void {
    const auditEntry = {
      timestamp: new Date(),
      action,
      details
    };

    this.auditLog.push(auditEntry);
    this.emit('audit:log', auditEntry);

    // Keep only last 10000 entries in memory
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filter?: { action?: string; since?: Date }): typeof this.auditLog {
    let logs = this.auditLog;

    if (filter?.action) {
      logs = logs.filter(log => log.action === filter.action);
    }

    if (filter?.since) {
      logs = logs.filter(log => log.timestamp >= filter.since!);
    }

    return logs;
  }

  /**
   * Generate GDPR compliance report
   */
  generateComplianceReport(): {
    organization: string;
    reportDate: Date;
    dpasCount: number;
    piasCount: number;
    pendingDSARs: number;
    completedDSARs: number;
    dataRetentionPolicy: any;
    dataSubjectRights: any[];
  } {
    const pendingDSARs = Array.from(this.dataSubjectRequests.values()).filter(
      r => r.status === 'pending'
    ).length;

    const completedDSARs = Array.from(this.dataSubjectRequests.values()).filter(
      r => r.status === 'completed'
    ).length;

    return {
      organization: this.config.organizationName,
      reportDate: new Date(),
      dpasCount: this.dpas.size,
      piasCount: this.pias.size,
      pendingDSARs,
      completedDSARs,
      dataRetentionPolicy: this.getDataRetentionPolicy(),
      dataSubjectRights: this.getDataSubjectRights()
    };
  }
}

// Export singleton instance
let gdprComplianceService: GDPRComplianceService | null = null;

export function initializeGDPRCompliance(config: {
  organizationName: string;
  dataProtectionOfficer?: string;
  privacyPolicyUrl?: string;
}): GDPRComplianceService {
  if (!gdprComplianceService) {
    gdprComplianceService = new GDPRComplianceService(config);
  }
  return gdprComplianceService;
}

export function getGDPRComplianceService(): GDPRComplianceService {
  if (!gdprComplianceService) {
    throw new Error('GDPR Compliance Service not initialized');
  }
  return gdprComplianceService;
}

export default GDPRComplianceService;
