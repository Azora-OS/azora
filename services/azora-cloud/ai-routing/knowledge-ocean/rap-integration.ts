/**
 * RAP Integration with Context Injector
 * Demonstrates how to integrate ContextInjector with RAP system
 */

import { ContextInjector } from './context-injector';
import { KnowledgeOceanRetriever } from './retriever';
import { ContextRanker } from './context-ranker';
import { Document, ContextInjectionOptions } from './types';

/**
 * RAP Context Integration
 * Combines retrieval, ranking, and context injection for RAP system
 */
export class RAPContextIntegration {
  private contextInjector: ContextInjector;
  private retriever: KnowledgeOceanRetriever;
  private ranker: ContextRanker;

  constructor(
    contextInjector: ContextInjector,
    retriever: KnowledgeOceanRetriever,
    ranker: ContextRanker
  ) {
    this.contextInjector = contextInjector;
    this.retriever = retriever;
    this.ranker = ranker;
  }

  /**
   * Complete RAP pipeline: retrieve → rank → inject
   */
  async buildAugmentedPrompt(
    userQuery: string,
    options: ContextInjectionOptions = {}
  ): Promise<{
    augmentedPrompt: string;
    contextStats: any;
    retrievalStats: any;
  }> {
    // Step 1: Retrieve documents with 70/30 rule
    const retrievalResult = await this.retriever.retrieve(userQuery, {
      topK: 10,
      enforceSeventyThirty: true
    });

    // Step 2: Rank documents by relevance, diversity, and recency
    const rankingResult = this.ranker.rank(retrievalResult.documents);

    // Step 3: Inject context into prompt
    const injectionResult = this.contextInjector.injectContext(
      userQuery,
      rankingResult.documents,
      options
    );

    // Get statistics
    const contextStats = this.contextInjector.getContextStats(rankingResult.documents);
    const rankingStats = this.ranker.getStatistics(rankingResult.documents);

    return {
      augmentedPrompt: injectionResult.prompt,
      contextStats: {
        ...contextStats,
        ...rankingStats,
        tokensUsed: injectionResult.tokensUsed,
        truncated: injectionResult.truncated
      },
      retrievalStats: {
        totalDocuments: retrievalResult.documents.length,
        internalCount: retrievalResult.internalCount,
        externalCount: retrievalResult.externalCount,
        internalPercentage: (retrievalResult.internalCount / retrievalResult.documents.length) * 100,
        externalPercentage: (retrievalResult.externalCount / retrievalResult.documents.length) * 100,
        retrievalTime: retrievalResult.retrievalTime,
        totalRelevanceScore: retrievalResult.totalRelevanceScore
      }
    };
  }

  /**
   * Build augmented prompt with custom formatting
   */
  async buildAugmentedPromptWithFormat(
    userQuery: string,
    format: 'markdown' | 'json' | 'plain' = 'markdown',
    maxTokens: number = 2000
  ): Promise<string> {
    const result = await this.buildAugmentedPrompt(userQuery, {
      format,
      maxTokens,
      includeMetadata: true
    });

    return result.augmentedPrompt;
  }
}

/**
 * Context Injection Pipeline
 * Standalone pipeline for context injection without retrieval
 */
export class ContextInjectionPipeline {
  private contextInjector: ContextInjector;

  constructor(contextInjector: ContextInjector) {
    this.contextInjector = contextInjector;
  }

  /**
   * Inject pre-retrieved documents into prompt
   */
  injectDocuments(
    userPrompt: string,
    documents: Document[],
    options: ContextInjectionOptions = {}
  ): {
    prompt: string;
    stats: any;
  } {
    const result = this.contextInjector.injectContext(userPrompt, documents, options);
    const stats = this.contextInjector.getContextStats(documents);

    return {
      prompt: result.prompt,
      stats: {
        ...stats,
        tokensUsed: result.tokensUsed,
        truncated: result.truncated,
        contextLength: result.contextLength
      }
    };
  }

  /**
   * Format documents without injection
   */
  formatDocuments(
    documents: Document[],
    format: 'markdown' | 'json' | 'plain' = 'markdown',
    includeMetadata: boolean = true
  ): string {
    return this.contextInjector.formatContext(documents, format, includeMetadata);
  }

  /**
   * Truncate context to token limit
   */
  truncateContext(
    context: string,
    maxTokens: number
  ): {
    truncatedContext: string;
    tokensUsed: number;
    truncated: boolean;
  } {
    return this.contextInjector.truncateToTokenLimit(context, maxTokens);
  }

  /**
   * Validate injection options
   */
  validateOptions(options: ContextInjectionOptions): {
    valid: boolean;
    errors: string[];
  } {
    return this.contextInjector.validateOptions(options);
  }

  /**
   * Get context statistics
   */
  getContextStats(documents: Document[]): any {
    return this.contextInjector.getContextStats(documents);
  }
}
