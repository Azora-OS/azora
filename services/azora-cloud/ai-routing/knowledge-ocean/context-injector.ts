/**
 * Context Injector
 * Injects retrieved context into AI prompts with formatting and token management
 */

import { Document, ContextInjectionOptions } from './types';

export interface ContextInjectionResult {
  prompt: string;
  contextLength: number;
  tokensUsed: number;
  documentsIncluded: number;
  truncated: boolean;
}

export interface PromptTemplate {
  system: string;
  userPrefix: string;
  contextPrefix: string;
  contextSuffix: string;
  userSuffix: string;
}

/**
 * Context Injector
 * Handles context formatting and injection into prompts
 */
export class ContextInjector {
  private defaultMaxTokens: number;
  private tokensPerWord: number;
  private defaultFormat: 'markdown' | 'json' | 'plain';
  private promptTemplate: PromptTemplate;

  constructor(options: ContextInjectionOptions = {}) {
    this.defaultMaxTokens = options.maxTokens || 2000;
    this.tokensPerWord = 1.3; // Approximate tokens per word
    this.defaultFormat = options.format || 'markdown';
    this.promptTemplate = this.getDefaultTemplate();
  }

  /**
   * Inject context into a user prompt
   */
  public injectContext(
    userPrompt: string,
    documents: Document[],
    options: ContextInjectionOptions = {}
  ): ContextInjectionResult {
    const maxTokens = options.maxTokens || this.defaultMaxTokens;
    const format = options.format || this.defaultFormat;
    const includeMetadata = options.includeMetadata !== false;

    // Format context from documents
    const formattedContext = this.formatContext(documents, format, includeMetadata);

    // Truncate context if needed
    const { truncatedContext, tokensUsed, truncated } = this.truncateToTokenLimit(
      formattedContext,
      maxTokens
    );

    // Build final prompt
    const prompt = this.buildPrompt(userPrompt, truncatedContext);

    return {
      prompt,
      contextLength: truncatedContext.length,
      tokensUsed,
      documentsIncluded: documents.length,
      truncated
    };
  }

  /**
   * Format context from documents
   */
  public formatContext(
    documents: Document[],
    format: 'markdown' | 'json' | 'plain' = 'markdown',
    includeMetadata: boolean = true
  ): string {
    if (documents.length === 0) {
      return '';
    }

    switch (format) {
      case 'json':
        return this.formatAsJson(documents, includeMetadata);
      case 'plain':
        return this.formatAsPlain(documents, includeMetadata);
      case 'markdown':
      default:
        return this.formatAsMarkdown(documents, includeMetadata);
    }
  }

  /**
   * Format context as Markdown
   */
  private formatAsMarkdown(documents: Document[], includeMetadata: boolean): string {
    const sections = documents.map((doc, index) => {
      let section = `### Source ${index + 1}\n\n`;

      if (includeMetadata) {
        section += `**Source:** ${doc.metadata.source}\n`;
        section += `**Category:** ${doc.metadata.category}\n`;

        if (doc.metadata.subcategory) {
          section += `**Subcategory:** ${doc.metadata.subcategory}\n`;
        }

        if (doc.metadata.author) {
          section += `**Author:** ${doc.metadata.author}\n`;
        }

        if (doc.score !== undefined) {
          section += `**Relevance:** ${(doc.score * 100).toFixed(1)}%\n`;
        }

        if (doc.metadata.tags && doc.metadata.tags.length > 0) {
          section += `**Tags:** ${doc.metadata.tags.join(', ')}\n`;
        }

        section += '\n';
      }

      section += `${doc.content}\n`;

      return section;
    });

    return `## Context\n\n${sections.join('\n---\n\n')}`;
  }

  /**
   * Format context as plain text
   */
  private formatAsPlain(documents: Document[], includeMetadata: boolean): string {
    const sections = documents.map((doc, index) => {
      let section = `Source ${index + 1}:\n`;

      if (includeMetadata) {
        section += `Source: ${doc.metadata.source}\n`;
        section += `Category: ${doc.metadata.category}\n`;

        if (doc.metadata.subcategory) {
          section += `Subcategory: ${doc.metadata.subcategory}\n`;
        }

        if (doc.metadata.author) {
          section += `Author: ${doc.metadata.author}\n`;
        }

        if (doc.score !== undefined) {
          section += `Relevance: ${(doc.score * 100).toFixed(1)}%\n`;
        }

        if (doc.metadata.tags && doc.metadata.tags.length > 0) {
          section += `Tags: ${doc.metadata.tags.join(', ')}\n`;
        }

        section += '\n';
      }

      section += `${doc.content}\n`;

      return section;
    });

    return `CONTEXT:\n\n${sections.join('\n---\n\n')}`;
  }

  /**
   * Format context as JSON
   */
  private formatAsJson(documents: Document[], includeMetadata: boolean): string {
    const contextDocs = documents.map(doc => {
      const item: any = {
        content: doc.content
      };

      if (includeMetadata) {
        item.metadata = {
          source: doc.metadata.source,
          category: doc.metadata.category
        };

        if (doc.metadata.subcategory) {
          item.metadata.subcategory = doc.metadata.subcategory;
        }

        if (doc.metadata.author) {
          item.metadata.author = doc.metadata.author;
        }

        if (doc.score !== undefined) {
          item.relevance = parseFloat((doc.score * 100).toFixed(1));
        }

        if (doc.metadata.tags && doc.metadata.tags.length > 0) {
          item.metadata.tags = doc.metadata.tags;
        }
      }

      return item;
    });

    return JSON.stringify({ context: contextDocs }, null, 2);
  }

  /**
   * Truncate context to token limit
   */
  public truncateToTokenLimit(
    context: string,
    maxTokens: number
  ): { truncatedContext: string; tokensUsed: number; truncated: boolean } {
    const estimatedTokens = this.estimateTokens(context);

    if (estimatedTokens <= maxTokens) {
      return {
        truncatedContext: context,
        tokensUsed: estimatedTokens,
        truncated: false
      };
    }

    // Calculate target character count
    const targetChars = Math.floor((context.length * maxTokens) / estimatedTokens);
    let truncated = context.substring(0, targetChars);

    // Find last complete sentence or section
    const lastNewline = truncated.lastIndexOf('\n');
    if (lastNewline > targetChars * 0.8) {
      truncated = truncated.substring(0, lastNewline);
    }

    // Add truncation indicator
    truncated += '\n\n[Context truncated due to token limit]';

    return {
      truncatedContext: truncated,
      tokensUsed: this.estimateTokens(truncated),
      truncated: true
    };
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Simple estimation: count words and multiply by average tokens per word
    const words = text.split(/\s+/).length;
    return Math.ceil(words * this.tokensPerWord);
  }

  /**
   * Build final prompt with context
   */
  private buildPrompt(userPrompt: string, context: string): string {
    if (!context) {
      return userPrompt;
    }

    return `${this.promptTemplate.system}

${context}

${this.promptTemplate.userPrefix}

${userPrompt}

${this.promptTemplate.userSuffix}`;
  }

  /**
   * Get default prompt template
   */
  private getDefaultTemplate(): PromptTemplate {
    return {
      system: 'You are a helpful assistant. Use the provided context to answer questions accurately and thoroughly.',
      userPrefix: 'Based on the context provided above, please answer the following question:',
      contextPrefix: 'CONTEXT:',
      contextSuffix: 'END CONTEXT',
      userSuffix: 'Please provide a comprehensive answer based on the context.'
    };
  }

  /**
   * Set custom prompt template
   */
  public setPromptTemplate(template: Partial<PromptTemplate>): void {
    this.promptTemplate = {
      ...this.getDefaultTemplate(),
      ...template
    };
  }

  /**
   * Get current prompt template
   */
  public getPromptTemplate(): PromptTemplate {
    return { ...this.promptTemplate };
  }

  /**
   * Calculate context statistics
   */
  public getContextStats(documents: Document[]): {
    totalDocuments: number;
    totalCharacters: number;
    estimatedTokens: number;
    averageDocLength: number;
    sourceBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  } {
    if (documents.length === 0) {
      return {
        totalDocuments: 0,
        totalCharacters: 0,
        estimatedTokens: 0,
        averageDocLength: 0,
        sourceBreakdown: {},
        categoryBreakdown: {}
      };
    }

    const totalCharacters = documents.reduce((sum, doc) => sum + doc.content.length, 0);
    const estimatedTokens = this.estimateTokens(
      documents.map(d => d.content).join(' ')
    );

    const sourceBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};

    documents.forEach(doc => {
      sourceBreakdown[doc.metadata.source] = (sourceBreakdown[doc.metadata.source] || 0) + 1;
      categoryBreakdown[doc.metadata.category] = (categoryBreakdown[doc.metadata.category] || 0) + 1;
    });

    return {
      totalDocuments: documents.length,
      totalCharacters,
      estimatedTokens,
      averageDocLength: Math.round(totalCharacters / documents.length),
      sourceBreakdown,
      categoryBreakdown
    };
  }

  /**
   * Validate context injection options
   */
  public validateOptions(options: ContextInjectionOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.maxTokens !== undefined && options.maxTokens < 100) {
      errors.push('maxTokens must be at least 100');
    }

    if (options.format && !['markdown', 'json', 'plain'].includes(options.format)) {
      errors.push('format must be one of: markdown, json, plain');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
