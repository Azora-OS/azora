/**
 * RAP System Integration Tests
 * Tests for Retrieval-Augmented Prompt system integration with AI routing
 */

import { RAPSystem, RAPSystemConfig } from '../../services/ai-routing/rap-system';
import { AIQuery, RoutingTier } from '../../services/ai-routing/types';

describe('RAP System Integration', () => {
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
      externalLLMApiKey: process.env.OPENAI_API_KEY || 'test-key',
      embeddingApiKey: process.env.OPENAI_API_KEY || 'test-embedding-key',
      vectorDbApiKey: process.env.PINECONE_API_KEY || 'test-vector-key',
      vectorDbIndexName: 'azora-knowledge'
    };

    rapSystem = new RAPSystem(mockConfig);
  });

  describe('Complete RAP Flow', () => {
    it('should process query through complete RAP pipeline', async () => {
      const query: AIQuery = {
        query: 'What are the key principles of machine learning?',
        userId: 'test-user-123',
        context: {
          courseId: 'ml-101',
          difficulty: 'intermediate'
        }
      };

      // Mock the services
      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

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
            tags: ['machine-learning', 'principles'],
            title: 'ML Fundamentals',
            url: 'https://azora.example.com/ml-fundamentals'
          }
        },
        {
          id: 'source-2',
          score: 0.88,
          metadata: {
            date: '2024-01-02',
            source: 'external',
            category: 'Research',
            verified: false,
            relevance: 0.88,
            tags: ['ml', 'research'],
            title: 'Recent ML Research',
            url: 'https://research.example.com/ml-2024'
          }
        }
      ]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: `The key principles of machine learning include:

1. **Supervised Learning**: Learning from labeled data to make predictions
2. **Unsupervised Learning**: Finding patterns in unlabeled data
3. **Reinforcement Learning**: Learning through interaction and rewards
4. **Generalization**: Models should perform well on unseen data
5. **Regularization**: Preventing overfitting through constraints
6. **Feature Engineering**: Selecting and transforming relevant features
7. **Cross-validation**: Evaluating model performance reliably

These principles are fundamental to building effective ML systems.`
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response).toBeDefined();
      expect(response.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(response.content).toContain('machine learning');
      expect(response.responseTime).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.cached).toBe(false);
      expect(response.metadata?.internalSourcesCount).toBeGreaterThan(0);
    });

    it('should handle context injection correctly', async () => {
      const query: AIQuery = {
        query: 'Explain neural networks',
        userId: 'test-user-456',
        context: {
          userLevel: 'beginner',
          language: 'en'
        }
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([
        {
          id: 'nn-guide',
          score: 0.92,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'AI',
            verified: true,
            relevance: 0.92,
            tags: ['neural-networks', 'beginner'],
            title: 'Neural Networks for Beginners',
            url: 'https://azora.example.com/nn-beginner'
          }
        }
      ]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Neural networks are computational models inspired by biological neurons...'
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response).toBeDefined();
      expect(response.metadata?.contextLength).toBeGreaterThan(0);
    });
  });

  describe('70/30 Rule Enforcement', () => {
    it('should weight internal sources at 70%', async () => {
      const queryEmbedding = new Array(1536).fill(0.1);
      const query = 'Test query';

      const mockInternalSources = Array(7).fill(null).map((_, i) => ({
        id: `internal-${i}`,
        score: 0.9 - (i * 0.01),
        metadata: {
          date: '2024-01-01',
          source: 'internal',
          category: 'Education',
          verified: true,
          relevance: 0.9 - (i * 0.01),
          tags: ['education'],
          title: `Internal Source ${i}`,
          url: `https://internal.example.com/${i}`
        }
      }));

      const mockExternalSources = Array(3).fill(null).map((_, i) => ({
        id: `external-${i}`,
        score: 0.85 - (i * 0.01),
        metadata: {
          date: '2024-01-02',
          source: 'external',
          category: 'Research',
          verified: false,
          relevance: 0.85 - (i * 0.01),
          tags: ['research'],
          title: `External Source ${i}`,
          url: `https://external.example.com/${i}`
        }
      }));

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch')
        .mockResolvedValueOnce(mockInternalSources)
        .mockResolvedValueOnce(mockExternalSources);

      const context = await rapSystem['retrieveContext'](queryEmbedding);

      expect(context.internalSources).toHaveLength(7);
      expect(context.externalSources).toHaveLength(3);
      expect(context.internalWeight).toBe(0.7);
      expect(context.externalWeight).toBe(0.3);
    });

    it('should format context with proper weighting labels', () => {
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
            tags: ['ml'],
            title: 'Internal ML Guide',
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
            title: 'External Research',
            url: 'https://example.com/research'
          }
        }
      ];

      const formatted = rapSystem['formatContext'](internalSources, externalSources);

      // Verify 70% label
      expect(formatted).toContain('70% weight');
      // Verify 30% label
      expect(formatted).toContain('30% weight');
      // Verify internal sources come first
      expect(formatted.indexOf('70% weight')).toBeLessThan(formatted.indexOf('30% weight'));
    });
  });

  describe('Response Synthesis', () => {
    it('should synthesize response from multiple sources', async () => {
      const query: AIQuery = {
        query: 'Compare supervised and unsupervised learning'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([
        {
          id: 'supervised-guide',
          score: 0.93,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'ML',
            verified: true,
            relevance: 0.93,
            tags: ['supervised-learning'],
            title: 'Supervised Learning Guide',
            url: 'https://azora.example.com/supervised'
          }
        },
        {
          id: 'unsupervised-guide',
          score: 0.91,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'ML',
            verified: true,
            relevance: 0.91,
            tags: ['unsupervised-learning'],
            title: 'Unsupervised Learning Guide',
            url: 'https://azora.example.com/unsupervised'
          }
        }
      ]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: `Supervised vs Unsupervised Learning:

**Supervised Learning:**
- Uses labeled training data
- Goal: Predict output for new inputs
- Examples: Classification, Regression

**Unsupervised Learning:**
- Uses unlabeled data
- Goal: Discover hidden patterns
- Examples: Clustering, Dimensionality Reduction

**Key Differences:**
- Data labeling requirement
- Problem formulation
- Evaluation metrics`
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response.content).toContain('Supervised');
      expect(response.content).toContain('Unsupervised');
      expect(response.metadata?.internalSourcesCount).toBeGreaterThan(0);
    });
  });

  describe('Caching and Performance', () => {
    it('should cache responses for identical queries', async () => {
      const query: AIQuery = {
        query: 'What is deep learning?'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Deep learning is a subset of machine learning...'
            }
          }
        ]
      });

      // First call
      const response1 = await rapSystem.processQuery(query);
      const time1 = response1.responseTime;

      // Second call (should be cached)
      const response2 = await rapSystem.processQuery(query);
      const time2 = response2.responseTime;

      expect(response2.cached).toBe(true);
      expect(time2).toBeLessThan(time1);
      expect(response2.cost).toBe(0);
    });

    it('should track cache statistics', async () => {
      rapSystem.clearCache();

      const query1: AIQuery = { query: 'Query 1' };
      const query2: AIQuery = { query: 'Query 2' };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Response'
            }
          }
        ]
      });

      await rapSystem.processQuery(query1);
      await rapSystem.processQuery(query2);

      const stats = rapSystem.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toBe(2);
    });
  });

  describe('Cost Tracking', () => {
    it('should calculate and track costs', async () => {
      const query: AIQuery = {
        query: 'Explain the transformer architecture in detail with examples'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([
        {
          id: 'transformer-guide',
          score: 0.94,
          metadata: {
            date: '2024-01-01',
            source: 'internal',
            category: 'AI',
            verified: true,
            relevance: 0.94,
            tags: ['transformers', 'architecture'],
            title: 'Transformer Architecture Guide',
            url: 'https://azora.example.com/transformers'
          }
        }
      ]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'The transformer architecture is a deep learning model that uses self-attention mechanisms...'
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response.cost).toBeGreaterThan(0);
      expect(typeof response.cost).toBe('number');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle missing context gracefully', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch').mockResolvedValue([]);

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Response without context'
            }
          }
        ]
      });

      const response = await rapSystem.processQuery(query);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.metadata?.internalSourcesCount).toBe(0);
    });

    it('should handle partial retrieval failures', async () => {
      const query: AIQuery = {
        query: 'Test query'
      };

      jest.spyOn(rapSystem['embeddingService'], 'generateEmbedding').mockResolvedValue(
        new Array(1536).fill(0.1)
      );

      // First call succeeds, second fails
      jest.spyOn(rapSystem['vectorStorage'], 'semanticSearch')
        .mockResolvedValueOnce([
          {
            id: 'source-1',
            score: 0.9,
            metadata: {
              date: '2024-01-01',
              source: 'internal',
              category: 'Test',
              verified: true,
              relevance: 0.9,
              tags: ['test'],
              title: 'Test Source',
              url: 'https://example.com'
            }
          }
        ])
        .mockRejectedValueOnce(new Error('Retrieval failed'));

      jest.spyOn(rapSystem['externalLLMClient'].chat.completions, 'create').mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Response'
            }
          }
        ]
      });

      await expect(rapSystem.processQuery(query)).rejects.toThrow();
    });
  });
});
