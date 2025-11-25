import { AIOrchestrator } from '../../src/main/services/AIOrchestrator';
import { CodeGeneratorAgent } from '../../src/main/services/CodeGeneratorAgent';
import { PlannerAgent } from '../../src/main/services/PlannerAgent';

/**
 * Performance tests for AI operations
 * Tests response times for various AI tasks
 */
describe('AI Performance', () => {
  let orchestrator: AIOrchestrator;
  let codeGenerator: CodeGeneratorAgent;
  let planner: PlannerAgent;
  const testProjectPath = '/test/ai-performance';

  beforeEach(() => {
    orchestrator = new AIOrchestrator(testProjectPath);
    codeGenerator = new CodeGeneratorAgent();
    planner = new PlannerAgent();
  });

  describe('Planning Performance', () => {
    it('should generate task plan in under 10 seconds', async () => {
      const prompt = 'Add authentication to the user service with JWT and password reset';
      const context = {
        files: ['/test/project/src/user-service.ts'],
        projectInfo: { frameworks: ['express', 'typescript'] },
      };

      const startTime = performance.now();
      const plan = await orchestrator.planTask(prompt, context as any);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 seconds

      console.log(`Task planning completed in ${duration.toFixed(2)}ms`);
      console.log(`Tasks generated: ${plan.tasks.length}`);
    });

    it('should handle complex prompts efficiently', async () => {
      const prompt = `
        Create a complete e-commerce platform with:
        - User authentication and authorization
        - Product catalog with search and filters
        - Shopping cart and checkout
        - Payment processing with Stripe
        - Order management
        - Admin dashboard
      `;
      const context = { files: [], projectInfo: {} };

      const startTime = performance.now();
      const plan = await orchestrator.planTask(prompt, context as any);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Complex prompts may take longer but should still be reasonable
      expect(duration).toBeLessThan(30000); // 30 seconds

      console.log(`Complex planning completed in ${duration.toFixed(2)}ms`);
      console.log(`Tasks generated: ${plan.tasks.length}`);
    });
  });

  describe('Code Generation Performance', () => {
    it('should generate service code in under 5 seconds', async () => {
      const spec = {
        name: 'AuthService',
        type: 'auth',
        features: ['jwt', 'registration'],
      };

      const startTime = performance.now();
      const result = await codeGenerator.generateService(spec);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5 seconds

      console.log(`Service generation completed in ${duration.toFixed(2)}ms`);
      console.log(`Files generated: ${result.files?.length || 0}`);
    });

    it('should generate component code quickly', async () => {
      const spec = {
        name: 'UserProfile',
        type: 'component',
        props: ['userId', 'showEmail'],
      };

      const startTime = performance.now();
      const result = await codeGenerator.generateComponent(spec);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000); // 3 seconds

      console.log(`Component generation completed in ${duration.toFixed(2)}ms`);
    });

    it('should generate API endpoints efficiently', async () => {
      const spec = {
        path: '/api/users',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        authentication: true,
      };

      const startTime = performance.now();
      const result = await codeGenerator.generateAPIEndpoint(spec);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(4000); // 4 seconds

      console.log(`API generation completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Caching Performance', () => {
    it('should return cached responses instantly', async () => {
      const prompt = 'Generate a simple Express server';
      const context = { files: [], projectInfo: {} };

      // First request (uncached)
      const startTime1 = performance.now();
      await orchestrator.planTask(prompt, context as any);
      const endTime1 = performance.now();
      const duration1 = endTime1 - startTime1;

      // Second request (cached)
      const startTime2 = performance.now();
      await orchestrator.planTask(prompt, context as any);
      const endTime2 = performance.now();
      const duration2 = endTime2 - startTime2;

      // Cached response should be much faster
      expect(duration2).toBeLessThan(100); // 100ms
      expect(duration2).toBeLessThan(duration1 * 0.1); // At least 10x faster

      console.log(`Uncached: ${duration1.toFixed(2)}ms`);
      console.log(`Cached: ${duration2.toFixed(2)}ms`);
      console.log(`Speedup: ${(duration1 / duration2).toFixed(2)}x`);
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple code generations in parallel', async () => {
      const specs = [
        { name: 'Service1', type: 'api' },
        { name: 'Service2', type: 'api' },
        { name: 'Service3', type: 'api' },
        { name: 'Service4', type: 'api' },
        { name: 'Service5', type: 'api' },
      ];

      const startTime = performance.now();

      await Promise.all(
        specs.map(spec => codeGenerator.generateService(spec))
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Parallel execution should be faster than sequential
      console.log(`5 services generated in parallel: ${duration.toFixed(2)}ms`);
      console.log(`Average per service: ${(duration / 5).toFixed(2)}ms`);

      // Should complete in reasonable time
      expect(duration).toBeLessThan(15000); // 15 seconds for 5 services
    });
  });

  describe('Token Usage Optimization', () => {
    it('should minimize token usage for simple tasks', async () => {
      const prompt = 'Add a console.log statement';
      const context = { files: ['test.ts'], projectInfo: {} };

      const startTime = performance.now();
      const cost = await orchestrator.estimateCost(prompt);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Cost estimation should be fast
      expect(duration).toBeLessThan(100); // 100ms

      // Cost should be low for simple tasks
      expect(cost).toBeLessThan(0.01); // Less than 1 cent

      console.log(`Cost estimation: ${duration.toFixed(2)}ms`);
      console.log(`Estimated cost: $${cost.toFixed(4)}`);
    });

    it('should use appropriate models for task complexity', async () => {
      const simpleTasks = [
        'Add a comment',
        'Rename variable',
        'Format code',
      ];

      const complexTasks = [
        'Refactor entire service architecture',
        'Implement complex algorithm',
        'Generate comprehensive test suite',
      ];

      // Simple tasks should use cheaper models
      for (const task of simpleTasks) {
        const model = orchestrator.selectModel(task as any);
        expect(model).toBe('gpt-3.5-turbo');
      }

      // Complex tasks should use more capable models
      for (const task of complexTasks) {
        const model = orchestrator.selectModel(task as any);
        expect(['gpt-4-turbo', 'claude-3-opus']).toContain(model);
      }
    });
  });

  describe('Context Management', () => {
    it('should build context efficiently', async () => {
      const files = Array.from({ length: 100 }, (_, i) => `/test/file${i}.ts`);

      const startTime = performance.now();
      const context = await orchestrator['contextManager'].buildContext(files);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Context building should be fast even for many files
      expect(duration).toBeLessThan(1000); // 1 second

      console.log(`Context built for 100 files in ${duration.toFixed(2)}ms`);
    });

    it('should compress large contexts', async () => {
      const largeContext = {
        files: Array.from({ length: 1000 }, (_, i) => `/test/file${i}.ts`),
        projectInfo: { frameworks: ['express', 'react', 'typescript'] },
      };

      const startTime = performance.now();
      const compressed = await orchestrator['contextManager'].compressContext(largeContext);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 500ms

      // Compressed context should be smaller
      const originalSize = JSON.stringify(largeContext).length;
      const compressedSize = JSON.stringify(compressed).length;

      expect(compressedSize).toBeLessThan(originalSize * 0.5); // At least 50% reduction

      console.log(`Context compression: ${duration.toFixed(2)}ms`);
      console.log(`Size reduction: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limits gracefully', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        prompt: `Generate service ${i}`,
        context: { files: [], projectInfo: {} },
      }));

      const startTime = performance.now();

      // Make many requests quickly
      const results = await Promise.allSettled(
        requests.map(req => orchestrator.planTask(req.prompt, req.context as any))
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // All requests should eventually succeed
      const successful = results.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBe(10);

      console.log(`10 requests completed in ${duration.toFixed(2)}ms`);
      console.log(`Average per request: ${(duration / 10).toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during AI operations', async () => {
      const memBefore = process.memoryUsage().heapUsed;

      // Perform many AI operations
      for (let i = 0; i < 50; i++) {
        await orchestrator.planTask('Simple task', { files: [], projectInfo: {} } as any);
      }

      // Force garbage collection
      global.gc && global.gc();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const memAfter = process.memoryUsage().heapUsed;
      const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB

      // Memory increase should be reasonable
      expect(memIncrease).toBeLessThan(100); // Less than 100MB increase

      console.log(`Memory increase after 50 operations: ${memIncrease.toFixed(2)}MB`);
    });
  });
});
