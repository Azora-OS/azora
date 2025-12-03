/**
 * Local LLM Service Tests
 * Tests for on-device inference using quantized models
 */

import { LocalLLMService, LocalLLMConfig } from '../local-llm-service';
import { RoutingTier } from '../types';

describe('LocalLLMService', () => {
  let service: LocalLLMService;

  beforeEach(() => {
    service = new LocalLLMService();
  });

  afterEach(async () => {
    await service.unload();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const status = service.getStatus();
      expect(status.model).toBe('llama');
      expect(status.quantization).toBe('q4');
      expect(status.maxTokens).toBe(512);
    });

    it('should initialize with custom config', () => {
      const customService = new LocalLLMService({
        model: 'phi',
        quantization: 'q8',
        maxTokens: 1024
      });

      const status = customService.getStatus();
      expect(status.model).toBe('phi');
      expect(status.quantization).toBe('q8');
      expect(status.maxTokens).toBe(1024);
    });

    it('should load model on first use', async () => {
      expect(service.isReady()).toBe(false);
      await service.initialize();
      expect(service.isReady()).toBe(true);
    });

    it('should not reload model if already loaded', async () => {
      await service.initialize();
      const firstStatus = service.getStatus();
      await service.initialize();
      const secondStatus = service.getStatus();
      expect(firstStatus.loaded).toBe(secondStatus.loaded);
    });
  });

  describe('Query Processing', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should process a simple query', async () => {
      const response = await service.processQuery({
        query: 'Hello',
        userId: 'user-123'
      });

      expect(response.id).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.LOCAL_LLM);
      expect(response.cost).toBe(0);
      expect(response.cached).toBe(false);
      expect(response.responseTime).toBeGreaterThan(0);
    });

    it('should return cached response on second query', async () => {
      const query = { query: 'What is Azora?' };

      const firstResponse = await service.processQuery(query);
      expect(firstResponse.cached).toBe(false);

      const secondResponse = await service.processQuery(query);
      expect(secondResponse.cached).toBe(true);
      expect(secondResponse.content).toBe(firstResponse.content);
    });

    it('should handle FAQ queries', async () => {
      const response = await service.processQuery({
        query: 'How do I start with Azora?'
      });

      expect(response.content).toContain('start');
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should handle token-related queries', async () => {
      const response = await service.processQuery({
        query: 'What are AZR tokens?'
      });

      expect(response.content).toContain('token');
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should handle factual queries', async () => {
      const response = await service.processQuery({
        query: 'What is the capital of France?'
      });

      expect(response.content).toContain('Paris');
    });

    it('should handle unknown queries gracefully', async () => {
      const response = await service.processQuery({
        query: 'xyzabc unknown query'
      });

      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should include metadata in response', async () => {
      const response = await service.processQuery({
        query: 'Test query'
      });

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.model).toBe('llama');
      expect(response.metadata?.quantization).toBe('q4');
      expect(response.metadata?.tokensGenerated).toBeGreaterThan(0);
    });

    it('should have zero cost for local LLM', async () => {
      const response = await service.processQuery({
        query: 'Test query'
      });

      expect(response.cost).toBe(0);
    });

    it('should complete within reasonable time', async () => {
      const response = await service.processQuery({
        query: 'Test query'
      });

      // Local LLM should respond within 500ms
      expect(response.responseTime).toBeLessThan(500);
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should cache responses', async () => {
      const query = { query: 'Cache test' };

      await service.processQuery(query);
      const stats1 = service.getCacheStats();
      expect(stats1.size).toBe(1);

      await service.processQuery(query);
      const stats2 = service.getCacheStats();
      expect(stats2.size).toBe(1); // Same query, same cache entry
    });

    it('should clear cache', async () => {
      await service.processQuery({ query: 'Test 1' });
      await service.processQuery({ query: 'Test 2' });

      let stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      service.clearCache();
      stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should report cache statistics', async () => {
      await service.processQuery({ query: 'Test' });

      const stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.maxSize).toBe(1000);
      expect(stats.utilizationPercent).toBeGreaterThan(0);
      expect(stats.utilizationPercent).toBeLessThanOrEqual(100);
    });

    it('should limit cache size', async () => {
      // Add many queries to exceed cache limit
      for (let i = 0; i < 1100; i++) {
        await service.processQuery({ query: `Query ${i}` });
      }

      const stats = service.getCacheStats();
      // Cache should be limited to prevent memory issues
      expect(stats.size).toBeLessThanOrEqual(1000);
    });
  });

  describe('Service Status', () => {
    it('should report not ready before initialization', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should report ready after initialization', async () => {
      await service.initialize();
      expect(service.isReady()).toBe(true);
    });

    it('should provide detailed status', async () => {
      await service.initialize();

      const status = service.getStatus();
      expect(status.loaded).toBe(true);
      expect(status.model).toBeDefined();
      expect(status.quantization).toBeDefined();
      expect(status.cacheSize).toBeGreaterThanOrEqual(0);
      expect(status.maxTokens).toBeGreaterThan(0);
    });
  });

  describe('Model Unloading', () => {
    it('should unload model and free resources', async () => {
      await service.initialize();
      expect(service.isReady()).toBe(true);

      await service.unload();
      expect(service.isReady()).toBe(false);

      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should reinitialize after unloading', async () => {
      await service.initialize();
      await service.unload();
      expect(service.isReady()).toBe(false);

      await service.initialize();
      expect(service.isReady()).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('should support different quantization levels', () => {
      const q4Service = new LocalLLMService({ quantization: 'q4' });
      const q5Service = new LocalLLMService({ quantization: 'q5' });
      const q8Service = new LocalLLMService({ quantization: 'q8' });

      expect(q4Service.getStatus().quantization).toBe('q4');
      expect(q5Service.getStatus().quantization).toBe('q5');
      expect(q8Service.getStatus().quantization).toBe('q8');
    });

    it('should support different models', () => {
      const llamaService = new LocalLLMService({ model: 'llama' });
      const phiService = new LocalLLMService({ model: 'phi' });

      expect(llamaService.getStatus().model).toBe('llama');
      expect(phiService.getStatus().model).toBe('phi');
    });

    it('should support custom token limits', () => {
      const service512 = new LocalLLMService({ maxTokens: 512 });
      const service1024 = new LocalLLMService({ maxTokens: 1024 });

      expect(service512.getStatus().maxTokens).toBe(512);
      expect(service1024.getStatus().maxTokens).toBe(1024);
    });
  });

  describe('Response Quality', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should generate non-empty responses', async () => {
      const response = await service.processQuery({
        query: 'Test'
      });

      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should estimate token count', async () => {
      const response = await service.processQuery({
        query: 'Test'
      });

      expect(response.metadata?.tokensGenerated).toBeGreaterThan(0);
      // Rough check: tokens should be roughly 1/4 of characters
      const estimatedTokens = Math.ceil(response.content.length / 4);
      expect(response.metadata?.tokensGenerated).toBeLessThanOrEqual(estimatedTokens + 10);
    });

    it('should include temperature and topP in metadata', async () => {
      const response = await service.processQuery({
        query: 'Test'
      });

      expect(response.metadata?.temperature).toBe(0.7);
      expect(response.metadata?.topP).toBe(0.9);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Create a service and try to process without proper initialization
      const testService = new LocalLLMService();
      // Should auto-initialize on first query
      const response = await testService.processQuery({
        query: 'Test'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle empty queries', async () => {
      await service.initialize();

      const response = await service.processQuery({
        query: ''
      });

      expect(response.content).toBeDefined();
    });

    it('should handle very long queries', async () => {
      await service.initialize();

      const longQuery = 'test '.repeat(1000);
      const response = await service.processQuery({
        query: longQuery
      });

      expect(response.content).toBeDefined();
      expect(response.responseTime).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should process queries quickly', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        await service.processQuery({
          query: `Query ${i}`
        });
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 10;

      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(500);
    });

    it('should serve cached responses faster', async () => {
      const query = { query: 'Performance test' };

      // First query (not cached)
      const firstResponse = await service.processQuery(query);
      const firstTime = firstResponse.responseTime;

      // Second query (cached)
      const secondResponse = await service.processQuery(query);
      const secondTime = secondResponse.responseTime;

      // Cached response should be faster
      expect(secondTime).toBeLessThan(firstTime);
    });
  });
});
