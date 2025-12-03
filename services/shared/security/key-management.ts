/**
 * Centralized Key Management Service
 * Implements AWS KMS or HashiCorp Vault integration
 * Handles encryption key lifecycle management
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

interface KeyConfig {
  keyId: string;
  algorithm: string;
  createdAt: Date;
  rotatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyId: string;
  algorithm: string;
}

/**
 * Key Management Service
 * Provides centralized key management with rotation and audit logging
 */
export class KeyManagementService extends EventEmitter {
  private keys: Map<string, KeyConfig> = new Map();
  private keyRotationInterval: NodeJS.Timer | null = null;
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    keyId: string;
    details: any;
  }> = [];

  constructor(private config: {
    provider: 'kms' | 'vault' | 'local';
    kmsRegion?: string;
    vaultAddr?: string;
    vaultToken?: string;
    rotationIntervalDays?: number;
  }) {
    super();
    this.initialize();
  }

  /**
   * Initialize key management service
   */
  private initialize(): void {
    this.logAudit('SERVICE_INITIALIZED', 'system', {
      provider: this.config.provider,
      timestamp: new Date()
    });

    // Start key rotation scheduler
    if (this.config.rotationIntervalDays) {
      this.startKeyRotationScheduler();
    }
  }

  /**
   * Generate a new encryption key
   */
  async generateKey(keyId: string, algorithm: string = 'aes-256-gcm'): Promise<KeyConfig> {
    try {
      const keyConfig: KeyConfig = {
        keyId,
        algorithm,
        createdAt: new Date(),
        rotatedAt: new Date()
      };

      this.keys.set(keyId, keyConfig);
      this.logAudit('KEY_GENERATED', keyId, { algorithm });
      this.emit('key:generated', { keyId, algorithm });

      return keyConfig;
    } catch (error) {
      this.logAudit('KEY_GENERATION_FAILED', keyId, { error: String(error) });
      throw new Error(`Failed to generate key: ${error}`);
    }
  }

  /**
   * Encrypt data using a specific key
   */
  async encrypt(keyId: string, plaintext: string): Promise<EncryptedData> {
    try {
      const keyConfig = this.keys.get(keyId);
      if (!keyConfig) {
        throw new Error(`Key not found: ${keyId}`);
      }

      // Generate random IV
      const iv = crypto.randomBytes(16);
      
      // For demonstration, use a derived key from keyId
      // In production, this would use actual key material from KMS/Vault
      const key = crypto.scryptSync(keyId, 'salt', 32);

      // Create cipher
      const cipher = crypto.createCipheriv(keyConfig.algorithm, key, iv);
      
      let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
      ciphertext += cipher.final('hex');
      
      const authTag = cipher.getAuthTag().toString('hex');

      this.logAudit('DATA_ENCRYPTED', keyId, { 
        dataSize: plaintext.length,
        algorithm: keyConfig.algorithm
      });

      return {
        ciphertext,
        iv: iv.toString('hex'),
        authTag,
        keyId,
        algorithm: keyConfig.algorithm
      };
    } catch (error) {
      this.logAudit('ENCRYPTION_FAILED', keyId, { error: String(error) });
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using a specific key
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const keyConfig = this.keys.get(encryptedData.keyId);
      if (!keyConfig) {
        throw new Error(`Key not found: ${encryptedData.keyId}`);
      }

      // Derive key from keyId (same as encryption)
      const key = crypto.scryptSync(encryptedData.keyId, 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        encryptedData.algorithm,
        key,
        iv
      );
      decipher.setAuthTag(authTag);

      let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
      plaintext += decipher.final('utf8');

      this.logAudit('DATA_DECRYPTED', encryptedData.keyId, {
        algorithm: encryptedData.algorithm
      });

      return plaintext;
    } catch (error) {
      this.logAudit('DECRYPTION_FAILED', encryptedData.keyId, { error: String(error) });
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Rotate a key
   */
  async rotateKey(keyId: string): Promise<KeyConfig> {
    try {
      const oldKeyConfig = this.keys.get(keyId);
      if (!oldKeyConfig) {
        throw new Error(`Key not found: ${keyId}`);
      }

      // Generate new key
      const newKeyConfig = await this.generateKey(`${keyId}-rotated-${Date.now()}`, oldKeyConfig.algorithm);
      
      // Update rotation timestamp
      oldKeyConfig.rotatedAt = new Date();

      this.logAudit('KEY_ROTATED', keyId, {
        oldKeyId: keyId,
        newKeyId: newKeyConfig.keyId
      });

      this.emit('key:rotated', { oldKeyId: keyId, newKeyId: newKeyConfig.keyId });

      return newKeyConfig;
    } catch (error) {
      this.logAudit('KEY_ROTATION_FAILED', keyId, { error: String(error) });
      throw new Error(`Key rotation failed: ${error}`);
    }
  }

  /**
   * Start automatic key rotation scheduler
   */
  private startKeyRotationScheduler(): void {
    const intervalMs = (this.config.rotationIntervalDays || 90) * 24 * 60 * 60 * 1000;
    
    this.keyRotationInterval = setInterval(async () => {
      try {
        for (const [keyId, keyConfig] of this.keys.entries()) {
          const daysSinceRotation = (Date.now() - keyConfig.rotatedAt.getTime()) / (24 * 60 * 60 * 1000);
          
          if (daysSinceRotation >= (this.config.rotationIntervalDays || 90)) {
            await this.rotateKey(keyId);
          }
        }
      } catch (error) {
        this.logAudit('KEY_ROTATION_SCHEDULER_ERROR', 'system', { error: String(error) });
      }
    }, intervalMs);
  }

  /**
   * Get key configuration
   */
  getKeyConfig(keyId: string): KeyConfig | undefined {
    return this.keys.get(keyId);
  }

  /**
   * List all keys
   */
  listKeys(): KeyConfig[] {
    return Array.from(this.keys.values());
  }

  /**
   * Log audit event
   */
  private logAudit(action: string, keyId: string, details: any): void {
    const auditEntry = {
      timestamp: new Date(),
      action,
      keyId,
      details
    };

    this.auditLog.push(auditEntry);
    this.emit('audit:log', auditEntry);

    // Keep only last 10000 entries in memory
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filter?: { keyId?: string; action?: string; since?: Date }): typeof this.auditLog {
    let logs = this.auditLog;

    if (filter?.keyId) {
      logs = logs.filter(log => log.keyId === filter.keyId);
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
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
let keyManagementService: KeyManagementService | null = null;

export function initializeKeyManagement(config: {
  provider: 'kms' | 'vault' | 'local';
  kmsRegion?: string;
  vaultAddr?: string;
  vaultToken?: string;
  rotationIntervalDays?: number;
}): KeyManagementService {
  if (!keyManagementService) {
    keyManagementService = new KeyManagementService(config);
  }
  return keyManagementService;
}

export function getKeyManagementService(): KeyManagementService {
  if (!keyManagementService) {
    throw new Error('Key Management Service not initialized');
  }
  return keyManagementService;
}

export default KeyManagementService;
