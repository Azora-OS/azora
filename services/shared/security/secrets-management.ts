/**
 * Centralized Secrets Management Service
 * Implements HashiCorp Vault or AWS Secrets Manager integration
 * Handles secret storage, rotation, and access control
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

interface SecretConfig {
  name: string;
  value: string;
  createdAt: Date;
  rotatedAt: Date;
  expiresAt?: Date;
  rotationPolicy?: {
    enabled: boolean;
    intervalDays: number;
  };
  accessControl?: {
    allowedServices: string[];
    allowedUsers: string[];
  };
  metadata?: Record<string, any>;
}

interface SecretAccessLog {
  timestamp: Date;
  secretName: string;
  action: 'read' | 'write' | 'rotate' | 'delete';
  accessor: string;
  success: boolean;
  details?: any;
}

/**
 * Secrets Management Service
 * Provides centralized secret management with rotation and audit logging
 */
export class SecretsManagementService extends EventEmitter {
  private secrets: Map<string, SecretConfig> = new Map();
  private rotationInterval: NodeJS.Timer | null = null;
  private accessLog: SecretAccessLog[] = [];

  constructor(private config: {
    provider: 'vault' | 'aws-secrets-manager' | 'local';
    vaultAddr?: string;
    vaultToken?: string;
    awsRegion?: string;
    rotationIntervalDays?: number;
    encryptionKey?: string;
  }) {
    super();
    this.initialize();
  }

  /**
   * Initialize secrets management service
   */
  private initialize(): void {
    this.logAccess('SERVICE_INITIALIZED', 'system', 'write', true, {
      provider: this.config.provider
    });

    // Start secret rotation scheduler
    if (this.config.rotationIntervalDays) {
      this.startSecretRotationScheduler();
    }
  }

  /**
   * Store a secret
   */
  async storeSecret(
    name: string,
    value: string,
    options?: {
      rotationPolicy?: { enabled: boolean; intervalDays: number };
      accessControl?: { allowedServices: string[]; allowedUsers: string[] };
      metadata?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<SecretConfig> {
    try {
      // Validate secret name
      if (!name || name.trim().length === 0) {
        throw new Error('Secret name cannot be empty');
      }

      // Validate secret value
      if (!value || value.trim().length === 0) {
        throw new Error('Secret value cannot be empty');
      }

      // Encrypt secret value
      const encryptedValue = this.encryptSecret(value);

      const secretConfig: SecretConfig = {
        name,
        value: encryptedValue,
        createdAt: new Date(),
        rotatedAt: new Date(),
        rotationPolicy: options?.rotationPolicy,
        accessControl: options?.accessControl,
        metadata: options?.metadata,
        expiresAt: options?.expiresAt
      };

      this.secrets.set(name, secretConfig);
      this.logAccess(name, 'system', 'write', true, { metadata: options?.metadata });
      this.emit('secret:stored', { name, metadata: options?.metadata });

      return secretConfig;
    } catch (error) {
      this.logAccess(name, 'system', 'write', false, { error: String(error) });
      throw new Error(`Failed to store secret: ${error}`);
    }
  }

  /**
   * Retrieve a secret
   */
  async getSecret(name: string, accessor: string = 'system'): Promise<string> {
    try {
      const secretConfig = this.secrets.get(name);
      if (!secretConfig) {
        this.logAccess(name, accessor, 'read', false, { reason: 'Secret not found' });
        throw new Error(`Secret not found: ${name}`);
      }

      // Check access control
      if (secretConfig.accessControl) {
        const hasAccess = this.checkAccess(accessor, secretConfig.accessControl);
        if (!hasAccess) {
          this.logAccess(name, accessor, 'read', false, { reason: 'Access denied' });
          throw new Error(`Access denied to secret: ${name}`);
        }
      }

      // Check expiration
      if (secretConfig.expiresAt && secretConfig.expiresAt < new Date()) {
        this.logAccess(name, accessor, 'read', false, { reason: 'Secret expired' });
        throw new Error(`Secret has expired: ${name}`);
      }

      // Decrypt secret value
      const decryptedValue = this.decryptSecret(secretConfig.value);
      this.logAccess(name, accessor, 'read', true);
      this.emit('secret:accessed', { name, accessor });

      return decryptedValue;
    } catch (error) {
      this.logAccess(name, accessor, 'read', false, { error: String(error) });
      throw new Error(`Failed to retrieve secret: ${error}`);
    }
  }

  /**
   * Rotate a secret
   */
  async rotateSecret(name: string, newValue: string): Promise<SecretConfig> {
    try {
      const secretConfig = this.secrets.get(name);
      if (!secretConfig) {
        throw new Error(`Secret not found: ${name}`);
      }

      // Validate new value
      if (!newValue || newValue.trim().length === 0) {
        throw new Error('New secret value cannot be empty');
      }

      // Encrypt new value
      const encryptedValue = this.encryptSecret(newValue);

      // Update secret
      secretConfig.value = encryptedValue;
      secretConfig.rotatedAt = new Date();

      this.logAccess(name, 'system', 'rotate', true);
      this.emit('secret:rotated', { name });

      return secretConfig;
    } catch (error) {
      this.logAccess(name, 'system', 'rotate', false, { error: String(error) });
      throw new Error(`Failed to rotate secret: ${error}`);
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(name: string): Promise<void> {
    try {
      if (!this.secrets.has(name)) {
        throw new Error(`Secret not found: ${name}`);
      }

      this.secrets.delete(name);
      this.logAccess(name, 'system', 'delete', true);
      this.emit('secret:deleted', { name });
    } catch (error) {
      this.logAccess(name, 'system', 'delete', false, { error: String(error) });
      throw new Error(`Failed to delete secret: ${error}`);
    }
  }

  /**
   * Start automatic secret rotation scheduler
   */
  private startSecretRotationScheduler(): void {
    const intervalMs = (this.config.rotationIntervalDays || 30) * 24 * 60 * 60 * 1000;

    this.rotationInterval = setInterval(async () => {
      try {
        for (const [name, secretConfig] of this.secrets.entries()) {
          if (secretConfig.rotationPolicy?.enabled) {
            const daysSinceRotation = (Date.now() - secretConfig.rotatedAt.getTime()) / (24 * 60 * 60 * 1000);

            if (daysSinceRotation >= secretConfig.rotationPolicy.intervalDays) {
              // Generate new secret value
              const newValue = this.generateSecureValue();
              await this.rotateSecret(name, newValue);
            }
          }
        }
      } catch (error) {
        this.logAccess('system', 'system', 'rotate', false, { error: String(error) });
      }
    }, intervalMs);
  }

  /**
   * Check access control
   */
  private checkAccess(accessor: string, accessControl: SecretConfig['accessControl']): boolean {
    if (!accessControl) return true;

    if (accessControl.allowedServices && !accessControl.allowedServices.includes(accessor)) {
      return false;
    }

    if (accessControl.allowedUsers && !accessControl.allowedUsers.includes(accessor)) {
      return false;
    }

    return true;
  }

  /**
   * Encrypt secret value
   */
  private encryptSecret(value: string): string {
    try {
      const key = this.config.encryptionKey || 'default-encryption-key';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(key, 'salt', 32), iv);

      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt secret value
   */
  private decryptSecret(encryptedValue: string): string {
    try {
      const key = this.config.encryptionKey || 'default-encryption-key';
      const [ivHex, encrypted] = encryptedValue.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(key, 'salt', 32), iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Generate secure random value
   */
  private generateSecureValue(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Log access event
   */
  private logAccess(
    secretName: string,
    accessor: string,
    action: 'read' | 'write' | 'rotate' | 'delete',
    success: boolean,
    details?: any
  ): void {
    const logEntry: SecretAccessLog = {
      timestamp: new Date(),
      secretName,
      action,
      accessor,
      success,
      details
    };

    this.accessLog.push(logEntry);
    this.emit('access:log', logEntry);

    // Keep only last 10000 entries in memory
    if (this.accessLog.length > 10000) {
      this.accessLog = this.accessLog.slice(-10000);
    }
  }

  /**
   * Get access log
   */
  getAccessLog(filter?: {
    secretName?: string;
    accessor?: string;
    action?: string;
    since?: Date;
  }): SecretAccessLog[] {
    let logs = this.accessLog;

    if (filter?.secretName) {
      logs = logs.filter(log => log.secretName === filter.secretName);
    }

    if (filter?.accessor) {
      logs = logs.filter(log => log.accessor === filter.accessor);
    }

    if (filter?.action) {
      logs = logs.filter(log => log.action === filter.action);
    }

    if (filter?.since) {
      logs = logs.filter(log => log.timestamp >= filter.since!);
    }

    return logs;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
let secretsManagementService: SecretsManagementService | null = null;

export function initializeSecretsManagement(config: {
  provider: 'vault' | 'aws-secrets-manager' | 'local';
  vaultAddr?: string;
  vaultToken?: string;
  awsRegion?: string;
  rotationIntervalDays?: number;
  encryptionKey?: string;
}): SecretsManagementService {
  if (!secretsManagementService) {
    secretsManagementService = new SecretsManagementService(config);
  }
  return secretsManagementService;
}

export function getSecretsManagementService(): SecretsManagementService {
  if (!secretsManagementService) {
    throw new Error('Secrets Management Service not initialized');
  }
  return secretsManagementService;
}

export default SecretsManagementService;
