import { AIOrchestrator, AIContext } from './AIOrchestrator';

export interface Task {
  id: string;
  description: string;
  type: 'create' | 'modify' | 'delete' | 'refactor';
  targetFiles: string[];
  dependencies: string[];
  rollbackPoint: string;
  estimatedDuration: number;
}

export interface TaskDAG {
  tasks: Task[];
  dependencies: Map<string, string[]>;
  rollbackPoints: string[];
  estimatedDuration: number;
}

export class PlannerAgent {
  private aiOrchestrator: AIOrchestrator;

  constructor(aiOrchestrator: AIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  async planTask(userPrompt: string, context: AIContext): Promise<TaskDAG> {
    console.log('Planning task:', userPrompt);

    // Generate plan using AI
    const planningPrompt = this.buildPlanningPrompt(userPrompt);
    const response = await this.aiOrchestrator.generateCode(planningPrompt, context);

    // Parse AI response into tasks
    const tasks = this.parsePlan(response.content);

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(tasks);

    // Calculate estimated duration
    const estimatedDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);

    // Identify rollback points
    const rollbackPoints = tasks.map(task => task.rollbackPoint);

    return {
      tasks,
      dependencies,
      rollbackPoints,
      estimatedDuration,
    };
  }

  private buildPlanningPrompt(userPrompt: string): string {
    return `
You are a software development planner. Break down the following task into a series of concrete, actionable steps.

Task: ${userPrompt}

For each step, provide:
1. A clear description of what needs to be done
2. The type of operation (create, modify, delete, refactor)
3. Which files will be affected
4. Dependencies on other steps
5. Estimated duration in minutes

Format your response as a JSON array of tasks:
[
  {
    "id": "task-1",
    "description": "Create user model with TypeScript interfaces",
    "type": "create",
    "targetFiles": ["src/models/User.ts"],
    "dependencies": [],
    "estimatedDuration": 5
  },
  {
    "id": "task-2",
    "description": "Implement user service with CRUD operations",
    "type": "create",
    "targetFiles": ["src/services/UserService.ts"],
    "dependencies": ["task-1"],
    "estimatedDuration": 10
  }
]

Important:
- Each task should be small and focused (5-15 minutes)
- Tasks should build on each other incrementally
- Include proper error handling and validation
- Follow TypeScript and modern JavaScript best practices
`;
  }

  private parsePlan(aiResponse: string): Task[] {
    try {
      // Extract JSON from response (AI might include explanation text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.map((task: any, index: number) => ({
        id: task.id || `task-${index + 1}`,
        description: task.description,
        type: task.type || 'modify',
        targetFiles: task.targetFiles || [],
        dependencies: task.dependencies || [],
        rollbackPoint: `rollback-${task.id || index + 1}`,
        estimatedDuration: task.estimatedDuration || 10,
      }));
    } catch (error) {
      console.error('Failed to parse AI plan:', error);
      
      // Fallback: create a single task
      return [{
        id: 'task-1',
        description: 'Complete the requested task',
        type: 'modify',
        targetFiles: [],
        dependencies: [],
        rollbackPoint: 'rollback-1',
        estimatedDuration: 15,
      }];
    }
  }

  private buildDependencyGraph(tasks: Task[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const task of tasks) {
      graph.set(task.id, task.dependencies);
    }
    
    return graph;
  }

  getExecutionOrder(dag: TaskDAG): Task[] {
    const { tasks, dependencies } = dag;
    const executed = new Set<string>();
    const order: Task[] = [];

    // Topological sort
    const visit = (taskId: string) => {
      if (executed.has(taskId)) return;

      const deps = dependencies.get(taskId) || [];
      for (const depId of deps) {
        visit(depId);
      }

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        order.push(task);
        executed.add(taskId);
      }
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return order;
  }

  validateDAG(dag: TaskDAG): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const deps = dag.dependencies.get(taskId) || [];
      for (const depId of deps) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of dag.tasks) {
      if (!visited.has(task.id) && hasCycle(task.id)) {
        errors.push(`Circular dependency detected involving task: ${task.id}`);
      }
    }

    // Check for missing dependencies
    for (const task of dag.tasks) {
      for (const depId of task.dependencies) {
        if (!dag.tasks.find(t => t.id === depId)) {
          errors.push(`Task ${task.id} depends on non-existent task: ${depId}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
