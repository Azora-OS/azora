import * as vscode from 'vscode';
import * as path from 'path';
import { TaskParser, Task, TaskFile } from '../parsers/taskParser';

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined | null | void> =
    new vscode.EventEmitter<TaskItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private taskFiles: TaskFile[] = [];
  private taskItems: Map<string, TaskItem> = new Map();

  async refresh(): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      return;
    }

    const taskFilePaths = TaskParser.findTaskFiles(workspaceRoot);
    this.taskFiles = taskFilePaths.map((filePath) => TaskParser.parseTaskFile(filePath));

    this.taskItems.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskItem): Thenable<TaskItem[]> {
    if (!element) {
      // Root level - show task files
      return Promise.resolve(
        this.taskFiles.map(
          (taskFile) =>
            new TaskItem(
              taskFile.title,
              vscode.TreeItemCollapsibleState.Collapsed,
              {
                command: 'kiro.openTasksFile',
                title: 'Open Tasks File',
                arguments: [taskFile.path],
              },
              taskFile.path,
              undefined,
              this.getProgressIcon(taskFile.completedTasks, taskFile.totalTasks)
            )
        )
      );
    }

    // Get tasks for this file
    const taskFile = this.taskFiles.find((tf) => tf.path === element.filePath);
    if (!taskFile) {
      return Promise.resolve([]);
    }

    // Get top-level tasks
    const topLevelTasks = taskFile.tasks.filter((t) => t.level === 0);

    return Promise.resolve(
      topLevelTasks.map((task) => this.createTaskItem(task, taskFile.path))
    );
  }

  private createTaskItem(task: Task, filePath: string): TaskItem {
    const icon = task.completed ? '✓' : '○';
    const label = `${icon} ${task.title}${task.optional ? ' *' : ''}`;

    const item = new TaskItem(
      label,
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'kiro.toggleTask',
        title: 'Toggle Task',
        arguments: [task],
      },
      filePath,
      task.id,
      task.completed ? '✓' : '○'
    );

    item.contextValue = task.completed ? 'completedTask' : 'incompleteTask';
    item.tooltip = task.requirements ? `Requirements: ${task.requirements.join(', ')}` : undefined;

    return item;
  }

  private getProgressIcon(completed: number, total: number): string {
    if (total === 0) return '○';
    const percentage = (completed / total) * 100;

    if (percentage === 0) return '○';
    if (percentage < 25) return '◐';
    if (percentage < 50) return '◑';
    if (percentage < 75) return '◕';
    if (percentage < 100) return '◔';
    return '●';
  }
}

export class TaskItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly filePath?: string,
    public readonly taskId?: string,
    public readonly icon?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = new vscode.MarkdownString(`**${label}**`);
  }
}
