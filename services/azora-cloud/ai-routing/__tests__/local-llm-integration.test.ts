/**
 * Local LLM Service Integration Tests
 */

import { LocalLLMService } from '../local-llm-service';
import { RoutingTier, QueryComplexity } from '../types';
import { QueryClassifier } from '../query-classifier';

describe('LocalLLMService Integration', () => {
  let llmService: LocalLLMService;
  let classifier: QueryClassifier;

  beforeEach(async () => {
    llmService = new LocalLLMService();
    classifier = new QueryClassifier();
    await llmService.initialize();
  });

  afterEach(async () => {
    await llmService.unload();
  });

  it('should route simple queries to Local LLM', async () => {
    const classification = await classifier.classify({
      query: 'What is Azora?'
    });

    expect(classification.classifiedAs).toBe(QueryComplexity.SIMPLE);
    expect(classification.routedTo).toBe(RoutingTier.LOCAL_LLM);
  });

  it('should process queries with zero cost', async () => {
    const response = await llmService.processQuery({
      query: 'Test query'
    });

    expect(response.cost).toBe(0);
    expect(response.routingTier).toBe(RoutingTier.LOCAL_LLM);
  });

  it('should cache responses efficiently', async () => {
    const query = 'Cache test';

    const response1 = await llmService.processQuery({ query });
    expect(response1.cached).toBe(false);

    const response2 = await llmService.processQuery({ query });
    expect(response2.cached).toBe(true);
  });

  it('should complete within performance targets', async () => {
    const response = await llmService.processQuery({
      query: 'Performance test'
    });

    expect(response.responseTime).toBeLessThan(500);
  });
});
