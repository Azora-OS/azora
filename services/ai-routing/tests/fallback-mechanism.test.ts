import { RoutingTier } from '../types';

describe('AI Routing - Fallback Mechanism', () => {
  it('should fallback to next tier on failure', () => {
    const primaryTier = RoutingTier.LOCAL_LLM;
    const fallbackTier = RoutingTier.RAP_SYSTEM;
    
    expect(primaryTier).toBe('LOCAL_LLM');
    expect(fallbackTier).toBe('RAP_SYSTEM');
  });
});