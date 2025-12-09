import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { glob } from 'glob';

export interface FileNode {
  path: string;
  type: 'typescript' | 'javascript' | 'css' | 'json' | 'other';
  imports: string[];
  exports: string[];
  symbols: Symbol[];
  lastModified: number;
  hash: string;
}

export interface Symbol {
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface' | 'type';
  line: number;
  column: number;
}

export interface ProjectGraph {
  rootPath: string;
  files: Map<string, FileNode>;
  dependencies: Map<string, string[]>;
  lastIndexed: number;
}

export class ProjectIndexer {
  private projectGraph: ProjectGraph | null = null;
  private indexingInProgress = false;

  async indexProject(rootPath: string): Promise<ProjectGraph> {
    if (this.indexingInProgress) {
      throw new Error('Indexing already in progress');
    }

    this.indexingInProgress = true;
    console.log(`Starting project indexing: ${rootPath}`);

    try {
      const files = new Map<string, FileNode>();
      const dependencies = new Map<string, string[]>();

      // Find all relevant files
      const patterns = [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
        '**/*.css',
      ];

      const ignorePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
      ];

      for (const pattern of patterns) {
        const matchedFiles = await glob(pattern, {
          cwd: rootPath,
          ignore: ignorePatterns,
          absolute: true,
        });

        for (const filePath of matchedFiles) {
          try {
            const fileNode = await this.parseFile(filePath);
            if (fileNode) {
              files.set(filePath, fileNode);
              
              // Build dependency graph
              if (fileNode.imports.length > 0) {
                dependencies.set(filePath, fileNode.imports);
              }
            }
          } catch (error) {
            console.error(`Failed to parse file ${filePath}:`, error);
          }
        }
      }

      this.projectGraph = {
        rootPath,
        files,
        dependencies,
        lastIndexed: Date.now(),
      };

      console.log(`Indexing complete: ${files.size} files indexed`);
      return this.projectGraph;
    } finally {
      this.indexingInProgress = false;
    }
  }

  async parseFile(filePath: string): Promise<FileNode | null> {
    const ext = path.extname(filePath).toLowerCase();
    const stats = await fs.promises.stat(filePath);
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const hash = this.hashString(content);

    const fileNode: FileNode = {
      path: filePath,
      type: this.getFileType(ext),
      imports: [],
      exports: [],
      symbols: [],
      lastModified: stats.mtimeMs,
      hash,
    };

    // Parse TypeScript/JavaScript files
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      try {
        const ast = parse(content, {
          sourceType: 'module',
          plugins: [
            'typescript',
            'jsx',
            'decorators-legacy',
            'classProperties',
            'objectRestSpread',
            'optionalChaining',
            'nullishCoalescingOperator',
          ],
        });

        traverse(ast, {
          ImportDeclaration: (nodePath) => {
            const source = nodePath.node.source.value;
            fileNode.imports.push(source);
          },

          ExportNamedDeclaration: (nodePath) => {
            if (nodePath.node.declaration) {
              if (t.isFunctionDeclaration(nodePath.node.declaration)) {
                const name = nodePath.node.declaration.id?.name;
                if (name) {
                  fileNode.exports.push(name);
                  fileNode.symbols.push({
                    name,
                    type: 'function',
                    line: nodePath.node.loc?.start.line || 0,
                    column: nodePath.node.loc?.start.column || 0,
                  });
                }
              } else if (t.isClassDeclaration(nodePath.node.declaration)) {
                const name = nodePath.node.declaration.id?.name;
                if (name) {
                  fileNode.exports.push(name);
                  fileNode.symbols.push({
                    name,
                    type: 'class',
                    line: nodePath.node.loc?.start.line || 0,
                    column: nodePath.node.loc?.start.column || 0,
                  });
                }
              } else if (t.isVariableDeclaration(nodePath.node.declaration)) {
                nodePath.node.declaration.declarations.forEach((decl) => {
                  if (t.isIdentifier(decl.id)) {
                    fileNode.exports.push(decl.id.name);
                    fileNode.symbols.push({
                      name: decl.id.name,
                      type: 'variable',
                      line: nodePath.node.loc?.start.line || 0,
                      column: nodePath.node.loc?.start.column || 0,
                    });
                  }
                });
              } else if (t.isTSInterfaceDeclaration(nodePath.node.declaration)) {
                const name = nodePath.node.declaration.id.name;
                fileNode.exports.push(name);
                fileNode.symbols.push({
                  name,
                  type: 'interface',
                  line: nodePath.node.loc?.start.line || 0,
                  column: nodePath.node.loc?.start.column || 0,
                });
              } else if (t.isTSTypeAliasDeclaration(nodePath.node.declaration)) {
                const name = nodePath.node.declaration.id.name;
                fileNode.exports.push(name);
                fileNode.symbols.push({
                  name,
                  type: 'type',
                  line: nodePath.node.loc?.start.line || 0,
                  column: nodePath.node.loc?.start.column || 0,
                });
              }
            }
          },

          ExportDefaultDeclaration: (nodePath) => {
            fileNode.exports.push('default');
          },

          FunctionDeclaration: (nodePath) => {
            const name = nodePath.node.id?.name;
            if (name && !fileNode.symbols.find(s => s.name === name)) {
              fileNode.symbols.push({
                name,
                type: 'function',
                line: nodePath.node.loc?.start.line || 0,
                column: nodePath.node.loc?.start.column || 0,
              });
            }
          },

          ClassDeclaration: (nodePath) => {
            const name = nodePath.node.id?.name;
            if (name && !fileNode.symbols.find(s => s.name === name)) {
              fileNode.symbols.push({
                name,
                type: 'class',
                line: nodePath.node.loc?.start.line || 0,
                column: nodePath.node.loc?.start.column || 0,
              });
            }
          },

          TSInterfaceDeclaration: (nodePath) => {
            const name = nodePath.node.id.name;
            if (!fileNode.symbols.find(s => s.name === name)) {
              fileNode.symbols.push({
                name,
                type: 'interface',
                line: nodePath.node.loc?.start.line || 0,
                column: nodePath.node.loc?.start.column || 0,
              });
            }
          },

          TSTypeAliasDeclaration: (nodePath) => {
            const name = nodePath.node.id.name;
            if (!fileNode.symbols.find(s => s.name === name)) {
              fileNode.symbols.push({
                name,
                type: 'type',
                line: nodePath.node.loc?.start.line || 0,
                column: nodePath.node.loc?.start.column || 0,
              });
            }
          },
        });
      } catch (error) {
        console.error(`Failed to parse AST for ${filePath}:`, error);
      }
    }

    return fileNode;
  }

  async updateIndex(changedFiles: string[]): Promise<void> {
    if (!this.projectGraph) {
      throw new Error('Project not indexed yet');
    }

    console.log(`Updating index for ${changedFiles.length} files`);

    for (const filePath of changedFiles) {
      try {
        const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
        
        if (exists) {
          const fileNode = await this.parseFile(filePath);
          if (fileNode) {
            this.projectGraph.files.set(filePath, fileNode);
            
            // Update dependencies
            if (fileNode.imports.length > 0) {
              this.projectGraph.dependencies.set(filePath, fileNode.imports);
            } else {
              this.projectGraph.dependencies.delete(filePath);
            }
          }
        } else {
          // File was deleted
          this.projectGraph.files.delete(filePath);
          this.projectGraph.dependencies.delete(filePath);
        }
      } catch (error) {
        console.error(`Failed to update file ${filePath}:`, error);
      }
    }

    this.projectGraph.lastIndexed = Date.now();
  }

  findSymbol(name: string): Array<{ file: string; symbol: Symbol }> {
    if (!this.projectGraph) {
      return [];
    }

    const results: Array<{ file: string; symbol: Symbol }> = [];

    for (const [filePath, fileNode] of this.projectGraph.files) {
      const symbol = fileNode.symbols.find(s => s.name === name);
      if (symbol) {
        results.push({ file: filePath, symbol });
      }
    }

    return results;
  }

  findReferences(symbolName: string): string[] {
    if (!this.projectGraph) {
      return [];
    }

    const references: string[] = [];

    for (const [filePath, fileNode] of this.projectGraph.files) {
      // Check if file imports or uses the symbol
      if (fileNode.symbols.some(s => s.name === symbolName)) {
        references.push(filePath);
      }
    }

    return references;
  }

  getImportGraph(): Map<string, string[]> {
    return this.projectGraph?.dependencies || new Map();
  }

  getProjectGraph(): ProjectGraph | null {
    return this.projectGraph;
  }

  private getFileType(ext: string): FileNode['type'] {
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.js':
      case '.jsx':
        return 'javascript';
      case '.css':
      case '.scss':
        return 'css';
      case '.json':
        return 'json';
      default:
        return 'other';
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}
