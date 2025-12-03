import { miningEngine } from '../mining-engine';

describe('Proof-of-Value Mint Integration', () => {
  beforeAll(() => {
    // Set environment variable to point to a test mint service
    process.env.MINT_SERVICE_URL = 'http://localhost:4000';
    process.env.MINT_SERVICE_API_KEY = 'test-api-key';
  });

  it('calls mint service when MINT_SERVICE_URL configured', async () => {
    // Mock global fetch for the mint call
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, txHash: '0xtxhash123' })
    });

    const proof = await miningEngine.submitValueProof('user-1', 'knowledge', { id: 'c-1', type: 'article', quality: 80, impact: 70 });
    const txHash = await miningEngine.verifyAndMint(proof.id);
    expect(txHash).toBe('0xtxhash123');
  });
});
