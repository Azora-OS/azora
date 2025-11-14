/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { AegisPremium } from '../src/aegis-premium';
import threatIntelligence from '../src/threat-intelligence';
import constitutionalGuardian from '../src/constitutional-guardian';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
    }),
  };
});

describe('Aegis Premium Security', () => {
  const aegis = new AegisPremium();

  describe('Security Scanning', () => {
    it('should detect SQL injection', async () => {
      const result = await aegis.performSecurityScan("SELECT * FROM users WHERE id = 1");
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.vulnerabilities[0].severity).toBe('CRITICAL');
    });

    it('should detect XSS attacks', async () => {
      const result = await aegis.performSecurityScan('<script>alert("xss")</script>');
      expect(result.vulnerabilities.some(v => v.description.includes('XSS'))).toBe(true);
    });

    it('should flag weak encryption', async () => {
      const result = await aegis.performSecurityScan('using md5 hash');
      expect(result.vulnerabilities.some(v => v.description.includes('Weak encryption'))).toBe(true);
    });
  });

  describe('Threat Intelligence', () => {
    it('should detect multiple threat signatures', () => {
      const result = threatIntelligence.detectThreats("SELECT * FROM users; <script>alert(1)</script>");
      expect(result.threatsFound).toBeGreaterThan(0);
      expect(result.riskScore).toBeGreaterThan(50);
    });

    it('should calculate risk scores correctly', () => {
      const critical = threatIntelligence.detectThreats("password=admin123");
      expect(critical.riskScore).toBeGreaterThan(30);
    });

    it('should provide mitigation recommendations', () => {
      const result = threatIntelligence.detectThreats("SELECT * FROM users");
      const recs = threatIntelligence.getRecommendations(result.threats);
      expect(recs.length).toBeGreaterThan(0);
    });
  });

  describe('Constitutional Guardian', () => {
    it('should validate compliant actions', () => {
      const context = {
        userConsent: true,
        auditLogged: true,
        userOwnsData: true,
        fairDistribution: true,
        encrypted: true,
        authenticated: true,
        privacyRespected: true
      };
      const result = constitutionalGuardian.validateAction('DATA_ACCESS', context);
      expect(result.compliant).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should detect violations', () => {
      const context = {
        userConsent: false,
        auditLogged: false
      };
      const result = constitutionalGuardian.validateAction('DATA_ACCESS', context);
      expect(result.compliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should enforce constitution', () => {
      const context = { userConsent: false };
      const result = constitutionalGuardian.enforceConstitution('DATA_ACCESS', context);
      expect(result.allowed).toBe(false);
      expect(result.remediation).toBeDefined();
    });

    it('should provide remediation steps', () => {
      const context = { userConsent: false, encrypted: false };
      const result = constitutionalGuardian.enforceConstitution('DATA_ACCESS', context);
      if (result.remediation) {
        expect(result.remediation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Encryption', () => {
    it('should encrypt sensitive data', async () => {
      const data = 'sensitive-password-123';
      const encrypted = await aegis.encryptSensitiveData(data);
      expect(encrypted).not.toBe(data);
      expect(encrypted.length).toBe(64); // SHA-256 hex length
    });
  });

  describe('Penetration Testing', () => {
    it('should test for common vulnerabilities', async () => {
      const results = await aegis.performPenetrationTest('/api/users');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('test');
      expect(results[0]).toHaveProperty('vulnerable');
    });
  });
});
