import { BaseMock } from './base.mock';

export interface MockChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MockChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: MockChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MockEmbedding {
  object: 'embedding';
  embedding: number[];
  index: number;
}

/**
 * Mock OpenAI service for testing
 */
export class MockOpenAIService extends BaseMock {
  private responsePatterns: Map<string, string> = new Map();
  private defaultResponse: string = 'This is a mock AI response for testing purposes.';
  private totalCost: number = 0;

  /**
   * Create a chat completion
   */
  async createChatCompletion(params: {
    model: string;
    messages: MockChatMessage[];
    temperature?: number;
    max_tokens?: number;
  }): Promise<MockChatCompletion> {
    this.trackCall('createChatCompletion', [params]);

    const lastMessage = params.messages[params.messages.length - 1];
    const responseContent = this.getResponseForPrompt(lastMessage.content);

    // Calculate mock token usage
    const promptTokens = this.estimateTokens(params.messages);
    const completionTokens = this.estimateTokens([{ role: 'assistant', content: responseContent }]);
    const totalTokens = promptTokens + completionTokens;

    // Track cost
    this.totalCost += this.calculateCost(params.model, promptTokens, completionTokens);

    const completion: MockChatCompletion = {
      id: `chatcmpl-test-${this.generateId()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: params.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
    };

    return completion;
  }

  /**
   * Create embeddings
   */
  async createEmbedding(params: {
    model: string;
    input: string | string[];
  }): Promise<{ data: MockEmbedding[] }> {
    this.trackCall('createEmbedding', [params]);

    const inputs = Array.isArray(params.input) ? params.input : [params.input];
    const embeddings = inputs.map((_, index) => ({
      object: 'embedding' as const,
      embedding: this.generateMockEmbedding(),
      index,
    }));

    return { data: embeddings };
  }

  /**
   * Set response pattern for specific prompts
   */
  setResponsePattern(promptPattern: string, response: string): void {
    this.responsePatterns.set(promptPattern, response);
  }

  /**
   * Set default response
   */
  setDefaultResponse(response: string): void {
    this.defaultResponse = response;
  }

  /**
   * Get response for a prompt
   */
  private getResponseForPrompt(prompt: string): string {
    // Check for pattern matches
    for (const [pattern, response] of this.responsePatterns.entries()) {
      if (prompt.toLowerCase().includes(pattern.toLowerCase())) {
        return response;
      }
    }

    // Return custom response if set, otherwise default
    return this.getResponse('chatCompletion', this.defaultResponse);
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(messages: MockChatMessage[]): number {
    const text = messages.map(m => m.content).join(' ');
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
  }

  /**
   * Calculate mock cost
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    // Mock pricing (per 1000 tokens)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;

    return promptCost + completionCost;
  }

  /**
   * Generate mock embedding vector
   */
  private generateMockEmbedding(): number[] {
    // Generate a 1536-dimensional vector (OpenAI embedding size)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  /**
   * Get total cost of all API calls
   */
  getTotalCost(): number {
    return this.totalCost;
  }

  /**
   * Reset mock state
   */
  reset(): void {
    super.reset();
    this.responsePatterns.clear();
    this.totalCost = 0;
  }

  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const mockOpenAI = new MockOpenAIService();
