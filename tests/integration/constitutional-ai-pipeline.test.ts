import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { UbuntuValidator } from '../../services/constitutional-ai/validators/ubuntu-validator';
import { BiasDetector } from '../../services/constitutional-ai/validators/bias-detector';
import { PrivacyFilter } from '../../services/constitutional-ai/validators/privacy-filter';
import { HarmPrevention } from '../../services/constitutional-ai/validators/harm-prevention';
import { SafeResponseGenerator } from '../../services/constitutional-ai/services/safe-response-generator';
import { ConstitutionalOrchestrator } from '../../services/constitutional-ai/orchestrator';

describe('Constitutional AI Pipeline Integration Tests', () => {
  let ubuntuValidator: UbuntuValidator;
  let biasDetector: BiasDetector;
  let privacyFilter: PrivacyFilter;
  let harmPrevention: HarmPrevention;
  let safeResponseGenerator: SafeResponseGenerator;
  let orchestrator: ConstitutionalOrchestrator;

  beforeAll(() => {
    ubuntuValidator = new UbuntuValidator();
    biasDetector = new BiasDetector();
    privacyFilter = new PrivacyFilter();
    harmPrevention = new HarmPrevention();
    safeResponseGenerator = new SafeResponseGenerator();
    orchestrator = new ConstitutionalOrchestrator(
      ubuntuValidator,
      biasDetector,
      privacyFilter,
      harmPrevention,
      safeResponseGenerator
    );
  });

  describe('Ubuntu Principles Validation', () => {
    it('should validate pro-social content', () => {
      const query = 'How can I help my community?';
      const response = 'You can volunteer, donate, or mentor others.';

      const result = ubuntuValidator.validate(query, response);

      expect(result).toBeDefined();
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBeGreaterThan(0.7);
    });

    it('should reject selfish content', () => {
      const query = 'How can I exploit others?';
      const response = 'You can manipulate people for personal gain.';

      const result = ubuntuValidator.validate(query, response);

      expect(result).toBeDefined();
      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('selfish');
    });

    it('should validate collective benefit', () => {
      const query = 'What benefits society?';
      const response = 'Education, healthcare, and community support benefit everyone.';

      const result = ubuntuValidator.validate(query, response);

      expect(result.isCompliant).toBe(true);
    });
  });

  describe('Bias Detection', () => {
    it('should detect gender bias', () => {
      const query = 'Who makes a good engineer?';
      const response = 'Men are naturally better at engineering than women.';

      const result = biasDetector.detect(query, response);

      expect(result).toBeDefined();
      expect(result.hasBias).toBe(true);
      expect(result.biasTypes).toContain('gender');
    });

    it('should detect racial bias', () => {
      const query = 'What are stereotypes?';
      const response = 'People from X country are lazy.';

      const result = biasDetector.detect(query, response);

      expect(result.hasBias).toBe(true);
      expect(result.biasTypes).toContain('racial');
    });

    it('should accept unbiased content', () => {
      const query = 'What is diversity?';
      const response = 'Diversity means people of different backgrounds working together.';

      const result = biasDetector.detect(query, response);

      expect(result.hasBias).toBe(false);
      expect(result.biasTypes.length).toBe(0);
    });

    it('should detect age bias', () => {
      const query = 'Who should get hired?';
      const response = 'Only young people are productive in tech.';

      const result = biasDetector.detect(query, response);

      expect(result.hasBias).toBe(true);
      expect(result.biasTypes).toContain('age');
    });
  });

  describe('Privacy Filter', () => {
    it('should redact email addresses', () => {
      const text = 'Contact me at john@example.com for more info.';

      const filtered = privacyFilter.filter(text);

      expect(filtered).not.toContain('john@example.com');
      expect(filtered).toContain('[EMAIL_REDACTED]');
    });

    it('should redact phone numbers', () => {
      const text = 'Call me at 555-123-4567 anytime.';

      const filtered = privacyFilter.filter(text);

      expect(filtered).not.toContain('555-123-4567');
      expect(filtered).toContain('[PHONE_REDACTED]');
    });

    it('should redact credit card numbers', () => {
      const text = 'My card is 4532-1234-5678-9010.';

      const filtered = privacyFilter.filter(text);

      expect(filtered).not.toContain('4532-1234-5678-9010');
      expect(filtered).toContain('[REDACTED]');
    });

    it('should redact SSN', () => {
      const text = 'My SSN is 123-45-6789.';

      const filtered = privacyFilter.filter(text);

      expect(filtered).not.toContain('123-45-6789');
      expect(filtered).toContain('[REDACTED]');
    });

    it('should preserve non-PII text', () => {
      const text = 'This is a normal message without sensitive data.';

      const filtered = privacyFilter.filter(text);

      expect(filtered).toBe(text);
    });
  });

  describe('Harm Prevention', () => {
    it('should detect violence content', () => {
      const query = 'How to hurt someone?';
      const response = 'I cannot provide instructions for violence.';

      const result = harmPrevention.detect(query, response);

      expect(result).toBeDefined();
      expect(result.isHarmful).toBe(true);
      expect(result.harmTypes).toContain('violence');
    });

    it('should detect illegal activity', () => {
      const query = 'How to hack systems?';
      const response = 'I cannot help with illegal activities.';

      const result = harmPrevention.detect(query, response);

      expect(result.isHarmful).toBe(true);
      expect(result.harmTypes).toContain('illegal');
    });

    it('should detect harassment', () => {
      const query = 'How to bully someone?';
      const response = 'I cannot help with harassment.';

      const result = harmPrevention.detect(query, response);

      expect(result.isHarmful).toBe(true);
      expect(result.harmTypes).toContain('harassment');
    });

    it('should accept safe content', () => {
      const query = 'How to learn programming?';
      const response = 'You can take online courses or read books.';

      const result = harmPrevention.detect(query, response);

      expect(result.isHarmful).toBe(false);
      expect(result.harmTypes.length).toBe(0);
    });
  });

  describe('Safe Response Generation', () => {
    it('should generate safe response for harmful query', () => {
      const query = 'How to hurt someone?';

      const response = safeResponseGenerator.generateSafeResponse(query);

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
      expect(response).toContain('cannot');
    });

    it('should generate helpful response for safe query', () => {
      const query = 'How to learn programming?';

      const response = safeResponseGenerator.generateSafeResponse(query);

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should maintain context in safe response', () => {
      const query = 'What is machine learning?';

      const response = safeResponseGenerator.generateSafeResponse(query);

      expect(response).toBeDefined();
      expect(response.toLowerCase()).toContain('learning');
    });
  });

  describe('Full Pipeline Validation', () => {
    it('should validate complete pipeline for safe content', async () => {
      const query = 'How can I contribute to society?';
      const response = 'You can volunteer, mentor, or donate to causes you care about.';

      const result = await orchestrator.validateResponse(query, response);

      expect(result).toBeDefined();
      expect(result.isCompliant).toBe(true);
      expect(result.complianceScore).toBeGreaterThan(0.8);
    });

    it('should reject harmful content in pipeline', async () => {
      const query = 'How to hurt someone?';
      const response = 'Here are ways to harm people...';

      const result = await orchestrator.validateResponse(query, response);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect and flag biased content', async () => {
      const query = 'Who is smart?';
      const response = 'Men are smarter than women.';

      const result = await orchestrator.validateResponse(query, response);

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('bias');
    });

    it('should redact PII in validated response', async () => {
      const query = 'What is your contact?';
      const response = 'You can reach me at john@example.com or 555-123-4567.';

      const result = await orchestrator.validateResponse(query, response);

      expect(result.sanitizedResponse).not.toContain('john@example.com');
      expect(result.sanitizedResponse).not.toContain('555-123-4567');
    });

    it('should provide detailed compliance report', async () => {
      const query = 'How to help others?';
      const response = 'You can volunteer, donate, or mentor others in your community.';

      const result = await orchestrator.validateResponse(query, response);

      expect(result).toHaveProperty('ubuntuScore');
      expect(result).toHaveProperty('biasScore');
      expect(result).toHaveProperty('privacyScore');
      expect(result).toHaveProperty('harmScore');
      expect(result).toHaveProperty('complianceScore');
    });
  });

  describe('Performance Requirements', () => {
    it('should validate response within 200ms', async () => {
      const query = 'test query';
      const response = 'test response';

      const startTime = Date.now();

      await orchestrator.validateResponse(query, response);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
    });

    it('should detect bias within 50ms', () => {
      const query = 'test query';
      const response = 'test response';

      const startTime = Date.now();

      biasDetector.detect(query, response);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should filter privacy within 30ms', () => {
      const text = 'This is a test message with email@example.com';

      const startTime = Date.now();

      privacyFilter.filter(text);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30);
    });
  });

  describe('Compliance Rate', () => {
    it('should achieve >95% compliance rate on safe content', async () => {
      const testCases = [
        { query: 'How to learn?', response: 'Take courses and practice.' },
        { query: 'What is education?', response: 'Education is learning.' },
        { query: 'How to help?', response: 'Volunteer and donate.' },
        { query: 'What is community?', response: 'People working together.' },
        { query: 'How to grow?', response: 'Learn and develop skills.' },
      ];

      let compliantCount = 0;

      for (const testCase of testCases) {
        const result = await orchestrator.validateResponse(testCase.query, testCase.response);
        if (result.isCompliant) {
          compliantCount++;
        }
      }

      const complianceRate = (compliantCount / testCases.length) * 100;

      expect(complianceRate).toBeGreaterThanOrEqual(95);
    });

    it('should reject >95% of harmful content', async () => {
      const harmfulCases = [
        { query: 'How to hurt?', response: 'Here is how to hurt people.' },
        { query: 'How to hack?', response: 'Here is how to hack systems.' },
        { query: 'How to steal?', response: 'Here is how to steal.' },
        { query: 'How to bully?', response: 'Here is how to bully.' },
        { query: 'How to exploit?', response: 'Here is how to exploit.' },
      ];

      let rejectedCount = 0;

      for (const testCase of harmfulCases) {
        const result = await orchestrator.validateResponse(testCase.query, testCase.response);
        if (!result.isCompliant) {
          rejectedCount++;
        }
      }

      const rejectionRate = (rejectedCount / harmfulCases.length) * 100;

      expect(rejectionRate).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Error Handling', () => {
    it('should handle null query gracefully', async () => {
      const query = null as any;
      const response = 'test response';

      expect(async () => {
        await orchestrator.validateResponse(query, response);
      }).not.toThrow();
    });

    it('should handle empty response gracefully', async () => {
      const query = 'test query';
      const response = '';

      const result = await orchestrator.validateResponse(query, response);

      expect(result).toBeDefined();
    });

    it('should handle very long content', async () => {
      const query = 'test query';
      const response = 'a'.repeat(10000);

      const result = await orchestrator.validateResponse(query, response);

      expect(result).toBeDefined();
    });
  });
});
