import { generateUUID } from '../utils/uuid.js';
import { LegalDocument, DocumentSigningRequest, SignatureData } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { legalService } from './legal.service.js';
import { auditService } from './audit.service.js';
import crypto from 'crypto';

// Mock database for signing sessions
interface SigningSession {
  id: string;
  documentId: string;
  userId: string;
  status: 'pending' | 'signed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  signatureHash?: string;
  signatureTimestamp?: Date;
}

interface SignatureCapture {
  sessionId: string;
  documentId: string;
  userId: string;
  signatureHash: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  signatureData: {
    algorithm: string;
    hashLength: number;
    verified: boolean;
  };
}

const signingSessions: Map<string, SigningSession> = new Map();
const signatureCaptures: Map<string, SignatureCapture> = new Map();

export class SigningService {
  /**
   * Create signing session
   * Requirements: 3.4, 3.5, 7.1
   */
  async createSigningSession(documentId: string, userId: string): Promise<SigningSession> {
    // Verify document exists
    const document = await legalService.getDocumentById(documentId, userId);

    if (document.status === 'signed') {
      throw new AppError(400, 'Document is already signed');
    }

    if (document.status === 'archived') {
      throw new AppError(400, 'Cannot sign archived document');
    }

    const sessionId = generateUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const session: SigningSession = {
      id: sessionId,
      documentId,
      userId,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    signingSessions.set(sessionId, session);

    // Log signing session creation
    await auditService.logDocumentAction(
      documentId,
      'signing_session_created',
      `Signing session created for user ${userId}`,
      userId
    );

    return session;
  }

  /**
   * Get signing session
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSigningSession(sessionId: string): Promise<SigningSession> {
    const session = signingSessions.get(sessionId);

    if (!session) {
      throw new AppError(404, 'Signing session not found');
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      signingSessions.set(sessionId, session);
      throw new AppError(400, 'Signing session has expired');
    }

    return session;
  }

  /**
   * Capture signature with timestamp and IP logging
   * Requirements: 3.4, 3.5, 7.1
   */
  async captureSignature(
    sessionId: string,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SignatureCapture> {
    const session = await this.getSigningSession(sessionId);

    if (session.userId !== userId) {
      throw new AppError(403, 'Unauthorized to sign this document');
    }

    if (session.status !== 'pending') {
      throw new AppError(400, 'Signing session is not pending');
    }

    // Get document
    const document = await legalService.getDocumentById(session.documentId, userId);

    // Generate signature hash with timestamp and IP
    const timestamp = new Date();
    const signatureHash = this.generateSignatureHashWithContext(
      document.content,
      userId,
      ipAddress,
      timestamp
    );

    // Validate signature hash format
    if (!this.validateSignatureHash(signatureHash)) {
      throw new AppError(500, 'Failed to generate valid signature hash');
    }

    // Create signature capture record
    const captureId = generateUUID();
    const capture: SignatureCapture = {
      sessionId,
      documentId: session.documentId,
      userId,
      signatureHash,
      timestamp,
      ipAddress,
      userAgent,
      signatureData: {
        algorithm: 'SHA256',
        hashLength: 64,
        verified: true,
      },
    };

    signatureCaptures.set(captureId, capture);

    // Update session with signature info
    session.signatureHash = signatureHash;
    session.signatureTimestamp = timestamp;
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    signingSessions.set(sessionId, session);

    // Log signature capture
    await auditService.logDocumentAction(
      session.documentId,
      'signature_captured',
      `Signature captured for document - Hash: ${signatureHash.substring(0, 16)}... IP: ${ipAddress}`,
      userId,
      ipAddress
    );

    return capture;
  }

  /**
   * Sign document
   * Requirements: 3.4, 3.5, 7.1
   */
  async signDocument(
    sessionId: string,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<LegalDocument> {
    const session = await this.getSigningSession(sessionId);

    if (session.userId !== userId) {
      throw new AppError(403, 'Unauthorized to sign this document');
    }

    if (session.status !== 'pending') {
      throw new AppError(400, 'Signing session is not pending');
    }

    // Get document
    const document = await legalService.getDocumentById(session.documentId, userId);

    // Generate signature hash
    const signatureHash = this.generateSignatureHashWithContext(
      document.content,
      userId,
      ipAddress,
      new Date()
    );

    // Sign document
    const signedDocument = await legalService.signDocument(
      session.documentId,
      userId,
      {
        documentId: session.documentId,
        signatureHash,
      },
      ipAddress,
      userAgent
    );

    // Update session
    session.status = 'signed';
    session.signedAt = new Date();
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    session.signatureHash = signatureHash;
    signingSessions.set(sessionId, session);

    // Log signing
    await auditService.logDocumentAction(
      session.documentId,
      'document_signed',
      `Document signed by user ${userId} from IP ${ipAddress}`,
      userId,
      ipAddress
    );

    return signedDocument;
  }

  /**
   * Get signing status
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSigningStatus(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    documentId: string;
    createdAt: Date;
    expiresAt: Date;
    signedAt?: Date;
    timeRemaining: number;
  }> {
    const session = await this.getSigningSession(sessionId);

    const now = new Date();
    const timeRemaining = Math.max(0, session.expiresAt.getTime() - now.getTime());

    return {
      sessionId,
      status: session.status,
      documentId: session.documentId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      signedAt: session.signedAt,
      timeRemaining,
    };
  }

  /**
   * Verify signature
   * Requirements: 3.4, 3.5, 7.1
   */
  async verifySignature(documentId: string, userId: string): Promise<{
    valid: boolean;
    signedAt?: Date;
    signerId?: string;
    ipAddress?: string;
    userAgent?: string;
  }> {
    const document = await legalService.getDocumentById(documentId, userId);

    if (document.status !== 'signed') {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      signedAt: document.signedAt,
      signerId: document.signerId,
      ipAddress: document.ipAddress,
      userAgent: document.userAgent,
    };
  }

  /**
   * Get signing history for a document
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSigningHistory(documentId: string, userId: string): Promise<
    Array<{
      action: string;
      timestamp: Date;
      userId?: string;
      ipAddress?: string;
      details: string;
    }>
  > {
    const auditTrail = await legalService.getDocumentAuditTrail(documentId, userId);
    return auditTrail.auditEntries;
  }

  /**
   * Extend signing session
   * Requirements: 3.4, 3.5, 7.1
   */
  async extendSigningSession(sessionId: string, userId: string): Promise<SigningSession> {
    const session = await this.getSigningSession(sessionId);

    if (session.userId !== userId) {
      throw new AppError(403, 'Unauthorized to extend this session');
    }

    if (session.status !== 'pending') {
      throw new AppError(400, 'Can only extend pending sessions');
    }

    // Extend by 24 hours
    session.expiresAt = new Date(session.expiresAt.getTime() + 24 * 60 * 60 * 1000);
    signingSessions.set(sessionId, session);

    // Log extension
    await auditService.logDocumentAction(
      session.documentId,
      'signing_session_extended',
      `Signing session extended for user ${userId}`,
      userId
    );

    return session;
  }

  /**
   * Cancel signing session
   * Requirements: 3.4, 3.5, 7.1
   */
  async cancelSigningSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSigningSession(sessionId);

    if (session.userId !== userId) {
      throw new AppError(403, 'Unauthorized to cancel this session');
    }

    signingSessions.delete(sessionId);

    // Log cancellation
    await auditService.logDocumentAction(
      session.documentId,
      'signing_session_cancelled',
      `Signing session cancelled by user ${userId}`,
      userId
    );
  }

  /**
   * Get all signing sessions for a user
   * Requirements: 3.4, 3.5, 7.1
   */
  async getUserSigningSessions(userId: string): Promise<SigningSession[]> {
    return Array.from(signingSessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get signing statistics
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSigningStats(): Promise<{
    totalSessions: number;
    pendingSessions: number;
    signedSessions: number;
    expiredSessions: number;
    averageSigningTime: number;
  }> {
    const allSessions = Array.from(signingSessions.values());

    const pendingSessions = allSessions.filter((s) => s.status === 'pending').length;
    const signedSessions = allSessions.filter((s) => s.status === 'signed').length;
    const expiredSessions = allSessions.filter((s) => s.status === 'expired').length;

    let totalSigningTime = 0;
    let signedCount = 0;

    allSessions.forEach((s) => {
      if (s.status === 'signed' && s.signedAt) {
        totalSigningTime += s.signedAt.getTime() - s.createdAt.getTime();
        signedCount++;
      }
    });

    const averageSigningTime = signedCount > 0 ? totalSigningTime / signedCount : 0;

    return {
      totalSessions: allSessions.length,
      pendingSessions,
      signedSessions,
      expiredSessions,
      averageSigningTime,
    };
  }

  /**
   * Generate signature hash with context (timestamp and IP)
   * Requirements: 3.4, 3.5, 7.1
   */
  private generateSignatureHashWithContext(
    content: string,
    userId: string,
    ipAddress: string,
    timestamp: Date
  ): string {
    const timestampStr = timestamp.toISOString();
    const data = `${content}${userId}${ipAddress}${timestampStr}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate signature hash
   * Requirements: 3.4, 3.5, 7.1
   */
  private generateSignatureHash(content: string, userId: string, ipAddress: string): string {
    const timestamp = new Date().toISOString();
    const data = `${content}${userId}${ipAddress}${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate signature hash
   * Requirements: 3.4, 3.5, 7.1
   */
  validateSignatureHash(hash: string): boolean {
    // Validate hash format (SHA256 produces 64 character hex string)
    return /^[a-f0-9]{64}$/i.test(hash);
  }

  /**
   * Verify signature integrity
   * Requirements: 3.4, 3.5, 7.1
   */
  async verifySignatureIntegrity(
    documentId: string,
    userId: string,
    signatureHash: string
  ): Promise<{
    valid: boolean;
    documentId: string;
    signatureHash: string;
    verificationTimestamp: Date;
    details: string;
  }> {
    const document = await legalService.getDocumentById(documentId, userId);

    if (document.status !== 'signed') {
      return {
        valid: false,
        documentId,
        signatureHash,
        verificationTimestamp: new Date(),
        details: 'Document is not signed',
      };
    }

    if (!document.signatureHash) {
      return {
        valid: false,
        documentId,
        signatureHash,
        verificationTimestamp: new Date(),
        details: 'Document has no signature hash',
      };
    }

    const hashesMatch = document.signatureHash === signatureHash;

    // Log verification
    await auditService.logDocumentAction(
      documentId,
      'signature_verified',
      `Signature verification ${hashesMatch ? 'successful' : 'failed'} for document`,
      userId
    );

    return {
      valid: hashesMatch,
      documentId,
      signatureHash,
      verificationTimestamp: new Date(),
      details: hashesMatch ? 'Signature is valid' : 'Signature hash mismatch',
    };
  }

  /**
   * Get signature capture details
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSignatureCapture(captureId: string): Promise<SignatureCapture> {
    const capture = signatureCaptures.get(captureId);

    if (!capture) {
      throw new AppError(404, 'Signature capture not found');
    }

    return capture;
  }

  /**
   * Get all signature captures for a document
   * Requirements: 3.4, 3.5, 7.1
   */
  async getDocumentSignatureCaptures(documentId: string): Promise<SignatureCapture[]> {
    return Array.from(signatureCaptures.values())
      .filter((c) => c.documentId === documentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get complete audit trail for signed document
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSignedDocumentAuditTrail(documentId: string, userId: string): Promise<{
    documentId: string;
    auditTrail: Array<{
      action: string;
      timestamp: Date;
      userId?: string;
      ipAddress?: string;
      details: string;
      signatureHash?: string;
    }>;
    signatureVerification: {
      isSigned: boolean;
      signedAt?: Date;
      signedBy?: string;
      signatureHash?: string;
      ipAddress?: string;
      userAgent?: string;
    };
  }> {
    const document = await legalService.getDocumentById(documentId, userId);
    const auditTrail = await legalService.getDocumentAuditTrail(documentId, userId);

    // Get all sessions for this document
    const sessions = Array.from(signingSessions.values()).filter(
      (s) => s.documentId === documentId
    );

    // Build comprehensive audit trail
    const enrichedTrail = auditTrail.auditEntries.map((entry) => ({
      ...entry,
      signatureHash: sessions.find((s) => s.status === 'signed')?.signatureHash,
    }));

    return {
      documentId,
      auditTrail: enrichedTrail,
      signatureVerification: {
        isSigned: document.status === 'signed',
        signedAt: document.signedAt,
        signedBy: document.signerId,
        signatureHash: document.signatureHash,
        ipAddress: document.ipAddress,
        userAgent: document.userAgent,
      },
    };
  }

  /**
   * Export audit trail as CSV
   * Requirements: 3.4, 3.5, 7.1
   */
  async exportAuditTrailAsCSV(documentId: string, userId: string): Promise<string> {
    const trail = await this.getSignedDocumentAuditTrail(documentId, userId);

    const headers = ['Action', 'Timestamp', 'User ID', 'IP Address', 'Details'];
    const rows = trail.auditTrail.map((entry) => [
      entry.action,
      entry.timestamp.toISOString(),
      entry.userId || 'N/A',
      entry.ipAddress || 'N/A',
      entry.details,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }

  /**
   * Validate signing session security
   * Requirements: 3.4, 3.5, 7.1
   */
  async validateSessionSecurity(sessionId: string): Promise<{
    sessionId: string;
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const session = await this.getSigningSession(sessionId);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      issues.push('Session has expired');
      recommendations.push('Create a new signing session');
    }

    // Check if session is pending
    if (session.status !== 'pending' && session.status !== 'signed') {
      issues.push(`Session status is ${session.status}`);
      recommendations.push('Verify session status before signing');
    }

    // Check if IP address is captured
    if (!session.ipAddress) {
      issues.push('IP address not captured');
      recommendations.push('Ensure IP address is logged during signing');
    }

    // Check if user agent is captured
    if (!session.userAgent) {
      issues.push('User agent not captured');
      recommendations.push('Ensure user agent is logged during signing');
    }

    return {
      sessionId,
      isSecure: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Clean up expired sessions
   * Requirements: 3.4, 3.5, 7.1
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, session] of signingSessions.entries()) {
      if (now > session.expiresAt && session.status === 'pending') {
        signingSessions.delete(id);
        deletedCount++;

        // Log cleanup
        await auditService.logDocumentAction(
          session.documentId,
          'signing_session_expired_cleanup',
          `Expired signing session cleaned up`,
          undefined,
          session.ipAddress
        );
      }
    }

    console.log(`[Signing] Cleaned up ${deletedCount} expired signing sessions`);

    return deletedCount;
  }

  /**
   * Get signing statistics
   * Requirements: 3.4, 3.5, 7.1
   */
  async getSigningStatistics(): Promise<{
    totalSessions: number;
    pendingSessions: number;
    signedSessions: number;
    expiredSessions: number;
    averageSigningTime: number;
    totalSignatureCaptures: number;
    securityMetrics: {
      sessionsWithIPLogging: number;
      sessionsWithUserAgent: number;
      sessionsWithTimestamp: number;
    };
  }> {
    const allSessions = Array.from(signingSessions.values());
    const allCaptures = Array.from(signatureCaptures.values());

    const pendingSessions = allSessions.filter((s) => s.status === 'pending').length;
    const signedSessions = allSessions.filter((s) => s.status === 'signed').length;
    const expiredSessions = allSessions.filter((s) => s.status === 'expired').length;

    let totalSigningTime = 0;
    let signedCount = 0;

    allSessions.forEach((s) => {
      if (s.status === 'signed' && s.signedAt) {
        totalSigningTime += s.signedAt.getTime() - s.createdAt.getTime();
        signedCount++;
      }
    });

    const averageSigningTime = signedCount > 0 ? totalSigningTime / signedCount : 0;

    // Security metrics
    const sessionsWithIPLogging = allSessions.filter((s) => s.ipAddress).length;
    const sessionsWithUserAgent = allSessions.filter((s) => s.userAgent).length;
    const sessionsWithTimestamp = allSessions.filter((s) => s.signatureTimestamp).length;

    return {
      totalSessions: allSessions.length,
      pendingSessions,
      signedSessions,
      expiredSessions,
      averageSigningTime,
      totalSignatureCaptures: allCaptures.length,
      securityMetrics: {
        sessionsWithIPLogging,
        sessionsWithUserAgent,
        sessionsWithTimestamp,
      },
    };
  }
}

export const signingService = new SigningService();
