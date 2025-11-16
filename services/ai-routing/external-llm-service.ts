/**
 * External LLM Service (Route C)
 * Handles OpenAI GPT-4 integration with cost tracking and response caching
 * Route C: Complex queries (strategic decisions, novel problems, creative tasks)
 */

import { AIQuery, AIResponse, RoutingTier } from './types';

/**
 * Configuration for External LLM Service
 */
export interface ExternalLLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  cacheTTL?: number; // Cache time-to-live in seconds
}

/**
 * Cost tracking for API calls
 */
export interface CostTrackingData {
  totalCost: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerRequest: number;
  costByModel: Record<string, number>;
  costByDate: Record<string, number>;
}

/**
 * External LLM Service
 * Implements OpenAI GPT-4 integration with cost tracking and caching
 */
export class ExternalLLMService {
  private config: ExternalLLMConfig;
  private client: any;
  private responseCache: Map<string, { response: string; cost: number; timestamp: number }> = new Map();
  private costTracking: CostTrackingData = {
    totalCost: 0,
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    averageCostPerRequest: 0,
    costByModel: {},
    costByDate: {}
  };

  constructor(config: ExternalLLMConfig) {
    this.config = {
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      cacheTTL: 3600, // 1 hour default
      ...config
    };

    this.initializeClient();
  }

  /**
   * Initialize external LLM client based on provider
   */
  private initializeClient(): void {
    if (this.config.provider === 'openai') {
      try {
        const { OpenAI } = require('openai');
        this.client = new OpenAI({
          apiKey: this.config.apiKey
        });
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        throw new Error('OpenAI client initialization failed');
      }
    } else if (this.config.provider === 'anthropic') {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        this.client = new Anthropic({
          apiKey: this.config.apiKey
        });
      } catch (error) {
        console.error('Failed to initialize Anthropic client:', error);
        throw new Error('Anthropic client initialization failed');
      }
    } else {
      throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  /**
   * Process a query using external LLM
   */
  async processQuery(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();
    const queryHash = this.hashQuery(query.query);

    // Check cache first
    const cached = this.getFromCache(queryHash);
    if (cached) {
      return {
        id: `response-${Date.now()}`,
        content: cached.response,
        routingTier: RoutingTier.EXTERNAL_LLM,
        responseTime: Date.now() - startTime,
        cost: 0, // No cost for cached response
        cached: true,
        metadata: {
          cacheHit: true,
          provider: this.config.provider,
          model: this.config.model
        }
      };
    }

    try {
      // Call external LLM
      const { response, inputTokens, outputTokens } = await this.callExternalLLM(query.query);

      // Calculate cost
      const cost = this.calculateCost(inputTokens, outputTokens);

      // Track cost
      this.trackCost(cost, inputTokens, outputTokens);

      // Cache the response
      this.setInCache(queryHash, response, cost);

      return {
        id: `response-${Date.now()}`,
        content: response,
        routingTier: RoutingTier.EXTERNAL_LLM,
        responseTime: Date.now() - startTime,
        cost,
        cached: false,
        metadata: {
          cacheHit: false,
          provider: this.config.provider,
          model: this.config.model,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens
        }
      };
    } catch (error) {
      throw new Error(
        `External LLM processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Call external LLM API
   */
  private async callExternalLLM(
    query: string
  ): Promise<{ response: string; inputTokens: number; outputTokens: number }> {
    try {
      if (this.config.provider === 'openai') {
        return await this.callOpenAI(query);
      } else if (this.config.provider === 'anthropic') {
        return await this.callAnthropic(query);
      }

      throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    } catch (error) {
      console.error('Error calling external LLM:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    query: string
  ): Promise<{ response: string; inputTokens: number; outputTokens: number }> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent AI assistant. Provide accurate, comprehensive, and well-reasoned responses.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP
    });

    const content = response.choices[0].message.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    return {
      response: content,
      inputTokens,
      outputTokens
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    query: string
  ): Promise<{ response: string; inputTokens: number; outputTokens: number }> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 2000,
      messages: [
        {
          role: 'user',
          content: query
        }
      ]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;

    return {
      response: content,
      inputTokens,
      outputTokens
    };
  }

  /**
   * Calculate cost based on tokens used
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Cost per 1K tokens varies by provider and model
    // OpenAI GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
    // OpenAI GPT-4 Turbo: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
    // Anthropic Claude 3: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens

    let inputCost = 0;
    let outputCost = 0;

    if (this.config.provider === 'openai') {
      if (this.config.model.includes('gpt-4-turbo')) {
        inputCost = (inputTokens / 1000) * 0.01;
        outputCost = (outputTokens / 1000) * 0.03;
      } else if (this.config.model.includes('gpt-4')) {
        inputCost = (inputTokens / 1000) * 0.03;
        outputCost = (outputTokens / 1000) * 0.06;
      } else if (this.config.model.includes('gpt-3.5')) {
        inputCost = (inputTokens / 1000) * 0.0005;
        outputCost = (outputTokens / 1000) * 0.0015;
      }
    } else if (this.config.provider === 'anthropic') {
      inputCost = (inputTokens / 1000) * 0.003;
      outputCost = (outputTokens / 1000) * 0.015;
    }

    return inputCost + outputCost;
  }

  /**
   * Track cost for analytics
   */
  private trackCost(cost: number, inputTokens: number, outputTokens: number): void {
    this.costTracking.totalCost += cost;
    this.costTracking.totalRequests += 1;
    this.costTracking.totalInputTokens += inputTokens;
    this.costTracking.totalOutputTokens += outputTokens;
    this.costTracking.averageCostPerRequest = this.costTracking.totalCost / this.costTracking.totalRequests;

    // Track by model
    if (!this.costTracking.costByModel[this.config.model]) {
      this.costTracking.costByModel[this.config.model] = 0;
    }
    this.costTracking.costByModel[this.config.model] += cost;

    // Track by date
    const today = new Date().toISOString().split('T')[0];
    if (!this.costTracking.costByDate[today]) {
      this.costTracking.costByDate[today] = 0;
    }
    this.costTracking.costByDate[today] += cost;
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTrackingData {
    return { ...this.costTracking };
  }

  /**
   * Reset cost tracking
   */
  resetCostTracking(): void {
    this.costTracking = {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      averageCostPerRequest: 0,
      costByModel: {},
      costByDate: {}
    };
  }

  /**
   * Get cost for a specific date
   */
  getCostByDate(date: string): number {
    return this.costTracking.costByDate[date] || 0;
  }

  /**
   * Get cost for a specific model
   */
  getCostByModel(model: string): number {
    return this.costTracking.costByModel[model] || 0;
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
  private getFromCache(queryHash: string): { response: string; cost: number } | null {
    const cached = this.responseCache.get(queryHash);
    if (cached && Date.now() - cached.timestamp < (this.config.cacheTTL || 3600) * 1000) {
      return {
        response: cached.response,
        cost: cached.cost
      };
    }
    this.responseCache.delete(queryHash);
    return null;
  }

  /**
   * Store response in cache
   */
  private setInCache(queryHash: string, response: string, cost: number): void {
    this.responseCache.set(queryHash, {
      response,
      cost,
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
   * Get cache entry count
   */
  getCacheSize(): number {
    return this.responseCache.size;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExternalLLMConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    // Reinitialize client if provider or API key changed
    if (config.provider || config.apiKey) {
      this.initializeClient();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ExternalLLMConfig {
    return { ...this.config };
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      if (this.config.provider === 'openai') {
        // Make a minimal API call to validate
        await this.client.models.list();
        return true;
      } else if (this.config.provider === 'anthropic') {
        // Anthropic doesn't have a simple validation endpoint
        // We'll consider it valid if client initialized successfully
        return !!this.client;
      }
      return false;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get available models for provider
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      if (this.config.provider === 'openai') {
        const models = await this.client.models.list();
        return models.data
          .filter((m: any) => m.id.includes('gpt'))
          .map((m: any) => m.id);
      } else if (this.config.provider === 'anthropic') {
        // Return known Anthropic models
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      }
      return [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }
}

export default ExternalLLMService;
