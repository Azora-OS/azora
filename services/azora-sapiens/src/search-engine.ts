import EmbeddingService from './embeddings';
import VectorStorageService, { SearchResult, KnowledgeMetadata } from './vector-storage';

export interface SearchOptions {
  topK?: number;
  filters?: Record<string, unknown>;
  useSemanticSearch?: boolean;
  useKeywordSearch?: boolean;
  minScore?: number;
}

export interface SearchResultWithContent extends SearchResult {
  content?: string;
  relevanceScore: number;
}

export class SearchEngine {
  private embeddingService: EmbeddingService;
  private vectorStorage: VectorStorageService;
  private keywordIndex: Map<string, Set<string>> = new Map();

  constructor(embeddingService: EmbeddingService, vectorStorage: VectorStorageService) {
    this.embeddingService = embeddingService;
    this.vectorStorage = vectorStorage;
  }

  /**
   * Perform semantic search using vector similarity
   */
  async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResultWithContent[]> {
    const { topK = 10, filters, minScore = 0.5 } = options;

    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search vector database
      const results = await this.vectorStorage.semanticSearch(queryEmbedding, topK * 2, filters);

      // Filter by minimum score and format results
      return results
        .filter((result) => result.score >= minScore)
        .slice(0, topK)
        .map((result) => ({
          ...result,
          relevanceScore: result.score,
        }));
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw error;
    }
  }

  /**
   * Perform keyword search using BM25-like algorithm
   */
  keywordSearch(query: string, options: SearchOptions = {}): SearchResultWithContent[] {
    const { topK = 10, minScore = 0.3 } = options;
    const queryTerms = this.tokenize(query);
    const results: Map<string, number> = new Map();

    // Simple BM25-like scoring
    for (const term of queryTerms) {
      const docIds = this.keywordIndex.get(term) || new Set();
      for (const docId of docIds) {
        const currentScore = results.get(docId) || 0;
        results.set(docId, currentScore + 1);
      }
    }

    // Convert to array and sort by score
    const sortedResults = Array.from(results.entries())
      .map(([id, score]) => ({
        id,
        score: score / queryTerms.length,
        metadata: {} as KnowledgeMetadata,
        relevanceScore: score / queryTerms.length,
      }))
      .filter((result) => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return sortedResults;
  }

  /**
   * Perform hybrid search combining semantic and keyword search
   */
  async hybridSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResultWithContent[]> {
    const { topK = 10 } = options;

    try {
      // Run both searches in parallel
      const [semanticResults, keywordResults] = await Promise.all([
        this.semanticSearch(query, { ...options, topK: topK * 2 }),
        Promise.resolve(this.keywordSearch(query, { ...options, topK: topK * 2 })),
      ]);

      // Combine and deduplicate results
      const combined = new Map<string, SearchResultWithContent>();

      // Add semantic results with weight 0.7
      for (const result of semanticResults) {
        combined.set(result.id, {
          ...result,
          relevanceScore: result.relevanceScore * 0.7,
        });
      }

      // Add keyword results with weight 0.3
      for (const result of keywordResults) {
        if (combined.has(result.id)) {
          const existing = combined.get(result.id)!;
          existing.relevanceScore += result.relevanceScore * 0.3;
        } else {
          combined.set(result.id, {
            ...result,
            relevanceScore: result.relevanceScore * 0.3,
          });
        }
      }

      // Sort by combined score and return top K
      return Array.from(combined.values())
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topK);
    } catch (error) {
      console.error('Error in hybrid search:', error);
      throw error;
    }
  }

  /**
   * Index a document for keyword search
   */
  indexDocument(docId: string, content: string): void {
    const terms = this.tokenize(content);
    for (const term of terms) {
      if (!this.keywordIndex.has(term)) {
        this.keywordIndex.set(term, new Set());
      }
      this.keywordIndex.get(term)!.add(docId);
    }
  }

  /**
   * Remove document from keyword index
   */
  removeDocumentFromIndex(docId: string): void {
    for (const [, docIds] of this.keywordIndex) {
      docIds.delete(docId);
    }
  }

  /**
   * Tokenize text for keyword search
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .map((token) => token.replace(/[^\w]/g, ''));
  }

  /**
   * Rank results by relevance and recency
   */
  rankResults(
    results: SearchResultWithContent[],
    options: { recencyWeight?: number; relevanceWeight?: number } = {}
  ): SearchResultWithContent[] {
    const { recencyWeight = 0.3, relevanceWeight = 0.7 } = options;

    return results
      .map((result) => {
        const recencyScore = this.calculateRecencyScore(result.metadata.date);
        const finalScore =
          result.relevanceScore * relevanceWeight + recencyScore * recencyWeight;

        return {
          ...result,
          relevanceScore: finalScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate recency score (0-1, where 1 is today)
   */
  private calculateRecencyScore(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    // Decay score over time (half-life of 30 days)
    return Math.exp(-daysDiff / 30);
  }
}

export default SearchEngine;
