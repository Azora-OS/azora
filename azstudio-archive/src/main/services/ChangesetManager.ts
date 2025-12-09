import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete';
  content?: string;
  originalContent?: string;
}

export interface Changeset {
  id: string;
  timestamp: Date;
  description: string;
  files: Map<string, FileChange>;
  rollbackData: RollbackData;
  verified: boolean;
  applied: boolean;
}

export interface RollbackData {
  backupPath: string;
  originalFiles: Map<string, string>; // path -> original content
  createdFiles: string[]; // files that were created (should be deleted on rollback)
}

export interface ChangesetPreview {
  id: string;
  description: string;
  filesAffected: number;
  changes: FileChange[];
  estimatedImpact: 'low' | 'medium' | 'high';
}

export class ChangesetManager {
  private changesets: Map<string, Changeset> = new Map();
  private backupDir: string;

  constructor(projectRoot?: string) {
    this.backupDir = path.join(projectRoot || process.cwd(), '.azstudio', 'backups');
    this.ensureBackupDir();
  }

  /**
   * Ensure backup directory exists
   */
  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a new changeset
   */
  createChangeset(description: string, changes: FileChange[] = []): Changeset {
    const id = this.generateChangesetId();
    const timestamp = new Date();
    const backupPath = path.join(this.backupDir, id);

    // Create backup directory for this changeset
    fs.mkdirSync(backupPath, { recursive: true });

    const filesMap = new Map<string, FileChange>();
    const originalFiles = new Map<string, string>();
    const createdFiles: string[] = [];

    const changeset: Changeset = {
      id,
      timestamp,
      description,
      files: filesMap,
      rollbackData: {
        backupPath,
        originalFiles,
        createdFiles,
      },
      verified: false,
      applied: false,
    };

    this.changesets.set(id, changeset);

    // Process initial changes
    for (const change of changes) {
      this.addChange(id, change);
    }

    return changeset;
  }

  /**
   * Add a change to an existing changeset
   */
  addChange(changesetId: string, change: FileChange): void {
    const changeset = this.changesets.get(changesetId);
    if (!changeset) {
      throw new Error(`Changeset not found: ${changesetId}`);
    }

    if (changeset.applied) {
      throw new Error(`Cannot add changes to applied changeset: ${changesetId}`);
    }

    changeset.files.set(change.path, change);

    if (change.type === 'create') {
      if (!changeset.rollbackData.createdFiles.includes(change.path)) {
        changeset.rollbackData.createdFiles.push(change.path);
      }
    } else if (change.type === 'modify' || change.type === 'delete') {
      // Backup original content if not already backed up
      if (!changeset.rollbackData.originalFiles.has(change.path)) {
        try {
          if (fs.existsSync(change.path)) {
            const originalContent = fs.readFileSync(change.path, 'utf-8');
            changeset.rollbackData.originalFiles.set(change.path, originalContent);
            
            // Save backup to disk
            const backupFilePath = path.join(changeset.rollbackData.backupPath, path.basename(change.path));
            fs.writeFileSync(backupFilePath, originalContent, 'utf-8');
          }
        } catch (error) {
          console.error(`Failed to backup file ${change.path}:`, error);
        }
      }
    }
  }

  /**
   * Commit (apply) a changeset
   */
  async commitChangeset(changesetId: string): Promise<{ success: boolean; error?: string }> {
    return this.applyChangeset(changesetId);
  }

  /**
   * Generate a unique changeset ID
   */
  private generateChangesetId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `cs_${timestamp}_${random}`;
  }

  /**
   * Preview a changeset before applying
   */
  getChangesetPreview(changesetId: string): ChangesetPreview | null {
    const changeset = this.changesets.get(changesetId);
    if (!changeset) {
      return null;
    }

    const changes = Array.from(changeset.files.values());
    const filesAffected = changes.length;

    // Estimate impact based on number of files and types of changes
    let estimatedImpact: 'low' | 'medium' | 'high' = 'low';
    if (filesAffected > 10) {
      estimatedImpact = 'high';
    } else if (filesAffected > 5) {
      estimatedImpact = 'medium';
    }

    // Increase impact if there are deletions
    const hasDeletions = changes.some(c => c.type === 'delete');
    if (hasDeletions && estimatedImpact === 'low') {
      estimatedImpact = 'medium';
    }

    return {
      id: changeset.id,
      description: changeset.description,
      filesAffected,
      changes,
      estimatedImpact,
    };
  }

  /**
   * Apply a changeset
   */
  async applyChangeset(changesetId: string): Promise<{ success: boolean; error?: string }> {
    const changeset = this.changesets.get(changesetId);
    if (!changeset) {
      return { success: false, error: 'Changeset not found' };
    }

    if (changeset.applied) {
      return { success: false, error: 'Changeset already applied' };
    }

    try {
      // Apply each file change
      for (const [filePath, change] of changeset.files) {
        switch (change.type) {
          case 'create':
            await this.createFile(filePath, change.content || '');
            break;
          case 'modify':
            await this.modifyFile(filePath, change.content || '');
            break;
          case 'delete':
            await this.deleteFile(filePath);
            break;
        }
      }

      changeset.applied = true;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Rollback a changeset
   */
  async rollbackChangeset(changesetId: string): Promise<{ success: boolean; error?: string }> {
    const changeset = this.changesets.get(changesetId);
    if (!changeset) {
      return { success: false, error: 'Changeset not found' };
    }

    if (!changeset.applied) {
      return { success: false, error: 'Changeset not applied yet' };
    }

    try {
      const { originalFiles, createdFiles } = changeset.rollbackData;

      // Delete files that were created
      for (const filePath of createdFiles) {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }

      // Restore original content for modified/deleted files
      for (const [filePath, originalContent] of originalFiles) {
        await this.modifyFile(filePath, originalContent);
      }

      changeset.applied = false;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Create a file
   */
  private async createFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Modify a file
   */
  private async modifyFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Delete a file
   */
  private async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  /**
   * Get all changesets
   */
  getAllChangesets(): Changeset[] {
    return Array.from(this.changesets.values());
  }

  /**
   * Get a specific changeset
   */
  getChangeset(changesetId: string): Changeset | undefined {
    return this.changesets.get(changesetId);
  }

  /**
   * Mark changeset as verified
   */
  markAsVerified(changesetId: string): void {
    const changeset = this.changesets.get(changesetId);
    if (changeset) {
      changeset.verified = true;
    }
  }

  /**
   * Delete a changeset and its backup
   */
  async deleteChangeset(changesetId: string): Promise<void> {
    const changeset = this.changesets.get(changesetId);
    if (changeset) {
      // Delete backup directory
      const backupPath = changeset.rollbackData.backupPath;
      if (fs.existsSync(backupPath)) {
        await fs.promises.rm(backupPath, { recursive: true, force: true });
      }

      this.changesets.delete(changesetId);
    }
  }

  /**
   * Get changeset history
   */
  getHistory(limit: number = 10): Changeset[] {
    const changesets = Array.from(this.changesets.values());
    return changesets
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clean up old changesets
   */
  async cleanupOldChangesets(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;
    for (const [id, changeset] of this.changesets) {
      if (changeset.timestamp < cutoffDate) {
        await this.deleteChangeset(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Export changeset to JSON
   */
  exportChangeset(changesetId: string): string | null {
    const changeset = this.changesets.get(changesetId);
    if (!changeset) {
      return null;
    }

    const exportData = {
      id: changeset.id,
      timestamp: changeset.timestamp.toISOString(),
      description: changeset.description,
      files: Array.from(changeset.files.entries()).map(([path, change]) => ({
        path,
        type: change.type,
        content: change.content,
        originalContent: change.originalContent,
      })),
      verified: changeset.verified,
      applied: changeset.applied,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import changeset from JSON
   */
  importChangeset(jsonData: string): Changeset | null {
    try {
      const data = JSON.parse(jsonData);
      
      const files = new Map<string, FileChange>();
      for (const fileData of data.files) {
        files.set(fileData.path, {
          path: fileData.path,
          type: fileData.type,
          content: fileData.content,
          originalContent: fileData.originalContent,
        });
      }

      const changeset: Changeset = {
        id: data.id,
        timestamp: new Date(data.timestamp),
        description: data.description,
        files,
        rollbackData: {
          backupPath: path.join(this.backupDir, data.id),
          originalFiles: new Map(),
          createdFiles: [],
        },
        verified: data.verified,
        applied: data.applied,
      };

      this.changesets.set(changeset.id, changeset);
      return changeset;
    } catch (error) {
      console.error('Failed to import changeset:', error);
      return null;
    }
  }
}
