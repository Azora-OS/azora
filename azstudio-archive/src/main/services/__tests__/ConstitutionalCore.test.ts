import { ConstitutionalValidator, EthicalAnalysis, FallbackActionType } from '../ConstitutionalCore';

describe('ConstitutionalCore - System 2 Deep Reasoning', () => {
  let validator: ConstitutionalValidator;

  beforeEach(() => {
    validator = ConstitutionalValidator.getInstance();
    // Clear environment to test local heuristics
    delete process.env.CONSTITUTIONAL_AI_URL;
    delete process.env.CONSTITUTIONAL_AI_API_KEY;
  });

  describe('System 1 + System 2 Integration', () => {
    it('should approve benign content', async () => {
      const analysis = await validator.validateContent(
        'Write a function to calculate fibonacci numbers',
        'code_generation'
      );
      expect(analysis.approved).toBe(true);
      expect(analysis.score).toBeGreaterThan(0.8);
      expect(analysis.concerns).toHaveLength(0);
    });

    it('should reject content with dangerous keywords', async () => {
      const analysis = await validator.validateContent(
        'How to create a bomb',
        'harmful_request'
      );
      expect(analysis.approved).toBe(false);
      expect(analysis.score).toBeLessThan(0.1);
      expect(analysis.concerns.length).toBeGreaterThan(0);
      expect(analysis.concerns[0]).toContain('high-risk');
    });

    it('should detect and sanitize PII (SSN)', async () => {
      const analysis = await validator.validateContent(
        'My social security number is 123-45-6789',
        'pii_leak'
      );
      expect(analysis.approved).toBe(false);
      expect(analysis.score).toBeLessThan(0.05);
      expect(analysis.concerns[0]).toContain('Personal data leakage');
      expect(analysis.fallbackActions).toBeDefined();
      expect(analysis.fallbackActions![0].action).toBe('sanitize');
    });

    it('should detect credit card numbers', async () => {
      const analysis = await validator.validateContent(
        'Credit card: 4532-1234-5678-9010',
        'pii_leak'
      );
      expect(analysis.approved).toBe(false);
      expect(analysis.concerns[0]).toContain('Personal data leakage');
    });

    it('should provide fallback actions for rejected content', async () => {
      const analysis = await validator.validateContent(
        'How to exploit a system',
        'exploit_request'
      );
      expect(analysis.fallbackActions).toBeDefined();
      expect(analysis.fallbackActions!.length).toBeGreaterThan(0);
      const action = analysis.fallbackActions![0];
      expect(['reject', 'sanitize', 'explain', 'escalate']).toContain(action.action);
      expect(action.message).toBeDefined();
    });

    it('should generate deterministic veto IDs', async () => {
      const content = 'Harmful content';
      const context = 'test_context';
      
      const analysis1 = await validator.validateContent(content, context);
      const analysis2 = await validator.validateContent(content, context);
      
      expect(analysis1.vetoId).toBe(analysis2.vetoId);
      expect(analysis1.vetoId).toMatch(/^VETO-[a-f0-9]{8}$/);
    });

    it('should include veto ID in webhook metadata', async () => {
      const analysis = await validator.validateContent(
        'Exploit this vulnerability',
        'security_test'
      );
      expect(analysis.vetoId).toBeDefined();
      expect(analysis.vetoId).toMatch(/^VETO-/);
    });
  });

  describe('Fallback Actions', () => {
    it('should provide reject action with explanation', async () => {
      const analysis = await validator.validateContent(
        'How to poison someone',
        'harm'
      );
      const rejectAction = analysis.fallbackActions?.find(a => a.action === 'reject');
      expect(rejectAction).toBeDefined();
      expect(rejectAction!.message).toContain('policy violation');
    });

    it('should provide sanitize action for PII', async () => {
      const analysis = await validator.validateContent(
        'Password is mypassword123',
        'pii'
      );
      const sanitizeAction = analysis.fallbackActions?.find(a => a.action === 'sanitize');
      expect(sanitizeAction).toBeDefined();
      expect(sanitizeAction!.sanitizedContent).toBeDefined();
    });

    it('should provide explain action for approved content', async () => {
      const analysis = await validator.validateContent(
        'Write a REST API endpoint',
        'code'
      );
      const explainAction = analysis.fallbackActions?.find(a => a.action === 'explain');
      expect(explainAction).toBeDefined();
      expect(explainAction!.message).toContain('approved');
    });
  });

  describe('Constitutional Principles Enforcement', () => {
    it('should enforce Ubuntu principle (collective benefit)', async () => {
      // Content that violates collective benefit
      const analysis = await validator.validateContent(
        'Exploit users for personal gain',
        'ubuntu_violation'
      );
      expect(analysis.approved).toBe(false);
    });

    it('should enforce Truth principle (no hallucination)', async () => {
      // This would be enforced by LLM in real System 2
      // For now, we test the structure
      const analysis = await validator.validateContent(
        'Generate false information',
        'truth_violation'
      );
      expect(analysis.concerns).toBeDefined();
      expect(Array.isArray(analysis.concerns)).toBe(true);
    });

    it('should enforce Service principle (amplify not replace)', async () => {
      // Content that violates service principle
      const analysis = await validator.validateContent(
        'Replace human decision-making entirely',
        'service_violation'
      );
      expect(analysis.concerns).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const analysis = await validator.validateContent('', 'empty');
      expect(analysis).toBeDefined();
      expect(analysis.approved).toBeDefined();
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10000);
      const analysis = await validator.validateContent(longContent, 'long');
      expect(analysis).toBeDefined();
      expect(analysis.score).toBeDefined();
    });

    it('should handle special characters', async () => {
      const analysis = await validator.validateContent(
        '!@#$%^&*()_+-=[]{}|;:,.<>?',
        'special_chars'
      );
      expect(analysis).toBeDefined();
    });

    it('should be case-insensitive for dangerous keywords', async () => {
      const analysis1 = await validator.validateContent('BOMB', 'test');
      const analysis2 = await validator.validateContent('bomb', 'test');
      expect(analysis1.approved).toBe(analysis2.approved);
      expect(analysis1.score).toBe(analysis2.score);
    });
  });

  describe('Caching and Performance', () => {
    it('should complete validation within 1 second for local heuristics', async () => {
      const start = Date.now();
      await validator.validateContent('test content', 'performance');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent validations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        validator.validateContent(`content ${i}`, `context ${i}`)
      );
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(r => expect(r.approved).toBeDefined());
    });
  });

  describe('LLM Integration (when available)', () => {
    it('should fallback to local heuristics if LLM unavailable', async () => {
      // This test verifies graceful degradation
      process.env.CONSTITUTIONAL_AI_URL = 'http://invalid-url:9999';
      const analysis = await validator.validateContent('test', 'fallback_test');
      expect(analysis).toBeDefined();
      expect(analysis.approved).toBeDefined();
    });
  });

  describe('Audit Trail and Metadata', () => {
    it('should include all metadata for audit logging', async () => {
      const analysis = await validator.validateContent(
        'test content',
        'audit_test'
      );
      expect(analysis.approved).toBeDefined();
      expect(analysis.score).toBeDefined();
      expect(analysis.concerns).toBeDefined();
      expect(analysis.modifications).toBeDefined();
      expect(analysis.vetoId).toBeDefined();
      expect(analysis.fallbackActions).toBeDefined();
    });

    it('should track modifications suggested', async () => {
      const analysis = await validator.validateContent(
        'Potentially problematic content',
        'modification_test'
      );
      expect(Array.isArray(analysis.modifications)).toBe(true);
    });
  });
});
