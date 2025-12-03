/**
 * Onboarding Service Tests
 * 
 * Tests for session management and step progression
 */

import { OnboardingService } from '../services/onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    service = new OnboardingService();
  });

  describe('createSession', () => {
    it('should create a session for founder', async () => {
      const session = await service.createSession('user123', 'founder');

      expect(session.userId).toBe('user123');
      expect(session.userType).toBe('founder');
      expect(session.status).toBe('started');
      expect(session.currentStep).toBe('welcome');
      expect(session.completedSteps).toHaveLength(0);
    });

    it('should create a session for student', async () => {
      const session = await service.createSession('user456', 'student');

      expect(session.userId).toBe('user456');
      expect(session.userType).toBe('student');
      expect(session.status).toBe('started');
      expect(session.currentStep).toBe('welcome');
    });

    it('should create a session for teacher', async () => {
      const session = await service.createSession('user789', 'teacher');

      expect(session.userType).toBe('teacher');
      expect(session.status).toBe('started');
    });

    it('should create a session for all user types', async () => {
      const userTypes = ['founder', 'student', 'teacher', 'researcher', 'professional', 'enterprise', 'non-profit', 'government'] as const;

      for (const userType of userTypes) {
        const session = await service.createSession(`user_${userType}`, userType);
        expect(session.userType).toBe(userType);
        expect(session.status).toBe('started');
      }
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const created = await service.createSession('user123', 'founder');
      const retrieved = await service.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe('user123');
      expect(retrieved?.userType).toBe('founder');
    });

    it('should return null for non-existent session', async () => {
      const session = await service.getSession('non_existent_session');

      expect(session).toBeNull();
    });
  });

  describe('updateProfileData', () => {
    it('should update profile data', async () => {
      const session = await service.createSession('user123', 'founder');
      const updated = await service.updateProfileData(session.id, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      expect(updated.profileData.firstName).toBe('John');
      expect(updated.profileData.lastName).toBe('Doe');
      expect(updated.profileData.email).toBe('john@example.com');
      expect(updated.status).toBe('in_progress');
    });

    it('should merge profile data', async () => {
      const session = await service.createSession('user123', 'founder');
      await service.updateProfileData(session.id, { firstName: 'John' });
      const updated = await service.updateProfileData(session.id, { lastName: 'Doe' });

      expect(updated.profileData.firstName).toBe('John');
      expect(updated.profileData.lastName).toBe('Doe');
    });
  });

  describe('progressToNextStep', () => {
    it('should progress to next step', async () => {
      const session = await service.createSession('user123', 'founder');
      const result = await service.progressToNextStep(session.id);

      expect(result.currentStep).toBe('profile');
      expect(result.isComplete).toBe(false);
      expect(result.progress).toBeGreaterThan(0);
    });

    it('should mark step as completed', async () => {
      const session = await service.createSession('user123', 'founder');
      await service.progressToNextStep(session.id);
      const updated = await service.getSession(session.id);

      expect(updated?.completedSteps).toContain('welcome');
    });

    it('should complete onboarding when all steps done', async () => {
      const session = await service.createSession('user123', 'student');
      let result = await service.progressToNextStep(session.id);

      while (!result.isComplete) {
        result = await service.progressToNextStep(session.id);
      }

      const final = await service.getSession(session.id);
      expect(final?.status).toBe('completed');
      expect(final?.completedAt).toBeDefined();
    });

    it('should calculate progress percentage', async () => {
      const session = await service.createSession('user123', 'student');
      const result1 = await service.progressToNextStep(session.id);

      expect(result1.progress).toBeGreaterThan(0);
      expect(result1.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('getCurrentStep', () => {
    it('should get current step details', async () => {
      const session = await service.createSession('user123', 'founder');
      const step = await service.getCurrentStep(session.id);

      expect(step).not.toBeNull();
      expect(step?.id).toBe('welcome');
      expect(step?.name).toBe('Welcome');
    });

    it('should return null for invalid session', async () => {
      const step = await service.getCurrentStep('invalid_session');

      expect(step).toBeNull();
    });
  });

  describe('getSteps', () => {
    it('should get all steps for founder', async () => {
      const steps = await service.getSteps('founder');

      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].id).toBe('welcome');
      expect(steps.every(s => s.userTypes.includes('founder'))).toBe(true);
    });

    it('should get all steps for student', async () => {
      const steps = await service.getSteps('student');

      expect(steps.length).toBeGreaterThan(0);
      expect(steps.every(s => s.userTypes.includes('student'))).toBe(true);
    });

    it('should have different step counts for different user types', async () => {
      const founderSteps = await service.getSteps('founder');
      const studentSteps = await service.getSteps('student');

      expect(founderSteps.length).not.toBe(studentSteps.length);
    });
  });

  describe('getProgress', () => {
    it('should calculate progress correctly', async () => {
      const session = await service.createSession('user123', 'student');
      const progress1 = await service.getProgress(session.id);

      expect(progress1.completed).toBe(0);
      expect(progress1.total).toBeGreaterThan(0);
      expect(progress1.percentage).toBe(0);

      await service.progressToNextStep(session.id);
      const progress2 = await service.getProgress(session.id);

      expect(progress2.completed).toBe(1);
      expect(progress2.percentage).toBeGreaterThan(0);
    });
  });

  describe('validateProfileData', () => {
    it('should validate required fields', async () => {
      const result = await service.validateProfileData('founder', {});

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept valid profile data', async () => {
      const result = await service.validateProfileData('founder', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate email format', async () => {
      const result = await service.validateProfileData('founder', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email format is invalid');
    });

    it('should validate enterprise-specific fields', async () => {
      const result = await service.validateProfileData('enterprise', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Company name is required');
    });

    it('should provide warnings for optional fields', async () => {
      const result = await service.validateProfileData('founder', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('completeSession', () => {
    it('should mark session as completed', async () => {
      const session = await service.createSession('user123', 'founder');
      const completed = await service.completeSession(session.id);

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });
  });

  describe('abandonSession', () => {
    it('should mark session as abandoned', async () => {
      const session = await service.createSession('user123', 'founder');
      const abandoned = await service.abandonSession(session.id);

      expect(abandoned.status).toBe('abandoned');
      expect(abandoned.abandonedAt).toBeDefined();
    });
  });

  describe('session flow', () => {
    it('should complete full onboarding flow', async () => {
      // Create session
      const session = await service.createSession('user123', 'student');
      expect(session.status).toBe('started');

      // Update profile
      await service.updateProfileData(session.id, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@university.edu',
      });

      // Progress through steps
      let result = await service.progressToNextStep(session.id);
      while (!result.isComplete) {
        result = await service.progressToNextStep(session.id);
      }

      // Verify completion
      const final = await service.getSession(session.id);
      expect(final?.status).toBe('completed');
      expect(final?.completedAt).toBeDefined();
      expect(final?.profileData.firstName).toBe('John');
    });
  });
});
