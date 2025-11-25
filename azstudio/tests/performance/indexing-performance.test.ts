import { ProjectIndexer } from '../../src/main/services/ProjectIndexer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Performance tests for project indexing
 * Tests indexing speed on projects of various sizes
 */
describe('Indexing Performance', () => {
  let indexer: ProjectIndexer;
  const testProjectsPath = '/test/performance-projects';

  beforeEach(() => {
    indexer = new ProjectIndexer();
  });

  describe('Small Projects (< 100 files)', () => {
    it('should index small project in under 1 second', async () => {
      const projectPath = path.join(testProjectsPath, 'small-project');
      
      const startTime = performance.now();
      await indexer.indexProject(projectPath);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 1 second
      
      console.log(`Small project indexed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Medium Projects (100-1000 files)', () => {
    it('should index medium project in under 5 seconds', async () => {
      const projectPath = path.join(testProjectsPath, 'medium-project');
      
      const startTime = performance.now();
      await indexer.indexProject(projectPath);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // 5 seconds
      
      console.log(`Medium project indexed in ${duration.toFixed(2)}ms`);
    });

    it('should handle incremental updates efficiently', async () => {
      const projectPath = path.join(testProjectsPath, 'medium-project');
      
      // Initial index
      await indexer.indexProject(projectPath);
      
      // Update single file
      const testFile = path.join(projectPath, 'src/test.ts');
      
      const startTime = performance.now();
      await indexer.updateIndex([testFile]);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Incremental update should be very fast
      expect(duration).toBeLessThan(100); // 100ms
      
      console.log(`Incremental update completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Large Projects (> 1000 files)', () => {
    it('should index large project in under 10 seconds', async () => {
      const projectPath = path.join(testProjectsPath, 'large-project');
      
      const startTime = performance.now();
      await indexer.indexProject(projectPath);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // 10 seconds
      
      console.log(`Large project indexed in ${duration.toFixed(2)}ms`);
      
      // Log statistics
      const graph = indexer.getProjectGraph();
      console.log(`Files indexed: ${graph?.files.size}`);
      console.log(`Services found: ${graph?.services.size}`);
      console.log(`Components found: ${graph?.components.size}`);
    });

    it('should use caching effectively', async () => {
      const projectPath = path.join(testProjectsPath, 'large-project');
      
      // First index (cold cache)
      const startTime1 = performance.now();
      await indexer.indexProject(projectPath);
      const endTime1 = performance.now();
      const duration1 = endTime1 - startTime1;
      
      // Second index (warm cache)
      const indexer2 = new ProjectIndexer();
      const startTime2 = performance.now();
      await indexer2.indexProject(projectPath);
      const endTime2 = performance.now();
      const duration2 = endTime2 - startTime2;
      
      // Cached index should be significantly faster
      expect(duration2).toBeLessThan(duration1 * 0.5);
      
      console.log(`Cold cache: ${duration1.toFixed(2)}ms`);
      console.log(`Warm cache: ${duration2.toFixed(2)}ms`);
      console.log(`Speedup: ${(duration1 / duration2).toFixed(2)}x`);
    });
  });

  describe('Memory Usage', () => {
    it('should not exceed 500MB for large projects', async () => {
      const projectPath = path.join(testProjectsPath, 'large-project');
      
      const memBefore = process.memoryUsage().heapUsed;
      
      await indexer.indexProject(projectPath);
      
      const memAfter = process.memoryUsage().heapUsed;
      const memUsed = (memAfter - memBefore) / 1024 / 1024; // Convert to MB
      
      expect(memUsed).toBeLessThan(500); // 500MB
      
      console.log(`Memory used: ${memUsed.toFixed(2)}MB`);
    });

    it('should release memory after indexing', async () => {
      const projectPath = path.join(testProjectsPath, 'medium-project');
      
      const memBefore = process.memoryUsage().heapUsed;
      
      await indexer.indexProject(projectPath);
      
      // Clear indexer
      indexer = null as any;
      global.gc && global.gc(); // Force garbage collection if available
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for GC
      
      const memAfter = process.memoryUsage().heapUsed;
      
      // Memory should be released
      expect(memAfter).toBeLessThan(memBefore * 1.2); // Allow 20% overhead
    });
  });

  describe('Parallel Processing', () => {
    it('should index multiple projects concurrently', async () => {
      const projects = [
        path.join(testProjectsPath, 'project1'),
        path.join(testProjectsPath, 'project2'),
        path.join(testProjectsPath, 'project3'),
      ];
      
      const startTime = performance.now();
      
      // Index all projects in parallel
      await Promise.all(
        projects.map(async (projectPath) => {
          const indexer = new ProjectIndexer();
          return indexer.indexProject(projectPath);
        })
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Parallel indexing should be faster than sequential
      console.log(`Parallel indexing of 3 projects: ${duration.toFixed(2)}ms`);
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(15000); // 15 seconds for 3 projects
    });
  });

  describe('File Watching Performance', () => {
    it('should handle rapid file changes', async () => {
      const projectPath = path.join(testProjectsPath, 'watch-test');
      
      await indexer.indexProject(projectPath);
      
      // Simulate rapid file changes
      const changes: string[] = [];
      for (let i = 0; i < 100; i++) {
        changes.push(path.join(projectPath, `src/file${i}.ts`));
      }
      
      const startTime = performance.now();
      
      // Update all files
      await indexer.updateIndex(changes);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 100 file changes quickly
      expect(duration).toBeLessThan(2000); // 2 seconds
      
      console.log(`100 file updates processed in ${duration.toFixed(2)}ms`);
      console.log(`Average per file: ${(duration / 100).toFixed(2)}ms`);
    });
  });

  describe('Search Performance', () => {
    it('should find symbols quickly in large projects', async () => {
      const projectPath = path.join(testProjectsPath, 'large-project');
      
      await indexer.indexProject(projectPath);
      
      const startTime = performance.now();
      const results = indexer.findSymbol('testFunction');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Search should be very fast
      expect(duration).toBeLessThan(50); // 50ms
      
      console.log(`Symbol search completed in ${duration.toFixed(2)}ms`);
      console.log(`Results found: ${results.length}`);
    });

    it('should find references quickly', async () => {
      const projectPath = path.join(testProjectsPath, 'large-project');
      
      await indexer.indexProject(projectPath);
      
      const startTime = performance.now();
      const references = indexer.findReferences('commonFunction');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 100ms
      
      console.log(`Reference search completed in ${duration.toFixed(2)}ms`);
      console.log(`References found: ${references.length}`);
    });
  });
});
