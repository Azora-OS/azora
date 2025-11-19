/**
 * Knowledge Ocean Retriever
 * Implements document retrieval with 70/30 rule enforcement and relevance scoring
 */

import { VectorDBClient } from './vector-db-client';
import { DocumentEmbeddingService } from './embedding-service';
import { Document, RetrievalResult, SearchOptions } from './types';

export interface RetrieverOptions {
  topK?: number;
  minScore?: number;
  enforceSeventyThirty?: boolean;
  diversityWeight?: number;
}

export interface SeventyThirtyResult {
  documents: Document[];
  internalCount: number;
  externalCount: number;
  internalPercentage: number;
  externalPercentage: number;
}

/**
 * Knowledge Ocean Retriever
 * Handles document retrieval with 70/30 rule enforcement
 */
export class KnowledgeOceanRetriever {
  private vectorDBClient: VectorDBClient;
  private embeddingService: DocumentEmbeddingService;
  private defaultTopK: number;
  private defaultMinScore: number;
  private enforceSeventyThirty: boolean;
  constructor(
    vectorDBClient: VectorDBClient,
    embeddingService: DocumentEmbeddingService,
    options: RetrieverOptions = {}
  ) {
    this.vectorDBClient = vectorDBClient;
    this.embeddingService = embeddingService;
    this.defaultTopK = options.topK || 10;
    this.defaultMinScore = options.minScore || 0.7;
    this.enforceSeventyThirty = options.enforceSeventyThirty !== false;
  }

  /**
   * Retrieve documents for a query with 70/30 rule enforcement
   */
  public async retrieve(
    query: string,
    options: RetrieverOptions = {}
  ): Promise<RetrievalResult> {
    const startTime = Date.now();
    const topK = options.topK || this.defaultTopK;
    const minScore = options.minScore || this.defaultMinScore;

    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.embed(query);

      // Search for similar documents
      const searchOptions: SearchOptions = {
        topK: topK * 2, // Fetch more to apply 70/30 rule
        minScore,
        includeMetadata: true
      };

      const documents = await this.vectorDBClient.search(
        queryEmbedding.embedding,
        searchOptions
      );

      if (documents.length === 0) {
        return {
          documents: [],
          internalCount: 0,
          externalCount: 0,
          totalRelevanceScore: 0,
          retrievalTime: Date.now() - startTime
        };
      }

      // Apply 70/30 rule if enabled
      let finalDocuments = documents;
      if (this.enforceSeventyThirty) {
        finalDocuments = this.applySeventyThirtyRule(documents, topK);
      } else {
        finalDocuments = documents.slice(0, topK);
      }

      // Calculate metrics
      const internalCount = finalDocuments.filter(d => d.metadata.source === 'internal').length;
      const externalCount = finalDocuments.filter(d => d.metadata.source === 'external').length;
      const totalRelevanceScore = finalDocuments.reduce((sum, doc) => sum + (doc.score || 0), 0) / finalDocuments.length;

      return {
        documents: finalDocuments,
        internalCount,
        externalCount,
        totalRelevanceScore,
        retrievalTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Retrieval failed:', error);
      throw new Error(`Retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply 70/30 rule: 70% internal sources, 30% external sources
   * Maintains relevance ordering while enforcing the ratio
   */
  private applySeventyThirtyRule(documents: Document[], targetCount: number): Document[] {
    const internalTarget = Math.ceil(targetCount * 0.7);
    const externalTarget = Math.floor(targetCount * 0.3);

    const internal = documents.filter(d => d.metadata.source === 'internal');
    const external = documents.filter(d => d.metadata.source === 'external');

    // Take top documents from each source up to target
    const selectedInternal = internal.slice(0, internalTarget);
    const selectedExternal = external.slice(0, externalTarget);

    // If we don't have enough of one type, fill with the other
    const combined = [...selectedInternal, ...selectedExternal];
    if (combined.length < targetCount) {
      const remaining = targetCount - combined.length;
      if (selectedInternal.length < internalTarget) {
        const additionalInternal = internal.slice(internalTarget, internalTarget + remaining);
        combined.push(...additionalInternal);
      } else if (selectedExternal.length < externalTarget) {
        const additionalExternal = external.slice(externalTarget, externalTarget + remaining);
        combined.push(...additionalExternal);
      }
    }

    // Sort by relevance score to maintain ordering
    return combined
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, targetCount);
  }

  /**
   * Get 70/30 rule compliance for a set of documents
   */
  public getSeventyThirtyCompliance(documents: Document[]): SeventyThirtyResult {
    const internalCount = documents.filter(d => d.metadata.source === 'internal').length;
    const externalCount = documents.filter(d => d.metadata.source === 'external').length;
    const total = internalCount + externalCount;

    return {
      documents,
      internalCount,
      externalCount,
      internalPercentage: total > 0 ? (internalCount / total) * 100 : 0,
      externalPercentage: total > 0 ? (externalCount / total) * 100 : 0
    };
  }

  /**
   * Check if documents comply with 70/30 rule
   */
  public isSeventyThirtyCompliant(documents: Document[], tolerance: number = 5): boolean {
    const compliance = this.getSeventyThirtyCompliance(documents);
    const internalTarget = 70;
    const externalTarget = 30;

    return (
      Math.abs(compliance.internalPercentage - internalTarget) <= tolerance &&
      Math.abs(compliance.externalPercentage - externalTarget) <= tolerance
    );
  }

  /**
   * Retrieve documents with custom filtering
   */
  public async retrieveWithFilter(
    query: string,
    filter: Record<string, any>,
    options: RetrieverOptions = {}
  ): Promise<RetrievalResult> {
    const startTime = Date.now();
    const topK = options.topK || this.defaultTopK;
    const minScore = options.minScore || this.defaultMinScore;

    try {
      const queryEmbedding = await this.embeddingService.embed(query);

      const searchOptions: SearchOptions = {
        topK: topK * 2,
        minScore,
        filter,
        includeMetadata: true
      };

      const documents = await this.vectorDBClient.search(
        queryEmbedding.embedding,
        searchOptions
      );

      if (documents.length === 0) {
        return {
          documents: [],
          internalCount: 0,
          externalCount: 0,
          totalRelevanceScore: 0,
          retrievalTime: Date.now() - startTime
        };
      }

      let finalDocuments = documents;
      if (this.enforceSeventyThirty) {
        finalDocuments = this.applySeventyThirtyRule(documents, topK);
      } else {
        finalDocuments = documents.slice(0, topK);
      }

      const internalCount = finalDocuments.filter(d => d.metadata.source === 'internal').length;
      const externalCount = finalDocuments.filter(d => d.metadata.source === 'external').length;
      const totalRelevanceScore = finalDocuments.reduce((sum, doc) => sum + (doc.score || 0), 0) / finalDocuments.length;

      return {
        documents: finalDocuments,
        internalCount,
        externalCount,
        totalRelevanceScore,
        retrievalTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Filtered retrieval failed:', error);
      throw new Error(`Filtered retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
