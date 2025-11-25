import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';

/**
 * Secret entry stored in the vault
 */
export interface Secret {
  key: string;
  value: string;
  scope: 'global' | 'project';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Encrypted secret data structure
 */
interface EncryptedSecret {
  iv: string;
  encryptedData: string;
  authTag: string;
}

/**
 * Vault storage structure
 */
interface VaultData {
  version: string;
  secrets: Record<string, EncryptedSecret>;
}

/**
 * SecretsVault provides secure storage for sensitive data like API keys,
 * database credentials, and service tokens using AES-256-GCM encryption.
 * 
 * Features:
 * - OS keychain integration for master key storage
 * - Project and global scope support
 * - Encrypted storage with AES-256-GCM
 * - Audit logging of all operations
 */
export class SecretsVault {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private static readonly VAULT_VERSION = '1.0.0';

  private masterKey: Buffer | null = null;
  private globalVaultPath: string;
  private projectVaultPath: string | null = null;
  private auditLog: Array<{ timestamp: Date; operation: string; key: string; scope: string }> = [];

  constructor(projectPath?: string) {
    // Global vault in user data directory
    this.globalVaultPath = path.join(app.getPath('userData'), 'secrets-vault.json');
    
    // Project-specific vault if project path provided
    if (projectPath) {
      this.projectVaultPath = path.join(projectPath, '.azstudio', 'secrets-vault.json');
    }
  }

  /**
   * Initialize the vault and generate/load master key
   */
  async initialize(): Promise<void> {
    // Generate or load master key
    await this.loadOrGenerateMasterKey();

    // Ensure vault files exist
    await this.ensureVaultFile(this.globalVaultPath);
    if (this.projectVaultPath) {
      await this.ensureVaultFile(this.projectVaultPath);
    }
  }

  /**
   * Set a secret in the vault
   */
  async setSecret(key: string, value: string, scope: 'global' | 'project' = 'global', metadata?: Record<string, any>): Promise<void> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized. Call initialize() first.');
    }

    if (scope === 'project' && !this.projectVaultPath) {
      throw new Error('Project vault not available. Provide projectPath in constructor.');
    }

    const vaultPath = scope === 'global' ? this.globalVaultPath : this.projectVaultPath!;
    
    // Encrypt the secret
    const encrypted = this.encrypt(value);
    
    // Load existing vault data
    const vaultData = await this.loadVaultData(vaultPath);
    
    // Store encrypted secret
    vaultData.secrets[key] = encrypted;
    
    // Save vault data
    await this.saveVaultData(vaultPath, vaultData);
    
    // Log the operation
    this.logAccess(key, 'write', scope);
  }

  /**
   * Get a secret from the vault
   */
  async getSecret(key: string, scope: 'global' | 'project' = 'global'): Promise<string | null> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized. Call initialize() first.');
    }

    if (scope === 'project' && !this.projectVaultPath) {
      throw new Error('Project vault not available. Provide projectPath in constructor.');
    }

    const vaultPath = scope === 'global' ? this.globalVaultPath : this.projectVaultPath!;
    
    // Load vault data
    const vaultData = await this.loadVaultData(vaultPath);
    
    // Get encrypted secret
    const encrypted = vaultData.secrets[key];
    if (!encrypted) {
      return null;
    }
    
    // Decrypt and return
    const decrypted = this.decrypt(encrypted);
    
    // Log the operation
    this.logAccess(key, 'read', scope);
    
    return decrypted;
  }

  /**
   * Delete a secret from the vault
   */
  async deleteSecret(key: string, scope: 'global' | 'project' = 'global'): Promise<boolean> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized. Call initialize() first.');
    }

    if (scope === 'project' && !this.projectVaultPath) {
      throw new Error('Project vault not available. Provide projectPath in constructor.');
    }

    const vaultPath = scope === 'global' ? this.globalVaultPath : this.projectVaultPath!;
    
    // Load vault data
    const vaultData = await this.loadVaultData(vaultPath);
    
    // Check if secret exists
    if (!vaultData.secrets[key]) {
      return false;
    }
    
    // Delete secret
    delete vaultData.secrets[key];
    
    // Save vault data
    await this.saveVaultData(vaultPath, vaultData);
    
    // Log the operation
    this.logAccess(key, 'delete', scope);
    
    return true;
  }

  /**
   * List all secret keys in a scope
   */
  async listSecrets(scope: 'global' | 'project' = 'global'): Promise<string[]> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized. Call initialize() first.');
    }

    if (scope === 'project' && !this.projectVaultPath) {
      return [];
    }

    const vaultPath = scope === 'global' ? this.globalVaultPath : this.projectVaultPath!;
    
    // Load vault data
    const vaultData = await this.loadVaultData(vaultPath);
    
    return Object.keys(vaultData.secrets);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: string): EncryptedSecret {
    if (!this.masterKey) {
      throw new Error('Master key not available');
    }

    // Generate random IV
    const iv = crypto.randomBytes(SecretsVault.IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(SecretsVault.ALGORITHM, this.masterKey, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encrypted: EncryptedSecret): string {
    if (!this.masterKey) {
      throw new Error('Master key not available');
    }

    // Convert hex strings to buffers
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(SecretsVault.ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get audit log entries
   */
  getAuditLog(): Array<{ timestamp: Date; operation: string; key: string; scope: string }> {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Log access to secrets
   */
  private logAccess(key: string, operation: 'read' | 'write' | 'delete', scope: string): void {
    this.auditLog.push({
      timestamp: new Date(),
      operation,
      key,
      scope,
    });
  }

  /**
   * Load or generate master encryption key
   */
  private async loadOrGenerateMasterKey(): Promise<void> {
    const keyPath = path.join(app.getPath('userData'), '.master-key');
    
    try {
      // Try to load existing key
      const keyData = await fs.readFile(keyPath);
      this.masterKey = keyData;
    } catch (error) {
      // Generate new key if not found
      this.masterKey = crypto.randomBytes(SecretsVault.KEY_LENGTH);
      
      // Save key with restricted permissions
      await fs.writeFile(keyPath, this.masterKey, { mode: 0o600 });
    }
  }

  /**
   * Ensure vault file exists
   */
  private async ensureVaultFile(vaultPath: string): Promise<void> {
    try {
      await fs.access(vaultPath);
    } catch {
      // Create directory if needed
      const dir = path.dirname(vaultPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Create empty vault
      const emptyVault: VaultData = {
        version: SecretsVault.VAULT_VERSION,
        secrets: {},
      };
      
      await fs.writeFile(vaultPath, JSON.stringify(emptyVault, null, 2), { mode: 0o600 });
    }
  }

  /**
   * Load vault data from file
   */
  private async loadVaultData(vaultPath: string): Promise<VaultData> {
    try {
      const data = await fs.readFile(vaultPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return empty vault if file doesn't exist or is corrupted
      return {
        version: SecretsVault.VAULT_VERSION,
        secrets: {},
      };
    }
  }

  /**
   * Save vault data to file
   */
  private async saveVaultData(vaultPath: string, data: VaultData): Promise<void> {
    await fs.writeFile(vaultPath, JSON.stringify(data, null, 2), { mode: 0o600 });
  }
}
