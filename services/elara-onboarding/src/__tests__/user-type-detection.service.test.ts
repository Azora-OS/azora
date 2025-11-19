/**
 * User Type Detection Service Tests
 * 
 * Tests for user type detection and verification logic
 */

import { UserTypeDetectionService, UserProfile, DetectionResult, VerificationResult } from '../services/user-type-detection.service';

describe('UserTypeDetectionService', () => {
  let service: UserTypeDetectionService;

  beforeEach(() => {
    service = new UserTypeDetectionService();
  });

  describe('detectUserType', () => {
    it('should detect student from .edu email', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
        learningGoals: ['Learn programming'],
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('student');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Has .edu email address');
    });

    it('should detect student from learning goals', async () => {
      const profile: UserProfile = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        learningGoals: ['Master web development', 'Learn React'],
        interests: ['Technology', 'Programming'],
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('student');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.evidence).toContain('Has learning goals');
    });

    it('should detect teacher from credentials and institution', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Professor',
        email: 'prof@university.edu',
        institution: 'MIT',
        credentials: ['PhD in Computer Science', 'Teaching Certificate'],
        bio: 'I am a professor and educator',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('teacher');
      expect(result.confidence).toBeGreaterThan(0.4);
      expect(result.evidence).toContain('Has education credentials');
    });

    it('should detect researcher from institution and research keywords', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Researcher',
        email: 'researcher@university.edu',
        institution: 'Stanford',
        expertise: ['Machine Learning', 'AI'],
        bio: 'I conduct research in artificial intelligence',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('researcher');
      expect(result.confidence).toBeGreaterThan(0.4);
      expect(result.evidence).toContain('Bio mentions research activity');
    });

    it('should detect professional from LinkedIn and job title', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Professional',
        email: 'john@company.com',
        linkedIn: 'https://linkedin.com/in/johnprofessional',
        companyName: 'Tech Corp',
        jobTitle: 'Senior Software Engineer',
        bio: 'Working as a professional in tech industry',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('professional');
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('Has LinkedIn profile');
    });

    it('should detect enterprise from large company size', async () => {
      const profile: UserProfile = {
        firstName: 'Jane',
        lastName: 'Manager',
        email: 'jane@bigcorp.com',
        companyName: 'Big Corporation',
        companySize: 5000,
        industry: 'Technology',
        jobTitle: 'VP of Engineering',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('enterprise');
      expect(result.confidence).toBeGreaterThan(0.4);
      expect(result.evidence).toContain('Large company size');
    });

    it('should detect non-profit from tax ID', async () => {
      const profile: UserProfile = {
        firstName: 'Alice',
        lastName: 'Director',
        email: 'alice@nonprofit.org',
        taxId: '12-3456789',
        bio: 'Director of a non-profit organization',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('non-profit');
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('Has tax ID');
    });

    it('should detect government from agency type and jurisdiction', async () => {
      const profile: UserProfile = {
        firstName: 'Bob',
        lastName: 'Officer',
        email: 'bob@state.gov',
        agencyType: 'State Education Department',
        jurisdiction: 'California',
        bio: 'Government official',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('government');
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('Has agency type');
    });

    it('should detect founder from expertise and bio', async () => {
      const profile: UserProfile = {
        firstName: 'Sarah',
        lastName: 'Founder',
        email: 'sarah@startup.com',
        expertise: ['Product Management', 'Entrepreneurship'],
        bio: 'I am launching an innovative educational platform',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('founder');
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('Bio mentions entrepreneurial activity');
    });

    it('should throw error when unable to detect user type', async () => {
      const profile: UserProfile = {
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown@example.com',
      };

      await expect(service.detectUserType(profile)).rejects.toThrow(
        'Unable to detect user type from provided information'
      );
    });

    it('should require verification for high confidence detections', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
        learningGoals: ['Learn programming'],
        interests: ['Technology'],
      };

      const result = await service.detectUserType(profile);

      expect(result.requiresVerification).toBe(true);
      expect(result.verificationMethod).toBeDefined();
    });
  });

  describe('verifyUserType', () => {
    it('should verify student with .edu email', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
      };

      const result = await service.verifyUserType('student', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('student');
      expect(result.verificationMethod).toBe('student_verification');
    });

    it('should fail to verify student without .edu email', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const result = await service.verifyUserType('student', profile);

      expect(result.verified).toBe(false);
    });

    it('should verify teacher with institution and credentials', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Professor',
        email: 'prof@university.edu',
        institution: 'MIT',
        credentials: ['PhD in Computer Science'],
      };

      const result = await service.verifyUserType('teacher', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('teacher');
      expect(result.verificationMethod).toBe('credential_verification');
    });

    it('should verify researcher with institution', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Researcher',
        email: 'researcher@university.edu',
        institution: 'Stanford',
      };

      const result = await service.verifyUserType('researcher', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('researcher');
      expect(result.verificationMethod).toBe('affiliation_verification');
    });

    it('should verify professional with LinkedIn or company info', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Professional',
        email: 'john@company.com',
        linkedIn: 'https://linkedin.com/in/johnprofessional',
      };

      const result = await service.verifyUserType('professional', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('professional');
      expect(result.verificationMethod).toBe('linkedin_verification');
    });

    it('should verify enterprise with company size', async () => {
      const profile: UserProfile = {
        firstName: 'Jane',
        lastName: 'Manager',
        email: 'jane@bigcorp.com',
        companyName: 'Big Corporation',
        companySize: 5000,
      };

      const result = await service.verifyUserType('enterprise', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('enterprise');
      expect(result.verificationMethod).toBe('business_verification');
    });

    it('should verify non-profit with tax ID', async () => {
      const profile: UserProfile = {
        firstName: 'Alice',
        lastName: 'Director',
        email: 'alice@nonprofit.org',
        taxId: '12-3456789',
      };

      const result = await service.verifyUserType('non-profit', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('non-profit');
      expect(result.verificationMethod).toBe('nonprofit_verification');
    });

    it('should verify government with agency type and jurisdiction', async () => {
      const profile: UserProfile = {
        firstName: 'Bob',
        lastName: 'Officer',
        email: 'bob@state.gov',
        agencyType: 'State Education Department',
        jurisdiction: 'California',
      };

      const result = await service.verifyUserType('government', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('government');
      expect(result.verificationMethod).toBe('government_verification');
    });

    it('should verify founder with basic info', async () => {
      const profile: UserProfile = {
        firstName: 'Sarah',
        lastName: 'Founder',
        email: 'sarah@startup.com',
      };

      const result = await service.verifyUserType('founder', profile);

      expect(result.verified).toBe(true);
      expect(result.userType).toBe('founder');
      expect(result.verificationMethod).toBe('kyc_aml');
    });

    it('should throw error for unknown user type', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      await expect(service.verifyUserType('unknown' as any, profile)).rejects.toThrow(
        'Unknown user type: unknown'
      );
    });

    it('should include timestamp in verification result', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
      };

      const result = await service.verifyUserType('student', profile);

      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should include details in verification result', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
      };

      const result = await service.verifyUserType('student', profile);

      expect(result.details).toBeDefined();
      expect(result.details.method).toBe('student_verification');
    });
  });

  describe('edge cases', () => {
    it('should handle profile with minimal information', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      await expect(service.detectUserType(profile)).rejects.toThrow();
    });

    it('should prioritize higher confidence detections', async () => {
      const profile: UserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
        learningGoals: ['Learn programming'],
        expertise: ['Teaching'],
        credentials: ['Teaching Certificate'],
      };

      const result = await service.detectUserType(profile);

      // Should detect as student due to .edu email (highest confidence)
      expect(result.userType).toBe('student');
    });

    it('should handle case-insensitive keyword matching', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Professor',
        email: 'prof@university.edu',
        institution: 'MIT',
        credentials: ['PhD'],
        bio: 'I am a PROFESSOR and EDUCATOR at the university',
      };

      const result = await service.detectUserType(profile);

      expect(result.userType).toBe('teacher');
      expect(result.evidence).toContain('Bio mentions teaching role');
    });

    it('should handle multiple evidence points', async () => {
      const profile: UserProfile = {
        firstName: 'Dr',
        lastName: 'Researcher',
        email: 'researcher@university.edu',
        institution: 'Stanford',
        expertise: ['Machine Learning'],
        bio: 'I conduct academic research in AI',
        jobTitle: 'Research Scientist',
      };

      const result = await service.detectUserType(profile);

      expect(result.evidence.length).toBeGreaterThan(1);
    });
  });
});
