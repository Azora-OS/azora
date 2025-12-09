/**
 * GitService - Git integration using isomorphic-git
 * 
 * Provides Git operations including commit, push, pull, branch management,
 * and merge operations for AzStudio projects.
 */

import * as git from 'isomorphic-git';
import * as fs from 'fs-extra';
import * as path from 'path';
import http from 'isomorphic-git/http/node';

export interface GitConfig {
  name: string;
  email: string;
}

export interface GitStatus {
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  staged: string[];
}

export interface GitCommit {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  committer: {
    name: string;
    email: string;
    timestamp: number;
  };
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
}

export interface GitRemote {
  name: string;
  url: string;
}

export interface GitCredentials {
  username: string;
  password: string; // Can be personal access token
}

export class GitService {
  private dir: string;
  private fs: typeof fs;

  constructor(projectPath: string) {
    this.dir = projectPath;
    this.fs = fs;
  }

  /**
   * Initialize a new Git repository
   */
  async init(): Promise<void> {
    await git.init({
      fs: this.fs,
      dir: this.dir,
      defaultBranch: 'main',
    });
  }

  /**
   * Check if directory is a Git repository
   */
  async isRepo(): Promise<boolean> {
    try {
      const gitDir = path.join(this.dir, '.git');
      return await fs.pathExists(gitDir);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    return await git.currentBranch({
      fs: this.fs,
      dir: this.dir,
      fullname: false,
    }) || 'main';
  }

  /**
   * List all branches
   */
  async listBranches(): Promise<GitBranch[]> {
    const branches = await git.listBranches({
      fs: this.fs,
      dir: this.dir,
    });

    const currentBranch = await this.getCurrentBranch();
    
    const branchesWithInfo: GitBranch[] = [];
    for (const branch of branches) {
      const commit = await git.resolveRef({
        fs: this.fs,
        dir: this.dir,
        ref: branch,
      });

      branchesWithInfo.push({
        name: branch,
        current: branch === currentBranch,
        commit,
      });
    }

    return branchesWithInfo;
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string, checkout: boolean = false): Promise<void> {
    await git.branch({
      fs: this.fs,
      dir: this.dir,
      ref: branchName,
    });

    if (checkout) {
      await this.checkoutBranch(branchName);
    }
  }

  /**
   * Checkout a branch
   */
  async checkoutBranch(branchName: string): Promise<void> {
    await git.checkout({
      fs: this.fs,
      dir: this.dir,
      ref: branchName,
    });
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    await git.deleteBranch({
      fs: this.fs,
      dir: this.dir,
      ref: branchName,
    });
  }

  /**
   * Get repository status
   */
  async status(): Promise<GitStatus> {
    const FILE = 0, WORKDIR = 2, STAGE = 3;
    
    const statusMatrix = await git.statusMatrix({
      fs: this.fs,
      dir: this.dir,
    });

    const status: GitStatus = {
      modified: [],
      added: [],
      deleted: [],
      untracked: [],
      staged: [],
    };

    for (const [filepath, head, workdir, stage] of statusMatrix) {
      // Untracked files
      if (head === 0 && workdir === 2 && stage === 0) {
        status.untracked.push(filepath);
      }
      // Modified files
      else if (head === 1 && workdir === 2 && stage === 1) {
        status.modified.push(filepath);
      }
      // Deleted files
      else if (head === 1 && workdir === 0 && stage === 1) {
        status.deleted.push(filepath);
      }
      // Staged files
      else if (stage === 2) {
        status.staged.push(filepath);
      }
      // Added files
      else if (head === 0 && (workdir as any) === 2 && (stage as any) === 2) {
        status.added.push(filepath);
      }
    }

    return status;
  }

  /**
   * Stage files
   */
  async add(filepaths: string[]): Promise<void> {
    for (const filepath of filepaths) {
      await git.add({
        fs: this.fs,
        dir: this.dir,
        filepath,
      });
    }
  }

  /**
   * Unstage files
   */
  async remove(filepaths: string[]): Promise<void> {
    for (const filepath of filepaths) {
      await git.remove({
        fs: this.fs,
        dir: this.dir,
        filepath,
      });
    }
  }

  /**
   * Commit staged changes
   */
  async commit(message: string, config: GitConfig): Promise<string> {
    const sha = await git.commit({
      fs: this.fs,
      dir: this.dir,
      message,
      author: {
        name: config.name,
        email: config.email,
      },
    });

    return sha;
  }

  /**
   * Get commit history
   */
  async log(depth: number = 50): Promise<GitCommit[]> {
    const commits = await git.log({
      fs: this.fs,
      dir: this.dir,
      depth,
    });

    return commits.map(commit => ({
      oid: commit.oid,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        timestamp: commit.commit.author.timestamp,
      },
      committer: {
        name: commit.commit.committer.name,
        email: commit.commit.committer.email,
        timestamp: commit.commit.committer.timestamp,
      },
    }));
  }

  /**
   * Add a remote repository
   */
  async addRemote(name: string, url: string): Promise<void> {
    await git.addRemote({
      fs: this.fs,
      dir: this.dir,
      remote: name,
      url,
    });
  }

  /**
   * List remote repositories
   */
  async listRemotes(): Promise<GitRemote[]> {
    const remotes = await git.listRemotes({
      fs: this.fs,
      dir: this.dir,
    });

    return remotes.map(remote => ({
      name: remote.remote,
      url: remote.url,
    }));
  }

  /**
   * Remove a remote repository
   */
  async deleteRemote(name: string): Promise<void> {
    await git.deleteRemote({
      fs: this.fs,
      dir: this.dir,
      remote: name,
    });
  }

  /**
   * Push to remote repository
   */
  async push(
    remote: string = 'origin',
    branch?: string,
    credentials?: GitCredentials
  ): Promise<void> {
    const currentBranch = branch || await this.getCurrentBranch();

    const onAuth = credentials ? () => ({
      username: credentials.username,
      password: credentials.password,
    }) : undefined;

    await git.push({
      fs: this.fs,
      http,
      dir: this.dir,
      remote,
      ref: currentBranch,
      onAuth,
    });
  }

  /**
   * Pull from remote repository
   */
  async pull(
    remote: string = 'origin',
    branch?: string,
    credentials?: GitCredentials,
    config?: GitConfig
  ): Promise<void> {
    const currentBranch = branch || await this.getCurrentBranch();

    const onAuth = credentials ? () => ({
      username: credentials.username,
      password: credentials.password,
    }) : undefined;

    await git.pull({
      fs: this.fs,
      http,
      dir: this.dir,
      remote,
      ref: currentBranch,
      onAuth,
      author: config ? {
        name: config.name,
        email: config.email,
      } : undefined,
    });
  }

  /**
   * Fetch from remote repository
   */
  async fetch(
    remote: string = 'origin',
    credentials?: GitCredentials
  ): Promise<void> {
    const onAuth = credentials ? () => ({
      username: credentials.username,
      password: credentials.password,
    }) : undefined;

    await git.fetch({
      fs: this.fs,
      http,
      dir: this.dir,
      remote,
      onAuth,
    });
  }

  /**
   * Merge a branch into current branch
   */
  async merge(
    theirBranch: string,
    config: GitConfig
  ): Promise<void> {
    await git.merge({
      fs: this.fs,
      dir: this.dir,
      ours: await this.getCurrentBranch(),
      theirs: theirBranch,
      author: {
        name: config.name,
        email: config.email,
      },
    });
  }

  /**
   * Clone a repository
   */
  static async clone(
    url: string,
    dir: string,
    credentials?: GitCredentials
  ): Promise<GitService> {
    const onAuth = credentials ? () => ({
      username: credentials.username,
      password: credentials.password,
    }) : undefined;

    await git.clone({
      fs,
      http,
      dir,
      url,
      onAuth,
      singleBranch: true,
      depth: 1,
    });

    return new GitService(dir);
  }

  /**
   * Get diff for a file
   */
  async getDiff(filepath: string): Promise<string> {
    // Get the current content
    const workdirContent = await fs.readFile(
      path.join(this.dir, filepath),
      'utf8'
    );

    // Get the HEAD content
    let headContent = '';
    try {
      const oid = await git.resolveRef({
        fs: this.fs,
        dir: this.dir,
        ref: 'HEAD',
      });

      const { blob } = await git.readBlob({
        fs: this.fs,
        dir: this.dir,
        oid,
        filepath,
      });

      headContent = new TextDecoder().decode(blob);
    } catch (error) {
      // File doesn't exist in HEAD (new file)
      headContent = '';
    }

    // Simple diff - in production, use a proper diff library
    return `--- a/${filepath}\n+++ b/${filepath}\n${this.simpleDiff(headContent, workdirContent)}`;
  }

  /**
   * Simple diff implementation (for basic visualization)
   */
  private simpleDiff(oldText: string, newText: string): string {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    let diff = '';
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        if (oldLine) diff += `- ${oldLine}\n`;
        if (newLine) diff += `+ ${newLine}\n`;
      }
    }
    
    return diff;
  }

  /**
   * Check for merge conflicts
   */
  async hasConflicts(): Promise<boolean> {
    try {
      const conflictFiles = await fs.readdir(path.join(this.dir, '.git', 'MERGE_HEAD'));
      return conflictFiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of conflicted files
   */
  async getConflicts(): Promise<string[]> {
    const status = await this.status();
    // In a real implementation, we'd check for conflict markers
    // For now, return empty array
    return [];
  }
}
