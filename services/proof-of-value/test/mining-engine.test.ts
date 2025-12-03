import { MiningEngine } from './mining-engine';
import AntiGamingSystem from './anti-gaming';
import MintIntegration from './mint-integration';

// Mock MintIntegration
jest.mock('./mint-integration', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      mintTokens: jest.fn().mockResolvedValue({
        success: true,
        txHash: '0xmockhash',
        mintedAmount: 10
      })
    }))
  };
});

// Mock AntiGamingSystem
jest.mock('./anti-gaming', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      checkProof: jest.fn().mockResolvedValue({
        isGaming: false,
        reasons: [],
        confidence: 0,
        action: 'allow'
      })
    }))
  };
});

describe('MiningEngine', () => {
  let engine: MiningEngine;

  beforeEach(() => {
    process.env.BLOCKCHAIN_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
    engine = new MiningEngine();
  });

  test('should track knowledge creation correctly', async () => {
    const content = {
      id: '1',
      type: 'article' as const,
      quality: 80,
      impact: 70,
      engagement: 50,
      originality: 90
    };

    const score = await engine.trackKnowledgeCreation('user1', content);
    
    expect(score.score).toBeGreaterThan(0);
    expect(score.breakdown.quality).toBeDefined();
    expect(score.multiplier).toBe(1.0);
  });

  test('should submit value proof and mint reward', async () => {
    const content = {
      id: '1',
      type: 'article' as const,
      quality: 80,
      impact: 70
    };

    const score = await engine.trackKnowledgeCreation('user1', content);
    const proof = await engine.submitValueProof('user1', 'knowledge', content, score);

    expect(proof.id).toBeDefined();
    expect(proof.verified).toBe(true);
    expect(proof.txHash).toBe('0xmockhash');
    expect(proof.reward).toBeGreaterThan(0);
  });
});
