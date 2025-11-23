/**
 * Selective Testing Utilities
 * 
 * Implements smart test selection based on code changes,
 * test dependencies, and impact analysis to run only affected tests.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, relative, sep } from 'path';
import { glob } from 'glob';

export interface TestDependency {
  testFile: string;
  sourceFiles: string[];
  dependencies: string[];
}

export interface TestImpactAnalysis {
  changedFiles: string[];
  affectedTests: string[];
  reason: Map<string, string[]>;
  estimatedTime: number;
}

export interface SelectiveTestConfig {
  baseBranch?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  alwaysRun?: string[];
}

/**
 * Get changed files from git
 */
export function getChangedFiles(baseBranch: string = 'main'): string[] {
  try {
    // Try to get changed files compared to base branch
    const output = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    
    return output
      .split('\n')
      .filter(Boolean)
      .map(file => file.trim());
  } catch (error) {
    // Fallback to uncommitted changes
    try {
      const output = execSync('git diff --name-only HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      
      return output
        .split('\n')
        .filter(Boolean)
        .map(file => file.trim());
    } catch {
      // If git fails, return empty array
      return [];
    }
  }
}

/**
 * Map test files to their source dependencies
 */
export function buildTestDependencyMap(rootDir: string = process.cwd()): Map<string, TestDependency> {
  const dependencyMap = new Map<string, TestDependency>();
  
  // Find all test files
  const testFiles = glob.sync('**/*.test.{ts,js}', {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
    absolute: true,
  });
  
  for (const testFile of testFiles) {
    const dependencies = extractImports(testFile, rootDir);
    const sourceFiles = dependencies.filter(dep => !dep.includes('.test.'));
    
    dependencyMap.set(testFile, {
      testFile: relative(rootDir, testFile),
      sourceFiles: sourceFiles.map(f => relative(rootDir, f)),
      dependencies: dependencies.map(f => relative(rootDir, f)),
    });
  }
  
  return dependencyMap;
}

/**
 * Extract import statements from a file
 */
function extractImports(filePath: string, rootDir: string): string[] {
  if (!existsSync(filePath)) return [];
  
  const content = readFileSync(filePath, 'utf-8');
  const imports: string[] = [];
  
  // Match ES6 imports and require statements
  const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip node_modules
    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      const resolvedPath = resolveImportPath(importPath, filePath, rootDir);
      if (resolvedPath) {
        imports.push(resolvedPath);
      }
    }
  }
  
  return imports;
}

/**
 * Resolve import path to absolute file path
 */
function resolveImportPath(importPath: string, fromFile: string, rootDir: string): string | null {
  let resolvedPath: string;
  
  // Handle path aliases
  if (importPath.startsWith('@/')) {
    resolvedPath = join(rootDir, importPath.slice(2));
  } else if (importPath.startsWith('@services/')) {
    resolvedPath = join(rootDir, 'services', importPath.slice(10));
  } else if (importPath.startsWith('@packages/')) {
    resolvedPath = join(rootDir, 'packages', importPath.slice(10));
  } else if (importPath.startsWith('@tests/')) {
    resolvedPath = join(rootDir, 'tests', importPath.slice(7));
  } else if (importPath.startsWith('.')) {
    resolvedPath = join(fromFile, '..', importPath);
  } else {
    return null;
  }
  
  // Try different extensions
  const extensions = ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js'];
  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

/**
 * Analyze test impact based on changed files
 */
export function analyzeTestImpact(
  changedFiles: string[],
  dependencyMap: Map<string, TestDependency>,
  config: SelectiveTestConfig = {}
): TestImpactAnalysis {
  const affectedTests = new Set<string>();
  const reason = new Map<string, string[]>();
  
  // Always run specified tests
  if (config.alwaysRun) {
    for (const pattern of config.alwaysRun) {
      const tests = glob.sync(pattern, {
        cwd: process.cwd(),
        ignore: ['**/node_modules/**'],
      });
      tests.forEach(test => {
        affectedTests.add(test);
        reason.set(test, ['Always run']);
      });
    }
  }
  
  // Find tests affected by changed files
  for (const [testFile, dependency] of dependencyMap.entries()) {
    const reasons: string[] = [];
    
    // Check if test file itself changed
    if (changedFiles.includes(dependency.testFile)) {
      reasons.push('Test file modified');
    }
    
    // Check if any source files changed
    for (const sourceFile of dependency.sourceFiles) {
      if (changedFiles.some(changed => changed === sourceFile || sourceFile.includes(changed))) {
        reasons.push(`Source file modified: ${sourceFile}`);
      }
    }
    
    // Check if any dependencies changed
    for (const dep of dependency.dependencies) {
      if (changedFiles.some(changed => changed === dep || dep.includes(changed))) {
        reasons.push(`Dependency modified: ${dep}`);
      }
    }
    
    if (reasons.length > 0) {
      affectedTests.add(dependency.testFile);
      reason.set(dependency.testFile, reasons);
    }
  }
  
  // Apply include/exclude patterns
  let finalTests = Array.from(affectedTests);
  
  if (config.includePatterns) {
    finalTests = finalTests.filter(test =>
      config.includePatterns!.some(pattern => test.includes(pattern))
    );
  }
  
  if (config.excludePatterns) {
    finalTests = finalTests.filter(test =>
      !config.excludePatterns!.some(pattern => test.includes(pattern))
    );
  }
  
  // Estimate execution time (assume 2 seconds per test file)
  const estimatedTime = finalTests.length * 2;
  
  return {
    changedFiles,
    affectedTests: finalTests,
    reason,
    estimatedTime,
  };
}

/**
 * Get selective test command for Jest
 */
export function getSelectiveTestCommand(
  affectedTests: string[],
  options: { coverage?: boolean; verbose?: boolean } = {}
): string {
  if (affectedTests.length === 0) {
    return 'echo "No tests to run"';
  }
  
  const args = ['jest'];
  
  // Add test file patterns
  if (affectedTests.length < 50) {
    // If few tests, specify them directly
    args.push(...affectedTests.map(t => `"${t}"`));
  } else {
    // If many tests, use pattern matching
    args.push('--testPathPattern', `"(${affectedTests.join('|')})"`);
  }
  
  if (options.coverage) {
    args.push('--coverage');
  }
  
  if (options.verbose) {
    args.push('--verbose');
  }
  
  return args.join(' ');
}

/**
 * Smart test selection based on git changes
 */
export function selectTestsToRun(config: SelectiveTestConfig = {}): TestImpactAnalysis {
  const rootDir = process.cwd();
  const baseBranch = config.baseBranch || process.env.BASE_BRANCH || 'main';
  
  // Get changed files
  const changedFiles = getChangedFiles(baseBranch);
  
  if (changedFiles.length === 0) {
    console.log('No changed files detected. Running all tests.');
    return {
      changedFiles: [],
      affectedTests: [],
      reason: new Map(),
      estimatedTime: 0,
    };
  }
  
  // Build dependency map
  const dependencyMap = buildTestDependencyMap(rootDir);
  
  // Analyze impact
  const analysis = analyzeTestImpact(changedFiles, dependencyMap, config);
  
  return analysis;
}

/**
 * Generate test selection report
 */
export function generateTestSelectionReport(analysis: TestImpactAnalysis): string {
  const lines: string[] = [];
  
  lines.push('=== Test Selection Report ===\n');
  lines.push(`Changed Files: ${analysis.changedFiles.length}`);
  lines.push(`Affected Tests: ${analysis.affectedTests.length}`);
  lines.push(`Estimated Time: ${analysis.estimatedTime}s\n`);
  
  if (analysis.changedFiles.length > 0) {
    lines.push('Changed Files:');
    analysis.changedFiles.slice(0, 10).forEach(file => {
      lines.push(`  - ${file}`);
    });
    if (analysis.changedFiles.length > 10) {
      lines.push(`  ... and ${analysis.changedFiles.length - 10} more`);
    }
    lines.push('');
  }
  
  if (analysis.affectedTests.length > 0) {
    lines.push('Affected Tests:');
    analysis.affectedTests.slice(0, 10).forEach(test => {
      const reasons = analysis.reason.get(test) || [];
      lines.push(`  - ${test}`);
      reasons.forEach(reason => {
        lines.push(`    → ${reason}`);
      });
    });
    if (analysis.affectedTests.length > 10) {
      lines.push(`  ... and ${analysis.affectedTests.length - 10} more`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Cache test results for faster subsequent runs
 */
export class TestResultCache {
  private cacheFile: string;
  private cache: Map<string, CachedTestResult>;
  
  constructor(cacheDir: string = '.jest-cache') {
    this.cacheFile = join(process.cwd(), cacheDir, 'test-results.json');
    this.cache = new Map();
    this.load();
  }
  
  private load(): void {
    try {
      if (existsSync(this.cacheFile)) {
        const data = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load test result cache:', error);
    }
  }
  
  save(): void {
    try {
      const data = Object.fromEntries(this.cache);
      const dir = join(this.cacheFile, '..');
      if (!existsSync(dir)) {
        execSync(`mkdir -p "${dir}"`, { stdio: 'ignore' });
      }
      require('fs').writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save test result cache:', error);
    }
  }
  
  get(testFile: string, fileHash: string): CachedTestResult | null {
    const cached = this.cache.get(testFile);
    if (cached && cached.fileHash === fileHash) {
      return cached;
    }
    return null;
  }
  
  set(testFile: string, fileHash: string, result: Omit<CachedTestResult, 'fileHash'>): void {
    this.cache.set(testFile, {
      ...result,
      fileHash,
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export interface CachedTestResult {
  fileHash: string;
  passed: boolean;
  duration: number;
  timestamp: number;
}
