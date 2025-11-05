/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Elara Workspaces - Code Intelligence
 * Powered by Elara AI Constitutional Intelligence
 * 
 * Advanced AI-powered code analysis with:
 * - Constitutional AI compliance checking
 * - Security vulnerability detection
 * - Intelligent autocomplete and refactoring
 * - Azora-specific code patterns and snippets
 */

class CodeIntelligence {
  constructor() {
    this.codebase = new Map()
    this.symbols = new Map()
    this.dependencies = new Map()
    this.patterns = new Map()
    this.suggestions = []
    this.constitutionalRules = this.loadConstitutionalRules()
  }

  /**
   * Load Constitutional coding rules
   */
  loadConstitutionalRules() {
    return {
      licensing: {
        required: 'AZORA PROPRIETARY LICENSE',
        copyright: '© 2025 Azora ES (Pty) Ltd',
        enforcement: 'all-files',
      },
      security: {
        noHardcodedSecrets: true,
        encryptSensitiveData: true,
        zeroTrustArchitecture: true,
      },
      performance: {
        maxBundleSize: '100KB',
        minLighthouseScore: 90,
        adaptiveLoading: true,
      },
      accessibility: {
        wcagLevel: 'AA',
        screenReaderSupport: true,
        keyboardNavigation: true,
      },
      economics: {
        studentRewards: true,
        transparentFlows: true,
        uboFundIntegrity: true,
      },
    }
  }

  /**
   * Analyze codebase
   */
  async analyzeCodebase(rootPath) {
    console.log('🔍 Analyzing codebase...')

    const files = await this.scanDirectory(rootPath)
    
    for (const file of files) {
      if (this.isCodeFile(file)) {
        await this.analyzeFile(file)
      }
    }

    await this.buildDependencyGraph()
    await this.detectPatterns()
    await this.findOptimizations()

    console.log('✅ Analysis complete')
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(path) {
    // In production, use fs.readdir recursively
    // Mock implementation
    return [
      'genome/api-client/client.js',
      'genome/hooks/useData.js',
      'ui/app/services/sapiens/page.jsx',
      'ui/app/services/mint/page.jsx',
    ]
  }

  /**
   * Check if file is code
   */
  isCodeFile(filePath) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.sol', '.rs']
    return codeExtensions.some(ext => filePath.endsWith(ext))
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    // In production, read file content
    const content = '' // await fs.readFile(filePath, 'utf8')

    const analysis = {
      filePath,
      lines: content.split('\n').length,
      functions: this.extractFunctions(content),
      classes: this.extractClasses(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      complexity: this.calculateComplexity(content),
      issues: this.findIssues(content, filePath),
      suggestions: this.generateSuggestions(content, filePath),
    }

    this.codebase.set(filePath, analysis)
    return analysis
  }

  /**
   * Extract functions from code
   */
  extractFunctions(content) {
    const functionRegex = /(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(/g
    const functions = []
    let match

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1] || match[2],
        async: match[0].includes('async'),
        line: content.substring(0, match.index).split('\n').length,
      })
    }

    return functions
  }

  /**
   * Extract classes
   */
  extractClasses(content) {
    const classRegex = /class\s+(\w+)/g
    const classes = []
    let match

    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        name: match[1],
        line: content.substring(0, match.index).split('\n').length,
      })
    }

    return classes
  }

  /**
   * Extract imports
   */
  extractImports(content) {
    const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g
    const imports = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  }

  /**
   * Extract exports
   */
  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const)\s+(\w+)/g
    const exports = []
    let match

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    return exports
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateComplexity(content) {
    let complexity = 1

    // Count decision points
    const patterns = [/if\s*\(/g, /while\s*\(/g, /for\s*\(/g, /case\s+/g, /catch\s*\(/g, /&&/g, /\|\|/g]
    
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    }

    return complexity
  }

  /**
   * Find code issues
   */
  findIssues(content, filePath) {
    const issues = []

    // Check for hardcoded secrets
    if (/api[_-]?key|secret|password|token/i.test(content) && /['"][^'"]{20,}['"]/.test(content)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: 'Potential hardcoded secret detected',
        rule: this.constitutionalRules.security.noHardcodedSecrets,
      })
    }

    // Check for missing license header
    if (!content.includes('AZORA PROPRIETARY LICENSE')) {
      issues.push({
        type: 'licensing',
        severity: 'medium',
        message: 'Missing Azora Proprietary License header',
        rule: this.constitutionalRules.licensing.required,
      })
    }

    // Check for console.log in production code
    if (content.includes('console.log') && !filePath.includes('test')) {
      issues.push({
        type: 'quality',
        severity: 'low',
        message: 'console.log statement found',
        suggestion: 'Use proper logging framework',
      })
    }

    // Check for TODO comments
    const todoMatches = content.match(/\/\/\s*TODO:/g)
    if (todoMatches) {
      issues.push({
        type: 'technical-debt',
        severity: 'low',
        message: `${todoMatches.length} TODO comment(s) found`,
        count: todoMatches.length,
      })
    }

    return issues
  }

  /**
   * Generate code suggestions
   */
  generateSuggestions(content, filePath) {
    const suggestions = []

    // Suggest async/await instead of .then()
    if (content.includes('.then(') && !content.includes('async')) {
      suggestions.push({
        type: 'modernization',
        message: 'Consider using async/await instead of .then()',
        priority: 'medium',
      })
    }

    // Suggest TypeScript
    if (filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
      suggestions.push({
        type: 'type-safety',
        message: 'Consider migrating to TypeScript for better type safety',
        priority: 'low',
      })
    }

    // Suggest performance optimization
    if (content.includes('map(') && content.includes('filter(')) {
      suggestions.push({
        type: 'performance',
        message: 'Consider combining map() and filter() operations',
        priority: 'medium',
      })
    }

    // Suggest Constitutional AI integration
    if (filePath.includes('api') && !content.includes('constitutional')) {
      suggestions.push({
        type: 'constitutional',
        message: 'Consider adding Constitutional AI compliance checks',
        priority: 'high',
      })
    }

    return suggestions
  }

  /**
   * Build dependency graph
   */
  async buildDependencyGraph() {
    for (const [filePath, analysis] of this.codebase) {
      const deps = []

      for (const importPath of analysis.imports) {
        const resolvedPath = this.resolveImport(importPath, filePath)
        if (resolvedPath) {
          deps.push(resolvedPath)
        }
      }

      this.dependencies.set(filePath, deps)
    }
  }

  /**
   * Resolve import path
   */
  resolveImport(importPath, fromFile) {
    // Simple resolution - in production, use proper module resolution
    if (importPath.startsWith('.')) {
      // Relative import
      const dir = fromFile.substring(0, fromFile.lastIndexOf('/'))
      return `${dir}/${importPath}`
    }
    return importPath
  }

  /**
   * Detect code patterns
   */
  async detectPatterns() {
    const patterns = {
      hooks: [],
      components: [],
      services: [],
      utilities: [],
    }

    for (const [filePath, analysis] of this.codebase) {
      // Detect React hooks
      if (filePath.includes('hooks') || analysis.functions.some(f => f.name.startsWith('use'))) {
        patterns.hooks.push(filePath)
      }

      // Detect components
      if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
        patterns.components.push(filePath)
      }

      // Detect services
      if (filePath.includes('service') || filePath.includes('api-client')) {
        patterns.services.push(filePath)
      }
    }

    this.patterns = patterns
  }

  /**
   * Find optimization opportunities
   */
  async findOptimizations() {
    const optimizations = []

    for (const [filePath, analysis] of this.codebase) {
      // High complexity functions
      if (analysis.complexity > 20) {
        optimizations.push({
          type: 'complexity',
          file: filePath,
          message: `High complexity (${analysis.complexity}) - consider refactoring`,
          priority: 'high',
        })
      }

      // Large files
      if (analysis.lines > 500) {
        optimizations.push({
          type: 'size',
          file: filePath,
          message: `Large file (${analysis.lines} lines) - consider splitting`,
          priority: 'medium',
        })
      }

      // Duplicate code detection (simplified)
      const duplicates = this.findDuplicates(filePath)
      if (duplicates.length > 0) {
        optimizations.push({
          type: 'duplication',
          file: filePath,
          message: `${duplicates.length} potential duplicate(s) found`,
          duplicates,
          priority: 'medium',
        })
      }
    }

    this.optimizations = optimizations
  }

  /**
   * Find duplicate code
   */
  findDuplicates(filePath) {
    // Simplified duplicate detection
    // In production, use proper AST analysis
    return []
  }

  /**
   * Get AI code completion
   */
  async getCompletion(context) {
    const { code, cursorPosition, filePath } = context

    // Extract context
    const beforeCursor = code.substring(0, cursorPosition)
    const afterCursor = code.substring(cursorPosition)

    // Analyze context
    const currentLine = beforeCursor.split('\n').pop()
    const isImport = currentLine.trim().startsWith('import')
    const isFunction = currentLine.includes('function') || currentLine.includes('const')

    // Generate suggestions based on Constitutional AI
    const suggestions = []

    if (isImport) {
      suggestions.push(...this.suggestImports(beforeCursor))
    } else if (isFunction) {
      suggestions.push(...this.suggestFunctionSignature(currentLine))
    } else {
      suggestions.push(...this.suggestCode(beforeCursor, afterCursor))
    }

    // Filter by Constitutional compliance
    return suggestions.filter(s => this.isConstitutionallyCompliant(s))
  }

  /**
   * Suggest imports
   */
  suggestImports(code) {
    const suggestions = []

    // Suggest common Azora imports
    if (!code.includes('import.*from.*api-client')) {
      suggestions.push({
        text: "import apiClient from '../api-client/client'",
        description: 'Import Azora API client',
        type: 'import',
      })
    }

    if (!code.includes('import.*useData')) {
      suggestions.push({
        text: "import { useMintData } from '../hooks/useData'",
        description: 'Import Mint data hook',
        type: 'import',
      })
    }

    return suggestions
  }

  /**
   * Suggest function signature
   */
  suggestFunctionSignature(line) {
    const suggestions = []

    if (line.includes('async')) {
      suggestions.push({
        text: 'async function fetchData() {\n  try {\n    // Implementation\n  } catch (error) {\n    console.error(error)\n  }\n}',
        description: 'Async function with error handling',
        type: 'function',
      })
    }

    return suggestions
  }

  /**
   * Suggest code
   */
  suggestCode(beforeCursor, afterCursor) {
    const suggestions = []

    // Suggest error handling
    if (beforeCursor.includes('fetch(') && !beforeCursor.includes('try')) {
      suggestions.push({
        text: 'try {\n  const response = await fetch(url)\n  const data = await response.json()\n  return data\n} catch (error) {\n  console.error("Fetch failed:", error)\n  throw error\n}',
        description: 'Add error handling for fetch',
        type: 'error-handling',
      })
    }

    // Suggest Constitutional compliance
    if (beforeCursor.includes('transaction') && !beforeCursor.includes('constitutional')) {
      suggestions.push({
        text: '// Constitutional compliance check\nif (!checkConstitutionalCompliance(transaction)) {\n  throw new Error("Transaction violates Constitutional principles")\n}',
        description: 'Add Constitutional compliance check',
        type: 'constitutional',
      })
    }

    return suggestions
  }

  /**
   * Check if suggestion is constitutionally compliant
   */
  isConstitutionallyCompliant(suggestion) {
    // Ensure suggestion doesn't violate any Constitutional rules
    
    // No hardcoded secrets
    if (/api[_-]?key|secret|password/i.test(suggestion.text)) {
      return false
    }

    // No copyright violations
    if (suggestion.text.includes('copyright') && !suggestion.text.includes('Azora')) {
      return false
    }

    return true
  }

  /**
   * Get code refactoring suggestions
   */
  async getRefactoringSuggestions(filePath) {
    const analysis = this.codebase.get(filePath)
    if (!analysis) return []

    const suggestions = []

    // Suggest extracting complex functions
    for (const func of analysis.functions) {
      if (analysis.complexity > 15) {
        suggestions.push({
          type: 'extract-function',
          target: func.name,
          message: 'Extract complex logic into separate functions',
          priority: 'high',
        })
      }
    }

    // Suggest moving to shared utilities
    if (analysis.functions.length > 10) {
      suggestions.push({
        type: 'extract-module',
        message: 'Consider extracting utilities into genome/utils',
        priority: 'medium',
      })
    }

    return suggestions
  }

  /**
   * Get security analysis
   */
  async getSecurityAnalysis(filePath) {
    const analysis = this.codebase.get(filePath)
    if (!analysis) return { score: 100, issues: [] }

    const securityIssues = analysis.issues.filter(i => i.type === 'security')
    const score = Math.max(0, 100 - (securityIssues.length * 20))

    return {
      score,
      issues: securityIssues,
      recommendations: this.getSecurityRecommendations(securityIssues),
    }
  }

  /**
   * Get security recommendations
   */
  getSecurityRecommendations(issues) {
    const recommendations = []

    if (issues.some(i => i.message.includes('secret'))) {
      recommendations.push({
        priority: 'critical',
        message: 'Use environment variables for secrets',
        code: 'const apiKey = process.env.API_KEY',
      })
    }

    if (issues.some(i => i.message.includes('SQL'))) {
      recommendations.push({
        priority: 'critical',
        message: 'Use parameterized queries to prevent SQL injection',
        code: 'const query = "SELECT * FROM users WHERE id = $1"',
      })
    }

    return recommendations
  }

  /**
   * Get codebase statistics
   */
  getStatistics() {
    const totalLines = Array.from(this.codebase.values())
      .reduce((sum, analysis) => sum + analysis.lines, 0)

    const totalFunctions = Array.from(this.codebase.values())
      .reduce((sum, analysis) => sum + analysis.functions.length, 0)

    const totalIssues = Array.from(this.codebase.values())
      .reduce((sum, analysis) => sum + analysis.issues.length, 0)

    return {
      files: this.codebase.size,
      totalLines,
      totalFunctions,
      totalIssues,
      averageComplexity: totalFunctions > 0 
        ? Array.from(this.codebase.values()).reduce((sum, a) => sum + a.complexity, 0) / totalFunctions
        : 0,
      patterns: {
        hooks: this.patterns.hooks?.length || 0,
        components: this.patterns.components?.length || 0,
        services: this.patterns.services?.length || 0,
      },
    }
  }
}

// Create singleton
const codeIntelligence = new CodeIntelligence()

export default codeIntelligence
