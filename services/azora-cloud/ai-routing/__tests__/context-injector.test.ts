/**
 * Context Injector Tests
 * Tests for context formatting, injection, and token management
 */

import { ContextInjector } from '../knowledge-ocean/context-injector';
import { Document, ContextInjectionOptions } from '../knowledge-ocean/types';

describe('ContextInjector', () => {
  let injector: ContextInjector;
  let mockDocuments: Document[];

  beforeEach(() => {
    injector = new ContextInjector({
      maxTokens: 2000,
      format: 'markdown'
    });

    mockDocuments = [
      {
        id: 'doc-1',
        content: 'Ubuntu is a philosophy emphasizing collective benefit and community.',
        metadata: {
          source: 'internal',
          category: 'philosophy',
          timestamp: new Date('2024-01-01'),
          tags: ['ubuntu', 'principles']
        },
        score: 0.95
      },
      {
        id: 'doc-2',
        content: 'Knowledge sharing is fundamental to building inclusive communities.',
        metadata: {
          source: 'internal',
          category: 'community',
          timestamp: new Date('2024-01-02'),
          tags: ['knowledge', 'sharing']
        },
        score: 0.87
      },
      {
        id: 'doc-3',
        content: 'External research shows the importance of collaborative learning.',
        metadata: {
          source: 'external',
          category: 'research',
          timestamp: new Date('2024-01-03'),
          tags: ['research', 'learning']
        },
        score: 0.82
      }
    ];
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const defaultInjector = new ContextInjector();
      expect(defaultInjector).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const customInjector = new ContextInjector({
        maxTokens: 3000,
        format: 'json'
      });
      expect(customInjector).toBeDefined();
    });
  });

  describe('Context Formatting', () => {
    it('should format context as markdown', () => {
      const markdown = injector.formatContext(mockDocuments, 'markdown', true);

      expect(markdown).toContain('## Context');
      expect(markdown).toContain('### Source 1');
      expect(markdown).toContain('**Source:** internal');
      expect(markdown).toContain('**Category:** philosophy');
      expect(markdown).toContain('Ubuntu is a philosophy');
    });

    it('should format context as plain text', () => {
      const plain = injector.formatContext(mockDocuments, 'plain', true);

      expect(plain).toContain('CONTEXT:');
      expect(plain).toContain('Source 1:');
      expect(plain).toContain('Source: internal');
      expect(plain).toContain('Category: philosophy');
      expect(plain).toContain('Ubuntu is a philosophy');
    });

    it('should format context as JSON', () => {
      const json = injector.formatContext(mockDocuments, 'json', true);
      const parsed = JSON.parse(json);

      expect(parsed.context).toBeDefined();
      expect(parsed.context).toHaveLength(3);
      expect(parsed.context[0].content).toContain('Ubuntu');
      expect(parsed.context[0].metadata.source).toBe('internal');
    });

    it('should format context without metadata', () => {
      const markdown = injector.formatContext(mockDocuments, 'markdown', false);

      expect(markdown).toContain('Ubuntu is a philosophy');
      expect(markdown).not.toContain('**Source:**');
      expect(markdown).not.toContain('**Category:**');
    });

    it('should handle empty documents', () => {
      const markdown = injector.formatContext([], 'markdown', true);
      expect(markdown).toBe('');
    });

    it('should include relevance scores in markdown', () => {
      const markdown = injector.formatContext(mockDocuments, 'markdown', true);

      expect(markdown).toContain('95.0%');
      expect(markdown).toContain('87.0%');
      expect(markdown).toContain('82.0%');
    });

    it('should include tags in markdown', () => {
      const markdown = injector.formatContext(mockDocuments, 'markdown', true);

      expect(markdown).toContain('ubuntu, principles');
      expect(markdown).toContain('knowledge, sharing');
      expect(markdown).toContain('research, learning');
    });
  });

  describe('Context Injection', () => {
    it('should inject context into prompt', () => {
      const userPrompt = 'What is Ubuntu philosophy?';
      const result = injector.injectContext(userPrompt, mockDocuments);

      expect(result.prompt).toContain(userPrompt);
      expect(result.prompt).toContain('## Context');
      expect(result.prompt).toContain('Ubuntu is a philosophy');
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.truncated).toBe(false);
    });

    it('should inject context with custom options', () => {
      const userPrompt = 'What is Ubuntu philosophy?';
      const result = injector.injectContext(userPrompt, mockDocuments, {
        format: 'json',
        maxTokens: 2000,
        includeMetadata: false
      });

      expect(result.prompt).toContain(userPrompt);
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('should handle empty documents gracefully', () => {
      const userPrompt = 'What is Ubuntu philosophy?';
      const result = injector.injectContext(userPrompt, []);

      expect(result.prompt).toContain(userPrompt);
      expect(result.contextLength).toBe(0);
      expect(result.documentsIncluded).toBe(0);
    });

    it('should include system prompt in injection', () => {
      const userPrompt = 'What is Ubuntu philosophy?';
      const result = injector.injectContext(userPrompt, mockDocuments);

      expect(result.prompt).toContain('helpful assistant');
      expect(result.prompt).toContain('provided context');
    });
  });

  describe('Token Management', () => {
    it('should estimate tokens correctly', () => {
      const text = 'This is a test sentence with multiple words.';
      const tokens = injector['estimateTokens'](text);

      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    it('should truncate context when exceeding token limit', () => {
      const longContext = 'Lorem ipsum dolor sit amet, '.repeat(200);
      const result = injector.truncateToTokenLimit(longContext, 100);

      expect(result.truncatedContext.length).toBeLessThan(longContext.length);
      expect(result.truncated).toBe(true);
      expect(result.truncatedContext).toContain('[Context truncated');
    });

    it('should not truncate when within token limit', () => {
      const shortContext = 'This is a short context.';
      const result = injector.truncateToTokenLimit(shortContext, 1000);

      expect(result.truncatedContext).toBe(shortContext);
      expect(result.truncated).toBe(false);
    });

    it('should calculate tokens used correctly', () => {
      const userPrompt = 'What is Ubuntu philosophy?';
      const result = injector.injectContext(userPrompt, mockDocuments, {
        maxTokens: 2000
      });

      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.tokensUsed).toBeLessThanOrEqual(2000);
    });
  });

  describe('Prompt Templates', () => {
    it('should use default prompt template', () => {
      const template = injector.getPromptTemplate();

      expect(template.system).toContain('helpful assistant');
      expect(template.userPrefix).toBeDefined();
      expect(template.userSuffix).toBeDefined();
    });

    it('should set custom prompt template', () => {
      const customTemplate = {
        system: 'Custom system prompt',
        userPrefix: 'Custom prefix',
        userSuffix: 'Custom suffix'
      };

      injector.setPromptTemplate(customTemplate);
      const template = injector.getPromptTemplate();

      expect(template.system).toBe('Custom system prompt');
      expect(template.userPrefix).toBe('Custom prefix');
      expect(template.userSuffix).toBe('Custom suffix');
    });

    it('should use custom template in injection', () => {
      injector.setPromptTemplate({
        system: 'CUSTOM SYSTEM',
        userPrefix: 'CUSTOM PREFIX',
        userSuffix: 'CUSTOM SUFFIX'
      });

      const result = injector.injectContext('Test prompt', mockDocuments);

      expect(result.prompt).toContain('CUSTOM SYSTEM');
      expect(result.prompt).toContain('CUSTOM PREFIX');
      expect(result.prompt).toContain('CUSTOM SUFFIX');
    });
  });

  describe('Context Statistics', () => {
    it('should calculate context statistics', () => {
      const stats = injector.getContextStats(mockDocuments);

      expect(stats.totalDocuments).toBe(3);
      expect(stats.totalCharacters).toBeGreaterThan(0);
      expect(stats.estimatedTokens).toBeGreaterThan(0);
      expect(stats.averageDocLength).toBeGreaterThan(0);
    });

    it('should break down statistics by source', () => {
      const stats = injector.getContextStats(mockDocuments);

      expect(stats.sourceBreakdown.internal).toBe(2);
      expect(stats.sourceBreakdown.external).toBe(1);
    });

    it('should break down statistics by category', () => {
      const stats = injector.getContextStats(mockDocuments);

      expect(stats.categoryBreakdown.philosophy).toBe(1);
      expect(stats.categoryBreakdown.community).toBe(1);
      expect(stats.categoryBreakdown.research).toBe(1);
    });

    it('should handle empty documents in statistics', () => {
      const stats = injector.getContextStats([]);

      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalCharacters).toBe(0);
      expect(stats.estimatedTokens).toBe(0);
      expect(stats.averageDocLength).toBe(0);
    });
  });

  describe('Options Validation', () => {
    it('should validate valid options', () => {
      const result = injector.validateOptions({
        maxTokens: 2000,
        format: 'markdown'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject maxTokens below minimum', () => {
      const result = injector.validateOptions({
        maxTokens: 50
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxTokens must be at least 100');
    });

    it('should reject invalid format', () => {
      const result = injector.validateOptions({
        format: 'invalid' as any
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('format must be one of: markdown, json, plain');
    });

    it('should validate multiple errors', () => {
      const result = injector.validateOptions({
        maxTokens: 50,
        format: 'invalid' as any
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete injection workflow', () => {
      const userPrompt = 'What are the principles of Ubuntu?';
      const options: ContextInjectionOptions = {
        maxTokens: 2000,
        format: 'markdown',
        includeMetadata: true
      };

      const result = injector.injectContext(userPrompt, mockDocuments, options);

      expect(result.prompt).toBeTruthy();
      expect(result.contextLength).toBeGreaterThan(0);
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.documentsIncluded).toBe(3);
      expect(result.truncated).toBe(false);
    });

    it('should handle truncation in injection', () => {
      const userPrompt = 'What are the principles of Ubuntu?';
      const options: ContextInjectionOptions = {
        maxTokens: 100,
        format: 'markdown',
        includeMetadata: true
      };

      const result = injector.injectContext(userPrompt, mockDocuments, options);

      expect(result.truncated).toBe(true);
      expect(result.prompt).toContain('[Context truncated');
    });

    it('should handle different formats in injection', () => {
      const userPrompt = 'Test prompt';

      const markdownResult = injector.injectContext(userPrompt, mockDocuments, {
        format: 'markdown'
      });

      const jsonResult = injector.injectContext(userPrompt, mockDocuments, {
        format: 'json'
      });

      const plainResult = injector.injectContext(userPrompt, mockDocuments, {
        format: 'plain'
      });

      expect(markdownResult.prompt).toContain('## Context');
      expect(jsonResult.prompt).toContain('"context"');
      expect(plainResult.prompt).toContain('CONTEXT:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle documents with missing optional fields', () => {
      const minimalDocs: Document[] = [
        {
          id: 'doc-1',
          content: 'Test content',
          metadata: {
            source: 'internal',
            category: 'test',
            timestamp: new Date(),
            tags: []
          }
        }
      ];

      const result = injector.injectContext('Test prompt', minimalDocs);
      expect(result.prompt).toContain('Test content');
    });

    it('should handle very long document content', () => {
      const longDoc: Document = {
        id: 'long-doc',
        content: 'A'.repeat(5000),
        metadata: {
          source: 'internal',
          category: 'test',
          timestamp: new Date(),
          tags: []
        }
      };

      const result = injector.injectContext('Test prompt', [longDoc], {
        maxTokens: 500
      });

      expect(result.truncated).toBe(true);
    });

    it('should handle documents with special characters', () => {
      const specialDoc: Document = {
        id: 'special-doc',
        content: 'Content with special chars: @#$%^&*()[]{}',
        metadata: {
          source: 'internal',
          category: 'test',
          timestamp: new Date(),
          tags: []
        }
      };

      const result = injector.injectContext('Test prompt', [specialDoc]);
      expect(result.prompt).toContain('@#$%^&*()[]{}');
    });

    it('should handle documents with unicode characters', () => {
      const unicodeDoc: Document = {
        id: 'unicode-doc',
        content: 'Content with unicode: 你好世界 🌍 مرحبا',
        metadata: {
          source: 'internal',
          category: 'test',
          timestamp: new Date(),
          tags: []
        }
      };

      const result = injector.injectContext('Test prompt', [unicodeDoc]);
      expect(result.prompt).toContain('你好世界');
      expect(result.prompt).toContain('مرحبا');
    });
  });
});
