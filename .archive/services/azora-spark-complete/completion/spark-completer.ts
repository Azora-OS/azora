/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK COMPLETER - Code completion engine (like GitHub Copilot)
*/

// Elara integration - will be implemented based on actual Elara API
// import { elara } from '../../../core/system-core/agent-tools/elara-core'
import type { RepositoryIndex, CompletionContext, CompletionResult } from '../core/spark-service'

/**
 * ✨ SPARK COMPLETER
 * 
 * Code completion engine - GitHub Copilot alternative
 * Uses Elara AI for intelligent code completion
 * 
 * @ubuntu Individual completion → Collective code quality
 */
export class SparkCompleter {
  private initialized: boolean = false
  private completionCache: Map<string, CompletionResult> = new Map()

  /**
   * Initialize completer
   */
  async initialize(): Promise<void> {
    this.initialized = true
    console.log('✅ Spark Completer initialized')
  }

  /**
   * Get code completion
   */
  async complete(
    code: string,
    cursorPosition: { line: number; column: number },
    context: CompletionContext & { repositoryIndex?: RepositoryIndex; filePath?: string }
  ): Promise<CompletionResult> {
    // Check cache
    const cacheKey = this.getCacheKey(code, cursorPosition)
    if (this.completionCache.has(cacheKey)) {
      return this.completionCache.get(cacheKey)!
    }

    // Get context from repository
    const repositoryContext = await this.getRepositoryContext(
      context.repositoryIndex,
      context.filePath
    )

    // Build completion prompt
    const prompt = this.buildCompletionPrompt(
      code,
      cursorPosition,
      repositoryContext,
      context
    )

    // TODO: Get completion from Elara API
    // For now, generate a simple completion based on context
    // In production, this would call Elara's completion API
    const mockResponse = {
      response: this.generateMockCompletion(code, cursorPosition, repositoryContext, context)
    }
    
    // Parse completion
    const completion = this.parseCompletion(mockResponse.response, code, cursorPosition)

    // Generate alternatives
    const alternatives = await this.generateAlternatives(completion, code, context)

    const result: CompletionResult = {
      completion: completion.text,
      alternatives: alternatives,
      confidence: completion.confidence,
      explanation: completion.explanation,
    }

    // Cache result
    this.completionCache.set(cacheKey, result)

    return result
  }

  /**
   * Get repository context for completion
   */
  private async getRepositoryContext(
    repositoryIndex?: RepositoryIndex,
    filePath?: string
  ): Promise<string> {
    if (!repositoryIndex || !filePath) return ''

    // Get related files
    const relatedFiles = this.findRelatedFiles(repositoryIndex, filePath)
    
    // Build context string
    let context = 'Repository context:\n'
    for (const file of relatedFiles.slice(0, 5)) {
      context += `\nFile: ${file.path}\n`
      context += `Language: ${file.language}\n`
      context += `Content preview:\n${file.content.substring(0, 500)}\n`
    }

    return context
  }

  /**
   * Find related files
   */
  private findRelatedFiles(
    repositoryIndex: RepositoryIndex,
    filePath: string
  ): Array<{ path: string; content: string; language: string }> {
    const files: Array<{ path: string; content: string; language: string }> = []
    
    // Get files in same directory
    const directory = filePath.substring(0, filePath.lastIndexOf('/'))
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
    
    for (const [path, fileIndex] of repositoryIndex.files.entries()) {
      if (path.startsWith(directory) && path !== filePath) {
        files.push({
          path,
          content: fileIndex.content,
          language: fileIndex.language,
        })
      }
    }

    // Sort by relevance (same directory first, then by name similarity)
    files.sort((a, b) => {
      const aDir = a.path.substring(0, a.path.lastIndexOf('/'))
      const bDir = b.path.substring(0, b.path.lastIndexOf('/'))
      
      if (aDir === directory && bDir !== directory) return -1
      if (aDir !== directory && bDir === directory) return 1
      
      // Name similarity
      const aName = a.path.substring(a.path.lastIndexOf('/') + 1)
      const bName = b.path.substring(b.path.lastIndexOf('/') + 1)
      const aSimilarity = this.stringSimilarity(aName, fileName)
      const bSimilarity = this.stringSimilarity(bName, fileName)
      
      return bSimilarity - aSimilarity
    })

    return files.slice(0, 10) // Top 10 related files
  }

  /**
   * Build completion prompt
   */
  private buildCompletionPrompt(
    code: string,
    cursorPosition: { line: number; column: number },
    repositoryContext: string,
    context: CompletionContext
  ): string {
    const lines = code.split('\n')
    const currentLine = lines[cursorPosition.line] || ''
    const beforeCursor = currentLine.substring(0, cursorPosition.column)
    const afterCursor = currentLine.substring(cursorPosition.column)
    
    const beforeLines = lines.slice(Math.max(0, cursorPosition.line - 10), cursorPosition.line)
    const afterLines = lines.slice(cursorPosition.line + 1, cursorPosition.line + 5)

    return `Complete the code at the cursor position.

Current file context:
${beforeLines.join('\n')}
${beforeCursor}█${afterCursor}
${afterLines.join('\n')}

${repositoryContext}

${context.imports ? `Imports: ${context.imports.join(', ')}\n` : ''}
${context.framework ? `Framework: ${context.framework}\n` : ''}
${context.projectType ? `Project Type: ${context.projectType}\n` : ''}

Provide a code completion that:
1. Matches the existing code style
2. Uses the correct imports and dependencies
3. Follows best practices
4. Is contextually appropriate
5. Is concise and efficient

Return only the completion text, no explanations.`
  }

  /**
   * Parse completion from Elara response
   */
  private parseCompletion(
    response: string,
    code: string,
    cursorPosition: { line: number; column: number }
  ): { text: string; confidence: number; explanation?: string } {
    // Extract completion (first code block or first line)
    let completion = response.trim()
    
    // Remove markdown code blocks
    if (completion.startsWith('```')) {
      const lines = completion.split('\n')
      const startIndex = lines.findIndex(l => l.startsWith('```'))
      const endIndex = lines.findIndex((l, i) => i > startIndex && l.startsWith('```'))
      if (endIndex > startIndex) {
        completion = lines.slice(startIndex + 1, endIndex).join('\n')
      }
    }

    // Extract first meaningful line or block
    const lines = completion.split('\n')
    completion = lines[0] || completion

    // Calculate confidence based on response quality
    const confidence = this.calculateConfidence(completion, code)

    return {
      text: completion,
      confidence,
      explanation: response.length > completion.length ? response : undefined,
    }
  }

  /**
   * Generate alternative completions
   */
  private async generateAlternatives(
    completion: { text: string; confidence: number },
    code: string,
    context: CompletionContext
  ): Promise<string[]> {
    const alternatives: string[] = []

    // Generate variations
    for (let i = 0; i < 2; i++) {
      const variation = await this.generateVariation(completion.text, code, context)
      if (variation && variation !== completion.text) {
        alternatives.push(variation)
      }
    }

    return alternatives
  }

  /**
   * Generate variation
   */
  private async generateVariation(
    original: string,
    code: string,
    context: CompletionContext
  ): Promise<string> {
    // TODO: Generate variation using Elara API
    // For now, return a simple variation
    return original.replace(/function/g, 'const').replace(/=/g, '=>')
  }

  /**
   * Generate mock completion (temporary until Elara integration)
   */
  private generateMockCompletion(
    code: string,
    cursorPosition: { line: number; column: number },
    repositoryContext: string,
    context: CompletionContext
  ): string {
    const lines = code.split('\n')
    const currentLine = lines[cursorPosition.line] || ''
    const beforeCursor = currentLine.substring(0, cursorPosition.column)
    
    // Simple heuristics for mock completion
    if (beforeCursor.trim().endsWith('function')) {
      return '() {'
    }
    if (beforeCursor.trim().endsWith('if')) {
      return ' (true) {'
    }
    if (beforeCursor.trim().endsWith('for')) {
      return ' (let i = 0; i < length; i++) {'
    }
    
    return '// TODO: Implement'
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(completion: string, code: string): number {
    let confidence = 0.7 // Base confidence

    // Check if completion matches code style
    if (this.matchesCodeStyle(completion, code)) {
      confidence += 0.1
    }

    // Check if completion is syntactically valid
    if (this.isSyntacticallyValid(completion)) {
      confidence += 0.1
    }

    // Check completion length (not too short, not too long)
    if (completion.length > 10 && completion.length < 200) {
      confidence += 0.1
    }

    return Math.min(confidence, 0.95)
  }

  /**
   * Check if completion matches code style
   */
  private matchesCodeStyle(completion: string, code: string): boolean {
    // Simple heuristic: check indentation and common patterns
    const codeIndent = code.match(/^(\s*)/)?.[1] || ''
    const completionIndent = completion.match(/^(\s*)/)?.[1] || ''
    
    return codeIndent.length === completionIndent.length || 
           completionIndent.length === 0
  }

  /**
   * Check if completion is syntactically valid
   */
  private isSyntacticallyValid(completion: string): boolean {
    // Simple validation: check for balanced brackets
    const open = (completion.match(/[({[]/g) || []).length
    const close = (completion.match(/[)}\]]/g) || []).length
    
    return Math.abs(open - close) <= 1
  }

  /**
   * Get cache key
   */
  private getCacheKey(code: string, cursorPosition: { line: number; column: number }): string {
    const context = code.substring(Math.max(0, code.length - 200))
    return `${context}:${cursorPosition.line}:${cursorPosition.column}`
  }

  /**
   * String similarity (Levenshtein-like)
   */
  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}
