import * as fs from 'fs';
import * as path from 'path';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  optional: boolean;
  level: number;
  parent?: string;
  requirements?: string[];
  description?: string;
  filePath: string;
  lineNumber: number;
}

export interface TaskFile {
  path: string;
  title: string;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
}

export class TaskParser {
  /**
   * Parse a tasks.md file and extract task structure
   */
  static parseTaskFile(filePath: string): TaskFile {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const taskFile: TaskFile = {
      path: filePath,
      title: this.extractTitle(lines),
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
    };

    let currentParentId: string | undefined;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;

      // Skip non-task lines
      if (!line.includes('- [')) {
        continue;
      }

      const task = this.parseLine(line, lineNumber, filePath);
      if (task) {
        // Determine parent based on indentation
        const indentation = line.search(/\S/);
        if (indentation > 0) {
          task.parent = currentParentId;
          task.level = indentation / 2;
        } else {
          task.level = 0;
          currentParentId = task.id;
        }

        taskFile.tasks.push(task);
        taskFile.totalTasks++;

        if (task.completed) {
          taskFile.completedTasks++;
        }
      }
    }

    return taskFile;
  }

  /**
   * Parse a single line to extract task information
   */
  private static parseLine(line: string, lineNumber: number, filePath: string): Task | null {
    // Match checkbox pattern: - [x] or - [ ]
    const checkboxMatch = line.match(/- \[([ xX])\]\s*(.+?)(?:\s*\*)?(?:\s*_Requirements:(.+?)_)?$/);

    if (!checkboxMatch) {
      return null;
    }

    const [, checkbox, title, requirementsStr] = checkboxMatch;
    const completed = checkbox.toLowerCase() === 'x';
    const optional = line.includes('*');

    const task: Task = {
      id: `${path.basename(filePath)}:${lineNumber}`,
      title: title.trim(),
      completed,
      optional,
      level: 0,
      filePath,
      lineNumber,
    };

    // Parse requirements
    if (requirementsStr) {
      task.requirements = requirementsStr
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
    }

    return task;
  }

  /**
   * Extract title from markdown file
   */
  private static extractTitle(lines: string[]): string {
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return 'Tasks';
  }

  /**
   * Update task status in file
   */
  static async updateTaskStatus(
    filePath: string,
    lineNumber: number,
    completed: boolean
  ): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const line = lines[lineNumber - 1];
      const checkbox = completed ? '[x]' : '[ ]';
      lines[lineNumber - 1] = line.replace(/- \[[xX ]\]/, `- ${checkbox}`);

      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    }
  }

  /**
   * Find all tasks.md files in workspace
   */
  static findTaskFiles(workspaceRoot: string): string[] {
    const taskFiles: string[] = [];
    const specsDir = path.join(workspaceRoot, '.kiro', 'specs');

    if (!fs.existsSync(specsDir)) {
      return taskFiles;
    }

    const walkDir = (dir: string): void => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file === 'tasks.md') {
          taskFiles.push(filePath);
        }
      }
    };

    walkDir(specsDir);
    return taskFiles;
  }
}
