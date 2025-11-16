import * as vscode from 'vscode';
import { Task } from '../parsers/taskParser';

export class GitService {
  /**
   * Get current branch name
   */
  static async getCurrentBranch(): Promise<string | undefined> {
    try {
      const git = vscode.extensions.getExtension('vscode.git')?.exports;
      if (!git) {
        return undefined;
      }

      const repo = git.repositories[0];
      if (!repo) {
        return undefined;
      }

      return repo.state.HEAD?.name;
    } catch (error) {
      console.error('Failed to get current branch:', error);
      return undefined;
    }
  }

  /**
   * Create commit with task reference
   */
  static async createCommit(task: Task, message: string): Promise<void> {
    try {
      const git = vscode.extensions.getExtension('vscode.git')?.exports;
      if (!git) {
        throw new Error('Git extension not available');
      }

      const repo = git.repositories[0];
      if (!repo) {
        throw new Error('No git repository found');
      }

      const commitMessage = `${message}\n\nTask: ${task.id}\nTitle: ${task.title}`;

      // Stage all changes
      await repo.add(['.']);

      // Create commit
      await repo.commit(commitMessage);
    } catch (error) {
      throw new Error(`Failed to create commit: ${error}`);
    }
  }

  /**
   * Get commit history for task
   */
  static async getCommitHistory(task: Task): Promise<any[]> {
    try {
      const git = vscode.extensions.getExtension('vscode.git')?.exports;
      if (!git) {
        return [];
      }

      const repo = git.repositories[0];
      if (!repo) {
        return [];
      }

      // This would require more complex git operations
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get commit history:', error);
      return [];
    }
  }

  /**
   * Create branch for task
   */
  static async createBranchForTask(task: Task): Promise<string> {
    try {
      const git = vscode.extensions.getExtension('vscode.git')?.exports;
      if (!git) {
        throw new Error('Git extension not available');
      }

      const repo = git.repositories[0];
      if (!repo) {
        throw new Error('No git repository found');
      }

      // Create branch name from task title
      const branchName = `task/${task.id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

      // Create and checkout branch
      await repo.createBranch(branchName);
      await repo.checkout(branchName);

      return branchName;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  /**
   * Link task to commit
   */
  static async linkTaskToCommit(task: Task, commitHash: string): Promise<void> {
    // This would require backend integration
    // For now, just log the action
    console.log(`Linked task ${task.id} to commit ${commitHash}`);
  }
}
