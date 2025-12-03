import * as fs from 'fs';
import { ProjectGraph } from './ProjectIndexer';

export interface FileContext { path: string; content: string; relevance: number; }

export class ContextManager {
  private readonly MAX_CONTEXT_FILES = 10;
  private readonly MAX_FILE_SIZE = 50000; // 50KB

  async buildContext(files: string[], projectGraph: ProjectGraph | null): Promise<FileContext[]> {
    const contexts: FileContext[] = [];
    for (const filePath of files) {
      try {
        const stats = await fs.promises.stat(filePath);
        if (stats.size > this.MAX_FILE_SIZE) { console.log(`Skipping large file: ${filePath}`); continue; }
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const relevance = this.calculateRelevance(filePath, projectGraph);
        contexts.push({ path: filePath, content, relevance });
      } catch (error) { console.error(`Failed to read file ${filePath}:`, error); }
    }
    return contexts.sort((a,b) => b.relevance - a.relevance).slice(0, this.MAX_CONTEXT_FILES);
  }

  async selectRelevantFiles(targetFile: string, projectGraph: ProjectGraph | null): Promise<string[]> {
    if (!projectGraph) { return [targetFile]; }
    const relevantFiles = new Set<string>([targetFile]);
    for (const [filePath, deps] of projectGraph.dependencies) {
      if (deps.some(dep => this.resolveImport(dep, filePath) === targetFile)) {
        relevantFiles.add(filePath);
      }
    }
    const targetDeps = projectGraph.dependencies.get(targetFile);
    if (targetDeps) { for (const dep of targetDeps) { const resolvedPath = this.resolveImport(dep, targetFile); if (resolvedPath && projectGraph.files.has(resolvedPath)) { relevantFiles.add(resolvedPath); } } }
    return Array.from(relevantFiles);
  }

  compressContext(contexts: FileContext[]): FileContext[] {
    return contexts.map(ctx => ({ ...ctx, content: this.compressCode(ctx.content) }));
  }

  private compressCode(code: string): string {
    code = code.replace(/\/\/.*$/gm, '');
    code = code.replace(/\/*[\s\S]*?\*\//g, '');
    code = code.replace(/\n\s*\n/g, '\n');
    code = code.split('\n').map(line => line.trim()).join('\n');
    return code;
  }

  private calculateRelevance(filePath: string, projectGraph: ProjectGraph | null): number {
    let relevance = 1.0;
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) { relevance += 0.5; }
    if (projectGraph) {
      const fileNode = projectGraph.files.get(filePath);
      if (fileNode) { relevance += fileNode.imports.length * 0.1; relevance += fileNode.exports.length * 0.2; relevance += fileNode.symbols.length * 0.05; }
    }
    if (filePath.includes('.test.') || filePath.includes('.spec.')) { relevance *= 0.5; }
    if (filePath.includes('config') || filePath.includes('.config.')) { relevance *= 0.7; }
    return relevance;
  }

  private resolveImport(importPath: string, fromFile: string): string | null {
    if (importPath.startsWith('.')) {
      const fromDir = fromFile.substring(0, fromFile.lastIndexOf('/'));
      let resolved = `${fromDir}/${importPath}`;
      const parts = resolved.split('/');
      const normalized: string[] = [];
      for (const part of parts) { if (part === '..') { normalized.pop(); } else if (part !== '.') { normalized.push(part); } }
      resolved = normalized.join('/');
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      for (const ext of extensions) { const withExt = resolved + ext; try { if (fs.existsSync(withExt)) { return withExt; } } catch { } }
    }
    return null;
  }

  estimateTokenCount(contexts: FileContext[]): number { let totalChars = 0; for (const ctx of contexts) { totalChars += ctx.content.length; } return Math.ceil(totalChars / 4); }
}

export default ContextManager;
