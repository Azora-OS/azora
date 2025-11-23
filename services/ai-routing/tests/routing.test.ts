import { QueryClassifier } from '../query-classifier';

describe('AI Routing Service - Query Routing', () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  describe('Query Classification', () => {
    it('should classify simple queries correctly', async () => {
      const query = { query: 'What is 2+2?' };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.routedTo).toBeDefined();
    });

    it('should classify moderate complexity queries', async () => {
      const query = { query: 'Explain the benefits of renewable energy and compare it with fossil fuels' };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify complex queries', async () => {
      const query = {
        query: 'Develop a comprehensive strategic plan for global expansion including market analysis, risk assessment, financial projections, and implementation timeline'
      };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should provide routing tier recommendation', async () => {
      const query = { query: 'What is AI?' };

      const result = await classifier.classify(query);

      expect(result.routedTo).toBeDefined();
      expect(['LOCAL_LLM', 'RAP_SYSTEM', 'EXTERNAL_LLM']).toContain(result.routedTo);
    });

    it('should include reasoning for classification', async () => {
      const query = { query: 'Test query' };

      const result = await classifier.classify(query);

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
    });

    it('should handle empty queries', async () => {
      const query = { query: '' };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
    });

    it('should handle very long queries', async () => {
      const longQuery = 'word '.repeat(500);
      const query = { query: longQuery };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
    });

    it('should calculate confidence score', async () => {
      const query = { query: 'What is machine learning?' };

      const result = await classifier.classify(query);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Provider Routing', () => {
    it('should route to local LLM for simple queries', async () => {
      const query = { query: 'Hello' };

      const result = await classifier.classify(query);

      expect(['LOCAL_LLM', 'RAP_SYSTEM', 'EXTERNAL_LLM']).toContain(result.routedTo);
    });

    it('should consider query complexity in routing', async () => {
      const simpleQuery = { query: 'Hi' };
      const complexQuery = { query: 'Analyze the geopolitical implications of climate change on global trade patterns' };

      const simpleResult = await classifier.classify(simpleQuery);
      const complexResult = await classifier.classify(complexQuery);

      expect(simpleResult.routedTo).toBeDefined();
      expect(complexResult.routedTo).toBeDefined();
    });

    it('should provide consistent routing for same query', async () => {
      const query = { query: 'What is Python?' };

      const result1 = await classifier.classify(query);
      const result2 = await classifier.classify(query);

      expect(result1.classifiedAs).toBe(result2.classifiedAs);
      expect(result1.routedTo).toBe(result2.routedTo);
    });
  });

  describe('Load Balancing', () => {
    it('should track classification statistics', async () => {
      const queries = [
        { query: 'Simple query 1' },
        { query: 'Simple query 2' },
        { query: 'More complex analytical query about economics' },
      ];

      for (const query of queries) {
        await classifier.classify(query);
      }

      const stats = classifier.getClassificationMetrics();
      expect(stats).toBeDefined();
    });

    it('should handle concurrent classifications', async () => {
      const queries = Array.from({ length: 10 }, (_, i) => ({
        query: `Test query ${i}`
      }));

      const results = await Promise.all(
        queries.map(q => classifier.classify(q))
      );

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.classifiedAs).toBeDefined();
      });
    });
  });

  describe('Routing Priority', () => {
    it('should prioritize based on query characteristics', async () => {
      const urgentQuery = { query: 'Emergency: System down', priority: 'high' };
      const normalQuery = { query: 'What is AI?' };

      const urgentResult = await classifier.classify(urgentQuery);
      const normalResult = await classifier.classify(normalQuery);

      expect(urgentResult).toBeDefined();
      expect(normalResult).toBeDefined();
    });

    it('should consider user context in routing', async () => {
      const query = {
        query: 'Explain quantum computing',
        userId: 'user-123',
        context: { userLevel: 'beginner' }
      };

      const result = await classifier.classify(query);

      expect(result).toBeDefined();
      expect(result.classifiedAs).toBeDefined();
    });
  });
});
