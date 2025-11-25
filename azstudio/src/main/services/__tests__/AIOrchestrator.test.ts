import { AIOrchestrator, Task, TaskDAG, AIModel } from '../AIOrchestrator';
import { ContextManager } from '../ContextManager';
import { PlannerAgent } from '../PlannerAgent';
import { CodeGeneratorAgent } from '../CodeGeneratorAgent';

// Mock dependencies
jest.mock('../ContextManager');
jest.mock('../PlannerAgent');
jest.mock('../CodeGeneratorAgent');

describe('AIOrchestrator', () => {
  let orchestrator: AIOrchestrator;
  let mockContextManager: jest.Mocked<ContextManager>;
  let mockPlannerAgent: jest.Mocked<PlannerAgent>;
  let mockCodeGenerator: jest.Mocked<CodeGeneratorAgent>;

  beforeEach(() => {
    mockContextManager = new ContextManager('/test/project') as jest.Mocked<ContextManager>;
    mockPlannerAgent = new PlannerAgent() as jest.Mocked<PlannerAgent>;
    mockCodeGenerator = new CodeGeneratorAgent() as jest.Mocked<CodeGeneratorAgent>;
    
    orchestrator = new AIOrchestrator('/test/project');
    (orchestrator as any).contextManager = mockContextManager;
    (orchestrator as any).plannerAgent = mockPlannerAgent;
    (orchestrator as any).codeGenerator = mockCodeGenerator;
    
    jest.clearAllMocks();
  });

  describe('planTask', () => {
    it('should generate a task DAG from user prompt', async () => {
      const prompt = 'Add authentication to the user service';
      const mockContext = {
        files: ['/test/project/src/user-service.ts'],
        projectInfo: { frameworks: ['express', 'typescript'] },
      };

      const mockDAG: TaskDAG = {
        tasks: [
          {
            id: 'task-1',
            type: 'create-file',
            description: 'Create auth middleware',
            dependencies: [],
            rollbackPoint: 'before-task-1',
            operations: [],
            verification: [],
            estimatedDuration: 30,
          },
        ],
        dependencies: new Map([['task-1', []]]),
        rollbackPoints: ['before-task-1'],
        estimatedDuration: 30,
      };

      mockContextManager.buildContext = jest.fn().mockResolvedValue(mockContext);
      mockPlannerAgent.generatePlan = jest.fn().mockResolvedValue(mockDAG);

      const result = await orchestrator.planTask(prompt, mockContext as any);

      expect(result).toBeDefined();
      expect(result.tasks.length).toBe(1);
      expect(result.tasks[0].description).toBe('Create auth middleware');
      expect(mockContextManager.buildContext).toHaveBeenCalled();
      expect(mockPlannerAgent.generatePlan).toHaveBeenCalledWith(prompt, mockContext);
    });

    it('should handle planning errors gracefully', async () => {
      const prompt = 'Invalid task';
      const mockContext = { files: [], projectInfo: {} };

      mockContextManager.buildContext = jest.fn().mockResolvedValue(mockContext);
      mockPlannerAgent.generatePlan = jest.fn().mockRejectedValue(new Error('Planning failed'));

      await expect(orchestrator.planTask(prompt, mockContext as any)).rejects.toThrow('Planning failed');
    });
  });

  describe('executeTask', () => {
    it('should execute a task successfully', async () => {
      const task: Task = {
        id: 'task-1',
        type: 'create-file',
        description: 'Create test file',
        dependencies: [],
        rollbackPoint: 'before-task-1',
        operations: [
          {
            type: 'create',
            target: '/test/project/src/test.ts',
            action: { code: 'export function test() {}' },
            reversible: true,
          },
        ],
        verification: [],
        estimatedDuration: 10,
      };

      mockCodeGenerator.executeOperation = jest.fn().mockResolvedValue({
        success: true,
        output: 'File created successfully',
      });

      const result = await orchestrator.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.taskId).toBe('task-1');
      expect(mockCodeGenerator.executeOperation).toHaveBeenCalled();
    });

    it('should rollback on execution failure', async () => {
      const task: Task = {
        id: 'task-1',
        type: 'modify-file',
        description: 'Modify test file',
        dependencies: [],
        rollbackPoint: 'before-task-1',
        operations: [
          {
            type: 'modify',
            target: '/test/project/src/test.ts',
            action: { code: 'invalid syntax' },
            reversible: true,
          },
        ],
        verification: [],
        estimatedDuration: 10,
      };

      mockCodeGenerator.executeOperation = jest.fn().mockRejectedValue(new Error('Execution failed'));

      const result = await orchestrator.executeTask(task);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('selectModel', () => {
    it('should select GPT-4 for complex tasks', () => {
      const model = orchestrator.selectModel('refactor');
      expect(model).toBe('gpt-4-turbo');
    });

    it('should select Claude for code generation', () => {
      const model = orchestrator.selectModel('generate-code');
      expect(model).toBe('claude-3-opus');
    });

    it('should select GPT-3.5 for simple tasks', () => {
      const model = orchestrator.selectModel('simple');
      expect(model).toBe('gpt-3.5-turbo');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on prompt length', async () => {
      const prompt = 'Test prompt';
      const cost = await orchestrator.estimateCost(prompt);
      
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should return higher cost for longer prompts', async () => {
      const shortPrompt = 'Short';
      const longPrompt = 'This is a much longer prompt that should cost more to process';
      
      const shortCost = await orchestrator.estimateCost(shortPrompt);
      const longCost = await orchestrator.estimateCost(longPrompt);
      
      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('caching', () => {
    it('should cache AI responses', async () => {
      const prompt = 'Test prompt';
      const response = 'Test response';
      
      await orchestrator.cacheResponse(prompt, response);
      const cached = await orchestrator.getCachedResponse(prompt);
      
      expect(cached).toBe(response);
    });

    it('should return null for uncached prompts', async () => {
      const cached = await orchestrator.getCachedResponse('non-existent');
      expect(cached).toBeNull();
    });
  });
});