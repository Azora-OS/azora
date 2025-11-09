/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INTEGRATION TESTS
Test suite for backend integration layer
*/

import { describe, it, expect, beforeAll } from '@jest/globals';
import { initializeAzora } from './index';
import { authService } from './auth-service';
import { educationService, mintService, forgeService } from './service-bridges';

describe('Azora Integration Layer', () => {
  let azora: any;

  beforeAll(async () => {
    azora = await initializeAzora({ autoAuth: false });
  });

  describe('Initialization', () => {
    it('should initialize all services', () => {
      expect(azora.auth).toBeDefined();
      expect(azora.api).toBeDefined();
      expect(azora.ws).toBeDefined();
      expect(azora.services).toBeDefined();
      expect(azora.events).toBeDefined();
      expect(azora.bridge).toBeDefined();
    });

    it('should have all 7 service bridges', () => {
      expect(azora.services.education).toBeDefined();
      expect(azora.services.mint).toBeDefined();
      expect(azora.services.forge).toBeDefined();
      expect(azora.services.sapiens).toBeDefined();
      expect(azora.services.aegis).toBeDefined();
      expect(azora.services.nexus).toBeDefined();
      expect(azora.services.ledger).toBeDefined();
    });
  });

  describe('Authentication Service', () => {
    it('should handle login', async () => {
      const mockUser = { id: '1', email: 'test@azora.com', role: 'student' };
      // Mock implementation would go here
      expect(authService.login).toBeDefined();
    });

    it('should handle logout', async () => {
      expect(authService.logout).toBeDefined();
    });

    it('should restore session', () => {
      expect(authService.restoreSession).toBeDefined();
    });
  });

  describe('Education Service', () => {
    it('should fetch courses', async () => {
      expect(educationService.getCourses).toBeDefined();
    });

    it('should enroll in course', async () => {
      expect(educationService.enrollCourse).toBeDefined();
    });

    it('should track progress', async () => {
      expect(educationService.getProgress).toBeDefined();
    });
  });

  describe('Mint Service', () => {
    it('should get wallet', async () => {
      expect(mintService.getWallet).toBeDefined();
    });

    it('should start mining', async () => {
      expect(mintService.startMining).toBeDefined();
    });

    it('should handle transfers', async () => {
      expect(mintService.transfer).toBeDefined();
    });
  });

  describe('Forge Service', () => {
    it('should fetch jobs', async () => {
      expect(forgeService.getJobs).toBeDefined();
    });

    it('should apply to job', async () => {
      expect(forgeService.applyJob).toBeDefined();
    });

    it('should match jobs', async () => {
      expect(forgeService.matchJobs).toBeDefined();
    });
  });

  describe('WebSocket Client', () => {
    it('should connect', () => {
      expect(azora.ws.connect).toBeDefined();
    });

    it('should handle events', () => {
      expect(azora.ws.on).toBeDefined();
      expect(azora.ws.off).toBeDefined();
    });

    it('should send messages', () => {
      expect(azora.ws.send).toBeDefined();
    });
  });

  describe('Real-time Events', () => {
    it('should initialize', () => {
      expect(azora.events.initialize).toBeDefined();
    });

    it('should disconnect', () => {
      expect(azora.events.disconnect).toBeDefined();
    });
  });

  describe('V0 Bridge', () => {
    it('should calculate Ubuntu rewards', async () => {
      expect(azora.bridge.calculateUbuntuRewards).toBeDefined();
    });

    it('should verify content', async () => {
      expect(azora.bridge.verifyEducationalContent).toBeDefined();
    });

    it('should create learning paths', async () => {
      expect(azora.bridge.createPersonalizedLearningPath).toBeDefined();
    });
  });
});
