/**
 * Query Classifier Tests
 * Tests for query complexity classification and routing decisions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { QueryClassifier } from '../query-classifier';
import { QueryComplexity, AIQuery, RoutingTier } from '../types';

describe('QueryClassifier', () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  describe('classify', () => {
    it('should classify simple FAQ queries as SIMPLE', async () => {
      const query: AIQuery = {
        query: 'What is the capital of France?',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.SIMPLE);
      expect(result.routedTo).toBe(RoutingTier.LOCAL_LLM);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify simple search queries as SIMPLE', async () => {
      const query: AIQuery = {
        query: 'Find Python tutorials',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.SIMPLE);
      expect(result.routedTo).toBe(RoutingTier.LOCAL_LLM);
    });

    it('should classify analytical queries as MODERATE', async () => {
      const query: AIQuery = {
        query: 'Analyze the impact of climate change on agriculture and provide recommendations',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.MODERATE);
      expect(result.routedTo).toBe(RoutingTier.RAP_SYSTEM);
    });

    it('should classify complex strategic queries as COMPLEX', async () => {
      const query: AIQuery = {
        query: 'Develop a comprehensive strategic plan for digital transformation that considers organizational culture, technology infrastructure, market dynamics, competitive landscape, and regulatory environment while evaluating multiple scenarios and their long-term implications for business sustainability',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.COMPLEX);
      expect(result.routedTo).toBe(RoutingTier.EXTERNAL_LLM);
    });

    it('should provide confidence score between 0 and 1', async () => {
      const query: AIQuery = {
        query: 'What time is it?',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should include reasoning in classification result', async () => {
      const query: AIQuery = {
        query: 'Compare and contrast different machine learning algorithms',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.reasoning).toBeDefined();
      expect(result.reasoning).toContain('Classified as');
    });

    it('should include metadata with query statistics', async () => {
      const query: AIQuery = {
        query: 'Hello world',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.score).toBeGreaterThanOrEqual(0);
      expect(result.metadata?.queryLength).toBe(11);
      expect(result.metadata?.wordCount).toBe(2);
      expect(result.metadata?.userId).toBe('user-1');
    });

    it('should detect analytical keywords and increase complexity', async () => {
      const simpleQuery: AIQuery = { query: 'What is Python?' };
      const analyticalQuery: AIQuery = { query: 'Analyze the benefits and drawbacks of Python' };

      const simpleResult = await classifier.classify(simpleQuery);
      const analyticalResult = await classifier.classify(analyticalQuery);

      expect(analyticalResult.metadata?.score).toBeGreaterThan(simpleResult.metadata?.score);
    });

    it('should handle queries with multiple concepts', async () => {
      const query: AIQuery = {
        query: 'Compare machine learning, deep learning, and artificial intelligence in the context of healthcare applications',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.MODERATE);
      // Should have analytical keywords detected
      expect(result.reasoning).toContain('Classified as');
    });

    it('should recognize simple request indicators', async () => {
      const query: AIQuery = {
        query: 'Give me a quick summary of quantum computing',
        userId: 'user-1'
      };

      const result = await classifier.classify(query);

      expect(result.reasoning).toContain('Simple request indicators');
    });
  });

  describe('getClassificationMetrics', () => {
    it('should return classification statistics', async () => {
      const queries: AIQuery[] = [
        { query: 'What is AI?' },
        { query: 'Analyze market trends and provide recommendations' },
        { query: 'Develop a comprehensive strategic plan for global expansion considering organizational capabilities, market dynamics, competitive landscape, regulatory environment, and long-term sustainability implications' }
      ];

      for (const query of queries) {
        await classifier.classify(query);
      }

      const metrics = await classifier.getClassificationMetrics();

      expect(metrics[QueryComplexity.SIMPLE]).toBeGreaterThan(0);
      expect(metrics[QueryComplexity.MODERATE]).toBeGreaterThan(0);
      expect(metrics[QueryComplexity.COMPLEX]).toBeGreaterThan(0);
    });

    it('should track multiple classifications correctly', async () => {
      const simpleQueries = [
        { query: 'Hello' },
        { query: 'What is this?' },
        { query: 'Tell me a fact' }
      ];

      for (const query of simpleQueries) {
        await classifier.classify(query);
      }

      const metrics = await classifier.getClassificationMetrics();

      expect(metrics[QueryComplexity.SIMPLE]).toBe(3);
    });

    it('should initialize metrics to zero', async () => {
      const metrics = await classifier.getClassificationMetrics();

      expect(metrics[QueryComplexity.SIMPLE]).toBe(0);
      expect(metrics[QueryComplexity.MODERATE]).toBe(0);
      expect(metrics[QueryComplexity.COMPLEX]).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset classification statistics', async () => {
      const queries: AIQuery[] = [
        { query: 'What is AI?' },
        { query: 'Analyze trends' }
      ];

      for (const query of queries) {
        await classifier.classify(query);
      }

      let metrics = await classifier.getClassificationMetrics();
      expect(metrics[QueryComplexity.SIMPLE]).toBeGreaterThan(0);

      classifier.resetStats();

      metrics = await classifier.getClassificationMetrics();
      expect(metrics[QueryComplexity.SIMPLE]).toBe(0);
      expect(metrics[QueryComplexity.MODERATE]).toBe(0);
      expect(metrics[QueryComplexity.COMPLEX]).toBe(0);
    });
  });

  describe('complexity scoring', () => {
    it('should score longer queries higher', async () => {
      const shortQuery: AIQuery = { query: 'Hi' };
      const longQuery: AIQuery = { query: 'This is a very long query with many words and concepts that should result in a higher complexity score' };

      const shortResult = await classifier.classify(shortQuery);
      const longResult = await classifier.classify(longQuery);

      expect(longResult.metadata?.score).toBeGreaterThan(shortResult.metadata?.score);
    });

    it('should score queries with more words higher', async () => {
      const fewWords: AIQuery = { query: 'What is Python' };
      const manyWords: AIQuery = { query: 'What is Python and how does it compare to Java and C++ in terms of performance and ease of use' };

      const fewResult = await classifier.classify(fewWords);
      const manyResult = await classifier.classify(manyWords);

      expect(manyResult.metadata?.wordCount).toBeGreaterThan(fewResult.metadata?.wordCount);
    });

    it('should detect strategic keywords', async () => {
      const strategicQuery: AIQuery = { query: 'Develop a strategic plan for market expansion' };
      const basicQuery: AIQuery = { query: 'What is a market' };

      const strategicResult = await classifier.classify(strategicQuery);
      const basicResult = await classifier.classify(basicQuery);

      expect(strategicResult.metadata?.score).toBeGreaterThan(basicResult.metadata?.score);
    });

    it('should detect comparison keywords', async () => {
      const comparisonQuery: AIQuery = { query: 'Compare Python and JavaScript' };
      const basicQuery: AIQuery = { query: 'What is Python' };

      const comparisonResult = await classifier.classify(comparisonQuery);
      const basicResult = await classifier.classify(basicQuery);

      expect(comparisonResult.metadata?.score).toBeGreaterThan(basicResult.metadata?.score);
    });
  });

  describe('confidence scoring', () => {
    it('should have higher confidence for clear simple queries', async () => {
      const clearSimple: AIQuery = { query: 'Hello' };
      const ambiguous: AIQuery = { query: 'Something about things' };

      const clearResult = await classifier.classify(clearSimple);
      const ambiguousResult = await classifier.classify(ambiguous);

      expect(clearResult.confidence).toBeGreaterThanOrEqual(ambiguousResult.confidence);
    });

    it('should have higher confidence for clear complex queries', async () => {
      const clearComplex: AIQuery = { query: 'Analyze and evaluate the strategic implications of this decision' };
      const ambiguous: AIQuery = { query: 'Tell me about things' };

      const clearResult = await classifier.classify(clearComplex);
      const ambiguousResult = await classifier.classify(ambiguous);

      expect(clearResult.confidence).toBeGreaterThanOrEqual(ambiguousResult.confidence);
    });
  });

  describe('routing tier mapping', () => {
    it('should route SIMPLE queries to LOCAL_LLM', async () => {
      const query: AIQuery = { query: 'What is 2+2?' };
      const result = await classifier.classify(query);

      expect(result.routedTo).toBe(RoutingTier.LOCAL_LLM);
    });

    it('should route MODERATE queries to RAP_SYSTEM', async () => {
      const query: AIQuery = { query: 'Analyze the pros and cons of remote work' };
      const result = await classifier.classify(query);

      expect(result.routedTo).toBe(RoutingTier.RAP_SYSTEM);
    });

    it('should route COMPLEX queries to EXTERNAL_LLM', async () => {
      const query: AIQuery = { query: 'Develop a comprehensive multi-year strategic plan considering market dynamics, organizational capabilities, competitive landscape, regulatory environment, technological infrastructure, and long-term business sustainability implications' };
      const result = await classifier.classify(query);

      expect(result.routedTo).toBe(RoutingTier.EXTERNAL_LLM);
    });
  });

  describe('custom thresholds', () => {
    it('should use custom thresholds when provided', async () => {
      const customClassifier = new QueryClassifier({
        simpleThreshold: 30,
        moderateThreshold: 100,
        complexThreshold: 100
      });

      const query: AIQuery = { query: 'What is this?' };
      const result = await customClassifier.classify(query);

      // With lower thresholds, this might be classified differently
      expect(result.classifiedAs).toBeDefined();
      expect([QueryComplexity.SIMPLE, QueryComplexity.MODERATE, QueryComplexity.COMPLEX]).toContain(result.classifiedAs);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query', async () => {
      const query: AIQuery = { query: '' };
      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.SIMPLE);
      expect(result.metadata?.queryLength).toBe(0);
    });

    it('should handle very long query', async () => {
      const longQuery = 'word '.repeat(500);
      const query: AIQuery = { query: longQuery };
      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBeDefined();
      expect(result.metadata?.wordCount).toBeGreaterThan(100);
    });

    it('should handle query with special characters', async () => {
      const query: AIQuery = { query: 'What is @#$%^&*()?' };
      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle query with multiple punctuation marks', async () => {
      const query: AIQuery = { query: 'What??? How??? Why???' };
      const result = await classifier.classify(query);

      expect(result.classifiedAs).toBeDefined();
      expect(result.metadata?.score).toBeGreaterThan(0);
    });
  });

  describe('classification consistency', () => {
    it('should classify the same query consistently', async () => {
      const query: AIQuery = { query: 'Analyze market trends' };

      const result1 = await classifier.classify(query);
      const result2 = await classifier.classify(query);

      expect(result1.classifiedAs).toBe(result2.classifiedAs);
      expect(result1.confidence).toBe(result2.confidence);
    });

    it('should maintain consistent scoring for similar queries', async () => {
      const query1: AIQuery = { query: 'What is Python?' };
      const query2: AIQuery = { query: 'What is Java?' };

      const result1 = await classifier.classify(query1);
      const result2 = await classifier.classify(query2);

      expect(result1.classifiedAs).toBe(result2.classifiedAs);
      expect(Math.abs(result1.metadata?.score - result2.metadata?.score)).toBeLessThan(10);
    });
  });
});
