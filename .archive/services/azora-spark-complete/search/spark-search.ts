/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK SEARCH - Codebase search engine (like GitHub Spark)
*/

// Elara integration - will be implemented based on actual Elara API
// import { elara } from '../../../core/system-core/agent-tools/elara-core'
import type { RepositoryIndex, SearchOptions, SearchResult } from '../core/spark-service'

/**
 * 🔍 SPARK SEARCH
 * 
 * Codebase search engine - GitHub Spark alternative
 * Uses semantic search with Elara AI
 * 
 * @ubuntu Individual search → Collective knowledge discovery
 */
export class SparkSearch {
  private initialized: boolean = false

  /**
   * Initialize search
   */
  async initialize(): Promise<void> {
    this.initialized = true
    console.log('✅ Spark Search initialized')
  }

  /**
   * Search codebase
   */
  async search(
    query: string,
    repositoryIndex: RepositoryIndex,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    // Understand query intent with Elara
    const intent = await this.understandQuery(query)

    // Search files
    const results: SearchResult[] = []

    for (const [path, fileIndex] of repositoryIndex.files.entries()) {
      // Apply filters
      if (options?.language && fileIndex.language !== options.language) {
        continue
      }

      // Calculate relevance
      const relevance = await this.calculateRelevance(
        query,
        intent,
        fileIndex,
        path
      )

      if (relevance > (options?.threshold || 0.3)) {
        // Find matching lines
        const matchingLines = this.findMatchingLines(
          query,
          fileIndex.content,
          intent
        )

        for (const line of matchingLines) {
          results.push({
            file: path,
            content: line.content,
            relevance: relevance * line.matchScore,
            line: line.lineNumber,
            context: this.getContext(fileIndex.content, line.lineNumber),
          })
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    // Apply limit
    const limit = options?.limit || 20
    return results.slice(0, limit)
  }

  /**
   * Understand query intent
   */
  private async understandQuery(query: string): Promise<QueryIntent> {
    // TODO: Use Elara API for query understanding
    // For now, use simple keyword extraction
    return {
      type: 'general',
      keywords: this.extractKeywords(query),
      language: this.extractLanguage(query),
      context: query,
    }
  }

  /**
   * Calculate relevance score
   */
  private async calculateRelevance(
    query: string,
    intent: QueryIntent,
    fileIndex: FileIndex,
    path: string
  ): Promise<number> {
    let relevance = 0

    // Exact match in path
    if (path.toLowerCase().includes(query.toLowerCase())) {
      relevance += 0.5
    }

    // Keyword matching
    const queryKeywords = intent.keywords
    const contentLower = fileIndex.content.toLowerCase()
    
    for (const keyword of queryKeywords) {
      const keywordLower = keyword.toLowerCase()
      const matches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length
      relevance += Math.min(matches * 0.1, 0.3)
    }

    // Language matching
    if (intent.language && fileIndex.language === intent.language) {
      relevance += 0.2
    }

    // Semantic similarity (simplified)
    const semanticScore = this.calculateSemanticSimilarity(
      query,
      fileIndex.content
    )
    relevance += semanticScore * 0.3

    return Math.min(relevance, 1.0)
  }

  /**
   * Find matching lines
   */
  private findMatchingLines(
    query: string,
    content: string,
    intent: QueryIntent
  ): Array<{ lineNumber: number; content: string; matchScore: number }> {
    const lines = content.split('\n')
    const matches: Array<{ lineNumber: number; content: string; matchScore: number }> = []
    const queryLower = query.toLowerCase()
    const keywords = intent.keywords.map(k => k.toLowerCase())

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineLower = line.toLowerCase()
      
      let matchScore = 0

      // Exact query match
      if (lineLower.includes(queryLower)) {
        matchScore += 0.8
      }

      // Keyword matches
      for (const keyword of keywords) {
        if (lineLower.includes(keyword)) {
          matchScore += 0.2
        }
      }

      if (matchScore > 0) {
        matches.push({
          lineNumber: i + 1,
          content: line.trim(),
          matchScore: Math.min(matchScore, 1.0),
        })
      }
    }

    return matches
  }

  /**
   * Get context around line
   */
  private getContext(content: string, lineNumber: number, contextLines: number = 3): string {
    const lines = content.split('\n')
    const start = Math.max(0, lineNumber - contextLines - 1)
    const end = Math.min(lines.length, lineNumber + contextLines)
    
    return lines.slice(start, end).join('\n')
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why']
    
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
    
    return words
  }

  /**
   * Extract language from query
   */
  private extractLanguage(query: string): string | undefined {
    const languages = ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'cpp', 'c', 'ruby', 'php']
    const queryLower = query.toLowerCase()
    
    for (const lang of languages) {
      if (queryLower.includes(lang)) {
        return lang
      }
    }
    
    return undefined
  }

  /**
   * Calculate semantic similarity (simplified)
   */
  private calculateSemanticSimilarity(query: string, content: string): number {
    // Simple token-based similarity
    const queryTokens = new Set(query.toLowerCase().split(/\s+/))
    const contentTokens = new Set(content.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...queryTokens].filter(x => contentTokens.has(x)))
    const union = new Set([...queryTokens, ...contentTokens])
    
    return intersection.size / union.size
  }
}

// Types
interface QueryIntent {
  type: 'function' | 'class' | 'variable' | 'concept' | 'general'
  keywords: string[]
  language?: string
  context: string
}

interface FileIndex {
  path: string
  content: string
  language: string
  tokens: string[]
  embeddings?: number[]
  metadata: {
    lines: number
    size: number
    lastModified: Date
  }
}
