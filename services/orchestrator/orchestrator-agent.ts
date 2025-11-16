/**
 * Orchestrator Agent (Master)
 * Implements Kiro-style SDD + Cursor-style multi-agent orchestration
 */

import { ConstitutionalAI } from '../constitutional-ai/constitutional-filter';
import { IntentLayer } from './intent-layer';
import { CodeAgent } from './agents/code-agent';
import { TestAgent } from './agents/test-agent';
import { SchemaAgent } from './agents/schema-agent';

export interface Task {
  id: string;
  type: 'code' | 'test' | 'schema' | 'integration';
  description: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface Spec {
  requirements: string;
  design: string;
  tasks: Task[];
}

export class OrchestratorAgent {
  private constitutionalAI: ConstitutionalAI;
  private intentLayer: IntentLayer;
  private codeAgent: CodeAgent;
  private testAgent: TestAgent;
  private schemaAgent: SchemaAgent;

  constructor() {
    this.constitutionalAI = new ConstitutionalAI();
    this.intentLayer = new IntentLayer();
    this.codeAgent = new CodeAgent();
    this.testAgent = new TestAgent();
    this.schemaAgent = new SchemaAgent();
  }

  async executeTask(userIntent: string): Promise<void> {
    const spec = await this.intentLayer.generateSpec(userIntent);
    const approved = await this.constitutionalAI.validateSpec(spec);
    if (!approved.isValid) throw new Error(`Constitutional violation: ${approved.reason}`);
    await this.executeTasksInParallel(spec.tasks);
  }

  private async executeTasksInParallel(tasks: Task[]): Promise<void> {
    const taskGraph = this.buildDependencyGraph(tasks);
    while (taskGraph.length > 0) {
      const readyTasks = taskGraph.filter(t => t.dependencies.length === 0);
      await Promise.all(readyTasks.map(task => this.delegateTask(task)));
      taskGraph.splice(0, readyTasks.length);
    }
  }

  private async delegateTask(task: Task): Promise<void> {
    const agent = this.selectAgent(task.type);
    const result = await agent.execute(task);
    const validated = await this.constitutionalAI.validateOutput(result);
    if (!validated.isValid) throw new Error(`Output violates Ubuntu: ${validated.reason}`);
  }

  private selectAgent(type: Task['type']) {
    switch (type) {
      case 'code': return this.codeAgent;
      case 'test': return this.testAgent;
      case 'schema': return this.schemaAgent;
      default: return this.codeAgent;
    }
  }

  private buildDependencyGraph(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => a.dependencies.length - b.dependencies.length);
  }
}
