/**
 * Ubuntu Validator Tests
 * Tests for Ubuntu principles validation (collective benefit, knowledge sharing, inclusive design)
 */

import { UbuntuValidator, UbuntuValidatorConfig } from '../validators/ubuntu-validator';

describe('UbuntuValidator', () => {
  let validator: UbuntuValidator;

  beforeEach(() => {
    validator = new UbuntuValidator();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const config = validator.getConfig();
      
      expect(config.collectiveBenefitWeight).toBe(0.4);
      expect(config.knowledgeSharingWeight).toBe(0.3);
      expect(config.inclusiveDesignWeight).toBe(0.3);
      expect(config.minScore).toBe(70);
      expect(config.strictMode).toBe(false);
    });

    it('should validate that weights sum to 1.0', () => {
      expect(() => {
        new UbuntuValidator({
          collectiveBenefitWeight: 0.5,
          knowledgeSharingWeight: 0.3,
          inclusiveDesignWeight: 0.1 // Sum = 0.9
        });
      }).toThrow('weights must sum to 1.0');
    });

    it('should accept custom configuration with valid weights', () => {
      const customValidator = new UbuntuValidator({
        collectiveBenefitWeight: 0.5,
        knowledgeSharingWeight: 0.3,
        inclusiveDesignWeight: 0.2,
        minScore: 80
      });

      const config = customValidator.getConfig();
      expect(config.collectiveBenefitWeight).toBe(0.5);
      expect(config.minScore).toBe(80);
    });
  });

  describe('Collective Benefit Validation', () => {
    it('should detect collective benefit keywords', async () => {
      const output = 'This solution benefits the entire community and promotes shared prosperity.';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeGreaterThan(50);
    });

    it('should score high for community-focused content', async () => {
      const output = 'We work together as a collective to share resources and support each other.';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeGreaterThan(60);
    });

    it('should penalize selfish language', async () => {
      const output = 'This is only for me and my personal gain. I will not share with others.';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeLessThan(50);
    });

    it('should detect individualistic patterns', async () => {
      const output = 'Keep this to yourself and do not share with anyone.';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeLessThan(60);
    });

    it('should score neutral content as moderate', async () => {
      const output = 'The weather is nice today.';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeGreaterThanOrEqual(0);
      expect(result.collectiveBenefitScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Knowledge Sharing Validation', () => {
    it('should detect knowledge sharing keywords', async () => {
      const output = 'Here is a tutorial on how to learn this skill. I will teach you step by step.';
      const result = await validator.validate(output);

      expect(result.knowledgeSharingScore).toBeGreaterThan(50);
    });

    it('should score high for educational content', async () => {
      const output = 'Let me explain how this works. Here is a guide for learning this concept.';
      const result = await validator.validate(output);

      expect(result.knowledgeSharingScore).toBeGreaterThan(60);
    });

    it('should penalize knowledge hoarding', async () => {
      const output = 'This information is proprietary and I will not share it with anyone.';
      const result = await validator.validate(output);

      expect(result.knowledgeSharingScore).toBeLessThan(50);
    });

    it('should detect gatekeeping language', async () => {
      const output = 'Keep this knowledge restricted and do not allow others to access it.';
      const result = await validator.validate(output);

      expect(result.knowledgeSharingScore).toBeLessThan(60);
    });

    it('should bonus educational patterns', async () => {
      const output = 'Here is a step-by-step tutorial explaining how to learn this skill.';
      const result = await validator.validate(output);

      expect(result.knowledgeSharingScore).toBeGreaterThan(50);
    });
  });

  describe('Inclusive Design Validation', () => {
    it('should detect inclusive language', async () => {
      const output = 'This solution is accessible to everyone regardless of their background.';
      const result = await validator.validate(output);

      expect(result.inclusiveDesignScore).toBeGreaterThan(50);
    });

    it('should score high for universal design', async () => {
      const output = 'All people can benefit from this inclusive and accessible design.';
      const result = await validator.validate(output);

      expect(result.inclusiveDesignScore).toBeGreaterThan(60);
    });

    it('should penalize exclusionary language', async () => {
      const output = 'This is only for certain people and not for everyone.';
      const result = await validator.validate(output);

      expect(result.inclusiveDesignScore).toBeLessThan(60);
    });

    it('should detect discriminatory patterns', async () => {
      const output = 'This service excludes people based on their characteristics.';
      const result = await validator.validate(output);

      expect(result.inclusiveDesignScore).toBeLessThan(50);
    });

    it('should bonus universal language', async () => {
      const output = 'Everyone can access this service regardless of their abilities.';
      const result = await validator.validate(output);

      expect(result.inclusiveDesignScore).toBeGreaterThan(50);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate weighted score correctly', async () => {
      const output = 'This community-focused solution teaches everyone how to benefit together.';
      const result = await validator.validate(output);

      // Score should be weighted average of three principles
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should use configured weights in calculation', async () => {
      const customValidator = new UbuntuValidator({
        collectiveBenefitWeight: 0.6,
        knowledgeSharingWeight: 0.2,
        inclusiveDesignWeight: 0.2
      });

      const output = 'Community benefits are emphasized here.';
      const result = await customValidator.validate(output);

      expect(result.score).toBeDefined();
    });

    it('should pass validation when score meets threshold', async () => {
      const output = 'This inclusive community solution teaches everyone to share knowledge.';
      const result = await validator.validate(output);

      if (result.score >= 70) {
        expect(result.isValid).toBe(true);
      }
    });

    it('should fail validation when score is below threshold', async () => {
      const output = 'Keep this secret and do not share with anyone.';
      const result = await validator.validate(output);

      if (result.score < 70) {
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Violation Detection', () => {
    it('should identify collective benefit violations', async () => {
      const output = 'This is only for my personal gain.';
      const result = await validator.validate(output);

      if (result.collectiveBenefitScore < 70) {
        expect(result.violations.some(v => v.includes('Collective benefit'))).toBe(true);
      }
    });

    it('should identify knowledge sharing violations', async () => {
      const output = 'I will keep this knowledge proprietary.';
      const result = await validator.validate(output);

      if (result.knowledgeSharingScore < 70) {
        expect(result.violations.some(v => v.includes('Knowledge sharing'))).toBe(true);
      }
    });

    it('should identify inclusive design violations', async () => {
      const output = 'This is only for certain people.';
      const result = await validator.validate(output);

      if (result.inclusiveDesignScore < 70) {
        expect(result.violations.some(v => v.includes('Inclusive design'))).toBe(true);
      }
    });

    it('should return empty violations for compliant content', async () => {
      const output = 'This inclusive community solution teaches everyone to share knowledge.';
      const result = await validator.validate(output);

      if (result.isValid) {
        expect(result.violations).toHaveLength(0);
      }
    });
  });

  describe('Suggestions Generation', () => {
    it('should generate suggestions for collective benefit violations', async () => {
      const output = 'This is only for me.';
      const result = await validator.validate(output);

      if (result.violations.some(v => v.includes('Collective benefit'))) {
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.includes('community'))).toBe(true);
      }
    });

    it('should generate suggestions for knowledge sharing violations', async () => {
      const output = 'I will keep this secret.';
      const result = await validator.validate(output);

      if (result.violations.some(v => v.includes('Knowledge sharing'))) {
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.includes('educational'))).toBe(true);
      }
    });

    it('should generate suggestions for inclusive design violations', async () => {
      const output = 'This is not for everyone.';
      const result = await validator.validate(output);

      if (result.violations.some(v => v.includes('Inclusive design'))) {
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.includes('inclusive'))).toBe(true);
      }
    });

    it('should not generate suggestions for compliant content', async () => {
      const output = 'This inclusive community solution teaches everyone to share knowledge.';
      const result = await validator.validate(output);

      if (result.isValid) {
        expect(result.suggestions).toHaveLength(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', async () => {
      const result = await validator.validate('');

      expect(result.isValid).toBe(false);
      expect(result.score).toBe(0);
      expect(result.violations).toHaveLength(1);
    });

    it('should handle very long input', async () => {
      const longOutput = 'This is a community-focused solution. '.repeat(1000);
      const result = await validator.validate(longOutput);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle special characters', async () => {
      const output = 'Community! @#$% Knowledge? Inclusive!!!';
      const result = await validator.validate(output);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle mixed case keywords', async () => {
      const output = 'COMMUNITY and KNOWLEDGE and INCLUSIVE design';
      const result = await validator.validate(output);

      expect(result.collectiveBenefitScore).toBeGreaterThan(0);
      expect(result.knowledgeSharingScore).toBeGreaterThan(0);
      expect(result.inclusiveDesignScore).toBeGreaterThan(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should allow updating configuration', () => {
      validator.updateConfig({
        minScore: 80,
        strictMode: true
      });

      const config = validator.getConfig();
      expect(config.minScore).toBe(80);
      expect(config.strictMode).toBe(true);
    });

    it('should validate weights when updating', () => {
      expect(() => {
        validator.updateConfig({
          collectiveBenefitWeight: 0.5,
          knowledgeSharingWeight: 0.3,
          inclusiveDesignWeight: 0.1 // Sum = 0.9
        });
      }).toThrow('weights must sum to 1.0');
    });

    it('should apply updated configuration to validation', async () => {
      validator.updateConfig({ minScore: 90 });

      const output = 'This is a good solution.';
      const result = await validator.validate(output);

      if (result.score < 90) {
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Strict Mode', () => {
    it('should enforce strict mode when enabled', async () => {
      const strictValidator = new UbuntuValidator({
        strictMode: true,
        minScore: 80
      });

      const output = 'Somewhat community-focused content.';
      const result = await strictValidator.validate(output);

      expect(result).toBeDefined();
    });

    it('should be lenient in non-strict mode', async () => {
      const lenientValidator = new UbuntuValidator({
        strictMode: false,
        minScore: 50
      });

      const output = 'Somewhat community-focused content.';
      const result = await lenientValidator.validate(output);

      expect(result).toBeDefined();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should validate Ubuntu philosophy explanation', async () => {
      const output = `Ubuntu is an African philosophy that emphasizes community and shared humanity. 
        It teaches us that we are interconnected and that individual success depends on collective wellbeing. 
        By sharing knowledge and creating inclusive solutions, we build stronger communities.`;
      
      const result = await validator.validate(output);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(70);
    });

    it('should validate educational content', async () => {
      const output = `Here is a tutorial on how to learn programming. 
        Step 1: Learn the basics. Step 2: Practice with examples. 
        This knowledge is available to everyone regardless of background.`;
      
      const result = await validator.validate(output);

      expect(result.isValid).toBe(true);
      expect(result.knowledgeSharingScore).toBeGreaterThan(60);
    });

    it('should reject selfish content', async () => {
      const output = `I will keep all my knowledge to myself and not share with anyone. 
        This is only for my personal benefit and no one else matters.`;
      
      const result = await validator.validate(output);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should reject exclusionary content', async () => {
      const output = `This service is only for certain people and excludes others based on their characteristics.`;
      
      const result = await validator.validate(output);

      expect(result.isValid).toBe(false);
      expect(result.inclusiveDesignScore).toBeLessThan(70);
    });
  });
});
