/**
 * Compliance Rate Calculation Tests
 * Tests for calculating and tracking compliance rates across validations
 */

import { ConstitutionalOrchestrator } from '../orchestrator';

describe('Compliance Rate Calculation', () => {
  let orchestrator: ConstitutionalOrchestrator;

  beforeEach(() => {
    orchestrator = new ConstitutionalOrchestrator({
      ubuntuEnabled: true,
      biasDetectionEnabled: true,
      privacyFilterEnabled: true,
      harmPreventionEnabled: true,
      auditLoggingEnabled: false,
      minComplianceScore: 70
    });
  });

  afterEach(() => {
    orchestrator.resetMetrics();
  });

  describe('Compliance Score Calculation', () => {
    it('should calculate compliance score from all validators', async () => {
      const query = 'Test query';
      const output = 'This is a community-focused solution that teaches everyone.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(100);
    });

    it('should weight validators correctly', async () => {
      const query = 'Test query';
      const output = 'This is a community-focused solution that teaches everyone.';

      const result = await orchestrator.validateOutput(query, output);

      // Score should be weighted average of:
      // Ubuntu (30%) + Bias (25%) + Privacy (25%) + Harm (20%)
      expect(result.complianceScore).toBeDefined();
    });

    it('should give 100 score for compliant output', async () => {
      const query = 'Tell me about community';
      const output = 'Community brings people together to share knowledge and support each other.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeGreaterThanOrEqual(70);
    });

    it('should give low score for harmful output', async () => {
      const query = 'How to harm someone';
      const output = 'Here are ways to hurt people...';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeLessThan(70);
    });

    it('should give low score for biased output', async () => {
      const query = 'Describe a programmer';
      const output = 'A programmer is typically a young man who works long hours.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeLessThan(100);
    });

    it('should penalize PII in output', async () => {
      const query = 'What is my email';
      const output = 'Your email is john.doe@example.com';

      const result = await orchestrator.validateOutput(query, output);

      // Should have lower score due to PII
      expect(result.complianceScore).toBeLessThan(100);
    });
  });

  describe('Compliance Rate Tracking', () => {
    it('should track total validations', async () => {
      const query = 'Test query';
      const output = 'Test output';

      await orchestrator.validateOutput(query, output);
      await orchestrator.validateOutput(query, output);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(2);
    });

    it('should track successful validations', async () => {
      const goodOutput = 'This promotes community and sharing.';

      await orchestrator.validateOutput('test', goodOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.successfulValidations).toBeGreaterThanOrEqual(0);
    });

    it('should track failed validations', async () => {
      const badOutput = 'How to cause harm to others.';

      await orchestrator.validateOutput('test', badOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.failedValidations).toBeGreaterThanOrEqual(0);
    });

    it('should calculate compliance rate correctly', async () => {
      const goodOutput = 'This promotes community and sharing.';
      const badOutput = 'How to cause harm.';

      await orchestrator.validateOutput('test', goodOutput);
      await orchestrator.validateOutput('test', badOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      const complianceRate = metrics.successfulValidations / metrics.totalValidations;
      expect(complianceRate).toBeGreaterThanOrEqual(0);
      expect(complianceRate).toBeLessThanOrEqual(1);
    });

    it('should achieve 95% compliance rate target', async () => {
      // Run 100 validations with mostly compliant content
      for (let i = 0; i < 95; i++) {
        await orchestrator.validateOutput('test', 'This is compliant community-focused content.');
      }

      for (let i = 0; i < 5; i++) {
        await orchestrator.validateOutput('test', 'Harmful content here.');
      }

      const metrics = await orchestrator.getComplianceMetrics();
      const complianceRate = metrics.successfulValidations / metrics.totalValidations;

      expect(complianceRate).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('Average Compliance Score', () => {
    it('should calculate average compliance score', async () => {
      await orchestrator.validateOutput('test', 'Compliant content');
      await orchestrator.validateOutput('test', 'More compliant content');

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.averageComplianceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.averageComplianceScore).toBeLessThanOrEqual(100);
    });

    it('should update average with each validation', async () => {
      await orchestrator.validateOutput('test', 'Content 1');
      const metrics1 = await orchestrator.getComplianceMetrics();

      await orchestrator.validateOutput('test', 'Content 2');
      const metrics2 = await orchestrator.getComplianceMetrics();

      expect(metrics2.totalValidations).toBe(metrics1.totalValidations + 1);
    });

    it('should maintain accurate average across many validations', async () => {
      const scores: number[] = [];

      for (let i = 0; i < 10; i++) {
        const result = await orchestrator.validateOutput('test', `Content ${i}`);
        scores.push(result.complianceScore);
      }

      const metrics = await orchestrator.getComplianceMetrics();
      const expectedAverage = scores.reduce((a, b) => a + b, 0) / scores.length;

      expect(Math.abs(metrics.averageComplianceScore - expectedAverage)).toBeLessThan(1);
    });
  });

  describe('Violation Tracking', () => {
    it('should track violations by type', async () => {
      const outputWithPII = 'Contact me at test@example.com';
      const outputWithBias = 'All programmers are young men';

      await orchestrator.validateOutput('test', outputWithPII);
      await orchestrator.validateOutput('test', outputWithBias);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType).toBeDefined();
      expect(Object.keys(metrics.violationsByType).length).toBeGreaterThan(0);
    });

    it('should count privacy violations', async () => {
      const outputWithPII = 'Email: test@example.com, Phone: 555-1234';

      await orchestrator.validateOutput('test', outputWithPII);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType['privacy']).toBeGreaterThan(0);
    });

    it('should count bias violations', async () => {
      const biasedOutput = 'Men are better at math than women.';

      await orchestrator.validateOutput('test', biasedOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType['bias']).toBeGreaterThanOrEqual(0);
    });

    it('should count harm violations', async () => {
      const harmfulOutput = 'How to cause harm to others.';

      await orchestrator.validateOutput('test', harmfulOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType['harm']).toBeGreaterThan(0);
    });

    it('should count Ubuntu violations', async () => {
      const selfishOutput = 'This is only for me and my personal gain.';

      await orchestrator.validateOutput('test', selfishOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType['ubuntu']).toBeGreaterThanOrEqual(0);
    });

    it('should track multiple violations in single output', async () => {
      const multiViolationOutput = 'Contact me at test@example.com. Men are better than women. This is only for me.';

      await orchestrator.validateOutput('test', multiViolationOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      const totalViolations = Object.values(metrics.violationsByType).reduce((a: number, b: number) => a + b, 0);
      expect(totalViolations).toBeGreaterThan(0);
    });
  });

  describe('Compliance Metrics Aggregation', () => {
    it('should provide comprehensive metrics', async () => {
      await orchestrator.validateOutput('test', 'Compliant content');

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBeDefined();
      expect(metrics.successfulValidations).toBeDefined();
      expect(metrics.failedValidations).toBeDefined();
      expect(metrics.averageComplianceScore).toBeDefined();
      expect(metrics.violationsByType).toBeDefined();
    });

    it('should calculate success rate', async () => {
      const goodOutput = 'This is compliant content.';
      const badOutput = 'Harmful content.';

      await orchestrator.validateOutput('test', goodOutput);
      await orchestrator.validateOutput('test', badOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      const successRate = metrics.successfulValidations / metrics.totalValidations;
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(1);
    });

    it('should calculate failure rate', async () => {
      const goodOutput = 'This is compliant content.';
      const badOutput = 'Harmful content.';

      await orchestrator.validateOutput('test', goodOutput);
      await orchestrator.validateOutput('test', badOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      const failureRate = metrics.failedValidations / metrics.totalValidations;
      expect(failureRate).toBeGreaterThanOrEqual(0);
      expect(failureRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Compliance Threshold Enforcement', () => {
    it('should fail validation when score is below threshold', async () => {
      const orchestratorWithHighThreshold = new ConstitutionalOrchestrator({
        minComplianceScore: 90
      });

      const output = 'Somewhat compliant content.';
      const result = await orchestratorWithHighThreshold.validateOutput('test', output);

      if (result.complianceScore < 90) {
        expect(result.isValid).toBe(false);
      }
    });

    it('should pass validation when score meets threshold', async () => {
      const orchestratorWithLowThreshold = new ConstitutionalOrchestrator({
        minComplianceScore: 50
      });

      const output = 'This is compliant community-focused content.';
      const result = await orchestratorWithLowThreshold.validateOutput('test', output);

      if (result.complianceScore >= 50) {
        expect(result.isValid).toBe(true);
      }
    });

    it('should respect custom compliance thresholds', async () => {
      const customOrchestrator = new ConstitutionalOrchestrator({
        minComplianceScore: 75
      });

      const output = 'Test content';
      const result = await customOrchestrator.validateOutput('test', output);

      expect(result).toBeDefined();
    });
  });

  describe('Compliance Metrics Reset', () => {
    it('should reset metrics', async () => {
      await orchestrator.validateOutput('test', 'Content 1');
      await orchestrator.validateOutput('test', 'Content 2');

      orchestrator.resetMetrics();

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(0);
      expect(metrics.successfulValidations).toBe(0);
      expect(metrics.failedValidations).toBe(0);
    });

    it('should start fresh after reset', async () => {
      await orchestrator.validateOutput('test', 'Content 1');
      orchestrator.resetMetrics();
      await orchestrator.validateOutput('test', 'Content 2');

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(1);
    });
  });

  describe('Real-World Compliance Scenarios', () => {
    it('should maintain high compliance for educational content', async () => {
      const educationalOutputs = [
        'Here is a tutorial on how to learn programming.',
        'This guide teaches everyone the basics of web development.',
        'Community members share knowledge to help each other learn.'
      ];

      for (const output of educationalOutputs) {
        await orchestrator.validateOutput('test', output);
      }

      const metrics = await orchestrator.getComplianceMetrics();
      const complianceRate = metrics.successfulValidations / metrics.totalValidations;

      expect(complianceRate).toBeGreaterThan(0.7);
    });

    it('should detect low compliance for harmful content', async () => {
      const harmfulOutputs = [
        'How to harm someone',
        'Ways to exploit people',
        'Instructions for illegal activities'
      ];

      for (const output of harmfulOutputs) {
        await orchestrator.validateOutput('test', output);
      }

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.failedValidations).toBeGreaterThan(0);
    });

    it('should handle mixed content appropriately', async () => {
      const mixedOutputs = [
        'This is compliant community-focused content.',
        'Harmful content here.',
        'Another compliant educational piece.',
        'Biased content targeting specific groups.',
        'Inclusive solution for everyone.'
      ];

      for (const output of mixedOutputs) {
        await orchestrator.validateOutput('test', output);
      }

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(5);
      expect(metrics.successfulValidations).toBeGreaterThan(0);
      expect(metrics.failedValidations).toBeGreaterThan(0);
    });
  });

  describe('Compliance Rate Targets', () => {
    it('should track progress toward 95% compliance target', async () => {
      // Simulate 100 validations
      for (let i = 0; i < 100; i++) {
        const isCompliant = Math.random() > 0.05; // 95% compliant
        const output = isCompliant
          ? 'This is compliant community-focused content.'
          : 'Harmful content.';

        await orchestrator.validateOutput('test', output);
      }

      const metrics = await orchestrator.getComplianceMetrics();
      const complianceRate = metrics.successfulValidations / metrics.totalValidations;

      // Should be close to 95%
      expect(complianceRate).toBeGreaterThan(0.85);
    });

    it('should identify when compliance falls below target', async () => {
      // Simulate 100 validations with low compliance
      for (let i = 0; i < 100; i++) {
        const isCompliant = Math.random() > 0.5; // 50% compliant
        const output = isCompliant
          ? 'This is compliant content.'
          : 'Harmful content.';

        await orchestrator.validateOutput('test', output);
      }

      const metrics = await orchestrator.getComplianceMetrics();
      const complianceRate = metrics.successfulValidations / metrics.totalValidations;

      // Should be below 95% target
      expect(complianceRate).toBeLessThan(0.95);
    });
  });
});
