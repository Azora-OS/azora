import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIModel {
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIContext {
  files: Array<{ path: string; content: string }>;
  projectInfo: {
    frameworks: string[];
    conventions: any;
  };
  userPrompt: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
}

export interface CachedResponse {
  prompt: string;
  response: string;
  timestamp: number;
  model: string;
}

export class AIOrchestrator {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private validator: ConstitutionalValidator;
  private cache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour
  private totalTokensUsed = 0;
  private totalCost = 0;

  constructor() {
    this.validator = ConstitutionalValidator.getInstance();
    // Initialize clients if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async generateCode(prompt: string, context: AIContext, model?: AIModel): Promise<AIResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(prompt, context);
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      console.log('Using cached AI response');
      return {
        content: cached.response,
        model: cached.model,
        tokensUsed: 0,
        cost: 0,
      };
    }

    // Select model
    const selectedModel = model || this.selectModel('code-generation');

    // Build full prompt with context
    const fullPrompt = this.buildPrompt(prompt, context);

    // Generate response
    let response: AIResponse;
    if (selectedModel.provider === 'openai') {
      response = await this.generateWithOpenAI(fullPrompt, selectedModel);
    } else {
      response = await this.generateWithClaude(fullPrompt, selectedModel);
    }

    // CONSTITUTIONAL CHECK (The Conscience)
    console.log('[AIOrchestrator] Validating generated code against Divine Law...');
    const ethicalAnalysis = await this.validator.validateContent(response.content, prompt);

    if (!ethicalAnalysis.approved) {
      console.warn('[AIOrchestrator] Code generation VETOED by Constitution:', ethicalAnalysis.concerns);
      throw new Error(`Constitutional Violation: ${ethicalAnalysis.concerns.join(', ')}`);
    }

    // Cache response
    this.cacheResponse(cacheKey, response.content, response.model);

    // Track usage
    this.totalTokensUsed += response.tokensUsed;
    this.totalCost += response.cost;

    return response;
  }

  private async generateWithOpenAI(prompt: string, model: AIModel): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
    }

    const completion = await this.openai.chat.completions.create({
      model: model.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert software developer assistant. Generate clean, production-ready code following best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: model.maxTokens,
      temperature: model.temperature,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = this.calculateCost('openai', model.model, tokensUsed);

    return {
      content,
      model: model.model,
      tokensUsed,
      cost,
    };
  }

  private async generateWithClaude(prompt: string, model: AIModel): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized. Please set ANTHROPIC_API_KEY.');
    }

    const message = await this.anthropic.messages.create({
      model: model.model,
      max_tokens: model.maxTokens,
      temperature: model.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0]?.type === 'text' ? message.content[0].text : '';
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
    const cost = this.calculateCost('anthropic', model.model, tokensUsed);

    return {
      content,
      model: model.model,
      tokensUsed,
      cost,
    };
  }

  selectModel(taskType: string): AIModel {
    // Select appropriate model based on task type
    switch (taskType) {
      case 'code-generation':
        return {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          maxTokens: 4096,
          temperature: 0.2,
        };
      case 'refactoring':
        return {
          provider: 'anthropic',
          model: 'claude-3-opus-20240229',
          maxTokens: 4096,
          temperature: 0.1,
        };
      case 'explanation':
        return {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          maxTokens: 2048,
          temperature: 0.7,
        };
      default:
        return {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          maxTokens: 4096,
          temperature: 0.3,
        };
    }
  }

  private buildPrompt(userPrompt: string, context: AIContext): string {
    let prompt = `# Task\n${userPrompt}\n\n`;

    // Add project context
    if (context.projectInfo.frameworks.length > 0) {
      prompt += `# Project Frameworks\n${context.projectInfo.frameworks.join(', ')}\n\n`;
    }

    // Add relevant files
    if (context.files.length > 0) {
      prompt += `# Relevant Files\n\n`;
      for (const file of context.files) {
        prompt += `## ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
      }
    }

    // Add conventions
    if (context.projectInfo.conventions) {
      prompt += `# Project Conventions\n`;
      prompt += `- Package Manager: ${context.projectInfo.conventions.packageManager}\n`;
      prompt += `- TypeScript: ${context.projectInfo.conventions.typescript ? 'Yes' : 'No'}\n`;
      if (context.projectInfo.conventions.testing.length > 0) {
        prompt += `- Testing: ${context.projectInfo.conventions.testing.join(', ')}\n`;
      }
      prompt += `\n`;
    }

    prompt += `# Instructions\n`;
    prompt += `- Generate clean, production-ready code\n`;
    prompt += `- Follow the project's existing patterns and conventions\n`;
    prompt += `- Include proper error handling\n`;
    prompt += `- Add TypeScript types where applicable\n`;
    prompt += `- Write self-documenting code with clear variable names\n`;

    return prompt;
  }

  async estimateCost(prompt: string, context: AIContext): Promise<number> {
    const fullPrompt = this.buildPrompt(prompt, context);
    const estimatedTokens = Math.ceil(fullPrompt.length / 4); // Rough estimate: 1 token ≈ 4 chars
    const model = this.selectModel('code-generation');
    return this.calculateCost(model.provider, model.model, estimatedTokens);
  }

  private calculateCost(provider: string, model: string, tokens: number): number {
    // Pricing per 1M tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 10, output: 30 },
      'gpt-4': { input: 30, output: 60 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
    };

    const modelPricing = pricing[model] || { input: 10, output: 30 };
    // Assume 50/50 split between input and output tokens
    const inputTokens = tokens * 0.5;
    const outputTokens = tokens * 0.5;
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000000;
  }

  private getCacheKey(prompt: string, context: AIContext): string {
    const contextStr = JSON.stringify({
      prompt,
      files: context.files.map(f => f.path),
      frameworks: context.projectInfo.frameworks,
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < contextStr.length; i++) {
      const char = contextStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  getCachedResponse(key: string): CachedResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  cacheResponse(key: string, response: string, model: string): void {
    this.cache.set(key, {
      prompt: key,
      response,
      timestamp: Date.now(),
      model,
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  getUsageStats(): { totalTokens: number; totalCost: number; cacheSize: number } {
    return {
      totalTokens: this.totalTokensUsed,
      totalCost: this.totalCost,
      cacheSize: this.cache.size,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
