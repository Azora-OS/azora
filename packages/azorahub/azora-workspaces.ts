/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora Workspaces
 *
 * Cloud-based development environments (like GitHub Codespaces)
 * but with our own name and enhanced features
 */

import { EventEmitter } from 'events';
import { AzoraIDE } from '../azora-ide/azora-ide-core';
import { ElaraCore } from '../system-core/agent-tools/elara-core';

export interface Workspace {
  id: string;
  name: string;
  repository: string;
  branch: string;
  machineType: 'small' | 'medium' | 'large' | 'xlarge';
  status: 'creating' | 'running' | 'stopped' | 'deleted';
  url?: string;
  createdAt: Date;
  lastActivity: Date;
  owner: string;
  environment: {
    os: 'linux' | 'windows' | 'macos';
    cpu: number;
    memory: number;
    disk: number;
  };
  ide: {
    type: 'azora-ide' | 'vscode' | 'custom';
    config: any;
  };
}

export interface WorkspaceConfig {
  repository: string;
  branch?: string;
  machineType?: 'small' | 'medium' | 'large' | 'xlarge';
  environment?: {
    os?: 'linux' | 'windows' | 'macos';
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  ide?: {
    type?: 'azora-ide' | 'vscode' | 'custom';
    config?: any;
  };
}

export class AzoraWorkspaces extends EventEmitter {
  private static instance: AzoraWorkspaces;
  private workspaces: Map<string, Workspace> = new Map();
  private ide: AzoraIDE;
  private elara: ElaraCore;

  private constructor() {
    super();
    this.ide = AzoraIDE.getInstance();
    this.elara = ElaraCore.getInstance();
  }

  public static getInstance(): AzoraWorkspaces {
    if (!AzoraWorkspaces.instance) {
      AzoraWorkspaces.instance = new AzoraWorkspaces();
    }
    return AzoraWorkspaces.instance;
  }

  /**
   * Create new workspace
   */
  public async createWorkspace(
    owner: string,
    config: WorkspaceConfig
  ): Promise<Workspace> {
    console.log(`🚀 Creating workspace for ${config.repository}...`);

    const workspace: Workspace = {
      id: `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.repository.split('/').pop() || 'workspace',
      repository: config.repository,
      branch: config.branch || 'main',
      machineType: config.machineType || 'medium',
      status: 'creating',
      createdAt: new Date(),
      lastActivity: new Date(),
      owner,
      environment: {
        os: config.environment?.os || 'linux',
        cpu: config.environment?.cpu || 4,
        memory: config.environment?.memory || 8192,
        disk: config.environment?.disk || 50
      },
      ide: {
        type: config.ide?.type || 'azora-ide',
        config: config.ide?.config || {}
      }
    };

    // Create workspace environment
    await this.setupWorkspace(workspace);

    workspace.status = 'running';
    workspace.url = `https://workspace.azora.dev/${workspace.id}`;
    this.workspaces.set(workspace.id, workspace);

    this.emit('workspace-created', workspace);
    return workspace;
  }

  /**
   * Setup workspace environment
   */
  private async setupWorkspace(workspace: Workspace): Promise<void> {
    // Clone repository
    console.log(`📦 Cloning ${workspace.repository}...`);

    // Setup IDE session
    const session = this.ide.createSession(`/workspaces/${workspace.id}`);

    // Initialize Elara context
    await this.elara.initializeWorkspaceContext({
      workspaceId: workspace.id,
      repository: workspace.repository,
      branch: workspace.branch
    });

    console.log(`✅ Workspace ${workspace.id} ready`);
  }

  /**
   * Get workspace by ID
   */
  public getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  /**
   * List workspaces for user
   */
  public listWorkspaces(owner: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter(
      w => w.owner === owner
    );
  }

  /**
   * Stop workspace
   */
  public async stopWorkspace(id: string): Promise<void> {
    const workspace = this.workspaces.get(id);
    if (!workspace) {throw new Error('Workspace not found');}

    workspace.status = 'stopped';
    this.emit('workspace-stopped', workspace);
  }

  /**
   * Delete workspace
   */
  public async deleteWorkspace(id: string): Promise<void> {
    const workspace = this.workspaces.get(id);
    if (!workspace) {throw new Error('Workspace not found');}

    workspace.status = 'deleted';
    this.workspaces.delete(id);
    this.emit('workspace-deleted', workspace);
  }

  /**
   * Get workspace statistics
   */
  public getStats(): {
    total: number;
    running: number;
    stopped: number;
    byType: Record<string, number>;
  } {
    const workspaces = Array.from(this.workspaces.values());
    const byType: Record<string, number> = {};

    for (const ws of workspaces) {
      byType[ws.machineType] = (byType[ws.machineType] || 0) + 1;
    }

    return {
      total: workspaces.length,
      running: workspaces.filter(w => w.status === 'running').length,
      stopped: workspaces.filter(w => w.status === 'stopped').length,
      byType
    };
  }
}

export default AzoraWorkspaces;


