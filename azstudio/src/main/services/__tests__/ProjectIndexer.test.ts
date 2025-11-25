import { ProjectIndexer, FileNode, ProjectGraph } from '../ProjectIndexer';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Mock dependencies
jest.mock('fs');
jest.mock('glob');

describe('ProjectIndexer', () => {
  let indexer: ProjectIndexer;
  let mockFs: jest.Mocked<typeof fs>;
  let mockGlob: jest.MockedFunction<typeof glob>;

  beforeEach(() => {
    indexer = new ProjectIndexer();
    mockFs = fs as jest.Mocked<typeof fs>;
    mockGlob = glob as jest.MockedFunction<typeof glob>;
    jest.clearAllMocks();
  });

  describe('indexProject', () => {
    it('should index a project and return project graph', async () => {
      const rootPath = '/test/project';
      const mockFiles = [
        path.join(rootPath, 'src/index.ts'),
        path.join(rootPath, 'src/utils.ts'),
      ];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn()
        .mockResolvedValueOnce(`
          import { helper } from './utils';
          export function main() {
            return helper();
          }
        `)
        .mockResolvedValueOnce(`
          export function helper() {
            return 'test';
          }
        `);

      const result = await indexer.indexProject(rootPath);

      expect(result).toBeDefined();
      expect(result.rootPath).toBe(rootPath);
      expect(result.files.size).toBeGreaterThan(0);
      expect(result.lastIndexed).toBeDefined();
    });

    it('should handle parsing errors gracefully', async () => {
      const rootPath = '/test/project';
      const mockFiles = [path.join(rootPath, 'src/invalid.ts')];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue('invalid syntax {{{');

      const result = await indexer.indexProject(rootPath);

      expect(result).toBeDefined();
      expect(result.files.size).toBe(0);
    });

    it('should prevent concurrent indexing', async () => {
      const rootPath = '/test/project';
      
      mockGlob.mockResolvedValue([]);

      const promise1 = indexer.indexProject(rootPath);
      const promise2 = indexer.indexProject(rootPath);

      await expect(promise2).rejects.toThrow('Indexing already in progress');
      await promise1;
    });
  });

  describe('parseFile', () => {
    it('should parse TypeScript file and extract symbols', async () => {
      const filePath = '/test/file.ts';
      const content = `
        export function testFunction() {
          return 'test';
        }
        
        export class TestClass {
          method() {}
        }
        
        export interface TestInterface {
          prop: string;
        }
      `;

      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(content);

      const result = await indexer.parseFile(filePath);

      expect(result).toBeDefined();
      expect(result?.type).toBe('typescript');
      expect(result?.symbols.length).toBeGreaterThan(0);
      expect(result?.exports).toContain('testFunction');
      expect(result?.exports).toContain('TestClass');
      expect(result?.exports).toContain('TestInterface');
    });

    it('should extract imports from file', async () => {
      const filePath = '/test/file.ts';
      const content = `
        import React from 'react';
        import { useState } from 'react';
        import * as utils from './utils';
        
        export function Component() {
          return null;
        }
      `;

      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(content);

      const result = await indexer.parseFile(filePath);

      expect(result).toBeDefined();
      expect(result?.imports).toContain('react');
      expect(result?.imports).toContain('./utils');
    });

    it('should handle JavaScript files', async () => {
      const filePath = '/test/file.js';
      const content = `
        export function jsFunction() {
          return 'js';
        }
      `;

      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(content);

      const result = await indexer.parseFile(filePath);

      expect(result).toBeDefined();
      expect(result?.type).toBe('javascript');
      expect(result?.exports).toContain('jsFunction');
    });

    it('should handle non-code files', async () => {
      const filePath = '/test/file.json';
      const content = '{"key": "value"}';

      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(content);

      const result = await indexer.parseFile(filePath);

      expect(result).toBeDefined();
      expect(result?.type).toBe('json');
      expect(result?.symbols.length).toBe(0);
    });
  });

  describe('updateIndex', () => {
    it('should update index for changed files', async () => {
      const rootPath = '/test/project';
      const mockFiles = [path.join(rootPath, 'src/index.ts')];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function test() {}
      `);

      await indexer.indexProject(rootPath);

      mockFs.promises.access = jest.fn().mockResolvedValue(undefined);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function updatedTest() {}
      `);

      await indexer.updateIndex([mockFiles[0]]);

      const graph = indexer.getProjectGraph();
      expect(graph).toBeDefined();
      expect(graph?.files.has(mockFiles[0])).toBe(true);
    });

    it('should remove deleted files from index', async () => {
      const rootPath = '/test/project';
      const mockFiles = [path.join(rootPath, 'src/index.ts')];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function test() {}
      `);

      await indexer.indexProject(rootPath);

      mockFs.promises.access = jest.fn().mockRejectedValue(new Error('File not found'));

      await indexer.updateIndex([mockFiles[0]]);

      const graph = indexer.getProjectGraph();
      expect(graph?.files.has(mockFiles[0])).toBe(false);
    });

    it('should throw error if project not indexed', async () => {
      await expect(indexer.updateIndex(['/test/file.ts'])).rejects.toThrow(
        'Project not indexed yet'
      );
    });
  });

  describe('findSymbol', () => {
    it('should find symbol across files', async () => {
      const rootPath = '/test/project';
      const mockFiles = [
        path.join(rootPath, 'src/file1.ts'),
        path.join(rootPath, 'src/file2.ts'),
      ];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn()
        .mockResolvedValueOnce(`export function testFunction() {}`)
        .mockResolvedValueOnce(`export function testFunction() {}`);

      await indexer.indexProject(rootPath);

      const results = indexer.findSymbol('testFunction');

      expect(results.length).toBe(2);
      expect(results[0].symbol.name).toBe('testFunction');
    });

    it('should return empty array if symbol not found', async () => {
      const rootPath = '/test/project';
      mockGlob.mockResolvedValue([]);
      
      await indexer.indexProject(rootPath);

      const results = indexer.findSymbol('nonExistent');

      expect(results).toEqual([]);
    });
  });

  describe('findReferences', () => {
    it('should find files that reference a symbol', async () => {
      const rootPath = '/test/project';
      const mockFiles = [path.join(rootPath, 'src/index.ts')];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        export function testFunction() {}
      `);

      await indexer.indexProject(rootPath);

      const references = indexer.findReferences('testFunction');

      expect(references.length).toBeGreaterThan(0);
    });
  });

  describe('getImportGraph', () => {
    it('should return dependency graph', async () => {
      const rootPath = '/test/project';
      const mockFiles = [path.join(rootPath, 'src/index.ts')];

      mockGlob.mockResolvedValue(mockFiles as any);
      
      mockFs.promises.stat = jest.fn().mockResolvedValue({
        mtimeMs: Date.now(),
      });

      mockFs.promises.readFile = jest.fn().mockResolvedValue(`
        import { helper } from './utils';
        export function main() {}
      `);

      await indexer.indexProject(rootPath);

      const graph = indexer.getImportGraph();

      expect(graph).toBeInstanceOf(Map);
      expect(graph.size).toBeGreaterThanOrEqual(0);
    });
  });
});
