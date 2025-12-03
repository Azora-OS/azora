/**
 * RAP System Tests
 * Tests for Retrieval-Augmented Prompt system with Knowledge Ocean integration
 */

import { RAPSystem, RAPSystemConfig, RetrievedContext } from '../rap-system';
import { AIQuery, RoutingTier } from '../types';

// Mock dependencies
jest.mock('../../../services/azora-sapiens/src/embeddings');
jest.mock('../../../services/azora-sapiens/src/vector-storage');
jest.mock('../../../services/azora-sapiens/src/knowledge-ocean');

describe('RAPSystem', () => {
  let rapSystem: RAPSystem;
  let mockConfig: RAPSystemConfig;

  beforeEach(() => {
    mockConfig = {
      internalSourceWeight: 0.7,
      externalSourceWeight: 0.3,
      maxContextTokens: 2000,
      maxRetrievalResults: 10,
      externalLLMProvider: 'openai',
      externalLLMModel: 'gpt-4',
      externalLLMApiKey: 'test-key',
      embeddingApiKey: 'test-embedding-key',
      vectorDbApiKey: 'test-vector-key',
      vectorDbIndexName: 'azora-knowledge'
    };

    rapSystem = new RAPSystem(mockConfig);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const config: RAPSystemConfig = {
        internalSourceWeight: 0.7,
        externalSourceWeight: 0.3,
        maxContextTokens: 2000,
        maxRetrievalResults: 10,
        externalLLMProvider: 'openai',
        externalLLMModel: 'gpt-4',
        externalLLMApiKey: 'test-key',
        embeddingApiKey: 'test-embedding-key',
        vectorDbApiKey: 'test-vector-key'
      };

      const system = new RAPSystem(config);
      expect(system).toBeDefined();
    });

    it('should set 70/30 rule weights correctly', () => {
      expect(rapSystem['config'].internalSourceWeight).toBe(0.7);
      expect(rapSystem['config'].externalSourceWeight).toBe(0.3);
    });

    it('should initialize external LLM client for OpenAI', () => {
      expect(rapSystem['externalLLMClient']).toBeDefined();
    });
  });

  describe('Query Processing', () => {
    it('should process a query and return AIResponse', async () => {
      const query: AIQuery = {
        query: 'What are the best practices for machine learning?',
        userId: 'user-123'
      };

      // Mock the embedding service
      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      // Mock vector storage search
      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([
        {
          id: 'source-1',
          score: 0.95,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'ML',
            verified: true,
            relevance: 0.95,
            tags: ['machine-learning', 'best-practices'],
            title: 'ML Best Practices Guide',
            url: 'https://example.com/ml-guide'
          }
        }
      ]);

      // Mock external LLM call
      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Machine learning best practices include data validation, model evaluation, and hyperparameter tuning.'
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(response.content).toBeTruthy();
      expect(response.responseTime).toBeGreaterThan(0);
      expect(response.cached).toBe(false);
    });

    it('should return cached response on second query', async () => {
      const query: AIQuery = {
        query: 'What is artificial intelligence?',
        userId: 'user-123'
      };

      // Mock the embedding service
      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      // Mock vector storage search
      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([]);

      // Mock external LLM call
      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Artificial intelligence is the simulation of human intelligence by machines.'
            }
          }
        ]
      });

      // First call
      const response1 = await rapSystem.processQuery(query);
      expect(response1.cached).toBe(false);

      // Second call should be cached
      const response2 = await rapSystem.processQuery(query);
      expect(response2.cached).toBe(true);
      expect(response2.cost).toBe(0);
    });
  });

  describe('Context Retrieval', () => {
    it('should retrieve context with 70/30 rule', async () => {
      const queryEmbedding = new Array(1536).fill(0.1);
      const query = 'Test query';

      // Mock vector storage search
      const mockInternalSources = [
        {
          id: 'internal-1',
          score: 0.95,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'Education',
            verified: true,
            relevance: 0.95,
            tags: ['education'],
            title: 'Internal Source',
            url: 'https://internal.example.com'
          }
        }
      ];

      const mockExternalSources = [
        {
          id: 'external-1',
          score: 0.85,
          metadata: {
            date: '2024-01-02',
            source: 'external',
            category: 'Research',
            verified: false,
            relevance: 0.85,
            tags: ['research'],
            title: 'External Source',
            url: 'https://external.example.com'
          }
        }
      ];

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch')
        .mockResolvedValueOnce(mockInternalSources)
        .mockResolvedValueOnce(mockExternalSources);

      const context = await rapSystem['retrieveContext'](queryEmbedding, query);

      expect(context).toBeDefined();
      expect(context.internalSources).toHaveLength(1);
      expect(context.externalSources).toHaveLength(1);
      expect(context.internalWeight).toBe(0.7);
      expect(context.externalWeight).toBe(0.3);
      expect(context.combinedContext).toContain('Internal Knowledge Sources (70% weight)');
      expect(context.combinedContext).toContain('External Knowledge Sources (30% weight)');
    });

    it('should format context correctly', () => {
      const internalSources = [
        {
          id: 'internal-1',
          score: 0.95,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'ML',
            verified: true,
            relevance: 0.95,
            tags: ['ml', 'ai'],
            title: 'ML Guide',
            url: 'https://example.com/ml'
          }
        }
      ];

      const externalSources = [
        {
          id: 'external-1',
          score: 0.85,
          metadata: {
            date: '2024-01-02',
            source: 'external',
            category: 'Research',
            verified: false,
            relevance: 0.85,
            tags: ['research'],
            title: 'Research Paper',
            url: 'https://example.com/paper'
          }
        }
      ];

      const formatted = rapSystem['formatContext'](internalSources, externalSources);

      expect(formatted).toContain('Internal Knowledge Sources (70% weight)');
      expect(formatted).toContain('External Knowledge Sources (30% weight)');
      expect(formatted).toContain('ML Guide');
      expect(formatted).toContain('Research Paper');
      expect(formatted).toContain('95.00%'); // Relevance score
      expect(formatted).toContain('85.00%'); // Relevance score
    });
  });

  describe('RAP Building', () => {
    it('should build RAP with context injection', () => {
      const query = 'What is the future of AI?';
      const context: RetrievedContext = {
        internalSources: [],
        externalSources: [],
        combinedContext: 'Sample context about AI',
        internalWeight: 0.7,
        externalWeight: 0.3
      };

      const rap = rapSystem['buildRAP'](query, context);

      expect(rap).toContain(query);
      expect(rap).toContain('Sample context about AI');
      expect(rap).toContain('Knowledge Ocean');
      expect(rap).toContain('70%');
      expect(rap).toContain('30%');
    });

    it('should prioritize internal sources in RAP', () => {
      const query = 'Test query';
      const context: RetrievedContext = {
        internalSources: [],
        externalSources: [],
        combinedContext: 'Internal: verified data\nExternal: supplementary data',
        internalWeight: 0.7,
        externalWeight: 0.3
      };

      const rap = rapSystem['buildRAP'](query, context);

      expect(rap).toContain('prioritize internal sources');
      expect(rap).toContain('70%');
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate cost based on token count', () => {
      const prompt = 'This is a test prompt with some content';
      const response = 'This is a test response with some content';

      const cost = rapSystem['calculateCost'](prompt, response);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should calculate higher cost for longer content', () => {
      const shortPrompt = 'Short';
      const shortResponse = 'Short';
      const shortCost = rapSystem['calculateCost'](shortPrompt, shortResponse);

      const longPrompt = 'This is a much longer prompt with significantly more content that will result in more tokens';
      const longResponse = 'This is a much longer response with significantly more content that will result in more tokens';
      const longCost = rapSystem['calculateCost'](longPrompt, longResponse);

      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('Caching', () => {
    it('should cache responses', () => {
      const queryHash = 'test-hash-123';
      const response = 'Test response content';

      rapSystem['setInCache'](queryHash, response);
      const cached = rapSystem['getFromCache'](queryHash);

      expect(cached).toBe(response);
    });

    it('should return null for expired cache entries', async () => {
      const queryHash = 'test-hash-456';
      const response = 'Test response';

      rapSystem['setInCache'](queryHash, response);

      // Manually expire the cache
      const cacheEntry = rapSystem['responseCache'].get(queryHash);
      if (cacheEntry) {
        cacheEntry.timestamp = Date.now() - (4 * 3600000); // 4 hours ago
      }

      const cached = rapSystem['getFromCache'](queryHash);
      expect(cached).toBeNull();
    });

    it('should get cache statistics', () => {
      rapSystem.clearCache();
      rapSystem['setInCache']('hash-1', 'response-1');
      rapSystem['setInCache']('hash-2', 'response-2');

      const stats = rapSystem.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toBe(2);
    });

    it('should clear cache', () => {
      rapSystem['setInCache']('hash-1', 'response-1');
      rapSystem['setInCache']('hash-2', 'response-2');

      rapSystem.clearCache();
      const stats = rapSystem.getCacheStats();

      expect(stats.size).toBe(0);
    });
  });

  describe('Knowledge Ocean Integration', () => {
    it('should get Knowledge Ocean statistics', () => {
      const stats = rapSystem.getKnowledgeOceanStats();

      expect(stats).toBeDefined();
      expect(stats.totalSources).toBe(0);
      expect(stats.verifiedSources).toBe(0);
    });

    it('should ingest knowledge source', async () => {
      const source = {
        type: 'research',
        source: 'academic',
        url: 'https://example.com/paper',
        title: 'Test Paper',
        content: 'Test content',
        metadata: {
          date: '2024-01-01',
          category: 'ML',
          verified: true,
          relevance: 0.9,
          tags: ['ml', 'ai']
        }
      };

      const result = await rapSystem.ingestKnowledgeSource(source);

      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
      expect(result.title).toBe('Test Paper');
    });

    it('should ingest multiple knowledge sources', async () => {
      const sources = [
        {
          type: 'research',
          source: 'academic',
          url: 'https://example.com/paper1',
          title: 'Paper 1',
          content: 'Content 1',
          metadata: {
            date: '2024-01-01',
            category: 'ML',
            verified: true,
            relevance: 0.9,
            tags: ['ml']
          }
        },
        {
          type: 'news',
          source: 'news',
          url: 'https://example.com/news1',
          title: 'News 1',
          content: 'News content',
          metadata: {
            date: '2024-01-02',
            category: 'AI',
            verified: true,
            relevance: 0.8,
            tags: ['ai']
          }
        }
      ];

      const results = await rapSystem.ingestKnowledgeSources(sources);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Paper 1');
      expect(results[1].title).toBe('News 1');
    });
  });

  describe('Error Handling', () => {
    it('should handle embedding generation errors', async () => {
      const query: AIQuery = {
        query: 'Test query',
        userId: 'user-123'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockRejectedValue(
        new Error('Embedding service error')
      );

      await expect(rapSystem.processQuery(query)).rejects.toThrow('RAP System processing failed');
    });

    it('should handle external LLM errors', async () => {
      const query: AIQuery = {
        query: 'Test query',
        userId: 'user-123'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockRejectedValue(
        new Error('LLM API error')
      );

      await expect(rapSystem.processQuery(query)).rejects.toThrow('RAP System processing failed');
    });
  });

  describe('Metadata Tracking', () => {
    it('should include metadata in response', async () => {
      const query: AIQuery = {
        query: 'Test query',
        userId: 'user-123'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch')
        .mockResolvedValueOnce([
          {
            id: 'internal-1',
            score: 0.95,
            metadata: {
              date: '2024-01-01',
              source: 'internal',
              category: 'ML',
              verified: true,
              relevance: 0.95,
              tags: ['ml'],
              title: 'ML Guide',
              url: 'https://example.com'
            }
          }
        ])
        .mockResolvedValueOnce([]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Test response'
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.cacheHit).toBe(false);
      expect(response.metadata?.retrievalMethod).toBe('rap');
      expect(response.metadata?.internalSourcesCount).toBe(1);
      expect(response.metadata?.externalSourcesCount).toBe(0);
    });
  });
});
