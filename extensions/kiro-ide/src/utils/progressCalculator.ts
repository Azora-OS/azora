import { Task } from '../parsers/taskParser';

export class ProgressCalculator {
  /**
   * Calculate progress percentage
   */
  static calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) {
      return 0;
    }

    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  /**
   * Calculate progress excluding optional tasks
   */
  static calculateProgressExcludingOptional(tasks: Task[]): number {
    const requiredTasks = tasks.filter((t) => !t.optional);

    if (requiredTasks.length === 0) {
      return 0;
    }

    const completed = requiredTasks.filter((t) => t.completed).length;
    return Math.round((completed / requiredTasks.length) * 100);
  }

  /**
   * Get progress summary
   */
  static getProgressSummary(tasks: Task[]): {
    total: number;
    completed: number;
    remaining: number;
    optional: number;
    percentage: number;
  } {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const optional = tasks.filter((t) => t.optional).length;
    const remaining = total - completed;
    const percentage = this.calculateProgress(tasks);

    return {
      total,
      completed,
      remaining,
      optional,
      percentage,
    };
  }

  /**
   * Estimate time to completion
   */
  static estimateTimeToCompletion(tasks: Task[], avgTimePerTask: number = 30): number {
    const remaining = tasks.filter((t) => !t.completed && !t.optional).length;
    return remaining * avgTimePerTask;
  }
}
