/**
 * VersionHistory
 * 
 * Tracks all changes with user attribution, implements version history viewer,
 * supports reverting to previous versions, and enables branching and merging.
 * 
 * Features:
 * - Track all file changes with user attribution
 * - Version history viewer with diffs
 * - Revert to any previous version
 * - Branch and merge support
 * - Conflict resolution
 */

import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FileChange {
  fileId: string;
  filePath: string;
  operation: 'create' | 'modify' | 'delete' | 'rename' | 'move';
  oldContent?: string;
  newContent?: string;
  oldPath?: string;
  newPath?: string;
  diff?: string;
}

export interface Version {
  id: string;
  workspaceId: string;
  branchId: string;
  parentVersionId?: string;
  timestamp: Date;
  user: User;
  message: string;
  changes: FileChange[];
  hash: string;
  tags?: string[];
}

export interface Branch {
  id: string;
  name: string;
  workspaceId: string;
  headVersionId: string;
  createdAt: Date;
  createdBy: User;
  description?: string;
  isDefault: boolean;
}

export interface MergeConflict {
  fileId: string;
  filePath: string;
  baseContent: string;
  sourceContent: string;
  targetContent: string;
  conflictMarkers: ConflictMarker[];
}

export interface ConflictMarker {
  startLine: number;
  endLine: number;
  baseLines: string[];
  sourceLines: string[];
  targetLines: string[];
}

export interface MergeResult {
  success: boolean;
  mergedVersionId?: string;
  conflicts?: MergeConflict[];
  autoMergedFiles: string[];
  conflictedFiles: string[];
}

export interface VersionHistoryOptions {
  workspaceId: string;
  storagePath: string;
  maxVersionsPerFile?: number;
  enableCompression?: boolean;
}

export class VersionHistory extends EventEmitter {
  private workspaceId: string;
  private storagePath: string;
  private versions: Map<string, Version>;
  private branches: Map<string, Branch>;
  private fileVersions: Map<string, string[]>; // fileId -> versionIds
  private options: Required<VersionHistoryOptions>;

  constructor(options: VersionHistoryOptions) {
    super();
    
    this.workspaceId = options.workspaceId;
    this.storagePath = options.storagePath;
    this.versions = new Map();
    this.branches = new Map();
    this.fileVersions = new Map();
    
    this.options = {
      workspaceId: options.workspaceId,
      storagePath: options.storagePath,
      maxVersionsPerFile: options.maxVersionsPerFile || 1000,
      enableCompression: options.enableCompression !== false
    };
  }

  /**
   * Initialize version history storage
   */
  async initialize(): Promise<void> {
    try {
      // Create storage directory
      await fs.mkdir(this.storagePath, { recursive: true });
      
      // Load existing versions and branches
      await this.loadVersions();
      await this.loadBranches();
      
      // Create default branch if none exists
      if (this.branches.size === 0) {
        await this.createBranch('main', {
          id: 'system',
          name: 'System',
          email: 'system@azstudio.local'
        }, 'Default branch', true);
      }
      
      this.emit('initialized', { workspaceId: this.workspaceId });
    } catch (error) {
      console.error('Failed to initialize version history:', error);
      throw error;
    }
  }

  /**
   * Create a new version from file changes
   */
  async createVersion(
    user: User,
    branchId: string,
    message: string,
    changes: FileChange[],
    tags?: string[]
  ): Promise<Version> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    // Generate version ID and hash
    const versionId = this.generateVersionId();
    const hash = this.generateHash(changes);

    // Create version
    const version: Version = {
      id: versionId,
      workspaceId: this.workspaceId,
      branchId,
      parentVersionId: branch.headVersionId,
      timestamp: new Date(),
      user,
      message,
      changes,
      hash,
      tags
    };

    // Store version
    this.versions.set(versionId, version);
    
    // Update file versions
    for (const change of changes) {
      const fileVersions = this.fileVersions.get(change.fileId) || [];
      fileVersions.push(versionId);
      
      // Limit versions per file
      if (fileVersions.length > this.options.maxVersionsPerFile) {
        fileVersions.shift();
      }
      
      this.fileVersions.set(change.fileId, fileVersions);
    }

    // Update branch head
    branch.headVersionId = versionId;

    // Persist version
    await this.saveVersion(version);
    await this.saveBranch(branch);

    this.emit('version-created', version);
    
    return version;
  }

  /**
   * Get version by ID
   */
  getVersion(versionId: string): Version | null {
    return this.versions.get(versionId) || null;
  }

  /**
   * Get version history for a file
   */
  getFileHistory(fileId: string, limit?: number): Version[] {
    const versionIds = this.fileVersions.get(fileId) || [];
    const versions = versionIds
      .map(id => this.versions.get(id))
      .filter((v): v is Version => v !== undefined)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? versions.slice(0, limit) : versions;
  }

  /**
   * Get version history for a branch
   */
  getBranchHistory(branchId: string, limit?: number): Version[] {
    const branch = this.branches.get(branchId);
    if (!branch) {
      return [];
    }

    const versions: Version[] = [];
    let currentVersionId: string | undefined = branch.headVersionId;

    while (currentVersionId && (!limit || versions.length < limit)) {
      const version = this.versions.get(currentVersionId);
      if (!version) break;
      
      versions.push(version);
      currentVersionId = version.parentVersionId;
    }

    return versions;
  }

  /**
   * Get all versions in workspace
   */
  getAllVersions(limit?: number): Version[] {
    const versions = Array.from(this.versions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? versions.slice(0, limit) : versions;
  }

  /**
   * Revert to a previous version
   */
  async revertToVersion(
    versionId: string,
    user: User,
    branchId: string,
    message?: string
  ): Promise<Version> {
    const targetVersion = this.versions.get(versionId);
    if (!targetVersion) {
      throw new Error(`Version not found: ${versionId}`);
    }

    // Get current state
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    const currentVersion = this.versions.get(branch.headVersionId);
    if (!currentVersion) {
      throw new Error('Current version not found');
    }

    // Create revert changes (inverse of changes from target to current)
    const revertChanges: FileChange[] = [];
    
    for (const change of targetVersion.changes) {
      const revertChange: FileChange = {
        fileId: change.fileId,
        filePath: change.filePath,
        operation: change.operation === 'delete' ? 'create' : 
                   change.operation === 'create' ? 'delete' : 'modify',
        oldContent: change.newContent,
        newContent: change.oldContent
      };
      revertChanges.push(revertChange);
    }

    // Create new version with revert changes
    const revertMessage = message || `Revert to version ${versionId.substring(0, 8)}`;
    const revertVersion = await this.createVersion(
      user,
      branchId,
      revertMessage,
      revertChanges,
      ['revert']
    );

    this.emit('version-reverted', {
      targetVersionId: versionId,
      revertVersionId: revertVersion.id
    });

    return revertVersion;
  }

  /**
   * Create a new branch
   */
  async createBranch(
    name: string,
    user: User,
    description?: string,
    isDefault: boolean = false
  ): Promise<Branch> {
    // Check if branch name already exists
    const existingBranch = Array.from(this.branches.values())
      .find(b => b.name === name && b.workspaceId === this.workspaceId);
    
    if (existingBranch) {
      throw new Error(`Branch already exists: ${name}`);
    }

    // Get default branch head as starting point
    const defaultBranch = Array.from(this.branches.values())
      .find(b => b.isDefault && b.workspaceId === this.workspaceId);
    
    const headVersionId = defaultBranch?.headVersionId || '';

    const branch: Branch = {
      id: this.generateBranchId(),
      name,
      workspaceId: this.workspaceId,
      headVersionId,
      createdAt: new Date(),
      createdBy: user,
      description,
      isDefault
    };

    this.branches.set(branch.id, branch);
    await this.saveBranch(branch);

    this.emit('branch-created', branch);
    
    return branch;
  }

  /**
   * Get branch by ID
   */
  getBranch(branchId: string): Branch | null {
    return this.branches.get(branchId) || null;
  }

  /**
   * Get branch by name
   */
  getBranchByName(name: string): Branch | null {
    return Array.from(this.branches.values())
      .find(b => b.name === name && b.workspaceId === this.workspaceId) || null;
  }

  /**
   * Get all branches
   */
  getAllBranches(): Branch[] {
    return Array.from(this.branches.values())
      .filter(b => b.workspaceId === this.workspaceId)
      .sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    if (branch.isDefault) {
      throw new Error('Cannot delete default branch');
    }

    this.branches.delete(branchId);
    
    // Delete branch file
    const branchPath = path.join(this.storagePath, 'branches', `${branchId}.json`);
    await fs.unlink(branchPath).catch(() => {});

    this.emit('branch-deleted', { branchId, name: branch.name });
  }

  /**
   * Merge one branch into another
   */
  async mergeBranches(
    sourceBranchId: string,
    targetBranchId: string,
    user: User,
    message?: string
  ): Promise<MergeResult> {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);

    if (!sourceBranch || !targetBranch) {
      throw new Error('Source or target branch not found');
    }

    const sourceVersion = this.versions.get(sourceBranch.headVersionId);
    const targetVersion = this.versions.get(targetBranch.headVersionId);

    if (!sourceVersion || !targetVersion) {
      throw new Error('Branch head versions not found');
    }

    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(sourceVersion.id, targetVersion.id);
    
    // Get changes from common ancestor to source and target
    const sourceChanges = this.getChangesSince(commonAncestor?.id, sourceVersion.id);
    const targetChanges = this.getChangesSince(commonAncestor?.id, targetVersion.id);

    // Detect conflicts
    const conflicts = this.detectConflicts(sourceChanges, targetChanges);
    
    if (conflicts.length > 0) {
      return {
        success: false,
        conflicts,
        autoMergedFiles: [],
        conflictedFiles: conflicts.map(c => c.filePath)
      };
    }

    // Auto-merge non-conflicting changes
    const mergedChanges = this.mergeChanges(sourceChanges, targetChanges);
    
    // Create merge version
    const mergeMessage = message || `Merge ${sourceBranch.name} into ${targetBranch.name}`;
    const mergeVersion = await this.createVersion(
      user,
      targetBranchId,
      mergeMessage,
      mergedChanges,
      ['merge']
    );

    this.emit('branches-merged', {
      sourceBranchId,
      targetBranchId,
      mergeVersionId: mergeVersion.id
    });

    return {
      success: true,
      mergedVersionId: mergeVersion.id,
      autoMergedFiles: mergedChanges.map(c => c.filePath),
      conflictedFiles: []
    };
  }

  /**
   * Resolve merge conflicts and complete merge
   */
  async resolveMergeConflicts(
    sourceBranchId: string,
    targetBranchId: string,
    user: User,
    resolvedChanges: FileChange[],
    message?: string
  ): Promise<Version> {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);

    if (!sourceBranch || !targetBranch) {
      throw new Error('Source or target branch not found');
    }

    const mergeMessage = message || `Merge ${sourceBranch.name} into ${targetBranch.name} (conflicts resolved)`;
    const mergeVersion = await this.createVersion(
      user,
      targetBranchId,
      mergeMessage,
      resolvedChanges,
      ['merge', 'conflict-resolved']
    );

    this.emit('merge-conflicts-resolved', {
      sourceBranchId,
      targetBranchId,
      mergeVersionId: mergeVersion.id
    });

    return mergeVersion;
  }

  /**
   * Compare two versions
   */
  compareVersions(versionId1: string, versionId2: string): FileChange[] {
    const version1 = this.versions.get(versionId1);
    const version2 = this.versions.get(versionId2);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    // Collect all affected files
    const fileIds = new Set<string>();
    version1.changes.forEach(c => fileIds.add(c.fileId));
    version2.changes.forEach(c => fileIds.add(c.fileId));

    // Compare each file
    const differences: FileChange[] = [];
    
    for (const fileId of fileIds) {
      const change1 = version1.changes.find(c => c.fileId === fileId);
      const change2 = version2.changes.find(c => c.fileId === fileId);

      if (!change1 && change2) {
        differences.push(change2);
      } else if (change1 && !change2) {
        differences.push({
          ...change1,
          operation: 'delete'
        });
      } else if (change1 && change2 && change1.newContent !== change2.newContent) {
        differences.push({
          fileId,
          filePath: change2.filePath,
          operation: 'modify',
          oldContent: change1.newContent,
          newContent: change2.newContent
        });
      }
    }

    return differences;
  }

  /**
   * Find common ancestor of two versions
   */
  private findCommonAncestor(versionId1: string, versionId2: string): Version | null {
    const ancestors1 = this.getAncestors(versionId1);
    const ancestors2 = this.getAncestors(versionId2);

    // Find first common ancestor
    for (const ancestor1 of ancestors1) {
      if (ancestors2.some(a => a.id === ancestor1.id)) {
        return ancestor1;
      }
    }

    return null;
  }

  /**
   * Get all ancestors of a version
   */
  private getAncestors(versionId: string): Version[] {
    const ancestors: Version[] = [];
    let currentVersionId: string | undefined = versionId;

    while (currentVersionId) {
      const version = this.versions.get(currentVersionId);
      if (!version) break;
      
      ancestors.push(version);
      currentVersionId = version.parentVersionId;
    }

    return ancestors;
  }

  /**
   * Get all changes since a version
   */
  private getChangesSince(fromVersionId: string | undefined, toVersionId: string): FileChange[] {
    const changes: FileChange[] = [];
    let currentVersionId: string | undefined = toVersionId;

    while (currentVersionId && currentVersionId !== fromVersionId) {
      const version = this.versions.get(currentVersionId);
      if (!version) break;
      
      changes.push(...version.changes);
      currentVersionId = version.parentVersionId;
    }

    return changes;
  }

  /**
   * Detect conflicts between two sets of changes
   */
  private detectConflicts(changes1: FileChange[], changes2: FileChange[]): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    const fileMap1 = new Map(changes1.map(c => [c.fileId, c]));
    const fileMap2 = new Map(changes2.map(c => [c.fileId, c]));

    // Check for conflicting changes to same files
    for (const [fileId, change1] of fileMap1) {
      const change2 = fileMap2.get(fileId);
      
      if (change2 && this.hasConflict(change1, change2)) {
        conflicts.push({
          fileId,
          filePath: change1.filePath,
          baseContent: change1.oldContent || '',
          sourceContent: change1.newContent || '',
          targetContent: change2.newContent || '',
          conflictMarkers: this.generateConflictMarkers(
            change1.oldContent || '',
            change1.newContent || '',
            change2.newContent || ''
          )
        });
      }
    }

    return conflicts;
  }

  /**
   * Check if two changes conflict
   */
  private hasConflict(change1: FileChange, change2: FileChange): boolean {
    // Both modify the same file with different content
    if (change1.operation === 'modify' && change2.operation === 'modify') {
      return change1.newContent !== change2.newContent;
    }
    
    // One deletes while other modifies
    if ((change1.operation === 'delete' && change2.operation === 'modify') ||
        (change1.operation === 'modify' && change2.operation === 'delete')) {
      return true;
    }

    return false;
  }

  /**
   * Generate conflict markers for manual resolution
   */
  private generateConflictMarkers(
    baseContent: string,
    sourceContent: string,
    targetContent: string
  ): ConflictMarker[] {
    const baseLines = baseContent.split('\n');
    const sourceLines = sourceContent.split('\n');
    const targetLines = targetContent.split('\n');

    // Simple line-by-line comparison
    const markers: ConflictMarker[] = [];
    let i = 0;

    while (i < Math.max(sourceLines.length, targetLines.length)) {
      if (sourceLines[i] !== targetLines[i]) {
        const startLine = i;
        let endLine = i;

        // Find end of conflict region
        while (endLine < Math.max(sourceLines.length, targetLines.length) &&
               sourceLines[endLine] !== targetLines[endLine]) {
          endLine++;
        }

        markers.push({
          startLine,
          endLine,
          baseLines: baseLines.slice(startLine, endLine),
          sourceLines: sourceLines.slice(startLine, endLine),
          targetLines: targetLines.slice(startLine, endLine)
        });

        i = endLine;
      } else {
        i++;
      }
    }

    return markers;
  }

  /**
   * Merge non-conflicting changes
   */
  private mergeChanges(changes1: FileChange[], changes2: FileChange[]): FileChange[] {
    const merged: FileChange[] = [];
    const fileMap1 = new Map(changes1.map(c => [c.fileId, c]));
    const fileMap2 = new Map(changes2.map(c => [c.fileId, c]));

    // Add all changes from first set
    merged.push(...changes1);

    // Add non-conflicting changes from second set
    for (const [fileId, change2] of fileMap2) {
      const change1 = fileMap1.get(fileId);
      
      if (!change1) {
        merged.push(change2);
      } else if (change1.newContent === change2.newContent) {
        // Same change, skip duplicate
        continue;
      }
    }

    return merged;
  }

  /**
   * Generate unique version ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate unique branch ID
   */
  private generateBranchId(): string {
    return `b_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate hash for changes
   */
  private generateHash(changes: FileChange[]): string {
    const content = JSON.stringify(changes);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Load versions from storage
   */
  private async loadVersions(): Promise<void> {
    try {
      const versionsDir = path.join(this.storagePath, 'versions');
      await fs.mkdir(versionsDir, { recursive: true });
      
      const files = await fs.readdir(versionsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(versionsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const version: Version = JSON.parse(content);
          
          // Convert date strings back to Date objects
          version.timestamp = new Date(version.timestamp);
          
          this.versions.set(version.id, version);
          
          // Update file versions map
          for (const change of version.changes) {
            const fileVersions = this.fileVersions.get(change.fileId) || [];
            if (!fileVersions.includes(version.id)) {
              fileVersions.push(version.id);
              this.fileVersions.set(change.fileId, fileVersions);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  }

  /**
   * Load branches from storage
   */
  private async loadBranches(): Promise<void> {
    try {
      const branchesDir = path.join(this.storagePath, 'branches');
      await fs.mkdir(branchesDir, { recursive: true });
      
      const files = await fs.readdir(branchesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(branchesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const branch: Branch = JSON.parse(content);
          
          // Convert date strings back to Date objects
          branch.createdAt = new Date(branch.createdAt);
          
          this.branches.set(branch.id, branch);
        }
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  }

  /**
   * Save version to storage
   */
  private async saveVersion(version: Version): Promise<void> {
    try {
      const versionsDir = path.join(this.storagePath, 'versions');
      await fs.mkdir(versionsDir, { recursive: true });
      
      const filePath = path.join(versionsDir, `${version.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(version, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save version:', error);
      throw error;
    }
  }

  /**
   * Save branch to storage
   */
  private async saveBranch(branch: Branch): Promise<void> {
    try {
      const branchesDir = path.join(this.storagePath, 'branches');
      await fs.mkdir(branchesDir, { recursive: true });
      
      const filePath = path.join(branchesDir, `${branch.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(branch, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save branch:', error);
      throw error;
    }
  }

  /**
   * Clean up old versions
   */
  async cleanup(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;

    for (const [versionId, version] of this.versions) {
      if (version.timestamp < cutoffDate && !version.tags?.includes('important')) {
        this.versions.delete(versionId);
        
        // Delete version file
        const versionPath = path.join(this.storagePath, 'versions', `${versionId}.json`);
        await fs.unlink(versionPath).catch(() => {});
        
        deletedCount++;
      }
    }

    this.emit('cleanup-completed', { deletedCount, olderThanDays });
    
    return deletedCount;
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalVersions: number;
    totalBranches: number;
    totalFiles: number;
    oldestVersion?: Date;
    newestVersion?: Date;
  } {
    const versions = Array.from(this.versions.values());
    
    return {
      totalVersions: versions.length,
      totalBranches: this.branches.size,
      totalFiles: this.fileVersions.size,
      oldestVersion: versions.length > 0 
        ? new Date(Math.min(...versions.map(v => v.timestamp.getTime())))
        : undefined,
      newestVersion: versions.length > 0
        ? new Date(Math.max(...versions.map(v => v.timestamp.getTime())))
        : undefined
    };
  }
}
