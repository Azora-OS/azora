/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { credentialService } from '../credential-service';
import { AcademicCredential, CredentialType } from '../../azora-institutional-system/academic-credentialing';
import { connectAzoraDatabase, azoraDatabase } from '../../shared/database/connection';

describe('CredentialService', () => {
  let testCredential: AcademicCredential;
  const testStudentId = 'credential-student-123';
  const testStudentNumber = 'ASU2025011';

  beforeAll(async () => {
    await connectAzoraDatabase(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test');
  });

  afterAll(async () => {
    await azoraDatabase.disconnect();
  });

  beforeEach(() => {
    testCredential = {
      id: `cred-${Date.now()}`,
      credentialNumber: `CRED-${Date.now()}`,
      studentNumber: testStudentNumber,
      credentialType: CredentialType.CERTIFICATE,
      program: 'Test Program',
      institution: 'Azora Education',
      issuedDate: new Date(),
      grade: 'A',
      credits: 3,
      verificationUrl: `https://verify.azora.world/${Date.now()}`,
      status: 'issued',
      metadata: {},
    };
  });

  describe('generateCredentialDocument', () => {
    it('should generate credential document successfully', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.credentialId).toBe(testCredential.id);
      expect(document.studentNumber).toBe(testStudentNumber);
      expect(document.uid).toBeDefined();
      expect(document.watermark.enabled).toBe(true);
      expect(document.metadata.blockchainHash).toBeDefined();
      expect(document.metadata.ledgerRecordId).toBeDefined();
    });

    it('should use custom watermark options', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential, {
        watermarkText: 'CUSTOM WATERMARK',
        logoPath: '/custom/logo.png',
        includeWatermark: true,
      });

      expect(document.watermark.text).toBe('CUSTOM WATERMARK');
      expect(document.watermark.logo).toBe('/custom/logo.png');
    });

    it('should disable watermark if requested', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential, {
        includeWatermark: false,
      });

      expect(document.watermark.enabled).toBe(false);
    });
  });

  describe('createBadge', () => {
    it('should create a digital badge', async () => {
      const badge = await credentialService.createBadge(
        testStudentId,
        testStudentNumber,
        testCredential.id,
        'achievement',
        'Test Badge',
        'Test badge description'
      );

      expect(badge).toBeDefined();
      expect(badge.id).toBeDefined();
      expect(badge.studentId).toBe(testStudentId);
      expect(badge.studentNumber).toBe(testStudentNumber);
      expect(badge.title).toBe('Test Badge');
      expect(badge.badgeType).toBe('achievement');
      expect(badge.uid).toBeDefined();
      expect(badge.blockchainHash).toBeDefined();
      expect(badge.verifiable).toBe(true);
    });

    it('should create different badge types', async () => {
      const skillBadge = await credentialService.createBadge(
        testStudentId,
        testStudentNumber,
        testCredential.id,
        'skill',
        'Python Skill',
        'Proficient in Python'
      );

      expect(skillBadge.badgeType).toBe('skill');
    });
  });

  describe('getWallet', () => {
    it('should get credential wallet for student', async () => {
      // Generate a credential to add to wallet
      await credentialService.generateCredentialDocument(testCredential);

      const wallet = credentialService.getWallet(testStudentNumber);

      expect(wallet).toBeDefined();
      expect(wallet?.studentNumber).toBe(testStudentNumber);
      expect(wallet?.credentials.length).toBeGreaterThan(0);
      expect(wallet?.lastUpdated).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent wallet', () => {
      const wallet = credentialService.getWallet('non-existent');

      expect(wallet).toBeUndefined();
    });
  });

  describe('verifyCredential', () => {
    it('should verify a valid credential', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential);
      const result = await credentialService.verifyCredential(document.uid);

      expect(result.valid).toBe(true);
      expect(result.credential).toBeDefined();
      expect(result.ledgerRecord).toBeDefined();
      expect(result.message).toBe('Credential verified');
    });

    it('should reject invalid credential', async () => {
      const result = await credentialService.verifyCredential('invalid-uid');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Credential not found');
    });
  });

  describe('ledger records', () => {
    it('should record credential in ledger', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential);
      const record = credentialService.getLedgerRecord(document.metadata.ledgerRecordId!);

      expect(record).toBeDefined();
      expect(record?.studentNumber).toBe(testStudentNumber);
      expect(record?.credentialId).toBe(testCredential.id);
      expect(record?.blockchainHash).toBeDefined();
      expect(record?.verified).toBe(true);
    });

    it('should get all ledger records for student', async () => {
      await credentialService.generateCredentialDocument(testCredential);
      
      const records = credentialService.getStudentLedgerRecords(testStudentNumber);

      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(records.every(r => r.studentNumber === testStudentNumber)).toBe(true);
    });
  });

  describe('UID generation', () => {
    it('should generate unique UIDs', async () => {
      const doc1 = await credentialService.generateCredentialDocument(testCredential);
      const doc2 = await credentialService.generateCredentialDocument({
        ...testCredential,
        id: `cred-${Date.now() + 1}`,
        credentialNumber: `CRED-${Date.now() + 1}`,
      });

      expect(doc1.uid).not.toBe(doc2.uid);
    });

    it('should generate UIDs with correct format', async () => {
      const document = await credentialService.generateCredentialDocument(testCredential);

      expect(document.uid).toMatch(/^AZR-CRED-/);
    });
  });

  describe('document types', () => {
    it('should determine correct document type for certificate', async () => {
      const credential: AcademicCredential = {
        ...testCredential,
        credentialType: CredentialType.CERTIFICATE,
      };

      const document = await credentialService.generateCredentialDocument(credential);

      expect(document.documentType).toBe('certificate');
    });

    it('should determine correct document type for diploma', async () => {
      const credential: AcademicCredential = {
        ...testCredential,
        credentialType: CredentialType.DIPLOMA,
      };

      const document = await credentialService.generateCredentialDocument(credential);

      expect(document.documentType).toBe('diploma');
    });

    it('should determine correct document type for transcript', async () => {
      const credential: AcademicCredential = {
        ...testCredential,
        credentialType: CredentialType.TRANSCRIPT,
      };

      const document = await credentialService.generateCredentialDocument(credential);

      expect(document.documentType).toBe('transcript');
    });
  });
});
