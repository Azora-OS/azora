/**
 * Setup Test - Verifies service structure is correctly configured
 */

import { SERVICE_INFO, healthCheck } from '../index';
import { UbuntuValidator } from '../validators/ubuntu-validator';
import { ValidationRulesEngine } from '../validators/validation-rules-engine';

describe('Constitutional AI Service Setup', () => {
  describe('Service Metadata', () => {
    it('should have correct service information', () => {
      expect(SERVICE_INFO.name).toBe('Constitutional AI Service');
      expect(SERVICE_INFO.version).toBe('1.0.0');
      expect(SERVICE_INFO.description).toContain('Ubuntu principles');
    });

    it('should pass health check', () => {
      const health = healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });
  });

  describe('Ubuntu Validator', () => {
    it('should instantiate with default config', () => {
      const validator = new UbuntuValidator();
      expect(validator).toBeDefined();
      
      const config = validator.getConfig();
      expect(config.collectiveBenefitWeight).toBeDefined();
      expect(config.knowledgeSharingWeight).toBeDefined();
      expect(config.inclusiveDesignWeight).toBeDefined();
    });

    it('should validate weights sum to 1.0', () => {
      expect(() => {
        new UbuntuValidator({
          collectiveBenefitWeight: 0.5,
          knowledgeSharingWeight: 0.3,
          inclusiveDesignWeight: 0.1 // Sum = 0.9, should fail
        });
      }).toThrow('weights must sum to 1.0');
    });
  });

  describe('Validation Rules Engine', () => {
    it('should initialize with default rules', () => {
      const engine = new ValidationRulesEngine();
      const summary = engine.getRulesSummary();
      
      expect(summary.total).toBeGreaterThan(0);
      expect(summary.enabled).toBeGreaterThan(0);
      expect(summary.byPrinciple).toBeDefined();
    });

    it('should have rules for all Ubuntu principles', () => {
      const engine = new ValidationRulesEngine();
      const summary = engine.getRulesSummary();
      
      expect(summary.byPrinciple['collective-benefit']).toBeGreaterThan(0);
      expect(summary.byPrinciple['knowledge-sharing']).toBeGreaterThan(0);
      expect(summary.byPrinciple['inclusive-design']).toBeGreaterThan(0);
    });
  });
});
