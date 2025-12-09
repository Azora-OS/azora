import { CodeExecutor, ASTTransform, TransformResult } from '../CodeExecutor';
import * as fs from 'fs';

// Mock fs
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('CodeExecutor', () => {
  let executor: CodeExecutor;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    executor = new CodeExecutor();
    mockFs = fs as jest.Mocked<typeof fs>;
    jest.clearAllMocks();
  });

  describe('parseCode', () => {
    it('should parse TypeScript code', () => {
      const code = `
        export function test(): string {
          return 'test';
        }
      `;
      
      const ast = executor.parseCode(code, 'test.ts');
      
      expect(ast).toBeDefined();
      expect(ast.program).toBeDefined();
    });

    it('should parse JavaScript code', () => {
      const code = `
        export function test() {
          return 'test';
        }
      `;
      
      const ast = executor.parseCode(code, 'test.js');
      
      expect(ast).toBeDefined();
      expect(ast.program).toBeDefined();
    });

    it('should parse JSX code', () => {
      const code = `
        export function Component() {
          return <div>Test</div>;
        }
      `;
      
      const ast = executor.parseCode(code, 'Component.jsx');
      
      expect(ast).toBeDefined();
      expect(ast.program).toBeDefined();
    });

    it('should parse TSX code', () => {
      const code = `
        export function Component(): JSX.Element {
          return <div>Test</div>;
        }
      `;
      
      const ast = executor.parseCode(code, 'Component.tsx');
      
      expect(ast).toBeDefined();
      expect(ast.program).toBeDefined();
    });

    it('should throw error for invalid syntax', () => {
      const code = 'invalid syntax {{{';
      
      expect(() => executor.parseCode(code, 'test.ts')).toThrow();
    });
  });

  describe('generateCode', () => {
    it('should generate code from AST', () => {
      const code = `
        export function test() {
          return 'test';
        }
      `;
      
      const ast = executor.parseCode(code, 'test.ts');
      const generated = executor.generateCode(ast);
      
      expect(generated).toContain('export function test');
      expect(generated).toContain("return 'test'");
    });

    it('should preserve comments', () => {
      const code = `
        // This is a comment
        export function test() {
          return 'test';
        }
      `;
      
      const ast = executor.parseCode(code, 'test.ts');
      const generated = executor.generateCode(ast);
      
      expect(generated).toContain('// This is a comment');
    });
  });

  describe('applyTransform', () => {
    it('should apply rename transform', async () => {
      const code = `
        function oldName() {
          return 'test';
        }
        oldName();
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const transform: ASTTransform = {
        type: 'rename',
        target: 'oldName',
        options: { oldName: 'oldName', newName: 'newName' },
      };
      
      const result = await executor.applyTransform('test.ts', transform);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('newName');
      expect(result.code).not.toContain('oldName');
    });

    it('should apply extract transform', async () => {
      const code = `
        function main() {
          console.log('line 1');
          console.log('line 2');
          console.log('line 3');
        }
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const transform: ASTTransform = {
        type: 'extract',
        target: 'function',
        options: { startLine: 2, endLine: 3, functionName: 'extracted' },
      };
      
      const result = await executor.applyTransform('test.ts', transform);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('function extracted');
    });

    it('should apply update-imports transform', async () => {
      const code = `
        import { test } from './old-path';
        test();
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const transform: ASTTransform = {
        type: 'update-imports',
        target: './old-path',
        options: { oldPath: './old-path', newPath: './new-path' },
      };
      
      const result = await executor.applyTransform('test.ts', transform);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('./new-path');
      expect(result.code).not.toContain('./old-path');
    });

    it('should handle transform errors', async () => {
      mockFs.promises.readFile = jest.fn().mockRejectedValue(new Error('File not found'));
      
      const transform: ASTTransform = {
        type: 'rename',
        target: 'test',
        options: { oldName: 'test', newName: 'newTest' },
      };
      
      const result = await executor.applyTransform('test.ts', transform);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('renameSymbol', () => {
    it('should rename symbol across multiple files', async () => {
      const code1 = `export function oldName() {}`;
      const code2 = `import { oldName } from './file1'; oldName();`;
      
      mockFs.promises.readFile = jest.fn()
        .mockResolvedValueOnce(code1)
        .mockResolvedValueOnce(code2);
      
      const results = await executor.renameSymbol(
        ['file1.ts', 'file2.ts'],
        'oldName',
        'newName'
      );
      
      expect(results.size).toBe(2);
      expect(results.get('file1.ts')?.success).toBe(true);
      expect(results.get('file2.ts')?.success).toBe(true);
    });
  });

  describe('extractFunction', () => {
    it('should extract code into a new function', async () => {
      const code = `
        function main() {
          console.log('line 1');
          console.log('line 2');
        }
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const result = await executor.extractFunction('test.ts', 2, 3, 'extracted');
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('function extracted');
    });
  });

  describe('updateImports', () => {
    it('should update imports across multiple files', async () => {
      const code1 = `import { test } from './old-path';`;
      const code2 = `import { test } from './old-path';`;
      
      mockFs.promises.readFile = jest.fn()
        .mockResolvedValueOnce(code1)
        .mockResolvedValueOnce(code2);
      
      const results = await executor.updateImports(
        ['file1.ts', 'file2.ts'],
        './old-path',
        './new-path'
      );
      
      expect(results.size).toBe(2);
      expect(results.get('file1.ts')?.code).toContain('./new-path');
      expect(results.get('file2.ts')?.code).toContain('./new-path');
    });
  });

  describe('addImport', () => {
    it('should add default import', async () => {
      const code = `export function test() {}`;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const result = await executor.addImport('test.ts', 'React', 'react', true);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('import React from');
    });

    it('should add named import', async () => {
      const code = `export function test() {}`;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const result = await executor.addImport('test.ts', 'useState', 'react', false);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('import { useState }');
    });
  });

  describe('removeUnusedImports', () => {
    it('should remove unused imports', async () => {
      const code = `
        import { used, unused } from 'test';
        used();
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const result = await executor.removeUnusedImports('test.ts');
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('used');
      expect(result.code).not.toContain('unused');
    });

    it('should remove entire import if all specifiers unused', async () => {
      const code = `
        import { unused1, unused2 } from 'test';
        console.log('test');
      `;
      
      mockFs.promises.readFile = jest.fn().mockResolvedValue(code);
      
      const result = await executor.removeUnusedImports('test.ts');
      
      expect(result.success).toBe(true);
      expect(result.code).not.toContain('import');
    });
  });

  describe('validateSyntax', () => {
    it('should return no diagnostics for valid code', () => {
      const code = `export function test() { return 'test'; }`;
      
      const diagnostics = executor.validateSyntax(code, 'test.ts');
      
      expect(diagnostics.length).toBe(0);
    });

    it('should return error diagnostics for invalid code', () => {
      const code = `invalid syntax {{{`;
      
      const diagnostics = executor.validateSyntax(code, 'test.ts');
      
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0].severity).toBe('error');
    });
  });
});
