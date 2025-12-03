/**
 * Ai code completion moved from the Electron `azstudio` repo.
 * NOTE: Platform-specific APIs (fs, Node/Electron) must be adapted to the Workbench
 * environment. This file is copied as a migration sample.
 */

import { EventEmitter } from 'events';
import { AIOrchestrator } from './AIOrchestrator';
import { ProjectIndexer } from './ProjectIndexer';
import { ContextManager } from './ContextManager';
import { isPremiumEntitled } from '../browser/premiumGate';

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

  async getCompletions(
    document: TextDocument,
    position: Position,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    if (!this.isEnabled) {
      return [];
    }

    // Check if AzStudio is entitled for premium features
    const premium = await isPremiumEntitled();
    if (!premium) {
      // For non-premium users, return an empty set or a limited placeholder
      return [];
    }

    try {
      const cacheKey = this.generateCacheKey(document, position, context);

      if (this.completionCache.has(cacheKey)) {
        return this.completionCache.get(cacheKey)!;
      }

      const projectContext = await this.getProjectContext(document.uri);
      const lineContext = this.getLineContext(document, position);

      const completions = await this.generateMultiAgentCompletions({
        document,
        position,
        context: { ...context, project: projectContext },
        lineContext
      });

      const rankedCompletions = this.rankCompletions(completions, lineContext);
      this.completionCache.set(cacheKey, rankedCompletions);

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

  private async generateMultiAgentCompletions(params: {
    document: TextDocument;
    position: Position;
    context: CompletionContext;
    lineContext: any;
  }): Promise<CompletionItem[]> {
    const { document, position, context, lineContext } = params;
    const agents = [
      { id: 'azora-code', focus: 'general-coding', weight: 1.0 },
      { id: 'design-assistant', focus: 'ui-components', weight: 0.8 },
      { id: 'debug-agent', focus: 'error-handling', weight: 0.6 }
    ];

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

    const allCompletions = agentCompletions.flat();
    return this.mergeSimilarCompletions(allCompletions);
  }

  private async getProjectContext(uri: string): Promise<any> {
    try {
      const projectGraph = this.projectIndexer.getProjectGraph();
      if (!projectGraph) {
        return null;
      }

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

  private getLineContext(document: TextDocument, position: Position): any {
    const currentLine = document.lineAt(position.line);
    const textBeforeCursor = currentLine.text.substring(0, position.character);
    const textAfterCursor = currentLine.text.substring(position.character);

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

  private rankCompletions(completions: CompletionItem[], lineContext: any): CompletionItem[] {
    return completions
      .map(completion => ({ ...completion, score: this.calculateCompletionScore(completion, lineContext) }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 50)
      .map(({ score, ...completion }) => completion);
  }

  private calculateCompletionScore(completion: CompletionItem, lineContext: any): number {
    let score = completion.confidence || 0.5;
    if (lineContext.isInFunction && completion.kind === CompletionItemKind.Method) { score += 0.2; }
    if (lineContext.isInClass && completion.kind === CompletionItemKind.Property) { score += 0.2; }
    const prefix = lineContext.textBeforeCursor.split(/\s+/).pop() || '';
    if (completion.label.toLowerCase().startsWith(prefix.toLowerCase())) { score += 0.3; }
    if (completion.preselect) { score += 0.1; }
    return Math.min(1.0, score);
  }

  private mergeSimilarCompletions(completions: CompletionItem[]): CompletionItem[] {
    const merged = new Map<string, CompletionItem>();
    for (const completion of completions) {
      const key = `${completion.label}-${completion.kind}`;
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        if ((completion.confidence || 0) > (existing.confidence || 0)) {
          merged.set(key, completion);
        }
      } else {
        merged.set(key, completion);
      }
    }
    return Array.from(merged.values());
  }

  private generateCacheKey(document: TextDocument, position: Position, context: CompletionContext): string {
    const line = document.lineAt(position.line).text;
    const prefix = line.substring(0, position.character);
    return `${document.uri}-${position.line}-${prefix}-${context.triggerKind}`;
  }

  private getIndentation(line: string): string {
    const match = line.match(/^(\s*)/);
    return match ? match[1] : '';
  }

  private isInFunction(lines: string[], currentIndex: number): boolean {
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('function ') || line.includes('=>') || line.includes('def ')) { return true; }
      if (line.includes('}') || line.includes('class ')) { break; }
    }
    return false;
  }

  private isInClass(lines: string[], currentIndex: number): boolean {
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('class ')) { return true; }
    }
    return false;
  }

  private isInComment(text: string): boolean {
    return text.includes('//') || text.includes('/*') || text.includes('#');
  }

  private isInString(text: string): boolean {
    const sQuotes = (text.match(/'/g) || []).length;
    const dQuotes = (text.match(/"/g) || []).length;
    const bticks = (text.match(/`/g) || []).length;
    return (sQuotes % 2 === 1) || (dQuotes % 2 === 1) || (bticks % 2 === 1);
  }

  clearCache(): void { this.completionCache.clear(); }
  setEnabled(enabled: boolean): void { this.isEnabled = enabled; }
  getStatistics(): any { return { cacheSize: this.completionCache.size, isEnabled: this.isEnabled, totalCompletions: Array.from(this.completionCache.values()).reduce((s, c) => s + c.length, 0) }; }
}

export default AICodeCompletion;
