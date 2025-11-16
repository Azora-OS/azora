import * as vscode from 'vscode';
import * as path from 'path';
import { TaskTreeProvider } from '../providers/taskTreeProvider';

export class TaskFileWatcher {
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | undefined;

  constructor(private taskTreeProvider: TaskTreeProvider) {}

  async start(): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      return;
    }

    const pattern = new vscode.RelativePattern(workspaceRoot, '.kiro/specs/**/tasks.md');

    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    // Watch for file changes
    this.fileWatcher.onDidChange(() => {
      this.debounceRefresh();
    });

    // Watch for file creation
    this.fileWatcher.onDidCreate(() => {
      this.debounceRefresh();
    });

    // Watch for file deletion
    this.fileWatcher.onDidDelete(() => {
      this.debounceRefresh();
    });
  }

  private debounceRefresh(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.taskTreeProvider.refresh();
    }, 500);
  }

  stop(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
