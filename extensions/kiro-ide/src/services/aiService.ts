import { Task } from '../parsers/taskParser';

export interface AIResponse {
  suggestion: string;
  confidence: number;
  reasoning: string;
}

export class AIService {
  private apiUrl: string;
  private authHeader?: { Authorization: string };

  constructor(apiUrl: string, authHeader?: { Authorization: string }) {
    this.apiUrl = apiUrl;
    this.authHeader = authHeader;
  }

  /**
   * Get AI suggestion for task
   */
  async getSuggestion(task: Task): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/ai/task-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authHeader || {}),
        },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          requirements: task.requirements,
          completed: task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`AI suggestion failed: ${error}`);
    }
  }

  /**
   * Generate learning path for tasks
   */
  async generateLearningPath(tasks: Task[]): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/ai/learning-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authHeader || {}),
        },
        body: JSON.stringify({
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            requirements: t.requirements,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate learning path');
      }

      const data = await response.json();
      return data.path;
    } catch (error) {
      throw new Error(`Learning path generation failed: ${error}`);
    }
  }

  /**
   * Get task recommendations
   */
  async getRecommendations(completedTasks: Task[]): Promise<Task[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authHeader || {}),
        },
        body: JSON.stringify({
          completedTasks: completedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            requirements: t.requirements,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      throw new Error(`Recommendations failed: ${error}`);
    }
  }

  /**
   * Analyze task complexity
   */
  async analyzeComplexity(task: Task): Promise<{
    complexity: 'low' | 'medium' | 'high';
    estimatedTime: number;
    reasoning: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/ai/analyze-complexity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authHeader || {}),
        },
        body: JSON.stringify({
          title: task.title,
          requirements: task.requirements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze complexity');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Complexity analysis failed: ${error}`);
    }
  }
}
