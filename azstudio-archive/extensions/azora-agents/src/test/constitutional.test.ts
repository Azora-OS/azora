import { ConstitutionalValidator } from '../../../src/main/services/ConstitutionalCore';

describe('Constitutional Validator', () => {
  it('should validate content and return an analysis', async () => {
    const validator = ConstitutionalValidator.getInstance();
    const analysis = await validator.validateContent('This is a test content', 'test-context');
    expect(analysis).toBeDefined();
    expect(typeof analysis.approved).toBe('boolean');
    expect(Array.isArray(analysis.concerns)).toBeTruthy();
  });
});
