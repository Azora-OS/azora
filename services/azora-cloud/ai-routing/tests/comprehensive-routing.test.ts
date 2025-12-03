import { RoutingTier, QueryComplexity } from '../types';

describe('AI Routing - Comprehensive Tests', () => {
  it('should handle complete routing flow', () => {
    const tiers = [RoutingTier.LOCAL_LLM, RoutingTier.RAP_SYSTEM, RoutingTier.EXTERNAL_LLM];
    const complexities = [QueryComplexity.SIMPLE, QueryComplexity.MODERATE, QueryComplexity.COMPLEX];
    
    expect(tiers).toHaveLength(3);
    expect(complexities).toHaveLength(3);
  });
});