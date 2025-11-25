import * as fs from 'fs/promises';
import * as path from 'path';
import { app, dialog, BrowserWindow } from 'electron';

/**
 * Permission types that can be requested
 */
export type PermissionType = 
  | 'filesystem:read'
  | 'filesystem:write'
  | 'filesystem:delete'
  | 'network:request'
  | 'network:external-api'
  | 'process:execute'
  | 'git:operation';

/**
 * Permission grant entry
 */
export interface PermissionGrant {
  type: PermissionType;
  resource: string;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  permanent: boolean;
}

/**
 * Permission request options
 */
export interface PermissionRequestOptions {
  type: PermissionType;
  resource: string;
  reason?: string;
  temporary?: boolean;
  duration?: number; // Duration in milliseconds for temporary permissions
}

/**
 * Network allowlist entry
 */
export interface AllowlistEntry {
  domain: string;
  allowed: boolean;
  addedAt: Date;
  reason?: string;
}

/**
 * Permission configuration
 */
interface PermissionConfig {
  version: string;
  grants: PermissionGrant[];
  networkAllowlist: AllowlistEntry[];
  autoGrantPatterns: string[];
}

/**
 * PermissionManager handles all permission requests and grants for AzStudio.
 * It provides a security layer for file system access, network requests,
 * and other sensitive operations.
 * 
 * Features:
 * - Permission prompts with clear explanations
 * - Network request allowlisting
 * - Temporary and permanent grants
 * - Auto-grant patterns for trusted paths
 * - Audit logging of all permission grants
 */
export class PermissionManager {
  private static readonly CONFIG_VERSION = '1.0.0';
  private static readonly DEFAULT_TEMP_DURATION = 3600000; // 1 hour

  private configPath: string;
  private config: PermissionConfig;
  private mainWindow: BrowserWindow | null = null;
  private auditLog: Array<{ timestamp: Date; type: string; resource: string; granted: boolean; reason?: string }> = [];

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'permissions.json');
    this.config = {
      version: PermissionManager.CONFIG_VERSION,
      grants: [],
      networkAllowlist: [],
      autoGrantPatterns: [
        // Auto-grant for user's home directory and common dev paths
        path.join(app.getPath('home'), '**'),
        path.join(app.getPath('documents'), '**'),
        path.join(app.getPath('desktop'), '**'),
      ],
    };
  }

  /**
   * Initialize the permission manager
   */
  async initialize(mainWindow: BrowserWindow): Promise<void> {
    this.mainWindow = mainWindow;
    await this.loadConfig();
    
    // Add default network allowlist entries
    await this.addDefaultAllowlistEntries();
  }

  /**
   * Request permission for an operation
   */
  async requestPermission(options: PermissionRequestOptions): Promise<boolean> {
    const { type, resource, reason, temporary = false, duration } = options;

    // Check if permission already granted
    const existingGrant = this.findGrant(type, resource);
    if (existingGrant) {
      // Check if expired
      if (existingGrant.expiresAt && existingGrant.expiresAt < new Date()) {
        // Remove expired grant
        await this.revokePermission(type, resource);
      } else {
        this.logPermission(type, resource, true, 'Already granted');
        return existingGrant.granted;
      }
    }

    // Check auto-grant patterns
    if (this.shouldAutoGrant(type, resource)) {
      await this.grantPermission(type, resource, true, duration);
      this.logPermission(type, resource, true, 'Auto-granted');
      return true;
    }

    // Show permission prompt
    const granted = await this.showPermissionPrompt(type, resource, reason);
    
    // Store the grant
    if (granted) {
      await this.grantPermission(type, resource, !temporary, duration);
    }
    
    this.logPermission(type, resource, granted, reason);
    
    return granted;
  }

  /**
   * Grant permission for a resource
   */
  async grantPermission(
    type: PermissionType,
    resource: string,
    permanent: boolean = false,
    duration?: number
  ): Promise<void> {
    const grant: PermissionGrant = {
      type,
      resource,
      granted: true,
      timestamp: new Date(),
      permanent,
    };

    if (!permanent) {
      const expirationDuration = duration || PermissionManager.DEFAULT_TEMP_DURATION;
      grant.expiresAt = new Date(Date.now() + expirationDuration);
    }

    // Remove existing grant if any
    this.config.grants = this.config.grants.filter(
      g => !(g.type === type && g.resource === resource)
    );

    this.config.grants.push(grant);
    await this.saveConfig();
  }

  /**
   * Revoke permission for a resource
   */
  async revokePermission(type: PermissionType, resource: string): Promise<boolean> {
    const initialLength = this.config.grants.length;
    this.config.grants = this.config.grants.filter(
      g => !(g.type === type && g.resource === resource)
    );
    
    if (this.config.grants.length < initialLength) {
      await this.saveConfig();
      return true;
    }
    
    return false;
  }

  /**
   * Check if a domain is allowed for network requests
   */
  async isNetworkAllowed(domain: string): Promise<boolean> {
    // Check allowlist
    const entry = this.config.networkAllowlist.find(e => e.domain === domain);
    if (entry) {
      return entry.allowed;
    }

    // Check if it's a known safe domain
    if (this.isKnownSafeDomain(domain)) {
      await this.addToNetworkAllowlist(domain, true, 'Known safe domain');
      return true;
    }

    // Request permission
    const granted = await this.requestPermission({
      type: 'network:request',
      resource: domain,
      reason: `Allow network requests to ${domain}?`,
    });

    if (granted) {
      await this.addToNetworkAllowlist(domain, true, 'User granted');
    }

    return granted;
  }

  /**
   * Add domain to network allowlist
   */
  async addToNetworkAllowlist(domain: string, allowed: boolean, reason?: string): Promise<void> {
    // Remove existing entry
    this.config.networkAllowlist = this.config.networkAllowlist.filter(e => e.domain !== domain);

    this.config.networkAllowlist.push({
      domain,
      allowed,
      addedAt: new Date(),
      reason,
    });

    await this.saveConfig();
  }

  /**
   * Remove domain from network allowlist
   */
  async removeFromNetworkAllowlist(domain: string): Promise<boolean> {
    const initialLength = this.config.networkAllowlist.length;
    this.config.networkAllowlist = this.config.networkAllowlist.filter(e => e.domain !== domain);
    
    if (this.config.networkAllowlist.length < initialLength) {
      await this.saveConfig();
      return true;
    }
    
    return false;
  }

  /**
   * Get all permission grants
   */
  getGrants(): PermissionGrant[] {
    // Filter out expired grants
    const now = new Date();
    return this.config.grants.filter(g => !g.expiresAt || g.expiresAt > now);
  }

  /**
   * Get network allowlist
   */
  getNetworkAllowlist(): AllowlistEntry[] {
    return [...this.config.networkAllowlist];
  }

  /**
   * Get audit log
   */
  getAuditLog(): Array<{ timestamp: Date; type: string; resource: string; granted: boolean; reason?: string }> {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Add auto-grant pattern
   */
  async addAutoGrantPattern(pattern: string): Promise<void> {
    if (!this.config.autoGrantPatterns.includes(pattern)) {
      this.config.autoGrantPatterns.push(pattern);
      await this.saveConfig();
    }
  }

  /**
   * Remove auto-grant pattern
   */
  async removeAutoGrantPattern(pattern: string): Promise<boolean> {
    const initialLength = this.config.autoGrantPatterns.length;
    this.config.autoGrantPatterns = this.config.autoGrantPatterns.filter(p => p !== pattern);
    
    if (this.config.autoGrantPatterns.length < initialLength) {
      await this.saveConfig();
      return true;
    }
    
    return false;
  }

  /**
   * Get auto-grant patterns
   */
  getAutoGrantPatterns(): string[] {
    return [...this.config.autoGrantPatterns];
  }

  /**
   * Find existing grant
   */
  private findGrant(type: PermissionType, resource: string): PermissionGrant | undefined {
    return this.config.grants.find(g => g.type === type && g.resource === resource);
  }

  /**
   * Check if permission should be auto-granted
   */
  private shouldAutoGrant(type: PermissionType, resource: string): boolean {
    // Only auto-grant filesystem operations
    if (!type.startsWith('filesystem:')) {
      return false;
    }

    // Normalize paths for comparison (handle both forward and back slashes)
    const normalizedResource = resource.replace(/\\/g, '/');

    // Check against patterns
    return this.config.autoGrantPatterns.some(pattern => {
      // Normalize pattern path
      const normalizedPattern = pattern.replace(/\\/g, '/');
      
      // Escape special regex characters except * and **
      const escapedPattern = normalizedPattern
        .replace(/[.+?^${}()|[\]]/g, '\\$&')
        .replace(/\*\*/g, '___DOUBLESTAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/___DOUBLESTAR___/g, '.*');
      
      const regex = new RegExp(`^${escapedPattern}$`);
      return regex.test(normalizedResource);
    });
  }

  /**
   * Check if domain is known to be safe
   */
  private isKnownSafeDomain(domain: string): boolean {
    const safeDomains = [
      'api.openai.com',
      'api.anthropic.com',
      'api.elevenlabs.io',
      'api.heygen.com',
      'github.com',
      'api.github.com',
      'gitlab.com',
      'vercel.com',
      'railway.app',
      'render.com',
    ];

    return safeDomains.some(safe => domain === safe || domain.endsWith(`.${safe}`));
  }

  /**
   * Show permission prompt dialog
   */
  private async showPermissionPrompt(
    type: PermissionType,
    resource: string,
    reason?: string
  ): Promise<boolean> {
    if (!this.mainWindow) {
      return false;
    }

    const message = this.formatPermissionMessage(type, resource, reason);
    
    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'question',
      buttons: ['Allow', 'Deny', 'Allow Always'],
      defaultId: 0,
      cancelId: 1,
      title: 'Permission Request',
      message: 'AzStudio Permission Request',
      detail: message,
    });

    // If "Allow Always" was clicked
    if (result.response === 2) {
      await this.grantPermission(type, resource, true);
      return true;
    }

    return result.response === 0;
  }

  /**
   * Format permission message for display
   */
  private formatPermissionMessage(type: PermissionType, resource: string, reason?: string): string {
    let message = '';

    switch (type) {
      case 'filesystem:read':
        message = `Read files from:\n${resource}`;
        break;
      case 'filesystem:write':
        message = `Write files to:\n${resource}`;
        break;
      case 'filesystem:delete':
        message = `Delete files from:\n${resource}`;
        break;
      case 'network:request':
        message = `Make network requests to:\n${resource}`;
        break;
      case 'network:external-api':
        message = `Access external API:\n${resource}`;
        break;
      case 'process:execute':
        message = `Execute process:\n${resource}`;
        break;
      case 'git:operation':
        message = `Perform Git operation:\n${resource}`;
        break;
    }

    if (reason) {
      message += `\n\nReason: ${reason}`;
    }

    return message;
  }

  /**
   * Log permission grant/denial
   */
  private logPermission(type: string, resource: string, granted: boolean, reason?: string): void {
    this.auditLog.push({
      timestamp: new Date(),
      type,
      resource,
      granted,
      reason,
    });
  }

  /**
   * Add default network allowlist entries
   */
  private async addDefaultAllowlistEntries(): Promise<void> {
    const defaults = [
      { domain: 'api.openai.com', reason: 'OpenAI API for AI features' },
      { domain: 'api.anthropic.com', reason: 'Anthropic API for AI features' },
      { domain: 'api.elevenlabs.io', reason: 'ElevenLabs API for text-to-speech' },
      { domain: 'api.heygen.com', reason: 'HeyGen API for video generation' },
      { domain: 'github.com', reason: 'GitHub for Git operations' },
      { domain: 'api.github.com', reason: 'GitHub API for repository operations' },
    ];

    for (const { domain, reason } of defaults) {
      const exists = this.config.networkAllowlist.some(e => e.domain === domain);
      if (!exists) {
        this.config.networkAllowlist.push({
          domain,
          allowed: true,
          addedAt: new Date(),
          reason,
        });
      }
    }

    await this.saveConfig();
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const loaded = JSON.parse(data);
      
      // Merge with defaults
      this.config = {
        ...this.config,
        ...loaded,
        grants: loaded.grants.map((g: any) => ({
          ...g,
          timestamp: new Date(g.timestamp),
          expiresAt: g.expiresAt ? new Date(g.expiresAt) : undefined,
        })),
        networkAllowlist: loaded.networkAllowlist.map((e: any) => ({
          ...e,
          addedAt: new Date(e.addedAt),
        })),
      };
    } catch (error) {
      // Config doesn't exist yet, use defaults
      await this.saveConfig();
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfig(): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), { mode: 0o600 });
  }
}
