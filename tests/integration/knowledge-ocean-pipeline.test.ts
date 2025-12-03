import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { KnowledgeOceanRetriever } from '../../services/ai-routing/knowledge-ocean/retriever';
import { ContextRanker } from '../../services/ai-routing/knowledge-ocean/context-ranker';
import { ContextInjector } from '../../services/ai-routing/knowledge-ocean/context-injector';
import { VectorDBClient } from '../../services/ai-routing/knowledge-ocean/vector-db-client';
import { EmbeddingService } from '../../services/ai-routing/knowledge-ocean/embedding-service';

describe('Knowledge Ocean Pipeline Integration Tests', () => {
  let retriever: KnowledgeOceanRetriever;
  let ranker: ContextRanker;
  let injector: ContextInjector;
  let vectorDb: VectorDBClient;
  let embeddingService: EmbeddingService;

  beforeAll(async () => {
    // Initialize services
    vectorDb = new VectorDBClient({
      apiKey: process.env.PINECONE_API_KEY || 'test-key',
      environment: process.env.PINECONE_ENV || 'test',
      indexName: process.env.PINECONE_INDEX || 'test-index',
    });

    embeddingService = new EmbeddingService({
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
      model: 'text-embedding-3-small',
    });

    retriever = new KnowledgeOceanRetriever(vectorDb, embeddingService);
    ranker = new ContextRanker();
    injector = new ContextInjector();
  });

  afterAll(async () => {
    // Cleanup
    await vectorDb.disconnect();
  });

  describe('Document Retrieval', () => {
    it('should retrieve documents from vector database', async () => {
      const query = 'What is machine learning?';
      const documents = await retriever.retrieveDocuments(query, 5);

      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);
      expect(documents[0]).toHaveProperty('id');
      expect(documents[0]).toHaveProperty('content');
      expect(documents[0]).toHaveProperty('score');
    });

    it('should handle empty query gracefully', async () => {
      const query = '';
      const documents = await retriever.retrieveDocuments(query, 5);

      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
    });

    it('should respect max results parameter', async () => {
      const query = 'test query';
      const maxResults = 3;
      const documents = await retriever.retrieveDocuments(query, maxResults);

      expect(documents.length).toBeLessThanOrEqual(maxResults);
    });
  });

  describe('70/30 Rule Enforcement', () => {
    it('should enforce 70% internal knowledge, 30% external knowledge', async () => {
      const query = 'How does Azora work?';
      const documents = await retriever.retrieveDocuments(query, 10);

      const internalDocs = documents.filter(doc => doc.source === 'internal');
      const externalDocs = documents.filter(doc => doc.source === 'external');

      const internalRatio = internalDocs.length / documents.length;
      const externalRatio = externalDocs.length / documents.length;

      // Allow 5% tolerance
      expect(internalRatio).toBeGreaterThanOrEqual(0.65);
      expect(internalRatio).toBeLessThanOrEqual(0.75);
      expect(externalRatio).toBeGreaterThanOrEqual(0.25);
      expect(externalRatio).toBeLessThanOrEqual(0.35);
    });

    it('should prioritize internal knowledge in ranking', async () => {
      const query = 'Azora features';
      const documents = await retriever.retrieveDocuments(query, 10);

      // First document should be internal
      if (documents.length > 0) {
        expect(documents[0].source).toBe('internal');
      }
    });
  });

  describe('Context Ranking', () => {
    it('should rank documents by relevance score', async () => {
      const documents = [
        { id: '1', content: 'Machine learning basics', score: 0.95, source: 'internal' },
        { id: '2', content: 'Deep learning advanced', score: 0.87, source: 'internal' },
        { id: '3', content: 'Neural networks', score: 0.92, source: 'external' },
      ];

      const rankedDocs = ranker.rankDocuments(documents, 'machine learning');

      expect(rankedDocs[0].score).toBeGreaterThanOrEqual(rankedDocs[1].score);
      expect(rankedDocs[1].score).toBeGreaterThanOrEqual(rankedDocs[2].score);
    });

    it('should apply relevance scoring algorithm', async () => {
      const documents = [
        { id: '1', content: 'Test content', score: 0.8, source: 'internal' },
        { id: '2', content: 'Another test', score: 0.6, source: 'external' },
      ];

      const rankedDocs = ranker.rankDocuments(documents, 'test');

      expect(rankedDocs).toBeDefined();
      expect(rankedDocs.length).toBe(2);
      rankedDocs.forEach(doc => {
        expect(doc).toHaveProperty('relevanceScore');
        expect(doc.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(doc.relevanceScore).toBeLessThanOrEqual(1);
      });
    });

    it('should handle empty document list', () => {
      const rankedDocs = ranker.rankDocuments([], 'query');

      expect(rankedDocs).toBeDefined();
      expect(rankedDocs.length).toBe(0);
    });
  });

  describe('Context Injection', () => {
    it('should inject context into prompt', async () => {
      const query = 'What is Azora?';
      const context = [
        { id: '1', content: 'Azora is an AI platform', score: 0.95 },
        { id: '2', content: 'It provides education services', score: 0.92 },
      ];

      const injectedPrompt = injector.injectContext(query, context);

      expect(injectedPrompt).toBeDefined();
      expect(typeof injectedPrompt).toBe('string');
      expect(injectedPrompt).toContain(query);
      expect(injectedPrompt).toContain('Azora is an AI platform');
      expect(injectedPrompt).toContain('education services');
    });

    it('should format context properly', async () => {
      const query = 'test query';
      const context = [
        { id: '1', content: 'First document', score: 0.9 },
        { id: '2', content: 'Second document', score: 0.8 },
      ];

      const injectedPrompt = injector.injectContext(query, context);

      // Should contain context markers
      expect(injectedPrompt).toContain('CONTEXT');
      expect(injectedPrompt).toContain('QUERY');
    });

    it('should handle empty context', () => {
      const query = 'test query';
      const context: any[] = [];

      const injectedPrompt = injector.injectContext(query, context);

      expect(injectedPrompt).toBeDefined();
      expect(injectedPrompt).toContain(query);
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should execute complete retrieval pipeline', async () => {
      const query = 'How does Azora education work?';

      // Step 1: Retrieve documents
      const documents = await retriever.retrieveDocuments(query, 10);
      expect(documents.length).toBeGreaterThan(0);

      // Step 2: Rank documents
      const rankedDocs = ranker.rankDocuments(documents, query);
      expect(rankedDocs.length).toBeGreaterThan(0);

      // Step 3: Inject context
      const injectedPrompt = injector.injectContext(query, rankedDocs);
      expect(injectedPrompt).toBeDefined();
      expect(injectedPrompt.length).toBeGreaterThan(query.length);
    });

    it('should maintain context quality through pipeline', async () => {
      const query = 'Azora features';
      const documents = await retriever.retrieveDocuments(query, 5);
      const rankedDocs = ranker.rankDocuments(documents, query);
      const injectedPrompt = injector.injectContext(query, rankedDocs);

      // Verify quality metrics
      expect(rankedDocs.length).toBeGreaterThan(0);
      expect(injectedPrompt.length).toBeGreaterThan(0);

      // Verify top documents are high quality
      if (rankedDocs.length > 0) {
        expect(rankedDocs[0].relevanceScore).toBeGreaterThan(0.7);
      }
    });
  });

  describe('Performance Requirements', () => {
    it('should retrieve documents within 100ms', async () => {
      const query = 'test query';
      const startTime = Date.now();

      await retriever.retrieveDocuments(query, 5);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should rank documents within 50ms', () => {
      const documents = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        content: `Document ${i}`,
        score: Math.random(),
        source: i % 2 === 0 ? 'internal' : 'external',
      }));

      const startTime = Date.now();

      ranker.rankDocuments(documents, 'test query');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should inject context within 30ms', () => {
      const query = 'test query';
      const context = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        content: `Context document ${i}`,
        score: 0.9 - i * 0.05,
      }));

      const startTime = Date.now();

      injector.injectContext(query, context);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30);
    });

    it('should complete full pipeline within 200ms', async () => {
      const query = 'performance test query';
      const startTime = Date.now();

      const documents = await retriever.retrieveDocuments(query, 5);
      const rankedDocs = ranker.rankDocuments(documents, query);
      injector.injectContext(query, rankedDocs);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle retrieval errors gracefully', async () => {
      const query = 'test query';

      try {
        await retriever.retrieveDocuments(query, 5);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid context gracefully', () => {
      const query = 'test query';
      const invalidContext = null as any;

      expect(() => {
        injector.injectContext(query, invalidContext);
      }).not.toThrow();
    });
  });
});
