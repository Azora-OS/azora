/**
 * External LLM Routing Integration Tests
 * Tests for Route C integration with hierarchical router
 */

import { ExternalLLMService } from '../../services/ai-routing/external-llm-service';
import { AIQuery, RoutingTier } from '../../services/ai-routing/types';

// Mock OpenAI client
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Complex analysis response from GPT-4'
                }
              }
            ],
            usage: {
              prompt_tokens: 200,
              completion_tokens: 150
            }
          })
        }
      },
      models: {
        list: jest.fn().mockResolvedValue({
          data: [
            { id: 'gpt-4' },
            { id: 'gpt-3.5-turbo' }
          ]
        })
      }
    }))
  };
});

describe('External LLM Routing Integration', () => {
  let externalLLMService: ExternalLLMService;

  beforeEach(() => {
    externalLLMService = new ExternalLLMService({
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'test-api-key',
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      cacheTTL: 3600
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Route C: Complex Query Processing', () => {
    it('should process complex strategic query', async () => {
      const complexQuery: AIQuery = {
        query: 'Develop a comprehensive strategy for scaling an education platform in emerging markets',
        userId: 'user-123',
        context: {
          marketSize: 'large',
          targetRegion: 'Africa'
        }
      };

      const response = await externalLLMService.processQuery(complexQuery);

      expect(response).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.EXTERNAL_LLM);
      expect(response.content).toContain('Complex analysis response');
      expect(response.cost).toBeGreaterThan(0);
      expect(response.metadata?.inputTokens).toBe(200);
      expect(response.metadata?.outputTokens).toBe(150);
    });

    it('should process novel problem-solving query', async () => {
      const novelQuery: AIQuery = {
        query: 'How can we design an AI system that respects Ubuntu philosophy while maximizing economic efficiency?'
      };

      const response = await externalLLMService.processQuery(novelQuery);

      expect(response).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.EXTERNAL_LLM);
      expect(response.content).toBeDefined();
      expect(response.cached).toBe(false);
    });

    it('should process creative task query', async () => {
      const creativeQuery: AIQuery = {
        query: 'Create an innovative curriculum framework that combines technical skills with Ubuntu philosophy principles'
      };

      const response = await externalLLMService.processQuery(creativeQuery);

      expect(response).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.EXTERNAL_LLM);
      expect(response.content).toBeDefined();
    });
  });

  describe('Cost Optimization', () => {
    it('should track cost for complex queries', async () => {
      const query: AIQuery = {
        query: 'Complex strategic analysis query'
      };

      const initialTracking = externalLLMService.getCostTracking();
      const initialCost = initialTracking.totalCost;

      await externalLLMService.processQuery(query);

      const tracking = externalLLMService.getCostTracking();
      expect(tracking.totalCost).toBeGreaterThan(initialCost);
      expect(tracking.totalRequests).toBe(1);
    });

    it('should minimize cost through caching', async () => {
      const query: AIQuery = {
        query: 'Expensive query that should be cached'
      };

      // First call - incurs cost
      const response1 = await externalLLMService.processQuery(query);
      const tracking1 = externalLLMService.getCostTracking();
      const cost1 = tracking1.totalCost;

      // Second call - uses cache, no additional cost
      const response2 = await externalLLMService.processQuery(query);
      const tracking2 = externalLLMService.getCostTracking();
      const cost2 = tracking2.totalCost;

      expect(response1.cached).toBe(false);
      expect(response2.cached).toBe(true);
      expect(cost2).toBe(cost1); // No additional cost
    });

    it('should track cost by date for billing', async () => {
      const queries = [
        { query: 'Query 1' },
        { query: 'Query 2' },
        { query: 'Query 3' }
      ];

      for (const q of queries) {
        await externalLLMService.processQuery(q);
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyCost = externalLLMService.getCostByDate(today);

      expect(dailyCost).toBeGreaterThan(0);
    });

    it('should track cost by model for multi-model scenarios', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await externalLLMService.processQuery(query);

      const gpt4Cost = externalLLMService.getCostByModel('gpt-4');
      expect(gpt4Cost).toBeGreaterThan(0);
    });
  });

  describe('Response Caching Strategy', () => {
    it('should cache identical queries', async () => {
      const query: AIQuery = {
        query: 'What is the capital of France?'
      };

      const response1 = await externalLLMService.processQuery(query);
      const response2 = await externalLLMService.processQuery(query);

      expect(response1.cached).toBe(false);
      expect(response2.cached).toBe(true);
      expect(response1.content).toBe(response2.content);
    });

    it('should not cache different queries', async () => {
      const query1: AIQuery = {
        query: 'What is the capital of France?'
      };

      const query2: AIQuery = {
        query: 'What is the capital of Germany?'
      };

      const response1 = await externalLLMService.processQuery(query1);
      const response2 = await externalLLMService.processQuery(query2);

      expect(response1.cached).toBe(false);
      expect(response2.cached).toBe(false);
    });

    it('should provide cache statistics', async () => {
      const queries = [
        { query: 'Query 1' },
        { query: 'Query 2' },
        { query: 'Query 1' } // Duplicate
      ];

      for (const q of queries) {
        await externalLLMService.processQuery(q);
      }

      const stats = externalLLMService.getCacheStats();
      expect(stats.size).toBe(2); // Two unique queries
      expect(stats.entries).toBe(2);
    });
  });

  describe('API Management', () => {
    it('should validate API key', async () => {
      const isValid = await externalLLMService.validateApiKey();
      expect(isValid).toBe(true);
    });

    it('should list available models', async () => {
      const models = await externalLLMService.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should update configuration dynamically', () => {
      const originalConfig = externalLLMService.getConfig();
      expect(originalConfig.maxTokens).toBe(2000);

      externalLLMService.updateConfig({
        maxTokens: 4000,
        temperature: 0.5
      });

      const updatedConfig = externalLLMService.getConfig();
      expect(updatedConfig.maxTokens).toBe(4000);
      expect(updatedConfig.temperature).toBe(0.5);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle API errors gracefully', async () => {
      const mockClient = (externalLLMService as any).client;
      mockClient.chat.completions.create = jest.fn().mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      const query: AIQuery = {
        query: 'Test query'
      };

      await expect(externalLLMService.processQuery(query)).rejects.toThrow(
        'External LLM processing failed'
      );
    });

    it('should handle timeout errors', async () => {
      const mockClient = (externalLLMService as any).client;
      mockClient.chat.completions.create = jest.fn().mockRejectedValue(
        new Error('Request timeout')
      );

      const query: AIQuery = {
        query: 'Test query'
      };

      await expect(externalLLMService.processQuery(query)).rejects.toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should track response time', async () => {
      const query: AIQuery = {
        query: 'Performance test query'
      };

      const response = await externalLLMService.processQuery(query);

      expect(response.responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof response.responseTime).toBe('number');
    });

    it('should track token usage', async () => {
      const query: AIQuery = {
        query: 'Token tracking test'
      };

      const response = await externalLLMService.processQuery(query);

      expect(response.metadata?.inputTokens).toBe(200);
      expect(response.metadata?.outputTokens).toBe(150);
      expect(response.metadata?.totalTokens).toBe(350);
    });

    it('should calculate accurate costs', async () => {
      const query: AIQuery = {
        query: 'Cost calculation test'
      };

      const response = await externalLLMService.processQuery(query);

      // GPT-4: $0.03 per 1K input, $0.06 per 1K output
      // 200 input tokens: 0.2 * 0.03 = $0.006
      // 150 output tokens: 0.15 * 0.06 = $0.009
      // Total: ~$0.015
      expect(response.cost).toBeCloseTo(0.015, 3);
    });
  });

  describe('Multi-Query Scenarios', () => {
    it('should handle multiple sequential queries', async () => {
      const queries = [
        { query: 'First query' },
        { query: 'Second query' },
        { query: 'Third query' }
      ];

      const responses = [];
      for (const q of queries) {
        const response = await externalLLMService.processQuery(q);
        responses.push(response);
      }

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.routingTier).toBe(RoutingTier.EXTERNAL_LLM);
        expect(response.content).toBeDefined();
      });
    });

    it('should handle mixed cached and non-cached queries', async () => {
      const query1 = { query: 'Unique query 1' };
      const query2 = { query: 'Unique query 2' };

      // First batch
      const response1a = await externalLLMService.processQuery(query1);
      const response2a = await externalLLMService.processQuery(query2);

      // Second batch (should use cache)
      const response1b = await externalLLMService.processQuery(query1);
      const response2b = await externalLLMService.processQuery(query2);

      expect(response1a.cached).toBe(false);
      expect(response2a.cached).toBe(false);
      expect(response1b.cached).toBe(true);
      expect(response2b.cached).toBe(true);
    });

    it('should accumulate cost tracking across queries', async () => {
      const queries = [
        { query: 'Query 1' },
        { query: 'Query 2' },
        { query: 'Query 3' }
      ];

      for (const q of queries) {
        await externalLLMService.processQuery(q);
      }

      const tracking = externalLLMService.getCostTracking();
      expect(tracking.totalRequests).toBe(3);
      expect(tracking.totalCost).toBeGreaterThan(0);
      expect(tracking.totalInputTokens).toBe(600); // 200 * 3
      expect(tracking.totalOutputTokens).toBe(450); // 150 * 3
    });
  });

  describe('Cost Threshold Management', () => {
    it('should track spending for budget management', async () => {
      const queries = Array(5).fill(null).map((_, i) => ({
        query: `Query ${i + 1}`
      }));

      for (const q of queries) {
        await externalLLMService.processQuery(q);
      }

      const tracking = externalLLMService.getCostTracking();
      expect(tracking.totalCost).toBeGreaterThan(0);
      expect(tracking.averageCostPerRequest).toBeGreaterThan(0);
    });

    it('should provide cost breakdown by model', async () => {
      const query: AIQuery = {
        query: 'Cost breakdown test'
      };

      await externalLLMService.processQuery(query);

      const tracking = externalLLMService.getCostTracking();
      expect(tracking.costByModel['gpt-4']).toBeGreaterThan(0);
    });

    it('should reset cost tracking for new billing period', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await externalLLMService.processQuery(query);

      let tracking = externalLLMService.getCostTracking();
      expect(tracking.totalCost).toBeGreaterThan(0);

      externalLLMService.resetCostTracking();

      tracking = externalLLMService.getCostTracking();
      expect(tracking.totalCost).toBe(0);
      expect(tracking.totalRequests).toBe(0);
    });
  });
});
