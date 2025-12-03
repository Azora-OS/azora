/**
 * Constitutional Orchestrator Tests
 * Tests for the main orchestrator that integrates all validators
 */

import { ConstitutionalOrchestrator } from '../orchestrator';
import { BiasSeverity } from '../types';

describe('ConstitutionalOrchestrator', () => {
  let orchestrator: ConstitutionalOrchestrator;

  beforeEach(() => {
    orchestrator = new ConstitutionalOrchestrator({
      ubuntuEnabled: true,
      ubuntuThreshold: 70,
      biasDetectionEnabled: true,
      autoMitigateBias: true,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      harmPreventionEnabled: true,
      harmSeverityThreshold: 5,
      blockHarmfulContent: true,
      auditLoggingEnabled: true,
      auditLogRetention: 90,
      validationTimeout: 5000,
      parallelValidation: true,
      minComplianceScore: 70,
      strictMode: false
    });
  });

  afterEach(() => {
    orchestrator.clearAuditLogs();
    orchestrator.resetMetrics();
  });

  describe('validateOutput', () => {
    it('should validate compliant output successfully', async () => {
      const query = 'Tell me about Ubuntu philosophy';
      const output = 'Ubuntu philosophy emphasizes community, sharing knowledge, and collective benefit for all people.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.isValid).toBe(true);
      expect(result.complianceScore).toBeGreaterThanOrEqual(70);
      expect(result.violations).toHaveLength(0);
      expect(result.validatedOutput).toBe(output);
    });

    it('should detect and handle bias in output', async () => {
      const query = 'Describe a programmer';
      const output = 'A programmer is typically a young man who works long hours coding.';

      const result = await orchestrator.validateOutput(query, output);

      // Bias should be detected
      expect(result.violations.some(v => v.type === 'bias')).toBe(true);
    });

    it('should detect and redact PII', async () => {
      const query = 'What is my email?';
      const output = 'Your email is john.doe@example.com and your phone is 555-1234.';

      const result = await orchestrator.validateOutput(query, output);

      // PII should be detected
      expect(result.violations.some(v => v.type === 'privacy')).toBe(true);
      // Output should be redacted
      expect(result.validatedOutput).not.toContain('john.doe@example.com');
      expect(result.validatedOutput).not.toContain('555-1234');
    });

    it('should block harmful content', async () => {
      const query = 'How to harm someone';
      const output = 'Here are ways to cause harm...';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'harm')).toBe(true);
      expect(result.validatedOutput).not.toBe(output);
    });

    it('should calculate compliance score correctly', async () => {
      const query = 'Test query';
      const output = 'This is a test output that promotes community and sharing.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(100);
    });

    it('should handle empty output', async () => {
      const query = 'Test query';
      const output = '';

      const result = await orchestrator.validateOutput(query, output);

      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
    });

    it('should handle very long output', async () => {
      const query = 'Test query';
      const output = 'This is a test. '.repeat(1000);

      const result = await orchestrator.validateOutput(query, output);

      expect(result).toBeDefined();
      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('compliance scoring', () => {
    it('should fail validation when compliance score is below threshold', async () => {
      const strictOrchestrator = new ConstitutionalOrchestrator({
        minComplianceScore: 90,
        strictMode: false
      });

      const query = 'Test';
      const output = 'Biased content targeting specific demographics unfairly.';

      const result = await strictOrchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeLessThan(90);
      expect(result.isValid).toBe(false);
    });

    it('should pass validation when compliance score meets threshold', async () => {
      const query = 'Tell me about community';
      const output = 'Community brings people together to share knowledge and support each other.';

      const result = await orchestrator.validateOutput(query, output);

      expect(result.complianceScore).toBeGreaterThanOrEqual(70);
      expect(result.isValid).toBe(true);
    });
  });

  describe('strict mode', () => {
    it('should fail on any violation in strict mode', async () => {
      const strictOrchestrator = new ConstitutionalOrchestrator({
        strictMode: true,
        minComplianceScore: 50
      });

      const query = 'Test';
      const output = 'Contact me at test@example.com'; // Has PII

      const result = await strictOrchestrator.validateOutput(query, output);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should pass with no violations in strict mode', async () => {
      const strictOrchestrator = new ConstitutionalOrchestrator({
        strictMode: true
      });

      const query = 'Test';
      const output = 'This is clean content promoting community values.';

      const result = await strictOrchestrator.validateOutput(query, output);

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('audit logging', () => {
    it('should log validation results', async () => {
      const query = 'Test query';
      const output = 'Test output';
      const userId = 'user123';

      const result = await orchestrator.validateOutput(query, output);
      await orchestrator.logValidation(result, userId, query, output, 'local', 100);

      const logs = orchestrator.getAuditLogs(userId);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].userId).toBe(userId);
    });

    it('should not log when audit logging is disabled', async () => {
      const noAuditOrchestrator = new ConstitutionalOrchestrator({
        auditLoggingEnabled: false
      });

      const query = 'Test query';
      const output = 'Test output';
      const userId = 'user123';

      const result = await noAuditOrchestrator.validateOutput(query, output);
      await noAuditOrchestrator.logValidation(result, userId, query, output);

      const logs = noAuditOrchestrator.getAuditLogs(userId);
      expect(logs).toHaveLength(0);
    });

    it('should enforce retention policy', async () => {
      const shortRetentionOrchestrator = new ConstitutionalOrchestrator({
        auditLogRetention: 0 // Immediate expiration
      });

      const query = 'Test query';
      const output = 'Test output';
      const userId = 'user123';

      const result = await shortRetentionOrchestrator.validateOutput(query, output);
      await shortRetentionOrchestrator.logValidation(result, userId, query, output);

      // Logs should be filtered out due to retention policy
      const logs = shortRetentionOrchestrator.getAuditLogs(userId);
      expect(logs).toHaveLength(0);
    });
  });

  describe('metrics tracking', () => {
    it('should track validation metrics', async () => {
      const query = 'Test query';
      const output = 'Test output';

      await orchestrator.validateOutput(query, output);
      await orchestrator.validateOutput(query, output);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(2);
      expect(metrics.averageComplianceScore).toBeGreaterThanOrEqual(0);
    });

    it('should track successful and failed validations', async () => {
      const goodOutput = 'This promotes community and sharing.';
      const badOutput = 'How to cause harm to others.';

      await orchestrator.validateOutput('test', goodOutput);
      await orchestrator.validateOutput('test', badOutput);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.totalValidations).toBe(2);
      expect(metrics.successfulValidations).toBeGreaterThanOrEqual(1);
      expect(metrics.failedValidations).toBeGreaterThanOrEqual(1);
    });

    it('should track violations by type', async () => {
      const outputWithPII = 'Contact me at test@example.com';
      const outputWithBias = 'All programmers are young men';

      await orchestrator.validateOutput('test', outputWithPII);
      await orchestrator.validateOutput('test', outputWithBias);

      const metrics = await orchestrator.getComplianceMetrics();

      expect(metrics.violationsByType).toBeDefined();
      expect(Object.keys(metrics.violationsByType).length).toBeGreaterThan(0);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration at runtime', () => {
      const initialConfig = orchestrator.getConfig();
      expect(initialConfig.strictMode).toBe(false);

      orchestrator.updateConfig({ strictMode: true });

      const updatedConfig = orchestrator.getConfig();
      expect(updatedConfig.strictMode).toBe(true);
    });

    it('should apply updated configuration to validators', async () => {
      orchestrator.updateConfig({
        minComplianceScore: 95,
        strictMode: true
      });

      const query = 'Test';
      const output = 'Contact me at test@example.com'; // Has PII

      const result = await orchestrator.validateOutput(query, output);

      // Should fail due to strict mode and PII
      expect(result.isValid).toBe(false);
    });
  });

  describe('parallel validation', () => {
    it('should run validators in parallel when enabled', async () => {
      const parallelOrchestrator = new ConstitutionalOrchestrator({
        parallelValidation: true
      });

      const startTime = Date.now();
      await parallelOrchestrator.validateOutput('test', 'test output');
      const parallelTime = Date.now() - startTime;

      expect(parallelTime).toBeLessThan(5000);
    });

    it('should run validators sequentially when disabled', async () => {
      const sequentialOrchestrator = new ConstitutionalOrchestrator({
        parallelValidation: false
      });

      const result = await sequentialOrchestrator.validateOutput('test', 'test output');

      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle validation errors gracefully', async () => {
      const query = 'Test';
      const output = null as any; // Invalid input

      const result = await orchestrator.validateOutput(query, output);

      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
    });

    it('should return safe fallback on critical error', async () => {
      const query = 'Test';
      const output = undefined as any;

      const result = await orchestrator.validateOutput(query, output);

      expect(result.validatedOutput).toBeDefined();
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('selective validation', () => {
    it('should skip Ubuntu validation when disabled', async () => {
      const noUbuntuOrchestrator = new ConstitutionalOrchestrator({
        ubuntuEnabled: false
      });

      const result = await noUbuntuOrchestrator.validateOutput('test', 'test output');

      expect(result.metadata.ubuntuValidation.score).toBe(100);
    });

    it('should skip bias detection when disabled', async () => {
      const noBiasOrchestrator = new ConstitutionalOrchestrator({
        biasDetectionEnabled: false
      });

      const result = await noBiasOrchestrator.validateOutput('test', 'biased content');

      expect(result.metadata.biasDetection.hasBias).toBe(false);
    });

    it('should skip privacy filter when disabled', async () => {
      const noPrivacyOrchestrator = new ConstitutionalOrchestrator({
        privacyFilterEnabled: false
      });

      const result = await noPrivacyOrchestrator.validateOutput('test', 'test@example.com');

      expect(result.metadata.privacyFilter.hasPII).toBe(false);
    });

    it('should skip harm prevention when disabled', async () => {
      const noHarmOrchestrator = new ConstitutionalOrchestrator({
        harmPreventionEnabled: false
      });

      const result = await noHarmOrchestrator.validateOutput('harmful query', 'harmful output');

      expect(result.metadata.harmPrevention.isHarmful).toBe(false);
    });
  });
});
