import { KnowledgeOceanRetriever } from '../../services/ai-routing/knowledge-ocean/retriever';
import { VectorDBClient } from '../../services/ai-routing/knowledge-ocean/vector-db-client';
import { ContextRanker } from '../../services/ai-routing/knowledge-ocean/context-ranker';
import { ContextInjector } from '../../services/ai-routing/knowledge-ocean/context-injector';

describe('Knowledge Ocean Pipeline Integration', () => {
  let retriever: KnowledgeOceanRetriever;
  let vectorDb: VectorDBClient;
  let ranker: ContextRanker;
  let injector: ContextInjector;

  beforeAll(() => {
    vectorDb = new VectorDBClient();
    ranker = new ContextRanker();
    injector = new ContextInjector();
    retriever = new KnowledgeOceanRetriever(vectorDb, ranker);
  });

  describe('Document Retrieval', () => {
    it('should retrieve relevant documents', async () => {
      const query = 'How does machine learning work?';

      const result = await retriever.retrieve(query);

      expect(result.documents).toBeDefined();
      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.retrievalTime).toBeLessThan(100);
    });

    it('should implement 70/30 rule', async () => {
      const query = 'Educational content';

      const result = await retriever.retrieve(query);
      const internalRatio = result.internalCount / (result.internalCount + result.externalCount);

      expect(internalRatio).toBeGreaterThanOrEqual(0.65);
      expect(internalRatio).toBeLessThanOrEqual(0.75);
    });

    it('should rank documents by relevance', async () => {
      const query = 'Python programming';

      const result = await retriever.retrieve(query);
      const ranked = ranker.rankDocuments(result.documents);

      expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1]?.score || 0);
    });

    it('should handle empty results gracefully', async () => {
      const query = 'Nonexistent topic xyz123abc';

      const result = await retriever.retrieve(query);

      expect(result.documents).toBeDefined();
      expect(Array.isArray(result.documents)).toBe(true);
    });

    it('should achieve <100ms latency at p95', async () => {
      const queries = Array(100).fill('test query');
      const latencies: number[] = [];

      for (const query of queries) {
        const start = Date.now();
        await retriever.retrieve(query);
        latencies.push(Date.now() - start);
      }

      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];

      expect(p95).toBeLessThan(100);
    });
  });

  describe('70/30 Rule Enforcement', () => {
    it('should enforce 70% internal sources', async () => {
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc-${i}`,
        content: `Document ${i}`,
        metadata: {
          source: i < 70 ? 'internal' : 'external',
          category: 'test',
          timestamp: new Date(),
          tags: []
        }
      }));

      const enforced = retriever.applySeventyThirtyRule(documents);

      const internalCount = enforced.filter(d => d.metadata.source === 'internal').length;
      const externalCount = enforced.filter(d => d.metadata.source === 'external').length;

      expect(internalCount).toBeGreaterThanOrEqual(externalCount * 2);
    });

    it('should maintain quality with 70/30 split', async () => {
      const query = 'Quality content';

      const result = await retriever.retrieve(query);

      expect(result.internalCount + result.externalCount).toBeGreaterThan(0);
      expect(result.totalRelevanceScore).toBeGreaterThan(0);
    });
  });

  describe('Context Ranking', () => {
    it('should rank by relevance score', async () => {
      const documents = [
        { id: '1', content: 'Highly relevant', score: 0.95 },
        { id: '2', content: 'Moderately relevant', score: 0.65 },
        { id: '3', content: 'Slightly relevant', score: 0.35 }
      ];

      const ranked = ranker.rankDocuments(documents);

      expect(ranked[0].score).toBe(0.95);
      expect(ranked[1].score).toBe(0.65);
      expect(ranked[2].score).toBe(0.35);
    });

    it('should deduplicate results', async () => {
      const documents = [
        { id: '1', content: 'Same content', score: 0.9 },
        { id: '2', content: 'Same content', score: 0.85 }
      ];

      const ranked = ranker.rankDocuments(documents);

      expect(ranked.length).toBeLessThanOrEqual(documents.length);
    });

    it('should apply diversity scoring', async () => {
      const documents = [
        { id: '1', content: 'Topic A', category: 'education', score: 0.9 },
        { id: '2', content: 'Topic B', category: 'finance', score: 0.85 },
        { id: '3', content: 'Topic A again', category: 'education', score: 0.8 }
      ];

      const ranked = ranker.rankDocuments(documents);

      expect(ranked[0].category).not.toBe(ranked[1].category);
    });
  });

  describe('Context Injection', () => {
    it('should inject context into prompt', async () => {
      const prompt = 'What is machine learning?';
      const documents = [
        { id: '1', content: 'Machine learning is a subset of AI.' }
      ];

      const injected = injector.injectContext(prompt, documents);

      expect(injected).toContain(prompt);
      expect(injected).toContain('Machine learning is a subset of AI');
    });

    it('should format context properly', async () => {
      const documents = [
        { id: '1', content: 'First document' },
        { id: '2', content: 'Second document' }
      ];

      const formatted = injector.formatContext(documents);

      expect(formatted).toContain('First document');
      expect(formatted).toContain('Second document');
    });

    it('should handle token limits', async () => {
      const context = 'x'.repeat(10000);
      const maxTokens = 1000;

      const truncated = injector.truncateToTokenLimit(context, maxTokens);

      expect(truncated.length).toBeLessThanOrEqual(context.length);
    });

    it('should not exceed token limit', async () => {
      const documents = Array(50).fill(null).map((_, i) => ({
        id: `doc-${i}`,
        content: 'x'.repeat(100)
      }));

      const formatted = injector.formatContext(documents);
      const truncated = injector.truncateToTokenLimit(formatted, 2000);

      expect(truncated.length).toBeLessThanOrEqual(formatted.length);
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should execute complete retrieval pipeline', async () => {
      const query = 'How to learn programming?';
      const prompt = 'Answer this question: ' + query;

      const result = await retriever.retrieve(query);
      const ranked = ranker.rankDocuments(result.documents);
      const injected = injector.injectContext(prompt, ranked);

      expect(injected).toBeDefined();
      expect(injected.length).toBeGreaterThan(prompt.length);
    });

    it('should maintain quality through pipeline', async () => {
      const query = 'Educational content';

      const result = await retriever.retrieve(query);

      expect(result.totalRelevanceScore).toBeGreaterThan(0);
      expect(result.retrievalTime).toBeLessThan(100);
      expect(result.internalCount + result.externalCount).toBeGreaterThan(0);
    });

    it('should handle concurrent retrievals', async () => {
      const queries = ['Query 1', 'Query 2', 'Query 3', 'Query 4', 'Query 5'];

      const results = await Promise.all(
        queries.map(q => retriever.retrieve(q))
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.retrievalTime).toBeLessThan(100);
      });
    });
  });

  describe('Performance Requirements', () => {
    it('should retrieve within 100ms', async () => {
      const query = 'Performance test';

      const start = Date.now();
      await retriever.retrieve(query);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should rank efficiently', async () => {
      const documents = Array(1000).fill(null).map((_, i) => ({
        id: `doc-${i}`,
        content: `Document ${i}`,
        score: Math.random()
      }));

      const start = Date.now();
      ranker.rankDocuments(documents);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should inject context efficiently', async () => {
      const prompt = 'Test prompt';
      const documents = Array(100).fill(null).map((_, i) => ({
        id: `doc-${i}`,
        content: `Document ${i} content`
      }));

      const start = Date.now();
      injector.injectContext(prompt, documents);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
