import { SecretsVault } from '../SecretsVault';
import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      if (name === 'userData') {
        return '/mock/user/data';
      }
      return '/mock/path';
    }),
  },
}));

// Mock fs/promises
jest.mock('fs/promises');

describe('SecretsVault', () => {
  let vault: SecretsVault;
  const mockProjectPath = '/mock/project';

  beforeEach(() => {
    jest.clearAllMocks();
    vault = new SecretsVault(mockProjectPath);
    
    // Mock fs operations
    (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.includes('.master-key')) {
        // Return a mock 32-byte key
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      }
      if (filePath.includes('secrets-vault.json')) {
        return Promise.resolve(JSON.stringify({
          version: '1.0.0',
          secrets: {},
        }));
      }
      throw new Error('File not found');
    });

    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize vault successfully', async () => {
      await vault.initialize();
      
      expect(fs.readFile).toHaveBeenCalled();
      expect(fs.access).toHaveBeenCalled();
    });

    it('should generate master key if not exists', async () => {
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('.master-key')) {
          throw new Error('File not found');
        }
        return Promise.resolve(JSON.stringify({ version: '1.0.0', secrets: {} }));
      });

      await vault.initialize();
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.master-key'),
        expect.any(Buffer),
        expect.objectContaining({ mode: 0o600 })
      );
    });

    it('should create vault files if they do not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));

      await vault.initialize();
      
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('secrets-vault.json'),
        expect.any(String),
        expect.objectContaining({ mode: 0o600 })
      );
    });
  });

  describe('setSecret', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should store a secret in global scope', async () => {
      await vault.setSecret('API_KEY', 'secret-value-123', 'global');
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('secrets-vault.json'),
        expect.stringContaining('API_KEY'),
        expect.objectContaining({ mode: 0o600 })
      );
    });

    it('should store a secret in project scope', async () => {
      await vault.setSecret('DB_PASSWORD', 'db-secret-456', 'project');
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.azstudio'),
        expect.any(String),
        expect.objectContaining({ mode: 0o600 })
      );
    });

    it('should throw error if vault not initialized', async () => {
      const uninitializedVault = new SecretsVault();
      
      await expect(
        uninitializedVault.setSecret('KEY', 'value')
      ).rejects.toThrow('Vault not initialized');
    });

    it('should throw error for project scope without project path', async () => {
      const globalVault = new SecretsVault();
      await globalVault.initialize();
      
      await expect(
        globalVault.setSecret('KEY', 'value', 'project')
      ).rejects.toThrow('Project vault not available');
    });

    it('should log the write operation', async () => {
      await vault.setSecret('TEST_KEY', 'test-value', 'global');
      
      const auditLog = vault.getAuditLog();
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0]).toMatchObject({
        operation: 'write',
        key: 'TEST_KEY',
        scope: 'global',
      });
    });
  });

  describe('getSecret', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should retrieve a stored secret', async () => {
      // First store a secret
      await vault.setSecret('API_KEY', 'secret-value-123', 'global');
      
      // Mock reading the stored secret
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json')) {
          // Get the encrypted data from the last writeFile call
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls.find(
            call => call[0].includes('secrets-vault.json')
          );
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      const value = await vault.getSecret('API_KEY', 'global');
      expect(value).toBe('secret-value-123');
    });

    it('should return null for non-existent secret', async () => {
      const value = await vault.getSecret('NON_EXISTENT', 'global');
      expect(value).toBeNull();
    });

    it('should log the read operation', async () => {
      await vault.setSecret('TEST_KEY', 'test-value', 'global');
      
      // Mock reading
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json')) {
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls.find(
            call => call[0].includes('secrets-vault.json')
          );
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      await vault.getSecret('TEST_KEY', 'global');
      
      const auditLog = vault.getAuditLog();
      expect(auditLog.some(log => log.operation === 'read')).toBe(true);
    });
  });

  describe('deleteSecret', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should delete an existing secret', async () => {
      await vault.setSecret('TO_DELETE', 'value', 'global');
      
      // Mock reading the vault with the secret
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json')) {
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls.find(
            call => call[0].includes('secrets-vault.json')
          );
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      const result = await vault.deleteSecret('TO_DELETE', 'global');
      expect(result).toBe(true);
    });

    it('should return false for non-existent secret', async () => {
      const result = await vault.deleteSecret('NON_EXISTENT', 'global');
      expect(result).toBe(false);
    });

    it('should log the delete operation', async () => {
      await vault.setSecret('TO_DELETE', 'value', 'global');
      
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json')) {
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls.find(
            call => call[0].includes('secrets-vault.json')
          );
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      await vault.deleteSecret('TO_DELETE', 'global');
      
      const auditLog = vault.getAuditLog();
      expect(auditLog.some(log => log.operation === 'delete')).toBe(true);
    });
  });

  describe('listSecrets', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should list all secret keys in global scope', async () => {
      await vault.setSecret('KEY1', 'value1', 'global');
      await vault.setSecret('KEY2', 'value2', 'global');
      
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json') && !filePath.includes('.azstudio')) {
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls
            .filter(call => call[0].includes('secrets-vault.json') && !call[0].includes('.azstudio'))
            .pop();
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      const keys = await vault.listSecrets('global');
      expect(keys).toContain('KEY1');
      expect(keys).toContain('KEY2');
    });

    it('should return empty array for project scope without project path', async () => {
      const globalVault = new SecretsVault();
      await globalVault.initialize();
      
      const keys = await globalVault.listSecrets('project');
      expect(keys).toEqual([]);
    });
  });

  describe('encryption/decryption', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'sensitive-information-123';
      
      const encrypted = vault.encrypt(originalData);
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted.encryptedData).not.toBe(originalData);
      
      const decrypted = vault.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const data = 'test-data';
      
      const encrypted1 = vault.encrypt(data);
      const encrypted2 = vault.encrypt(data);
      
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should fail decryption with tampered data', async () => {
      const encrypted = vault.encrypt('test-data');
      
      // Tamper with encrypted data
      encrypted.encryptedData = encrypted.encryptedData.replace('a', 'b');
      
      expect(() => vault.decrypt(encrypted)).toThrow();
    });
  });

  describe('audit log', () => {
    beforeEach(async () => {
      await vault.initialize();
    });

    it('should track all operations in audit log', async () => {
      await vault.setSecret('KEY1', 'value1', 'global');
      
      (fs.readFile as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('secrets-vault.json')) {
          const lastWrite = (fs.writeFile as jest.Mock).mock.calls.find(
            call => call[0].includes('secrets-vault.json')
          );
          return Promise.resolve(lastWrite[1]);
        }
        return Promise.resolve(Buffer.from('a'.repeat(64), 'hex'));
      });
      
      await vault.getSecret('KEY1', 'global');
      await vault.deleteSecret('KEY1', 'global');
      
      const auditLog = vault.getAuditLog();
      expect(auditLog.length).toBeGreaterThanOrEqual(3);
      expect(auditLog.map(log => log.operation)).toContain('write');
      expect(auditLog.map(log => log.operation)).toContain('read');
      expect(auditLog.map(log => log.operation)).toContain('delete');
    });

    it('should clear audit log', async () => {
      await vault.setSecret('KEY1', 'value1', 'global');
      expect(vault.getAuditLog().length).toBeGreaterThan(0);
      
      vault.clearAuditLog();
      expect(vault.getAuditLog()).toEqual([]);
    });

    it('should include timestamp in audit entries', async () => {
      const before = new Date();
      await vault.setSecret('KEY1', 'value1', 'global');
      const after = new Date();
      
      const auditLog = vault.getAuditLog();
      const entry = auditLog[0];
      
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
