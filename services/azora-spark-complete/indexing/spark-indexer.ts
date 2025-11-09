/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK INDEXER - Codebase indexing engine
*/

import type { RepositoryIndex, FileIndex } from '../core/spark-service'

/**
 * 📚 SPARK INDEXER
 * 
 * Indexes codebases for fast search and completion
 * 
 * @ubuntu Individual indexing → Collective knowledge access
 */
export class SparkIndexer {
  private initialized: boolean = false

  /**
   * Initialize indexer
   */
  async initialize(): Promise<void> {
    this.initialized = true
    console.log('✅ Spark Indexer initialized')
  }

  /**
   * Index repository
   */
  async indexRepository(
    repositoryId: string,
    files: Array<{ path: string; content: string; language?: string }>
  ): Promise<RepositoryIndex> {
    const fileMap = new Map<string, FileIndex>()
    const languageStats = new Map<string, number>()

    for (const file of files) {
      const language = file.language || this.detectLanguage(file.path)
      const tokens = this.tokenize(file.content, language)
      
      const fileIndex: FileIndex = {
        path: file.path,
        content: file.content,
        language,
        tokens,
        metadata: {
          lines: file.content.split('\n').length,
          size: file.content.length,
          lastModified: new Date(),
        },
      }

      fileMap.set(file.path, fileIndex)

      // Update language stats
      languageStats.set(language, (languageStats.get(language) || 0) + 1)
    }

    const index: RepositoryIndex = {
      repositoryId,
      files: fileMap,
      fileCount: files.length,
      indexedAt: new Date(),
      languageStats,
    }

    return index
  }

  /**
   * Detect language from file path
   */
  private detectLanguage(path: string): string {
    const ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase()
    
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'bash',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sql': 'sql',
    }

    return languageMap[ext] || 'text'
  }

  /**
   * Tokenize content
   */
  private tokenize(content: string, language: string): string[] {
    // Simple tokenization (in production would use proper parsers)
    const tokens: string[] = []

    // Extract identifiers, keywords, strings
    const identifierRegex = /[a-zA-Z_$][a-zA-Z0-9_$]*/g
    const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g
    const numberRegex = /\d+/g

    const identifiers = content.match(identifierRegex) || []
    const strings = content.match(stringRegex) || []
    const numbers = content.match(numberRegex) || []

    tokens.push(...identifiers)
    tokens.push(...strings)
    tokens.push(...numbers)

    // Remove duplicates and normalize
    return [...new Set(tokens.map(t => t.toLowerCase()))]
  }
}
