import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ConstitutionalValidator, EthicalAnalysis } from './ConstitutionalCore';
import KnowledgeOceanService from '../../vs/workbench/services/azora/knowledgeOceanService';
import OpenAIStreamingAdapter from './providerAdapters/openaiStreamingAdapter';
import AnthropicStreamingAdapter from './providerAdapters/anthropicStreamingAdapter';
import StreamingAssembler from './streamingUtils';
import { getMetricsService } from '../../vs/workbench/services/azora/metricsService';
import { PlannerAgent, Task, TaskDAG } from './PlannerAgent';
import { CodeGeneratorAgent, GeneratedFile, GenerationResult } from './CodeGeneratorAgent';
import { VerificationPipeline, VerificationReport } from './VerificationPipeline';
import { ChangesetManager, FileChange, Changeset } from './ChangesetManager';

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
  ethicalAnalysis?: EthicalAnalysis;
}

export interface AIStreamChunk { chunk: string; metadata?: any }

export interface CachedResponse {
  prompt: string;
  response: string;
  timestamp: number;
  model: string;
}

export interface ExecuteTaskArtifact {
  changesetId: string;
  filesAffected: string[];
  filesCreated: string[];
  filesModified: string[];
  filesDeleted: string[];
}

export interface ExecuteTaskResult {
  success: boolean;
  taskId: string;
  artifacts?: ExecuteTaskArtifact;
  verification?: VerificationReport;
  executionLog: string[];
  errors: string[];
  changesetId?: string;
  rollbackPerformed: boolean;
  duration: number;
}

export class AIOrchestrator {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private validator: ConstitutionalValidator;
  private knowledge: any;
  private openaiAdapter: OpenAIStreamingAdapter | null = null;
  private anthropicAdapter: AnthropicStreamingAdapter | null = null;
  private cache: Map<string, CachedResponse> = new Map();
  private plans: Map<string, TaskDAG> = new Map();
  private plannerAgent!: PlannerAgent;
  private codeGeneratorAgent!: CodeGeneratorAgent;
  private verificationPipeline!: VerificationPipeline;
  private changesetManager!: ChangesetManager;
  private readonly CACHE_TTL = 3600000; // 1 hour
  private totalTokensUsed = 0;
  private totalCost = 0;

  constructor(projectRoot: string = process.cwd()) {
    this.validator = ConstitutionalValidator.getInstance();
    this.knowledge = new KnowledgeOceanService();
    
    // Initialize Agents and Pipelines
    this.plannerAgent = new PlannerAgent(this);
    this.codeGeneratorAgent = new CodeGeneratorAgent(this);
    this.verificationPipeline = new VerificationPipeline(projectRoot);
    this.changesetManager = new ChangesetManager(projectRoot);

    // Initialize clients if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      try { this.openaiAdapter = new OpenAIStreamingAdapter(this.openai); } catch (err) { this.openaiAdapter = null; }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      try { this.anthropicAdapter = new AnthropicStreamingAdapter(this.anthropic); } catch (err) { this.anthropicAdapter = null; }
    }
  }

  /**
   * Plan a complex task using the Planner Agent
   */
  async planTask(taskDescription: string, context: AIContext): Promise<{ id: string; plan: TaskDAG }> {
    console.log(`[AIOrchestrator] Planning task: "${taskDescription}"`);
    
    const plan = await this.plannerAgent.planTask(taskDescription, context);
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.plans.set(planId, plan);
    console.log(`[AIOrchestrator] Plan created with ID: ${planId} (${plan.tasks.length} tasks)`);
    
    return { id: planId, plan };
  }

  /**
   * Execute a previously planned task
   */
  async executeTask(planId: string): Promise<ExecuteTaskResult> {
    console.log(`[AIOrchestrator] Executing plan: ${planId}`);
    
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const executionLog: string[] = [];
    const errors: string[] = [];
    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];
    const startTime = Date.now();

    // Get execution order (topological sort)
    const tasks = this.plannerAgent.getExecutionOrder(plan);
    
    // Create a changeset to track all file operations
    const changeset = this.changesetManager.createChangeset(`Execution of plan ${planId}`);
    const changesetId = changeset.id;
    
    try {
      for (const task of tasks) {
        console.log(`[AIOrchestrator] Executing task: ${task.description} (${task.id})`);
        executionLog.push(`Starting task: ${task.description}`);
        
        // Generate code for this task
        const context: AIContext = {
          files: [], // TODO: Populate with relevant files for this task
          projectInfo: { frameworks: [], conventions: {} }, // TODO: Get from project context
          userPrompt: task.description
        };
        
        const result = await this.codeGeneratorAgent.generateCode(task, context);
        
        if (!result.success) {
          throw new Error(`Task ${task.id} failed: ${result.error}`);
        }

        // Record changes
        for (const file of result.files) {
          if (file.type === 'create') {
            createdFiles.push(file.path);
            this.changesetManager.addChange(changesetId, {
              path: file.path,
              type: 'create',
              content: file.content
            });
          } else {
            modifiedFiles.push(file.path);
            this.changesetManager.addChange(changesetId, {
              path: file.path,
              type: 'modify',
              content: file.content
            });
          }
        }
        
        executionLog.push(`Completed task: ${task.description}`);
      }

      // Commit changes
      await this.changesetManager.commitChangeset(changesetId);
      
      return {
        success: true,
        taskId: planId,
        executionLog,
        errors: [],
        changesetId,
        rollbackPerformed: false,
        duration: Date.now() - startTime,
        artifacts: {
          changesetId,
          filesAffected: [...createdFiles, ...modifiedFiles],
          filesCreated: createdFiles,
          filesModified: modifiedFiles,
          filesDeleted: []
        }
      };

    } catch (error) {
      console.error(`[AIOrchestrator] Execution failed:`, error);
      executionLog.push(`Execution failed: ${(error as Error).message}`);
      errors.push((error as Error).message);
      
      // Rollback
      await this.changesetManager.rollbackChangeset(changesetId);
      
      return {
        success: false,
        taskId: planId,
        executionLog,
        errors,
        changesetId,
        rollbackPerformed: true,
        duration: Date.now() - startTime
      };
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

    // Try Knowledge Ocean first — a cheap, free vector/text search
    try {
      const knowledgeAnswer = await this.knowledge.tryAnswer(prompt);
      if (knowledgeAnswer) {
        // Small 'knowledge-ocean' response
        return {
          content: knowledgeAnswer,
          model: 'knowledge-ocean',
          tokensUsed: 0,
          cost: 0,
        };
      }
    } catch (err) {
      // ignore knowledge ocean errors and fall through
    }

    // Build full prompt with context and include knowledge context if available
    // Query knowledge ocean for relevant snippets and limit context size to control token usage
    const snippets = await this.knowledge.querySnippets(prompt, 3);
    const contextString = snippets.map((s: any) => `- ${s.title || s.id}: ${s.snippet} (source: ${s.source})`).join('\n');
    const MAX_CONTEXT_CHARS = Number(process.env.AZORA_INLINE_CHAT_CONTEXT_CHARS || '2000');
    const truncated = contextString.length > MAX_CONTEXT_CHARS ? contextString.slice(0, MAX_CONTEXT_CHARS) + '\n... (truncated)' : contextString;
    const fullPrompt = this.buildPrompt(prompt, context, truncated);
    // we've already included truncated knowledge context in `fullPrompt`; nothing else to do here.

    // Generate response
    let response: AIResponse;
    if (selectedModel.provider === 'openai') {
      response = await this.generateWithOpenAI(fullPrompt, selectedModel);
    } else {
      response = await this.generateWithClaude(fullPrompt, selectedModel);
    }

    // CONSTITUTIONAL CHECK (The Conscience)
    console.log('[AIOrchestrator] Validating generated code against Divine Law...');
    const ethicalAnalysis: EthicalAnalysis = await this.validator.validateContent(response.content, prompt);

    if (!ethicalAnalysis.approved) {
      console.warn('[AIOrchestrator] Code generation VETOED by Constitution:', ethicalAnalysis.concerns);
      // We still return the analysis with the response for upstream components to decide
      // what to do, but we also throw to preserve existing veto semantics. Callers can
      // catch the error and inspect the analysis if required.
      const r: AIResponse = {
        content: response.content,
        model: response.model,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        ethicalAnalysis,
      };
      this.cacheResponse(cacheKey, response.content, response.model);
      this.totalTokensUsed += response.tokensUsed;
      this.totalCost += response.cost;
      throw Object.assign(new Error(`Constitutional Violation: ${ethicalAnalysis.concerns.join(', ')}`), { analysis: ethicalAnalysis, response: r });
    }

    // Cache response
    this.cacheResponse(cacheKey, response.content, response.model);

    // Track usage
    this.totalTokensUsed += response.tokensUsed;
    this.totalCost += response.cost;

    // Append analysis
    const finalResp: AIResponse = { ...response, ethicalAnalysis };
    return finalResp;
  }

  // Streaming generator that attempts to use provider streaming if available
  async *generateCodeStreaming(prompt: string, context: AIContext, model?: AIModel): AsyncGenerator<AIStreamChunk, AIResponse, void> {
    // Select model
    const selectedModel = model || this.selectModel('code-generation');
    // Try a knowledge ocean short answer first, using streaming-like behavior
    try {
      const knowledgeAnswer = await this.knowledge.tryAnswer(prompt);
      if (knowledgeAnswer) {
        // Yield the knowledge answer as a single chunk and return final response
        yield { chunk: knowledgeAnswer };
        return { content: knowledgeAnswer, model: 'knowledge-ocean', tokensUsed: 0, cost: 0 } as any;
      }
    } catch (err) { /* ignore or log */ }

    const snippets = await this.knowledge.querySnippets(prompt, 3);
    const contextString = snippets.map((s: any) => `- ${s.title || s.id}: ${s.snippet} (source: ${s.source})`).join('\n');
    const MAX_CONTEXT_CHARS = Number(process.env.AZORA_INLINE_CHAT_CONTEXT_CHARS || '2000');
    const truncated = contextString.length > MAX_CONTEXT_CHARS ? contextString.slice(0, MAX_CONTEXT_CHARS) + '\n... (truncated)' : contextString;
    const fullPrompt = this.buildPrompt(prompt, context, truncated);

    // If OpenAI streaming is available, create streaming response
    if (selectedModel.provider === 'openai' && this.openai) {
      try {
        // Attempt streaming via SDK-specific streaming support if present. SDKs differ:
        // - Some support `chat.completions.create` with stream: true returning async iterator
        // - Others provide `responses.stream` or `chat.completions.stream` functions
        if (this.openaiAdapter) {
          const assembler = new StreamingAssembler({ dedupe: true, trim: true });
          for await (const c of this.openaiAdapter.streamChat(fullPrompt, selectedModel.model, { maxTokens: selectedModel.maxTokens, temperature: selectedModel.temperature })) {
            const parts = assembler.accept(c);
            for (const p of parts) {
              yield { chunk: p.text, metadata: { partial: !!p.partial } };
              try { getMetricsService().recordStreamingChunk(); } catch {}
            }
          }
          for (const p of assembler.flush()) yield { chunk: p.text };
        } else {
          // fallback to old logic if no adapter
          const maybeIterator = (this.openai as any).chat?.completions?.create?.({ model: selectedModel.model, messages: [{ role: 'system', content: 'System' }, { role: 'user', content: fullPrompt }], max_tokens: selectedModel.maxTokens, temperature: selectedModel.temperature, stream: true }) as AsyncIterable<any> | undefined;
          if (maybeIterator && (maybeIterator as any)[Symbol.asyncIterator]) {
            for await (const chunk of maybeIterator as AsyncIterable<any>) {
              const content = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.message?.content || '';
              if (content) yield { chunk: content };
            }
          } else if (typeof (this.openai as any).responses?.stream === 'function') {
            const stream = (this.openai as any).responses.stream({ model: selectedModel.model, input: fullPrompt, max_tokens: selectedModel.maxTokens, temperature: selectedModel.temperature });
            for await (const event of stream) {
              const content = event?.output_text || event?.delta?.content || event?.message?.content || '';
              if (content) yield { chunk: content };
            }
          } else {
            throw new Error('No streaming interface available');
          }
        }
        // After streaming completes, call normal generateCode to get final metadata (usage/cost)
        const finalResp = await this.generateCode(prompt, context, selectedModel);
        return finalResp as any;
      } catch (err) {
        // Fallback to non-streaming. Attempt a single retry for streaming to handle transient provider issues
        try {
          if (this.openaiAdapter) {
            const assembler = new StreamingAssembler({ dedupe: true, trim: true });
            for await (const c of this.openaiAdapter.streamChat(fullPrompt, selectedModel.model, { maxTokens: selectedModel.maxTokens, temperature: selectedModel.temperature })) {
              const parts = assembler.accept(c);
              for (const p of parts) yield { chunk: p.text };
            }
            for (const p of assembler.flush()) yield { chunk: p.text };
            const finalResp2 = await this.generateCode(prompt, context, selectedModel);
            return finalResp2 as any;
          }
        } catch (err2) {
          // If retry fails, do non-streaming fallback by generating whole response and pseudo-chunking
          const fallbackResp = await this.generateCode(prompt, context, selectedModel);
          const parts = fallbackResp.content.match(/(.|\n){1,120}/g) || [fallbackResp.content];
          for (const p of parts) yield { chunk: p };
          return fallbackResp as any;
        }
      }
    }

    // Anthropic streaming fallback (not implemented); attempt to use SDK streaming if available. Otherwise fallback to a simple chunking generator
    if (selectedModel.provider === 'anthropic' && this.anthropic) {
      try {
        if (this.anthropicAdapter) {
          const assembler = new StreamingAssembler({ dedupe: true, trim: true });
          for await (const c of this.anthropicAdapter.streamChat(fullPrompt, selectedModel.model, { maxTokens: selectedModel.maxTokens })) {
            const parts = assembler.accept(c);
            for (const p of parts) yield { chunk: p.text };
          }
          for (const p of assembler.flush()) yield { chunk: p.text };
          const finalResp = await this.generateCode(prompt, context, selectedModel);
          return finalResp as any;
        }
      } catch (err) {
        // Single retry for anthropic streaming
        try {
          if (this.anthropicAdapter) {
            const assembler = new StreamingAssembler({ dedupe: true, trim: true });
            for await (const c of this.anthropicAdapter.streamChat(fullPrompt, selectedModel.model, { maxTokens: selectedModel.maxTokens })) {
              const parts = assembler.accept(c);
              for (const p of parts) yield { chunk: p.text };
            }
            for (const p of assembler.flush()) yield { chunk: p.text };
            const finalResp2 = await this.generateCode(prompt, context, selectedModel);
            return finalResp2 as any;
          }
        } catch (_err) {
          const fallbackResp = await this.generateCode(prompt, context, selectedModel);
          const parts = fallbackResp.content.match(/(.|\n){1,120}/g) || [fallbackResp.content];
          for (const p of parts) yield { chunk: p };
          return fallbackResp as any;
        }
      }
    }
    const resp = await this.generateCode(prompt, context, selectedModel);
    // Split into chunks for pseudo-streaming
    const parts = resp.content.match(/(.|\n){1,120}/g) || [resp.content];
    for (const p of parts) {
      yield { chunk: p };
    }
    return resp as any;
  }

  // Small helper: chunk a string into pieces of N characters for pseudo-streaming
  private *chunkString(content: string, size = 80) {
    for (let i = 0; i < content.length; i += size) {
      yield content.slice(i, i + size);
    }
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

  private buildPrompt(userPrompt: string, context: AIContext, knowledgeContext?: string): string {
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

    if (knowledgeContext) {
      prompt += `# Relevant Knowledge Ocean Context\n` + knowledgeContext + `\n\n`;
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
    // Include knowledge context in cost estimation to avoid surprises
    const snippets = await this.knowledge.querySnippets(prompt, 3);
    const contextString = snippets.map((s: any) => `- ${s.title || s.id}: ${s.snippet} (source: ${s.source})`).join('\n');
    const MAX_CONTEXT_CHARS = Number(process.env.AZORA_INLINE_CHAT_CONTEXT_CHARS || '2000');
    const truncated = contextString.length > MAX_CONTEXT_CHARS ? contextString.slice(0, MAX_CONTEXT_CHARS) + '\n... (truncated)' : contextString;
    const fullPrompt = this.buildPrompt(prompt, context, truncated);
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
