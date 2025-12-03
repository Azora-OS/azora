import { signingService } from '../services/signing.service.js';
import { legalService } from '../services/legal.service.js';
import { auditService } from '../services/audit.service.js';

describe('Legal Document Signing Flow', () => {
  const mockBusinessId = 'test-business-123';
  const mockUserId = 'test-user-123';
  const mockIpAddress = '192.168.1.1';
  const mockUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  let documentId: string;
  let templateId: string;

  beforeAll(async () => {
    // Get a template and create a document for testing
    const templates = await legalService.getTemplates();
    templateId = templates[0].id;

    const documentData = {
      templateId,
      data: {
        businessName: 'Test Business',
        businessType: 'e-commerce',
        ownerName: 'John Doe',
        date: '2024-01-01',
        additionalTerms: 'Standard terms apply',
      },
    };

    const document = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
    documentId = document.id;
  });

  describe('Signing Session Management', () => {
    it('should create a signing session', async () => {
      const session = await signingService.createSigningSession(documentId, mockUserId);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.documentId).toBe(documentId);
      expect(session.userId).toBe(mockUserId);
      expect(session.status).toBe('pending');
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();
      expect(session.expiresAt.getTime()).toBeGreaterThan(session.createdAt.getTime());
    });

    it('should retrieve signing session', async () => {
      const createdSession = await signingService.createSigningSession(documentId, mockUserId);
      const retrievedSession = await signingService.getSigningSession(createdSession.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession.id).toBe(createdSession.id);
      expect(retrievedSession.status).toBe('pending');
    });

    it('should throw error for non-existent session', async () => {
      await expect(signingService.getSigningSession('non-existent-session')).rejects.toThrow(
        'Signing session not found'
      );
    });

    it('should throw error when signing already signed document', async () => {
      const session = await signingService.createSigningSession(documentId, mockUserId);

      // Sign the document
      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      // Try to create another session for the same document
      await expect(
        signingService.createSigningSession(documentId, mockUserId)
      ).rejects.toThrow('Document is already signed');
    });
  });

  describe('Signature Capture with Timestamp and IP Logging', () => {
    it('should capture signature with timestamp and IP', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Capture Test Business',
          businessType: 'tutoring',
          ownerName: 'Jane Doe',
          date: '2024-01-01',
          additionalTerms: 'Capture test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const capture = await signingService.captureSignature(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      expect(capture).toBeDefined();
      expect(capture.sessionId).toBe(session.id);
      expect(capture.documentId).toBe(doc.id);
      expect(capture.userId).toBe(mockUserId);
      expect(capture.signatureHash).toBeDefined();
      expect(capture.timestamp).toBeDefined();
      expect(capture.ipAddress).toBe(mockIpAddress);
      expect(capture.userAgent).toBe(mockUserAgent);
      expect(capture.signatureData.algorithm).toBe('SHA256');
      expect(capture.signatureData.hashLength).toBe(64);
      expect(capture.signatureData.verified).toBe(true);
    });

    it('should validate signature hash format', async () => {
      const validHash = 'a'.repeat(64);
      const invalidHash = 'invalid-hash';

      expect(signingService.validateSignatureHash(validHash)).toBe(true);
      expect(signingService.validateSignatureHash(invalidHash)).toBe(false);
    });

    it('should throw error when capturing signature for non-pending session', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Non-Pending Test',
          businessType: 'gig-platform',
          ownerName: 'Test Owner',
          date: '2024-01-01',
          additionalTerms: 'Test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      // Sign the document
      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      // Try to capture signature again
      await expect(
        signingService.captureSignature(session.id, mockUserId, mockIpAddress, mockUserAgent)
      ).rejects.toThrow('Signing session is not pending');
    });
  });

  describe('Document Signing', () => {
    it('should sign document with timestamp and IP logging', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Sign Test Business',
          businessType: 'ride-sharing',
          ownerName: 'Sign Owner',
          date: '2024-01-01',
          additionalTerms: 'Sign test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const signedDoc = await signingService.signDocument(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      expect(signedDoc).toBeDefined();
      expect(signedDoc.status).toBe('signed');
      expect(signedDoc.signedAt).toBeDefined();
      expect(signedDoc.signerId).toBe(mockUserId);
      expect(signedDoc.signatureHash).toBeDefined();
      expect(signedDoc.ipAddress).toBe(mockIpAddress);
      expect(signedDoc.userAgent).toBe(mockUserAgent);
    });

    it('should throw error when unauthorized user tries to sign', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Unauthorized Test',
          businessType: 'e-commerce',
          ownerName: 'Unauth Owner',
          date: '2024-01-01',
          additionalTerms: 'Unauth terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await expect(
        signingService.signDocument(session.id, 'different-user', mockIpAddress, mockUserAgent)
      ).rejects.toThrow('Unauthorized to sign this document');
    });

    it('should throw error when signing non-pending session', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Non-Pending Sign Test',
          businessType: 'tutoring',
          ownerName: 'Non-Pending Owner',
          date: '2024-01-01',
          additionalTerms: 'Non-pending terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      // Sign once
      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      // Try to sign again
      await expect(
        signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent)
      ).rejects.toThrow('Signing session is not pending');
    });
  });

  describe('Signature Verification', () => {
    it('should verify valid signature', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Verify Test Business',
          businessType: 'gig-platform',
          ownerName: 'Verify Owner',
          date: '2024-01-01',
          additionalTerms: 'Verify test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const signedDoc = await signingService.signDocument(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const verification = await signingService.verifySignature(doc.id, mockUserId);

      expect(verification).toBeDefined();
      expect(verification.valid).toBe(true);
      expect(verification.signedAt).toBeDefined();
      expect(verification.signerId).toBe(mockUserId);
      expect(verification.ipAddress).toBe(mockIpAddress);
      expect(verification.userAgent).toBe(mockUserAgent);
    });

    it('should verify signature integrity', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Integrity Test Business',
          businessType: 'e-commerce',
          ownerName: 'Integrity Owner',
          date: '2024-01-01',
          additionalTerms: 'Integrity test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const signedDoc = await signingService.signDocument(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const verification = await signingService.verifySignatureIntegrity(
        doc.id,
        mockUserId,
        signedDoc.signatureHash!
      );

      expect(verification).toBeDefined();
      expect(verification.valid).toBe(true);
      expect(verification.documentId).toBe(doc.id);
      expect(verification.verificationTimestamp).toBeDefined();
    });

    it('should detect invalid signature', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Invalid Sig Test',
          businessType: 'ride-sharing',
          ownerName: 'Invalid Owner',
          date: '2024-01-01',
          additionalTerms: 'Invalid sig terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      const invalidHash = 'b'.repeat(64);
      const verification = await signingService.verifySignatureIntegrity(
        doc.id,
        mockUserId,
        invalidHash
      );

      expect(verification.valid).toBe(false);
      expect(verification.details).toContain('mismatch');
    });
  });

  describe('Audit Trail', () => {
    it('should retrieve signing history', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'History Test Business',
          businessType: 'tutoring',
          ownerName: 'History Owner',
          date: '2024-01-01',
          additionalTerms: 'History test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      const history = await signingService.getSigningHistory(doc.id, mockUserId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('action');
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('details');
    });

    it('should get complete audit trail for signed document', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Complete Audit Test',
          businessType: 'gig-platform',
          ownerName: 'Audit Owner',
          date: '2024-01-01',
          additionalTerms: 'Audit test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const signedDoc = await signingService.signDocument(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const auditTrail = await signingService.getSignedDocumentAuditTrail(doc.id, mockUserId);

      expect(auditTrail).toBeDefined();
      expect(auditTrail.documentId).toBe(doc.id);
      expect(auditTrail.auditTrail).toBeDefined();
      expect(Array.isArray(auditTrail.auditTrail)).toBe(true);
      expect(auditTrail.signatureVerification).toBeDefined();
      expect(auditTrail.signatureVerification.isSigned).toBe(true);
      expect(auditTrail.signatureVerification.signedAt).toBeDefined();
      expect(auditTrail.signatureVerification.signedBy).toBe(mockUserId);
      expect(auditTrail.signatureVerification.ipAddress).toBe(mockIpAddress);
      expect(auditTrail.signatureVerification.userAgent).toBe(mockUserAgent);
    });

    it('should export audit trail as CSV', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'CSV Export Test',
          businessType: 'e-commerce',
          ownerName: 'CSV Owner',
          date: '2024-01-01',
          additionalTerms: 'CSV test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await signingService.signDocument(session.id, mockUserId, mockIpAddress, mockUserAgent);

      const csv = await signingService.exportAuditTrailAsCSV(doc.id, mockUserId);

      expect(typeof csv).toBe('string');
      expect(csv).toContain('Action');
      expect(csv).toContain('Timestamp');
      expect(csv).toContain('User ID');
      expect(csv).toContain('IP Address');
    });
  });

  describe('Session Management', () => {
    it('should extend signing session', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Extend Test Business',
          businessType: 'ride-sharing',
          ownerName: 'Extend Owner',
          date: '2024-01-01',
          additionalTerms: 'Extend test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const originalExpiry = session.expiresAt;
      const extended = await signingService.extendSigningSession(session.id, mockUserId);

      expect(extended.expiresAt.getTime()).toBeGreaterThan(originalExpiry.getTime());
    });

    it('should cancel signing session', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Cancel Test Business',
          businessType: 'tutoring',
          ownerName: 'Cancel Owner',
          date: '2024-01-01',
          additionalTerms: 'Cancel test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await signingService.cancelSigningSession(session.id, mockUserId);

      await expect(signingService.getSigningSession(session.id)).rejects.toThrow(
        'Signing session not found'
      );
    });

    it('should get user signing sessions', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'User Sessions Test',
          businessType: 'gig-platform',
          ownerName: 'Sessions Owner',
          date: '2024-01-01',
          additionalTerms: 'Sessions test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      await signingService.createSigningSession(doc.id, mockUserId);

      const sessions = await signingService.getUserSigningSessions(mockUserId);

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].userId).toBe(mockUserId);
    });
  });

  describe('Security and Statistics', () => {
    it('should validate session security', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Security Test Business',
          businessType: 'e-commerce',
          ownerName: 'Security Owner',
          date: '2024-01-01',
          additionalTerms: 'Security test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      const security = await signingService.validateSessionSecurity(session.id);

      expect(security).toBeDefined();
      expect(security.sessionId).toBe(session.id);
      expect(security.isSecure).toBeDefined();
      expect(Array.isArray(security.issues)).toBe(true);
      expect(Array.isArray(security.recommendations)).toBe(true);
    });

    it('should get signing statistics', async () => {
      const stats = await signingService.getSigningStats();

      expect(stats).toBeDefined();
      expect(stats.totalSessions).toBeGreaterThanOrEqual(0);
      expect(stats.pendingSessions).toBeGreaterThanOrEqual(0);
      expect(stats.signedSessions).toBeGreaterThanOrEqual(0);
      expect(stats.expiredSessions).toBeGreaterThanOrEqual(0);
      expect(stats.averageSigningTime).toBeGreaterThanOrEqual(0);
    });

    it('should get signing statistics with security metrics', async () => {
      const stats = await signingService.getSigningStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalSessions).toBeGreaterThanOrEqual(0);
      expect(stats.securityMetrics).toBeDefined();
      expect(stats.securityMetrics.sessionsWithIPLogging).toBeGreaterThanOrEqual(0);
      expect(stats.securityMetrics.sessionsWithUserAgent).toBeGreaterThanOrEqual(0);
      expect(stats.securityMetrics.sessionsWithTimestamp).toBeGreaterThanOrEqual(0);
    });

    it('should cleanup expired sessions', async () => {
      const cleaned = await signingService.cleanupExpiredSessions();

      expect(typeof cleaned).toBe('number');
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Signature Capture Details', () => {
    it('should get document signature captures', async () => {
      const documentData = {
        templateId,
        data: {
          businessName: 'Captures Test Business',
          businessType: 'ride-sharing',
          ownerName: 'Captures Owner',
          date: '2024-01-01',
          additionalTerms: 'Captures test terms',
        },
      };

      const doc = await legalService.generateDocument(mockBusinessId, documentData, mockUserId);
      const session = await signingService.createSigningSession(doc.id, mockUserId);

      await signingService.captureSignature(
        session.id,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const captures = await signingService.getDocumentSignatureCaptures(doc.id);

      expect(Array.isArray(captures)).toBe(true);
      expect(captures.length).toBeGreaterThan(0);
      expect(captures[0].documentId).toBe(doc.id);
      expect(captures[0].userId).toBe(mockUserId);
    });
  });
});
