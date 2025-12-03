/**
 * Context Ranker
 * Implements ranking algorithm with diversity scoring and deduplication
 */

import { Document } from './types';

export interface RankingOptions {
  relevanceWeight?: number;
  diversityWeight?: number;
  recencyWeight?: number;
  categoryDiversity?: boolean;
  deduplicateThreshold?: number;
}

export interface RankedDocument extends Document {
  rankScore: number;
  relevanceScore: number;
  diversityScore: number;
  recencyScore: number;
}

export interface RankingResult {
  documents: RankedDocument[];
  totalScore: number;
  averageRankScore: number;
  deduplicatedCount: number;
}

/**
 * Context Ranker
 * Ranks documents by relevance, diversity, and recency
 */
export class ContextRanker {
  private relevanceWeight: number;
  private diversityWeight: number;
  private recencyWeight: number;
  private categoryDiversity: boolean;
  private deduplicateThreshold: number;

  constructor(options: RankingOptions = {}) {
    this.relevanceWeight = options.relevanceWeight || 0.6;
    this.diversityWeight = options.diversityWeight || 0.2;
    this.recencyWeight = options.recencyWeight || 0.2;
    this.categoryDiversity = options.categoryDiversity !== false;
    this.deduplicateThreshold = options.deduplicateThreshold || 0.95;
  }

  /**
   * Rank documents by multiple criteria
   */
  public rank(documents: Document[]): RankingResult {
    if (documents.length === 0) {
      return {
        documents: [],
        totalScore: 0,
        averageRankScore: 0,
        deduplicatedCount: 0
      };
    }

    // Deduplicate similar documents
    const deduplicatedDocs = this.deduplicateSimilar(documents);
    const deduplicatedCount = documents.length - deduplicatedDocs.length;

    // Calculate individual scores
    const rankedDocs = deduplicatedDocs.map((doc, index) => {
      const relevanceScore = this.calculateRelevanceScore(doc);
      const diversityScore = this.calculateDiversityScore(doc, deduplicatedDocs, index);
      const recencyScore = this.calculateRecencyScore(doc);

      const rankScore =
        relevanceScore * this.relevanceWeight +
        diversityScore * this.diversityWeight +
        recencyScore * this.recencyWeight;

      return {
        ...doc,
        rankScore,
        relevanceScore,
        diversityScore,
        recencyScore
      };
    });

    // Sort by rank score descending
    rankedDocs.sort((a, b) => b.rankScore - a.rankScore);

    const totalScore = rankedDocs.reduce((sum, doc) => sum + doc.rankScore, 0);
    const averageRankScore = totalScore / rankedDocs.length;

    return {
      documents: rankedDocs,
      totalScore,
      averageRankScore,
      deduplicatedCount
    };
  }

  /**
   * Calculate relevance score based on vector similarity
   */
  private calculateRelevanceScore(doc: Document): number {
    // Normalize score from 0-1 range
    const score = doc.score || 0;
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Calculate diversity score to promote varied results
   */
  private calculateDiversityScore(
    doc: Document,
    allDocs: Document[],
    index: number
  ): number {
    let diversityScore = 1.0;

    // Penalize documents with same category
    if (this.categoryDiversity) {
      const sameCategory = allDocs
        .slice(0, index)
        .filter(d => d.metadata.category === doc.metadata.category).length;

      if (sameCategory > 0) {
        diversityScore = Math.max(0.3, 1.0 - sameCategory * 0.15);
      }
    }

    // Penalize documents with same source appearing consecutively
    if (index > 0) {
      const prevDoc = allDocs[index - 1];
      if (prevDoc && prevDoc.metadata.source === doc.metadata.source) {
        diversityScore *= 0.85;
      }
    }

    return diversityScore;
  }

  /**
   * Calculate recency score based on document timestamp
   */
  private calculateRecencyScore(doc: Document): number {
    const now = Date.now();
    const docTime = doc.metadata.timestamp.getTime();
    const ageMs = now - docTime;

    // Convert to days
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    // Exponential decay: newer documents score higher
    // After 30 days, score is ~0.37
    // After 90 days, score is ~0.05
    const recencyScore = Math.exp(-ageDays / 30);

    return Math.max(0, Math.min(recencyScore, 1));
  }

  /**
   * Deduplicate similar documents based on content similarity
   */
  private deduplicateSimilar(documents: Document[]): Document[] {
    const deduplicated: Document[] = [];
    const seen = new Set<number>();

    for (let i = 0; i < documents.length; i++) {
      if (seen.has(i)) {continue;}

      const doc = documents[i];
      if (!doc) {continue;}

      deduplicated.push(doc);
      seen.add(i);

      // Mark similar documents as seen
      for (let j = i + 1; j < documents.length; j++) {
        if (seen.has(j)) {continue;}

        const otherDoc = documents[j];
        if (!otherDoc) {continue;}

        const similarity = this.calculateContentSimilarity(doc, otherDoc);
        if (similarity >= this.deduplicateThreshold) {
          seen.add(j);
        }
      }
    }

    return deduplicated;
  }

  /**
   * Calculate content similarity between two documents
   */
  private calculateContentSimilarity(doc1: Document, doc2: Document): number {
    // If both have embeddings, use cosine similarity
    if (doc1.embedding && doc2.embedding) {
      return this.cosineSimilarity(doc1.embedding, doc2.embedding);
    }

    // Fallback to text-based similarity
    return this.textSimilarity(doc1.content, doc2.content);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }

  /**
   * Rerank documents with custom weights
   */
  public rerank(
    documents: Document[],
    options: RankingOptions
  ): RankingResult {
    const previousWeights = {
      relevanceWeight: this.relevanceWeight,
      diversityWeight: this.diversityWeight,
      recencyWeight: this.recencyWeight
    };

    // Apply new weights
    if (options.relevanceWeight !== undefined) {
      this.relevanceWeight = options.relevanceWeight;
    }
    if (options.diversityWeight !== undefined) {
      this.diversityWeight = options.diversityWeight;
    }
    if (options.recencyWeight !== undefined) {
      this.recencyWeight = options.recencyWeight;
    }

    const result = this.rank(documents);

    // Restore previous weights
    this.relevanceWeight = previousWeights.relevanceWeight;
    this.diversityWeight = previousWeights.diversityWeight;
    this.recencyWeight = previousWeights.recencyWeight;

    return result;
  }

  /**
   * Get ranking statistics
   */
  public getStatistics(rankedDocs: RankedDocument[]): {
    averageRelevance: number;
    averageDiversity: number;
    averageRecency: number;
    topScore: number;
    bottomScore: number;
  } {
    if (rankedDocs.length === 0) {
      return {
        averageRelevance: 0,
        averageDiversity: 0,
        averageRecency: 0,
        topScore: 0,
        bottomScore: 0
      };
    }

    const averageRelevance =
      rankedDocs.reduce((sum, doc) => sum + doc.relevanceScore, 0) / rankedDocs.length;
    const averageDiversity =
      rankedDocs.reduce((sum, doc) => sum + doc.diversityScore, 0) / rankedDocs.length;
    const averageRecency =
      rankedDocs.reduce((sum, doc) => sum + doc.recencyScore, 0) / rankedDocs.length;

    return {
      averageRelevance,
      averageDiversity,
      averageRecency,
      topScore: rankedDocs[0]?.rankScore || 0,
      bottomScore: rankedDocs[rankedDocs.length - 1]?.rankScore || 0
    };
  }
}
