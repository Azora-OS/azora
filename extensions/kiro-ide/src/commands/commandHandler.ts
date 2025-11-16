import * as vscode from 'vscode';
import * as path from 'path';
import { TaskParser, Task } from '../parsers/taskParser';
import { TaskTreeProvider } from '../providers/taskTreeProvider';

export class CommandHandler {
  constructor(private taskTreeProvider: TaskTreeProvider) {}

  async openTasksFile(): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    const taskFiles = TaskParser.findTaskFiles(workspaceRoot);

    if (taskFiles.length === 0) {
      vscode.window.showWarningMessage('No tasks.md files found in .kiro/specs');
      return;
    }

    if (taskFiles.length === 1) {
      await this.openFile(taskFiles[0]);
    } else {
      const selected = await vscode.window.showQuickPick(
        taskFiles.map((f) => ({
          label: path.basename(path.dirname(f)),
          description: f,
          filePath: f,
        })),
        { placeHolder: 'Select a tasks file' }
      );

      if (selected) {
        await this.openFile(selected.filePath);
      }
    }
  }

  async toggleTask(task: Task): Promise<void> {
    try {
      await TaskParser.updateTaskStatus(task.filePath, task.lineNumber, !task.completed);
      await this.taskTreeProvider.refresh();

      const status = !task.completed ? 'completed' : 'reopened';
      vscode.window.showInformationMessage(`Task ${status}: ${task.title}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to update task: ${error}`);
    }
  }

  async startTask(task: Task): Promise<void> {
    if (task.completed) {
      vscode.window.showWarningMessage('Task is already completed');
      return;
    }

    // Open the tasks file
    await this.openFile(task.filePath);

    // Show task details
    vscode.window.showInformationMessage(`Started task: ${task.title}`);
  }

  async completeTask(task: Task): Promise<void> {
    if (task.completed) {
      vscode.window.showWarningMessage('Task is already completed');
      return;
    }

    try {
      await TaskParser.updateTaskStatus(task.filePath, task.lineNumber, true);
      await this.taskTreeProvider.refresh();

      vscode.window.showInformationMessage(`✓ Task completed: ${task.title}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to complete task: ${error}`);
    }
  }

  async showDashboard(): Promise<void> {
    // TODO: Implement dashboard webview
    vscode.window.showInformationMessage('Dashboard feature coming soon!');
  }

  private async openFile(filePath: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
  }
}
