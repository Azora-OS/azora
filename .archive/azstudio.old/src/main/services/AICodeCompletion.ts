/**
 * AI Code Completion Service
 * Enhanced with Cursor-inspired features + AzStudio's multi-agent architecture
 */

import { EventEmitter } from 'events';
import { AIOrchestrator } from './AIOrchestrator';
import { ProjectIndexer } from './ProjectIndexer';
import { ContextManager } from './ContextManager';

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText: string;
  range?: Range;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  additionalTextEdits?: TextEdit[];
  command?: Command;
  agent?: string;
  confidence?: number;
}

export interface TextEdit {
  range: Range;
  newText: string;
}

export interface Command {
  title: string;
  command: string;
  arguments?: any[];
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

export interface CompletionContext {
  triggerKind: CompletionTriggerKind;
  triggerCharacter?: string;
  project?: any;
  file?: string;
  language?: string;
}

export enum CompletionTriggerKind {
  Invoked = 1,
  TriggerCharacter = 2,
  TriggerForIncompleteCompletions = 3
}

export interface TextDocument {
  uri: string;
  languageId: string;
  version: number;
  getText(): string;
  getWordRangeAtPosition(position: Position): Range | undefined;
  lineAt(line: number): TextLine;
}

export interface TextLine {
  lineNumber: number;
  text: string;
  range: Range;
  rangeIncludingLineBreak: Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;
}

export class AICodeCompletion extends EventEmitter {
  private aiOrchestrator: AIOrchestrator;
  private projectIndexer: ProjectIndexer;
  private contextManager: ContextManager;
  private completionCache: Map<string, CompletionItem[]> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    super();
    this.aiOrchestrator = new AIOrchestrator();
    this.projectIndexer = new ProjectIndexer();
    this.contextManager = new ContextManager();
  }

  /**
   * Get AI-powered code completions
   */
  async getCompletions(
    document: TextDocument,
    position: Position,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(document, position, context);
      
      // Check cache first
      if (this.completionCache.has(cacheKey)) {
        return this.completionCache.get(cacheKey)!;
      }

      // Get project context
      const projectContext = await this.getProjectContext(document.uri);
      
      // Get current line and surrounding context
      const lineContext = this.getLineContext(document, position);
      
      // Multi-agent completion generation
      const completions = await this.generateMultiAgentCompletions({
        document,
        position,
        context: { ...context, project: projectContext },
        lineContext
      });

      // Rank and filter completions
      const rankedCompletions = this.rankCompletions(completions, lineContext);
      
      // Cache results
      this.completionCache.set(cacheKey, rankedCompletions);
      
      // Emit completion event
      this.emit('completions-generated', {
        document: document.uri,
        position,
        completions: rankedCompletions
      });

      return rankedCompletions;
    } catch (error) {
      console.error('Error generating completions:', error);
      return [];
    }
  }

  /**
   * Generate completions using multiple AI agents
   */
  private async generateMultiAgentCompletions(params: {
    document: TextDocument;
    position: Position;
    context: CompletionContext;
    lineContext: any;
  }): Promise<CompletionItem[]> {
    const { document, position, context, lineContext } = params;
    
    // Define agents for different completion types
    const agents = [
      {
        id: 'azora-code',
        focus: 'general-coding',
        weight: 1.0
      },
      {
        id: 'design-assistant',
        focus: 'ui-components',
        weight: 0.8
      },
      {
        id: 'debug-agent',
        focus: 'error-handling',
        weight: 0.6
      }
    ];

    // Generate completions from each agent
    const agentCompletions = await Promise.all(
      agents.map(async (agent) => {
        try {
          const completions = await this.aiOrchestrator.getCompletions(agent.id, {
            document: document.getText(),
            position,
            context,
            lineContext,
            focus: agent.focus
          });

          return completions.map((completion: any) => ({
            ...completion,
            agent: agent.id,
            confidence: (completion.confidence || 0.5) * agent.weight
          }));
        } catch (error) {
          console.error(`Error from agent ${agent.id}:`, error);
          return [];
        }
      })
    );

    // Flatten and merge completions
    const allCompletions = agentCompletions.flat();
    
    // Remove duplicates and merge similar completions
    return this.mergeSimilarCompletions(allCompletions);
  }

  /**
   * Get project context for completions
   */
  private async getProjectContext(uri: string): Promise<any> {
    try {
      const projectGraph = this.projectIndexer.getProjectGraph();
      if (!projectGraph) {
        return null;
      }

      // Get relevant symbols and imports
      const fileNode = projectGraph.files.get(uri);
      if (!fileNode) {
        return null;
      }

      return {
        symbols: fileNode.symbols,
        imports: fileNode.imports,
        exports: fileNode.exports,
        dependencies: Array.from(projectGraph.files.keys())
          .filter(path => fileNode.imports.some(imp => path.includes(imp.source)))
      };
    } catch (error) {
      console.error('Error getting project context:', error);
      return null;
    }
  }

  /**
   * Get line context for better completions
   */
  private getLineContext(document: TextDocument, position: Position): any {
    const currentLine = document.lineAt(position.line);
    const textBeforeCursor = currentLine.text.substring(0, position.character);
    const textAfterCursor = currentLine.text.substring(position.character);
    
    // Get surrounding lines for context
    const contextLines: string[] = [];
    const startLine = Math.max(0, position.line - 5);
    const endLine = Math.min(document.lineAt(document.getText().split('\n').length - 1).lineNumber, position.line + 5);
    
    for (let i = startLine; i <= endLine; i++) {
      if (i < document.getText().split('\n').length) {
        contextLines.push(document.lineAt(i).text);
      }
    }

    return {
      currentLine: currentLine.text,
      textBeforeCursor,
      textAfterCursor,
      contextLines,
      indentation: this.getIndentation(currentLine.text),
      isInFunction: this.isInFunction(contextLines, position.line - startLine),
      isInClass: this.isInClass(contextLines, position.line - startLine),
      isInComment: this.isInComment(textBeforeCursor),
      isInString: this.isInString(textBeforeCursor)
    };
  }

  /**
   * Rank completions based on relevance and confidence
   */
  private rankCompletions(completions: CompletionItem[], lineContext: any): CompletionItem[] {
    return completions
      .map(completion => ({
        ...completion,
        score: this.calculateCompletionScore(completion, lineContext)
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 50) // Limit to top 50 completions
      .map(({ score, ...completion }) => completion);
  }

  /**
   * Calculate completion score for ranking
   */
  private calculateCompletionScore(completion: CompletionItem, lineContext: any): number {
    let score = completion.confidence || 0.5;

    // Boost score based on context relevance
    if (lineContext.isInFunction && completion.kind === CompletionItemKind.Method) {
      score += 0.2;
    }
    
    if (lineContext.isInClass && completion.kind === CompletionItemKind.Property) {
      score += 0.2;
    }

    // Boost score for exact prefix matches
    const prefix = lineContext.textBeforeCursor.split(/\s+/).pop() || '';
    if (completion.label.toLowerCase().startsWith(prefix.toLowerCase())) {
      score += 0.3;
    }

    // Boost score for popular completions
    if (completion.preselect) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Merge similar completions from different agents
   */
  private mergeSimilarCompletions(completions: CompletionItem[]): CompletionItem[] {
    const merged = new Map<string, CompletionItem>();

    for (const completion of completions) {
      const key = `${completion.label}-${completion.kind}`;
      
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        // Keep the one with higher confidence
        if ((completion.confidence || 0) > (existing.confidence || 0)) {
          merged.set(key, completion);
        }
      } else {
        merged.set(key, completion);
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Generate cache key for completions
   */
  private generateCacheKey(
    document: TextDocument,
    position: Position,
    context: CompletionContext
  ): string {
    const line = document.lineAt(position.line).text;
    const prefix = line.substring(0, position.character);
    return `${document.uri}-${position.line}-${prefix}-${context.triggerKind}`;
  }

  /**
   * Utility methods for context analysis
   */
  private getIndentation(line: string): string {
    const match = line.match(/^(\s*)/);
    return match ? match[1] : '';
  }

  private isInFunction(lines: string[], currentIndex: number): boolean {
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('function ') || line.includes('=>') || line.includes('def ')) {
        return true;
      }
      if (line.includes('}') || line.includes('class ')) {
        break;
      }
    }
    return false;
  }

  private isInClass(lines: string[], currentIndex: number): boolean {
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('class ')) {
        return true;
      }
    }
    return false;
  }

  private isInComment(text: string): boolean {
    return text.includes('//') || text.includes('/*') || text.includes('#');
  }

  private isInString(text: string): boolean {
    const singleQuotes = (text.match(/'/g) || []).length;
    const doubleQuotes = (text.match(/"/g) || []).length;
    const backticks = (text.match(/`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }

  /**
   * Clear completion cache
   */
  clearCache(): void {
    this.completionCache.clear();
  }

  /**
   * Enable/disable completions
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get completion statistics
   */
  getStatistics(): any {
    return {
      cacheSize: this.completionCache.size,
      isEnabled: this.isEnabled,
      totalCompletions: Array.from(this.completionCache.values())
        .reduce((sum, completions) => sum + completions.length, 0)
    };
  }
}

export default AICodeCompletion;