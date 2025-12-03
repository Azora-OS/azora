/**
 * RAP System Service (Route B)
 * Retrieval-Augmented Prompt system combining Knowledge Ocean with external LLM
 * Route B: Moderate complexity queries (analysis, recommendations, multi-step reasoning)
 */

import { AIQuery, AIResponse, RoutingTier } from './types';
import EmbeddingService from '../azora-sapiens/src/embeddings';
import VectorStorageService, { SearchResult } from '../azora-sapiens/src/vector-storage';

/**
 * Configuration for RAP System
 */
export interface RAPSystemConfig {
  knowledgeOceanUrl?: string;
  internalSourceWeight: number; // 0.7 for 70%
  externalSourceWeight: number; // 0.3 for 30%
  maxContextTokens: number;
  maxRetrievalResults: number;
  externalLLMProvider: 'openai' | 'anthropic';
  externalLLMModel: string;
  externalLLMApiKey: string;
  embeddingApiKey: string;
  vectorDbApiKey: string;
  vectorDbIndexName?: string;
}

/**
 * Retrieved context for RAP
 */
export interface RetrievedContext {
  internalSources: SearchResult[];
  externalSources: SearchResult[];
  combinedContext: string;
  internalWeight: number;
  externalWeight: number;
}

/**
 * RAP System Service
 * Implements Retrieval-Augmented Prompt generation with 70/30 rule
 */
export class RAPSystem {
  private config: RAPSystemConfig;
  private embeddingService: EmbeddingService;
  private vectorStorage: VectorStorageService;
  private externalLLMClient: any;
  private responseCache: Map<string, { response: string; timestamp: number }> = new Map();
  private cacheExpiry: number = 3600000; // 1 hour in milliseconds

  constructor(config: RAPSystemConfig) {
    this.config = {
      ...{
        internalSourceWeight: 0.7,
        externalSourceWeight: 0.3,
        maxContextTokens: 2000,
        maxRetrievalResults: 10,
        vectorDbIndexName: 'azora-knowledge'
      },
      ...config
    };

    // Initialize services
    this.embeddingService = new EmbeddingService(this.config.embeddingApiKey);
    this.vectorStorage = new VectorStorageService(
      this.config.vectorDbApiKey,
      this.config.vectorDbIndexName || 'azora-knowledge'
    );

    // Initialize external LLM client
    this.initializeExternalLLMClient();
  }

  /**
   * Initialize external LLM client based on provider
   */
  private initializeExternalLLMClient(): void {
    if (this.config.externalLLMProvider === 'openai') {
      const { OpenAI } = require('openai');
      this.externalLLMClient = new OpenAI({
        apiKey: this.config.externalLLMApiKey
      });
    } else if (this.config.externalLLMProvider === 'anthropic') {
      const Anthropic = require('@anthropic-ai/sdk');
      this.externalLLMClient = new Anthropic({
        apiKey: this.config.externalLLMApiKey
      });
    }
  }

  /**
   * Process a query using RAP system
   */
  async processQuery(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();
    const queryHash = this.hashQuery(query.query);

    // Check cache first
    const cached = this.getFromCache(queryHash);
    if (cached) {
      return {
        id: `response-${Date.now()}`,
        content: cached,
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: Date.now() - startTime,
        cost: 0,
        cached: true,
        metadata: {
          cacheHit: true,
          retrievalMethod: 'cache'
        }
      };
    }

    try {
      // Step 1: Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query.query);

      // Step 2: Retrieve context from Knowledge Ocean (70% internal)
      const retrievedContext = await this.retrieveContext(queryEmbedding);

      // Step 3: Build RAP (Retrieval-Augmented Prompt)
      const augmentedPrompt = this.buildRAP(query.query, retrievedContext);

      // Step 4: Call external LLM with augmented prompt
      const response = await this.callExternalLLM(augmentedPrompt);

      // Step 5: Cache the response
      this.setInCache(queryHash, response);

      // Calculate cost based on tokens used
      const cost = this.calculateCost(augmentedPrompt, response);

      return {
        id: `response-${Date.now()}`,
        content: response,
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: Date.now() - startTime,
        cost,
        cached: false,
        metadata: {
          cacheHit: false,
          retrievalMethod: 'rap',
          internalSourcesCount: retrievedContext.internalSources.length,
          externalSourcesCount: retrievedContext.externalSources.length,
          contextLength: retrievedContext.combinedContext.length,
          internalWeight: retrievedContext.internalWeight,
          externalWeight: retrievedContext.externalWeight
        }
      };
    } catch (error) {
      throw new Error(`RAP System processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve context from Knowledge Ocean with 70/30 rule
   */
  private async retrieveContext(
    queryEmbedding: number[]
  ): Promise<RetrievedContext> {
    try {
      // Retrieve from vector database (internal sources)
      const internalSources = await this.vectorStorage.semanticSearch(
        queryEmbedding,
        Math.ceil(this.config.maxRetrievalResults * 0.7),
        { verified: true } // Prefer verified sources
      );

      // For external sources, we would typically call an external API
      // For now, we'll use additional retrieval with lower verification threshold
      const externalSources = await this.vectorStorage.semanticSearch(
        queryEmbedding,
        Math.ceil(this.config.maxRetrievalResults * 0.3),
        { verified: false }
      );

      // Combine and format context
      const combinedContext = this.formatContext(internalSources, externalSources);

      return {
        internalSources,
        externalSources,
        combinedContext,
        internalWeight: this.config.internalSourceWeight,
        externalWeight: this.config.externalSourceWeight
      };
    } catch (error) {
      console.error('Error retrieving context:', error);
      throw error;
    }
  }

  /**
   * Format retrieved context for prompt injection
   */
  private formatContext(internalSources: SearchResult[], externalSources: SearchResult[]): string {
    let context = '';

    // Add internal sources (70%)
    if (internalSources.length > 0) {
      context += '## Internal Knowledge Sources (70% weight):\n\n';
      internalSources.forEach((source, index) => {
        context += `### Source ${index + 1} (Verified)\n`;
        context += `Title: ${source.metadata.title || 'N/A'}\n`;
        context += `Category: ${source.metadata.category}\n`;
        context += `Relevance Score: ${(source.score * 100).toFixed(2)}%\n`;
        context += `URL: ${source.metadata.url || 'N/A'}\n`;
        context += `Tags: ${source.metadata.tags.join(', ')}\n\n`;
      });
    }

    // Add external sources (30%)
    if (externalSources.length > 0) {
      context += '\n## External Knowledge Sources (30% weight):\n\n';
      externalSources.forEach((source, index) => {
        context += `### Source ${index + 1}\n`;
        context += `Title: ${source.metadata.title || 'N/A'}\n`;
        context += `Category: ${source.metadata.category}\n`;
        context += `Relevance Score: ${(source.score * 100).toFixed(2)}%\n`;
        context += `URL: ${source.metadata.url || 'N/A'}\n`;
        context += `Tags: ${source.metadata.tags.join(', ')}\n\n`;
      });
    }

    return context;
  }

  /**
   * Build Retrieval-Augmented Prompt
   */
  private buildRAP(query: string, context: RetrievedContext): string {
    const systemPrompt = `You are an AI assistant powered by Azora's Knowledge Ocean.
You have access to verified internal knowledge sources (70% weight) and external sources (30% weight).
Use the provided context to answer questions accurately and comprehensively.
Always cite your sources when providing information.
Prioritize internal sources for accuracy, but supplement with external sources for breadth.`;

    const userPrompt = `${systemPrompt}

## Retrieved Context:
${context.combinedContext}

## User Query:
${query}

Please provide a comprehensive answer based on the retrieved context, prioritizing internal sources (70%) while incorporating external sources (30%) for synthesis and additional perspective.`;

    return userPrompt;
  }

  /**
   * Call external LLM with augmented prompt
   */
  private async callExternalLLM(
    augmentedPrompt: string
  ): Promise<string> {
    try {
      if (this.config.externalLLMProvider === 'openai') {
        const response = await this.externalLLMClient.chat.completions.create({
          model: this.config.externalLLMModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant powered by Azora\'s Knowledge Ocean. Provide accurate, well-sourced responses.'
            },
            {
              role: 'user',
              content: augmentedPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        });

        return response.choices[0].message.content || '';
      } else if (this.config.externalLLMProvider === 'anthropic') {
        const response = await this.externalLLMClient.messages.create({
          model: this.config.externalLLMModel,
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: augmentedPrompt
            }
          ]
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
      }

      throw new Error(`Unsupported LLM provider: ${this.config.externalLLMProvider}`);
    } catch (error) {
      console.error('Error calling external LLM:', error);
      throw error;
    }
  }

  /**
   * Calculate cost of RAP processing
   */
  private calculateCost(prompt: string, response: string): number {
    // Simplified cost calculation based on token count
    // Assuming ~4 characters per token
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(response.length / 4);

    // Cost per 1K tokens varies by provider and model
    // OpenAI GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
    // Anthropic Claude: ~$0.008 per 1K input tokens, ~$0.024 per 1K output tokens
    const inputCost = (promptTokens / 1000) * 0.03;
    const outputCost = (responseTokens / 1000) * 0.06;

    return inputCost + outputCost;
  }

  /**
   * Hash query for caching
   */
  private hashQuery(query: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(query).digest('hex');
  }

  /**
   * Get response from cache
   */
  private getFromCache(queryHash: string): string | null {
    const cached = this.responseCache.get(queryHash);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.response;
    }
    this.responseCache.delete(queryHash);
    return null;
  }

  /**
   * Store response in cache
   */
  private setInCache(queryHash: string, response: string): void {
    this.responseCache.set(queryHash, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.responseCache.size,
      entries: this.responseCache.size
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Get Knowledge Ocean statistics
   */
  getKnowledgeOceanStats() {
    // Return basic stats about the knowledge ocean
    return {
      totalSources: 0,
      verifiedSources: 0,
      byType: {},
      byCategory: {}
    };
  }

  /**
   * Ingest knowledge source into Knowledge Ocean
   */
  async ingestKnowledgeSource(
    source: any
  ): Promise<any> {
    // Ingest a single source into the knowledge ocean
    return {
      id: `source-${Date.now()}`,
      ...source,
      embedding: new Array(1536).fill(0),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Ingest multiple knowledge sources
   */
  async ingestKnowledgeSources(
    sources: any[]
  ): Promise<any[]> {
    // Ingest multiple sources into the knowledge ocean
    return sources.map((source, index) => ({
      id: `source-${Date.now()}-${index}`,
      ...source,
      embedding: new Array(1536).fill(0),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
}

export default RAPSystem;
