/**
 * External LLM Service Tests
 * Tests for OpenAI GPT-4 integration with cost tracking and caching
 */

import { ExternalLLMService, ExternalLLMConfig } from '../external-llm-service';
import { AIQuery, RoutingTier } from '../types';

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
                  content: 'Test response from OpenAI'
                }
              }
            ],
            usage: {
              prompt_tokens: 100,
              completion_tokens: 50
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

// Mock Anthropic client
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Test response from Anthropic'
          }
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 50
        }
      })
    }
  }));
});

describe('ExternalLLMService', () => {
  let service: ExternalLLMService;
  let config: ExternalLLMConfig;

  beforeEach(() => {
    config = {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'test-api-key',
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      cacheTTL: 3600
    };

    service = new ExternalLLMService(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with OpenAI provider', () => {
      const openaiService = new ExternalLLMService({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key'
      });

      expect(openaiService).toBeDefined();
    });

    it('should initialize with Anthropic provider', () => {
      const anthropicService = new ExternalLLMService({
        provider: 'anthropic',
        model: 'claude-3-opus',
        apiKey: 'test-key'
      });

      expect(anthropicService).toBeDefined();
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        new ExternalLLMService({
          provider: 'unsupported' as any,
          model: 'test-model',
          apiKey: 'test-key'
        });
      }).toThrow('Unsupported LLM provider');
    });

    it('should set default configuration values', () => {
      const minimalConfig: ExternalLLMConfig = {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key'
      };

      const minimalService = new ExternalLLMService(minimalConfig);
      const retrievedConfig = minimalService.getConfig();

      expect(retrievedConfig.maxTokens).toBe(2000);
      expect(retrievedConfig.temperature).toBe(0.7);
      expect(retrievedConfig.topP).toBe(0.9);
      expect(retrievedConfig.cacheTTL).toBe(3600);
    });
  });

  describe('Query Processing', () => {
    it('should process a query and return AIResponse', async () => {
      const query: AIQuery = {
        query: 'What is the capital of France?',
        userId: 'user-123'
      };

      const response = await service.processQuery(query);

      expect(response).toBeDefined();
      expect(response.content).toBe('Test response from OpenAI');
      expect(response.routingTier).toBe(RoutingTier.EXTERNAL_LLM);
      expect(response.cached).toBe(false);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should include metadata in response', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      const response = await service.processQuery(query);

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.provider).toBe('openai');
      expect(response.metadata?.model).toBe('gpt-4');
      expect(response.metadata?.inputTokens).toBe(100);
      expect(response.metadata?.outputTokens).toBe(50);
      expect(response.metadata?.totalTokens).toBe(150);
    });

    it('should return cached response on second query', async () => {
      const query: AIQuery = {
        query: 'What is 2+2?'
      };

      // First call
      const response1 = await service.processQuery(query);
      expect(response1.cached).toBe(false);

      // Second call with same query
      const response2 = await service.processQuery(query);
      expect(response2.cached).toBe(true);
      expect(response2.cost).toBe(0); // No cost for cached response
      expect(response2.content).toBe(response1.content);
    });

    it('should handle query with context', async () => {
      const query: AIQuery = {
        query: 'Summarize this text',
        context: {
          text: 'Long text content here...'
        }
      };

      const response = await service.processQuery(query);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('Cost Tracking', () => {
    it('should track cost for API calls', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      const initialTracking = service.getCostTracking();
      expect(initialTracking.totalCost).toBe(0);
      expect(initialTracking.totalRequests).toBe(0);

      await service.processQuery(query);

      const tracking = service.getCostTracking();
      expect(tracking.totalCost).toBeGreaterThan(0);
      expect(tracking.totalRequests).toBe(1);
      expect(tracking.totalInputTokens).toBe(100);
      expect(tracking.totalOutputTokens).toBe(50);
    });

    it('should calculate average cost per request', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);
      await service.processQuery(query); // Second call uses cache, no cost

      const tracking = service.getCostTracking();
      expect(tracking.averageCostPerRequest).toBeGreaterThan(0);
      expect(tracking.totalRequests).toBe(2);
    });

    it('should track cost by model', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const tracking = service.getCostTracking();
      expect(tracking.costByModel['gpt-4']).toBeGreaterThan(0);
    });

    it('should track cost by date', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const tracking = service.getCostTracking();
      const today = new Date().toISOString().split('T')[0];
      expect(tracking.costByDate[today]).toBeGreaterThan(0);
    });

    it('should get cost for specific date', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const today = new Date().toISOString().split('T')[0];
      const cost = service.getCostByDate(today);
      expect(cost).toBeGreaterThan(0);
    });

    it('should get cost for specific model', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const cost = service.getCostByModel('gpt-4');
      expect(cost).toBeGreaterThan(0);
    });

    it('should reset cost tracking', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      let tracking = service.getCostTracking();
      expect(tracking.totalCost).toBeGreaterThan(0);

      service.resetCostTracking();

      tracking = service.getCostTracking();
      expect(tracking.totalCost).toBe(0);
      expect(tracking.totalRequests).toBe(0);
      expect(tracking.totalInputTokens).toBe(0);
      expect(tracking.totalOutputTokens).toBe(0);
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate cost for GPT-4', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      const response = await service.processQuery(query);

      // GPT-4: $0.03 per 1K input, $0.06 per 1K output
      // 100 input tokens: 0.1 * 0.03 = $0.003
      // 50 output tokens: 0.05 * 0.06 = $0.003
      // Total: ~$0.006
      expect(response.cost).toBeCloseTo(0.006, 3);
    });

    it('should calculate cost for GPT-4 Turbo', async () => {
      const turboService = new ExternalLLMService({
        provider: 'openai',
        model: 'gpt-4-turbo',
        apiKey: 'test-key'
      });

      const query: AIQuery = {
        query: 'Test query'
      };

      const response = await turboService.processQuery(query);

      // GPT-4 Turbo: $0.01 per 1K input, $0.03 per 1K output
      // 100 input tokens: 0.1 * 0.01 = $0.001
      // 50 output tokens: 0.05 * 0.03 = $0.0015
      // Total: ~$0.0025
      expect(response.cost).toBeCloseTo(0.0025, 3);
    });

    it('should calculate cost for GPT-3.5', async () => {
      const gpt35Service = new ExternalLLMService({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-key'
      });

      const query: AIQuery = {
        query: 'Test query'
      };

      const response = await gpt35Service.processQuery(query);

      // GPT-3.5: $0.0005 per 1K input, $0.0015 per 1K output
      // 100 input tokens: 0.1 * 0.0005 = $0.00005
      // 50 output tokens: 0.05 * 0.0015 = $0.000075
      // Total: ~$0.000125
      expect(response.cost).toBeCloseTo(0.000125, 6);
    });
  });

  describe('Caching', () => {
    it('should cache responses', async () => {
      const query: AIQuery = {
        query: 'Cached query'
      };

      const response1 = await service.processQuery(query);
      const response2 = await service.processQuery(query);

      expect(response1.cached).toBe(false);
      expect(response2.cached).toBe(true);
      expect(response1.content).toBe(response2.content);
    });

    it('should get cache statistics', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const stats = service.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toBe(1);
    });

    it('should clear cache', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      let stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      service.clearCache();

      stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should get cache size', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      await service.processQuery(query);

      const size = service.getCacheSize();
      expect(size).toBe(1);
    });

    it('should respect cache TTL', async () => {
      const shortTTLService = new ExternalLLMService({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key',
        cacheTTL: 1 // 1 second
      });

      const query: AIQuery = {
        query: 'Test query'
      };

      const response1 = await shortTTLService.processQuery(query);
      expect(response1.cached).toBe(false);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      const response2 = await shortTTLService.processQuery(query);
      expect(response2.cached).toBe(false); // Cache expired
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig: Partial<ExternalLLMConfig> = {
        maxTokens: 4000,
        temperature: 0.5
      };

      service.updateConfig(newConfig);

      const config = service.getConfig();
      expect(config.maxTokens).toBe(4000);
      expect(config.temperature).toBe(0.5);
    });

    it('should get current configuration', () => {
      const config = service.getConfig();

      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4');
      expect(config.apiKey).toBe('test-api-key');
    });

    it('should reinitialize client on provider change', () => {
      service.updateConfig({
        provider: 'anthropic',
        model: 'claude-3-opus'
      });

      const config = service.getConfig();
      expect(config.provider).toBe('anthropic');
      expect(config.model).toBe('claude-3-opus');
    });
  });

  describe('API Key Validation', () => {
    it('should validate API key for OpenAI', async () => {
      const isValid = await service.validateApiKey();
      expect(isValid).toBe(true);
    });

    it('should handle invalid API key', async () => {
      const invalidService = new ExternalLLMService({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'invalid-key'
      });

      // Mock the models.list to throw error
      const mockClient = (invalidService as any).client;
      mockClient.models.list = jest.fn().mockRejectedValue(new Error('Invalid API key'));

      const isValid = await invalidService.validateApiKey();
      expect(isValid).toBe(false);
    });
  });

  describe('Available Models', () => {
    it('should get available OpenAI models', async () => {
      const models = await service.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('gpt-4');
    });

    it('should get available Anthropic models', async () => {
      const anthropicService = new ExternalLLMService({
        provider: 'anthropic',
        model: 'claude-3-opus',
        apiKey: 'test-key'
      });

      const models = await anthropicService.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('claude-3-opus');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockClient = (service as any).client;
      mockClient.chat.completions.create = jest.fn().mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      const query: AIQuery = {
        query: 'Test query'
      };

      await expect(service.processQuery(query)).rejects.toThrow('External LLM processing failed');
    });

    it('should handle network errors', async () => {
      const mockClient = (service as any).client;
      mockClient.chat.completions.create = jest.fn().mockRejectedValue(
        new Error('Network error: Connection timeout')
      );

      const query: AIQuery = {
        query: 'Test query'
      };

      await expect(service.processQuery(query)).rejects.toThrow('External LLM processing failed');
    });
  });
});
