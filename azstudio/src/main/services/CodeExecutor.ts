import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import * as fs from 'fs';

export interface ASTTransform {
  type: 'rename' | 'extract' | 'move' | 'update-imports' | 'custom';
  target: string;
  options: Record<string, any>;
}

export interface TransformResult {
  code: string;
  success: boolean;
  error?: string;
  diagnostics?: Diagnostic[];
}

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
}

export class CodeExecutor {
  /**
   * Parse TypeScript/JavaScript code into an AST
   */
  parseCode(code: string, filePath: string): parser.ParseResult<t.File> {
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    const isJSX = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

    return parser.parse(code, {
      sourceType: 'module',
      plugins: [
        isTypeScript && 'typescript',
        isJSX && 'jsx',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator',
      ].filter(Boolean) as parser.ParserPlugin[],
    });
  }

  /**
   * Generate code from an AST
   */
  generateCode(ast: t.File): string {
    const output = generate(ast, {
      retainLines: false,
      compact: false,
      concise: false,
      comments: true,
    });

    return output.code;
  }

  /**
   * Apply a transformation to code
   */
  async applyTransform(
    filePath: string,
    transform: ASTTransform
  ): Promise<TransformResult> {
    try {
      const code = await fs.promises.readFile(filePath, 'utf-8');
      const ast = this.parseCode(code, filePath);

      // Apply the transformation based on type
      switch (transform.type) {
        case 'rename':
          this.applyRenameTransform(ast, transform.options as { oldName: string; newName: string });
          break;
        case 'extract':
          this.applyExtractTransform(ast, transform.options as { startLine: number; endLine: number; functionName: string });
          break;
        case 'move':
          this.applyMoveTransform(ast, transform.options as { from: string; to: string });
          break;
        case 'update-imports':
          this.applyUpdateImportsTransform(ast, transform.options as { oldPath: string; newPath: string });
          break;
        case 'custom':
          // Custom transformations can be added here
          break;
      }

      const transformedCode = this.generateCode(ast);
      const diagnostics = this.validateSyntax(transformedCode, filePath);

      return {
        code: transformedCode,
        success: diagnostics.filter(d => d.severity === 'error').length === 0,
        diagnostics,
      };
    } catch (error) {
      return {
        code: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Rename a symbol (variable, function, class, etc.)
   */
  private applyRenameTransform(ast: t.File, options: { oldName: string; newName: string }): void {
    const { oldName, newName } = options;

    traverse(ast, {
      Identifier(nodePath) {
        if (nodePath.node.name === oldName) {
          // Check if this is a binding (declaration) or reference
          const binding = nodePath.scope.getBinding(oldName);
          if (binding && t.isIdentifier(binding.path.node)) {
            // Rename all references
            binding.path.node.name = newName;
            binding.referencePaths.forEach(refPath => {
              if (t.isIdentifier(refPath.node)) {
                refPath.node.name = newName;
              }
            });
          }
        }
      },
    });
  }

  /**
   * Extract code into a new function
   */
  private applyExtractTransform(
    ast: t.File,
    options: { startLine: number; endLine: number; functionName: string }
  ): void {
    const { startLine, endLine, functionName } = options;

    traverse(ast, {
      Program(path) {
        const statements: t.Statement[] = [];
        const extractedStatements: t.Statement[] = [];

        // Collect statements to extract
        path.node.body.forEach((statement) => {
          const loc = statement.loc;
          if (loc && loc.start.line >= startLine && loc.end.line <= endLine) {
            extractedStatements.push(statement);
          } else {
            statements.push(statement);
          }
        });

        // Create new function with extracted code
        const newFunction = t.functionDeclaration(
          t.identifier(functionName),
          [],
          t.blockStatement(extractedStatements)
        );

        // Replace extracted code with function call
        const functionCall = t.expressionStatement(
          t.callExpression(t.identifier(functionName), [])
        );

        // Update program body
        path.node.body = [...statements, newFunction, functionCall];
      },
    });
  }

  /**
   * Move code to a different location (placeholder for complex logic)
   */
  private applyMoveTransform(_ast: t.File, _options: { from: string; to: string }): void {
    // This would involve more complex logic to move code between files
    // For now, this is a placeholder
    console.log('Move transform not yet implemented');
  }

  /**
   * Update import statements
   */
  private applyUpdateImportsTransform(
    ast: t.File,
    options: { oldPath: string; newPath: string }
  ): void {
    const { oldPath, newPath } = options;

    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === oldPath) {
          path.node.source.value = newPath;
        }
      },
      // Also handle dynamic imports
      CallExpression(path) {
        if (
          t.isImport(path.node.callee) &&
          t.isStringLiteral(path.node.arguments[0]) &&
          path.node.arguments[0].value === oldPath
        ) {
          path.node.arguments[0].value = newPath;
        }
      },
    });
  }

  /**
   * Validate syntax after transformation
   */
  validateSyntax(code: string, filePath: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    try {
      this.parseCode(code, filePath);
    } catch (error: any) {
      diagnostics.push({
        severity: 'error',
        message: error.message,
        line: error.loc?.line,
        column: error.loc?.column,
      });
    }

    return diagnostics;
  }

  /**
   * Refactor: Rename symbol across multiple files
   */
  async renameSymbol(
    files: string[],
    oldName: string,
    newName: string
  ): Promise<Map<string, TransformResult>> {
    const results = new Map<string, TransformResult>();

    for (const file of files) {
      const result = await this.applyTransform(file, {
        type: 'rename',
        target: oldName,
        options: { oldName, newName },
      });
      results.set(file, result);
    }

    return results;
  }

  /**
   * Refactor: Extract function
   */
  async extractFunction(
    filePath: string,
    startLine: number,
    endLine: number,
    functionName: string
  ): Promise<TransformResult> {
    return this.applyTransform(filePath, {
      type: 'extract',
      target: 'function',
      options: { startLine, endLine, functionName },
    });
  }

  /**
   * Refactor: Update imports across files
   */
  async updateImports(
    files: string[],
    oldPath: string,
    newPath: string
  ): Promise<Map<string, TransformResult>> {
    const results = new Map<string, TransformResult>();

    for (const file of files) {
      const result = await this.applyTransform(file, {
        type: 'update-imports',
        target: oldPath,
        options: { oldPath, newPath },
      });
      results.set(file, result);
    }

    return results;
  }

  /**
   * Add import statement to a file
   */
  async addImport(
    filePath: string,
    importName: string,
    importPath: string,
    isDefault: boolean = false
  ): Promise<TransformResult> {
    try {
      const code = await fs.promises.readFile(filePath, 'utf-8');
      const ast = this.parseCode(code, filePath);

      traverse(ast, {
        Program(path) {
          const importDeclaration = isDefault
            ? t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(importName))],
                t.stringLiteral(importPath)
              )
            : t.importDeclaration(
                [t.importSpecifier(t.identifier(importName), t.identifier(importName))],
                t.stringLiteral(importPath)
              );

          // Add import at the beginning
          path.node.body.unshift(importDeclaration);
        },
      });

      const transformedCode = this.generateCode(ast);
      const diagnostics = this.validateSyntax(transformedCode, filePath);

      return {
        code: transformedCode,
        success: diagnostics.filter(d => d.severity === 'error').length === 0,
        diagnostics,
      };
    } catch (error) {
      return {
        code: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Remove unused imports
   */
  async removeUnusedImports(filePath: string): Promise<TransformResult> {
    try {
      const code = await fs.promises.readFile(filePath, 'utf-8');
      const ast = this.parseCode(code, filePath);

      const usedIdentifiers = new Set<string>();

      // First pass: collect all used identifiers
      traverse(ast, {
        Identifier(path) {
          // Skip if this is part of an import declaration
          if (path.findParent(p => p.isImportDeclaration())) {
            return;
          }
          usedIdentifiers.add(path.node.name);
        },
      });

      // Second pass: remove unused imports
      traverse(ast, {
        ImportDeclaration(path) {
          const specifiers = path.node.specifiers.filter(specifier => {
            if (t.isImportDefaultSpecifier(specifier)) {
              return usedIdentifiers.has(specifier.local.name);
            }
            if (t.isImportSpecifier(specifier)) {
              return usedIdentifiers.has(specifier.local.name);
            }
            return true;
          });

          if (specifiers.length === 0) {
            path.remove();
          } else {
            path.node.specifiers = specifiers;
          }
        },
      });

      const transformedCode = this.generateCode(ast);
      const diagnostics = this.validateSyntax(transformedCode, filePath);

      return {
        code: transformedCode,
        success: diagnostics.filter(d => d.severity === 'error').length === 0,
        diagnostics,
      };
    } catch (error) {
      return {
        code: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
