import { ConstitutionalOrchestrator } from '../../services/constitutional-ai/orchestrator';
import { UbuntuValidator } from '../../services/constitutional-ai/validators/ubuntu-validator';
import { BiasDetector } from '../../services/constitutional-ai/validators/bias-detector';
import { PrivacyFilter } from '../../services/constitutional-ai/validators/privacy-filter';
import { HarmPrevention } from '../../services/constitutional-ai/validators/harm-prevention';

describe('Constitutional AI Pipeline Integration', () => {
  let orchestrator: ConstitutionalOrchestrator;

  beforeAll(() => {
    orchestrator = new ConstitutionalOrchestrator();
  });

  describe('Full Validation Pipeline', () => {
    it('should validate output against all constitutional checks', async () => {
      const query = 'How can I learn programming?';
      const output = 'Programming is a valuable skill that promotes collective learning and knowledge sharing.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.isValid).toBe(true);
      expect(result.complianceScore).toBeGreaterThan(90);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect and mitigate bias in output', async () => {
      const query = 'What careers are best?';
      const biasedOutput = 'Men are naturally better at engineering, women are better at nursing.';

      const result = await orchestrator.validateOutput(query, biasedOutput);

      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'bias')).toBe(true);
      expect(result.complianceScore).toBeLessThan(50);
    });

    it('should detect and redact PII in output', async () => {
      const query = 'Who is the instructor?';
      const piiOutput = 'The instructor is John Doe, email: john@example.com, phone: 555-1234.';

      const result = await orchestrator.validateOutput(query, piiOutput);

      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'privacy')).toBe(true);
      expect(result.validatedOutput).not.toContain('john@example.com');
    });

    it('should detect harmful content', async () => {
      const query = 'How to cause harm?';
      const harmfulOutput = 'Here are instructions on how to create a weapon.';

      const result = await orchestrator.validateOutput(query, harmfulOutput);

      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'harm')).toBe(true);
    });

    it('should achieve 95% compliance rate on valid outputs', async () => {
      const validOutputs = [
        'Learning promotes collective benefit and knowledge sharing.',
        'Education should be inclusive and accessible to all.',
        'Ubuntu philosophy emphasizes community and shared prosperity.',
        'Diversity strengthens our collective understanding.',
        'Collaboration leads to better outcomes for everyone.'
      ];

      let complianceCount = 0;
      for (const output of validOutputs) {
        const result = await orchestrator.validateOutput('test query', output);
        if (result.isValid && result.complianceScore > 90) {
          complianceCount++;
        }
      }

      const complianceRate = (complianceCount / validOutputs.length) * 100;
      expect(complianceRate).toBeGreaterThanOrEqual(95);
    });

    it('should log all validation decisions', async () => {
      const query = 'Test query';
      const output = 'Test output';

      const result = await orchestrator.validateOutput(query, output);
      await orchestrator.logValidation(result);

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Ubuntu Principles Validation', () => {
    it('should validate collective benefit principle', async () => {
      const validator = new UbuntuValidator();
      const output = 'This solution benefits the entire community.';

      const result = await validator.validate(output);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should validate knowledge sharing principle', async () => {
      const validator = new UbuntuValidator();
      const output = 'We share knowledge openly to help others learn.';

      const result = await validator.validate(output);

      expect(result.isValid).toBe(true);
    });

    it('should validate inclusive design principle', async () => {
      const validator = new UbuntuValidator();
      const output = 'This design is accessible to people of all abilities.';

      const result = await validator.validate(output);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Bias Detection Integration', () => {
    it('should detect gender bias', async () => {
      const detector = new BiasDetector();
      const output = 'Women are not good at mathematics.';

      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes).toContain('gender');
    });

    it('should detect racial bias', async () => {
      const detector = new BiasDetector();
      const output = 'People from that country are lazy.';

      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes).toContain('race');
    });

    it('should mitigate detected bias', async () => {
      const detector = new BiasDetector();
      const biasedOutput = 'Men are better leaders than women.';

      const report = await detector.detectBias(biasedOutput);
      const mitigated = await detector.mitigateBias(biasedOutput, report.biasTypes);

      expect(mitigated).not.toContain('Men are better');
      expect(mitigated).toContain('leaders');
    });
  });

  describe('Privacy Filter Integration', () => {
    it('should detect email addresses', async () => {
      const filter = new PrivacyFilter();
      const output = 'Contact me at user@example.com';

      const result = await filter.filterPII(output);

      expect(result.hasPII).toBe(true);
      expect(result.piiTypes).toContain('email');
    });

    it('should detect phone numbers', async () => {
      const filter = new PrivacyFilter();
      const output = 'Call me at 555-123-4567';

      const result = await filter.filterPII(output);

      expect(result.hasPII).toBe(true);
      expect(result.piiTypes).toContain('phone');
    });

    it('should redact all PII', async () => {
      const filter = new PrivacyFilter();
      const output = 'John Doe, email: john@example.com, phone: 555-1234';

      const result = await filter.filterPII(output);
      const redacted = await filter.redactPII(output, result.matches);

      expect(redacted).not.toContain('john@example.com');
      expect(redacted).not.toContain('555-1234');
      expect(redacted).toContain('[REDACTED]');
    });
  });

  describe('Harm Prevention Integration', () => {
    it('should detect violent content', async () => {
      const prevention = new HarmPrevention();
      const output = 'Instructions on how to harm someone.';

      const assessment = await prevention.assessHarm('query', output);

      expect(assessment.isHarmful).toBe(true);
      expect(assessment.harmTypes).toContain('violence');
    });

    it('should detect hate speech', async () => {
      const prevention = new HarmPrevention();
      const output = 'Hateful speech targeting a group.';

      const assessment = await prevention.assessHarm('query', output);

      expect(assessment.isHarmful).toBe(true);
      expect(assessment.harmTypes).toContain('hate_speech');
    });

    it('should generate safe response for harmful content', async () => {
      const prevention = new HarmPrevention();
      const query = 'How to cause harm?';

      const safeResponse = await prevention.generateSafeResponse(query);

      expect(safeResponse).toBeDefined();
      expect(safeResponse.length).toBeGreaterThan(0);
      expect(safeResponse).toContain('cannot');
    });
  });

  describe('Performance Requirements', () => {
    it('should validate output within 200ms', async () => {
      const query = 'Test query';
      const output = 'Test output for performance validation.';

      const startTime = Date.now();
      await orchestrator.validateOutput(query, output);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle concurrent validations', async () => {
      const queries = Array(10).fill('Test query');
      const outputs = Array(10).fill('Test output');

      const startTime = Date.now();
      await Promise.all(
        queries.map((q, i) => orchestrator.validateOutput(q, outputs[i]))
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
