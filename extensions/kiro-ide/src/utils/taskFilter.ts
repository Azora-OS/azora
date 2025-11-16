import { Task } from '../parsers/taskParser';

export interface FilterOptions {
  completed?: boolean;
  optional?: boolean;
  searchText?: string;
  requirements?: string[];
  level?: number;
}

export class TaskFilter {
  /**
   * Filter tasks based on options
   */
  static filter(tasks: Task[], options: FilterOptions): Task[] {
    return tasks.filter((task) => {
      // Filter by completion status
      if (options.completed !== undefined && task.completed !== options.completed) {
        return false;
      }

      // Filter by optional status
      if (options.optional !== undefined && task.optional !== options.optional) {
        return false;
      }

      // Filter by search text
      if (options.searchText) {
        const searchLower = options.searchText.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filter by requirements
      if (options.requirements && options.requirements.length > 0) {
        const hasAllRequirements = options.requirements.every((req) =>
          task.requirements?.includes(req)
        );
        if (!hasAllRequirements) {
          return false;
        }
      }

      // Filter by level
      if (options.level !== undefined && task.level !== options.level) {
        return false;
      }

      return true;
    });
  }

  /**
   * Search tasks by text
   */
  static search(tasks: Task[], searchText: string): Task[] {
    return this.filter(tasks, { searchText });
  }

  /**
   * Get incomplete tasks
   */
  static getIncomplete(tasks: Task[]): Task[] {
    return this.filter(tasks, { completed: false });
  }

  /**
   * Get completed tasks
   */
  static getCompleted(tasks: Task[]): Task[] {
    return this.filter(tasks, { completed: true });
  }

  /**
   * Get optional tasks
   */
  static getOptional(tasks: Task[]): Task[] {
    return this.filter(tasks, { optional: true });
  }

  /**
   * Get required tasks
   */
  static getRequired(tasks: Task[]): Task[] {
    return this.filter(tasks, { optional: false });
  }

  /**
   * Get tasks by requirement
   */
  static getByRequirement(tasks: Task[], requirement: string): Task[] {
    return tasks.filter((task) => task.requirements?.includes(requirement));
  }

  /**
   * Get tasks by level
   */
  static getByLevel(tasks: Task[], level: number): Task[] {
    return this.filter(tasks, { level });
  }

  /**
   * Sort tasks
   */
  static sort(
    tasks: Task[],
    sortBy: 'title' | 'status' | 'level' | 'lineNumber' = 'lineNumber'
  ): Task[] {
    const sorted = [...tasks];

    switch (sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'status':
        sorted.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
        break;
      case 'level':
        sorted.sort((a, b) => a.level - b.level);
        break;
      case 'lineNumber':
        sorted.sort((a, b) => a.lineNumber - b.lineNumber);
        break;
    }

    return sorted;
  }
}
