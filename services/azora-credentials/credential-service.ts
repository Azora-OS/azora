/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Enhanced Credentials & Certification System
 * 
 * Features:
 * - PDF certificate generation with watermark/logo/UID
 * - Digital badge system
 * - Credential wallet
 * - Verification portal
 * - Crypto ledger integration for qualification records
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { AcademicCredential, CredentialType } from '../azora-institutional-system/academic-credentialing';

export interface CredentialDocument {
  id: string;
  credentialId: string;
  studentNumber: string;
  type: CredentialType;
  documentType: 'certificate' | 'transcript' | 'diploma' | 'badge';
  pdfUrl?: string;
  watermark: {
    enabled: boolean;
    text?: string;
    logo?: string; // Logo URL or path
    opacity?: number;
  };
  uid: string; // Unique identifier for tracing
  metadata: {
    issuedDate: Date;
    issuer: string;
    blockchainHash?: string;
    ledgerRecordId?: string;
  };
  createdAt: Date;
}

export interface DigitalBadge {
  id: string;
  studentId: string;
  studentNumber: string;
  credentialId: string;
  badgeType: 'achievement' | 'skill' | 'certification' | 'milestone';
  title: string;
  description: string;
  imageUrl: string;
  issuedDate: Date;
  expirationDate?: Date;
  issuer: string;
  uid: string;
  verifiable: boolean;
  blockchainHash?: string;
}

export interface CredentialWallet {
  studentId: string;
  studentNumber: string;
  credentials: CredentialDocument[];
  badges: DigitalBadge[];
  lastUpdated: Date;
}

export interface LedgerRecord {
  recordId: string;
  studentNumber: string;
  credentialId: string;
  credentialType: CredentialType;
  uid: string;
  blockchainHash: string;
  issuedDate: Date;
  issuer: string;
  metadata: Record<string, any>;
  verified: boolean;
}

export class CredentialService extends EventEmitter {
  private static instance: CredentialService;
  private credentials: Map<string, CredentialDocument> = new Map();
  private badges: Map<string, DigitalBadge> = new Map();
  private wallets: Map<string, CredentialWallet> = new Map();
  private ledgerRecords: Map<string, LedgerRecord> = new Map();

  // Default logo path (can be configured)
  private readonly DEFAULT_LOGO_PATH = '/branding/services/azora-education-logo.svg';

  private constructor() {
    super();
  }

  public static getInstance(): CredentialService {
    if (!CredentialService.instance) {
      CredentialService.instance = new CredentialService();
    }
    return CredentialService.instance;
  }

  /**
   * Generate credential document with watermark/logo/UID
   */
  async generateCredentialDocument(
    credential: AcademicCredential,
    options?: {
      watermarkText?: string;
      logoPath?: string;
      includeWatermark?: boolean;
    }
  ): Promise<CredentialDocument> {
    // Generate UID for tracing
    const uid = this.generateUID(credential.studentNumber, credential.id, credential.credentialType);

    // Determine document type
    const documentType = this.getDocumentType(credential.credentialType);

    // Generate watermark configuration
    const watermark = {
      enabled: options?.includeWatermark !== false,
      text: options?.watermarkText || 'AZORA EDUCATION',
      logo: options?.logoPath || this.DEFAULT_LOGO_PATH,
      opacity: 0.2, // Subtle watermark
    };

    // Generate PDF (mock - would use PDF library in production)
    const pdfUrl = await this.generatePDF(credential, watermark, uid);

    // Create blockchain hash
    const blockchainHash = await this.generateBlockchainHash(credential, uid);

    // Record in ledger
    const ledgerRecord = await this.recordInLedger(credential, uid, blockchainHash);

    const document: CredentialDocument = {
      id: crypto.randomUUID(),
      credentialId: credential.id,
      studentNumber: credential.studentNumber,
      type: credential.credentialType,
      documentType,
      pdfUrl,
      watermark,
      uid,
      metadata: {
        issuedDate: credential.issuedDate,
        issuer: credential.institution,
        blockchainHash,
        ledgerRecordId: ledgerRecord.recordId,
      },
      createdAt: new Date(),
    };

    this.credentials.set(document.id, document);

    // Add to wallet
    await this.addToWallet(credential.studentNumber, document);

    this.emit('credential:generated', document);
    return document;
  }

  /**
   * Generate PDF with watermark and logo
   */
  private async generatePDF(
    credential: AcademicCredential,
    watermark: CredentialDocument['watermark'],
    uid: string
  ): Promise<string> {
    // Mock PDF generation
    // In production, would use PDFKit or similar library
    // Steps:
    // 1. Create PDF document
    // 2. Add watermark layer (semi-transparent text + logo)
    // 3. Add credential content
    // 4. Add UID in footer/header
    // 5. Save to storage and return URL

    const pdfContent = {
      credential: credential.credentialNumber,
      student: credential.studentNumber,
      type: credential.credentialType,
      watermark: watermark.enabled,
      uid,
    };

    // Mock URL
    const pdfUrl = `/api/credentials/${credential.id}/document.pdf?uid=${uid}`;
    return pdfUrl;
  }

  /**
   * Generate blockchain hash
   */
  private async generateBlockchainHash(
    credential: AcademicCredential,
    uid: string
  ): Promise<string> {
    const data = JSON.stringify({
      credentialId: credential.id,
      credentialNumber: credential.credentialNumber,
      studentNumber: credential.studentNumber,
      type: credential.credentialType,
      program: credential.program,
      grade: credential.grade,
      issuedDate: credential.issuedDate.toISOString(),
      uid,
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Record in crypto ledger
   */
  private async recordInLedger(
    credential: AcademicCredential,
    uid: string,
    blockchainHash: string
  ): Promise<LedgerRecord> {
    const record: LedgerRecord = {
      recordId: crypto.randomUUID(),
      studentNumber: credential.studentNumber,
      credentialId: credential.id,
      credentialType: credential.credentialType,
      uid,
      blockchainHash,
      issuedDate: credential.issuedDate,
      issuer: credential.institution,
      metadata: {
        program: credential.program,
        grade: credential.grade,
        credits: credential.credits,
        verificationUrl: credential.verificationUrl,
      },
      verified: true,
    };

    this.ledgerRecords.set(record.recordId, record);

    // TODO: Integrate with actual crypto ledger service
    // await cryptoLedgerService.addQualificationRecord(record);

    this.emit('ledger:recorded', record);
    return record;
  }

  /**
   * Create digital badge
   */
  async createBadge(
    studentId: string,
    studentNumber: string,
    credentialId: string,
    badgeType: DigitalBadge['badgeType'],
    title: string,
    description: string
  ): Promise<DigitalBadge> {
    const uid = this.generateUID(studentNumber, credentialId, 'badge');

    const badge: DigitalBadge = {
      id: crypto.randomUUID(),
      studentId,
      studentNumber,
      credentialId,
      badgeType,
      title,
      description,
      imageUrl: `/api/badges/${uid}/image.svg`, // Badge image URL
      issuedDate: new Date(),
      issuer: 'Azora Education',
      uid,
      verifiable: true,
    };

    // Generate blockchain hash for badge
    badge.blockchainHash = await this.generateBlockchainHash({
      id: credentialId,
      studentNumber,
      credentialType: CredentialType.MICRO_CREDENTIAL,
      program: badgeType,
      institution: 'Azora Education',
      issuedDate: badge.issuedDate,
      grade: 'Pass',
      credits: 0,
      verificationUrl: '',
      status: 'issued',
      metadata: {},
    }, uid);

    this.badges.set(badge.id, badge);

    // Add to wallet
    await this.addBadgeToWallet(studentNumber, badge);

    this.emit('badge:created', badge);
    return badge;
  }

  /**
   * Add credential to wallet
   */
  private async addToWallet(studentNumber: string, document: CredentialDocument): Promise<void> {
    let wallet = this.wallets.get(studentNumber);

    if (!wallet) {
      wallet = {
        studentId: '', // TODO: Get from student service
        studentNumber,
        credentials: [],
        badges: [],
        lastUpdated: new Date(),
      };
    }

    // Check if already exists
    const exists = wallet.credentials.some(c => c.credentialId === document.credentialId);
    if (!exists) {
      wallet.credentials.push(document);
      wallet.lastUpdated = new Date();
      this.wallets.set(studentNumber, wallet);
    }
  }

  /**
   * Add badge to wallet
   */
  private async addBadgeToWallet(studentNumber: string, badge: DigitalBadge): Promise<void> {
    let wallet = this.wallets.get(studentNumber);

    if (!wallet) {
      wallet = {
        studentId: '',
        studentNumber,
        credentials: [],
        badges: [],
        lastUpdated: new Date(),
      };
    }

    const exists = wallet.badges.some(b => b.id === badge.id);
    if (!exists) {
      wallet.badges.push(badge);
      wallet.lastUpdated = new Date();
      this.wallets.set(studentNumber, wallet);
    }
  }

  /**
   * Get credential wallet
   */
  getWallet(studentNumber: string): CredentialWallet | undefined {
    return this.wallets.get(studentNumber);
  }

  /**
   * Verify credential by UID
   */
  async verifyCredential(uid: string): Promise<{
    valid: boolean;
    credential?: CredentialDocument;
    ledgerRecord?: LedgerRecord;
    message: string;
  }> {
    // Find credential by UID
    const credential = Array.from(this.credentials.values()).find(c => c.uid === uid);
    
    if (!credential) {
      return {
        valid: false,
        message: 'Credential not found',
      };
    }

    // Find ledger record
    const ledgerRecord = Array.from(this.ledgerRecords.values())
      .find(r => r.credentialId === credential.credentialId);

    if (!ledgerRecord) {
      return {
        valid: false,
        message: 'Ledger record not found',
      };
    }

    // Verify blockchain hash
    const hashMatch = ledgerRecord.blockchainHash === credential.metadata.blockchainHash;
    
    return {
      valid: hashMatch && ledgerRecord.verified,
      credential,
      ledgerRecord,
      message: hashMatch && ledgerRecord.verified ? 'Credential verified' : 'Verification failed',
    };
  }

  /**
   * Generate UID for tracing
   */
  private generateUID(studentNumber: string, credentialId: string, type: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('sha256')
      .update(`${studentNumber}:${credentialId}:${type}:${timestamp}`)
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();
    return `AZR-CRED-${timestamp.toString(36).toUpperCase()}-${hash}`;
  }

  /**
   * Get document type from credential type
   */
  private getDocumentType(credentialType: CredentialType): CredentialDocument['documentType'] {
    switch (credentialType) {
      case CredentialType.CERTIFICATE:
        return 'certificate';
      case CredentialType.DIPLOMA:
        return 'diploma';
      case CredentialType.DEGREE:
        return 'diploma'; // Degrees are also diplomas
      case CredentialType.TRANSCRIPT:
        return 'transcript';
      default:
        return 'certificate';
    }
  }

  /**
   * Get credential document
   */
  getCredentialDocument(documentId: string): CredentialDocument | undefined {
    return this.credentials.get(documentId);
  }

  /**
   * Get ledger record
   */
  getLedgerRecord(recordId: string): LedgerRecord | undefined {
    return this.ledgerRecords.get(recordId);
  }

  /**
   * Get all ledger records for student
   */
  getStudentLedgerRecords(studentNumber: string): LedgerRecord[] {
    return Array.from(this.ledgerRecords.values())
      .filter(r => r.studentNumber === studentNumber)
      .sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime());
  }
}

export const credentialService = CredentialService.getInstance();
