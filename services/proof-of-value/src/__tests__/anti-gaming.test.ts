import AntiGamingSystem from '../anti-gaming';

describe('AntiGamingSystem', () => {
  it('detects rapid submissions and duplicates', async () => {
    const config = {
      rateLimits: { perUser: 2, perIP: 10, global: 100 },
      duplicateThreshold: 0.8,
      minProofValue: 1,
      maxProofValue: 1000,
      suspiciousPatterns: ['spam', 'http:']
    };

    const ag = new AntiGamingSystem(config as any);

    // Submit some proofs
    ag.recordProofSubmission('user-1', '127.0.0.1', 'value: 10, content: good work');
    ag.recordProofSubmission('user-1', '127.0.0.1', 'value: 12, content: good work again');

    const result = await ag.checkProof('user-1', '127.0.0.1', 'value: 10, content: good work', 10, { userId: 'user-1' });
    expect(result.isGaming).toBe(true);
    expect(['rate_limit','flag','reject'].includes(result.action)).toBeTruthy();
  });
});
