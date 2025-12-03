/**
 * Secrets Management Test Suite
 * Tests Vault and AWS Secrets Manager integration
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

const { SecretsManagementService, initializeSecretsManagement } = require('../../services/shared/security/secrets-management');
const { SecretsProviderFactory, SecretsMigration } = require('../../services/shared/security/secrets-providers');

// Mock external dependencies
jest.mock('axios');
jest.mock('@aws-sdk/client-secrets-manager');

describe('Secrets Management Service', () => {
  let secretsService;
  let mockProvider;

  beforeEach(() => {
    // Mock provider
    mockProvider = {
      getSecret: jest.fn(),
      storeSecret: jest.fn(),
      rotateSecret: jest.fn(),
      deleteSecret: jest.fn(),
      listSecrets: jest.fn()
    };

    // Mock SecretsProviderFactory
    SecretsProviderFactory.create = jest.fn().mockReturnValue(mockProvider);

    // Initialize service with local provider for testing
    secretsService = new SecretsManagementService({
      provider: 'local',
      encryptionKey: 'test-key',
      rotationIntervalDays: 1
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize with local provider', () => {
      expect(secretsService).toBeDefined();
      expect(secretsService.config.provider).toBe('local');
    });

    it('should initialize with Vault provider', () => {
      const vaultService = new SecretsManagementService({
        provider: 'vault',
        vaultAddr: 'https://vault.example.com',
        vaultToken: 'test-token'
      });

      expect(SecretsProviderFactory.create).toHaveBeenCalledWith({
        provider: 'vault',
        vaultAddr: 'https://vault.example.com',
        vaultToken: 'test-token'
      });
    });

    it('should initialize with AWS provider', () => {
      const awsService = new SecretsManagementService({
        provider: 'aws-secrets-manager',
        awsRegion: 'us-east-1',
        awsCredentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      });

      expect(SecretsProviderFactory.create).toHaveBeenCalledWith({
        provider: 'aws-secrets-manager',
        awsRegion: 'us-east-1',
        awsCredentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      });
    });

    it('should fallback to local provider on error', () => {
      SecretsProviderFactory.create.mockImplementation(() => {
        throw new Error('Provider unavailable');
      });

      const fallbackService = new SecretsManagementService({
        provider: 'vault',
        vaultAddr: 'https://vault.example.com',
        vaultToken: 'test-token',
        fallbackToLocal: true
      });

      expect(fallbackService).toBeDefined();
    });
  });

  describe('Secret Storage', () => {
    it('should store a secret successfully', async () => {
      mockProvider.storeSecret.mockResolvedValue();

      const result = await secretsService.storeSecret('test-secret', 'test-value', {
        metadata: { description: 'Test secret' }
      });

      expect(result.name).toBe('test-secret');
      expect(result.value).toBe('test-value');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.rotatedAt).toBeInstanceOf(Date);

      expect(mockProvider.storeSecret).toHaveBeenCalledWith('test-secret', 'test-value', {
        description: 'Test secret',
        tags: undefined,
        ttl: undefined
      });
    });

    it('should reject empty secret name', async () => {
      await expect(
        secretsService.storeSecret('', 'test-value')
      ).rejects.toThrow('Secret name cannot be empty');
    });

    it('should reject empty secret value', async () => {
      await expect(
        secretsService.storeSecret('test-secret', '')
      ).rejects.toThrow('Secret value cannot be empty');
    });

    it('should handle provider errors gracefully', async () => {
      mockProvider.storeSecret.mockRejectedValue(new Error('Provider error'));

      await expect(
        secretsService.storeSecret('test-secret', 'test-value')
      ).rejects.toThrow('Failed to store secret');
    });

    it('should emit events on secret storage', async () => {
      const eventSpy = jest.fn();
      secretsService.on('secret:stored', eventSpy);

      mockProvider.storeSecret.mockResolvedValue();

      await secretsService.storeSecret('test-secret', 'test-value');

      expect(eventSpy).toHaveBeenCalledWith({
        name: 'test-secret',
        metadata: undefined
      });
    });
  });

  describe('Secret Retrieval', () => {
    beforeEach(async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.getSecret.mockResolvedValue('test-value');
      await secretsService.storeSecret('test-secret', 'test-value');
    });

    it('should retrieve a secret successfully', async () => {
      const result = await secretsService.getSecret('test-secret');

      expect(result).toBe('test-value');
    });

    it('should use cache for subsequent requests', async () => {
      // First call
      await secretsService.getSecret('test-secret');
      
      // Second call should use cache
      await secretsService.getSecret('test-secret');

      expect(mockProvider.getSecret).toHaveBeenCalledTimes(1);
    });

    it('should handle missing secret', async () => {
      mockProvider.getSecret.mockRejectedValue(new Error('Secret not found'));

      await expect(
        secretsService.getSecret('non-existent-secret')
      ).rejects.toThrow('Failed to retrieve secret');
    });

    it('should emit events on secret access', async () => {
      const eventSpy = jest.fn();
      secretsService.on('secret:accessed', eventSpy);

      await secretsService.getSecret('test-secret');

      expect(eventSpy).toHaveBeenCalledWith({
        name: 'test-secret',
        accessor: 'system'
      });
    });
  });

  describe('Secret Rotation', () => {
    beforeEach(async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.rotateSecret.mockResolvedValue();
      await secretsService.storeSecret('test-secret', 'old-value');
    });

    it('should rotate a secret successfully', async () => {
      const result = await secretsService.rotateSecret('test-secret', 'new-value');

      expect(result.value).toBe('new-value');
      expect(result.rotatedAt).toBeInstanceOf(Date);

      expect(mockProvider.rotateSecret).toHaveBeenCalledWith('test-secret', 'new-value');
    });

    it('should reject rotation of non-existent secret', async () => {
      await expect(
        secretsService.rotateSecret('non-existent-secret', 'new-value')
      ).rejects.toThrow('Secret not found');
    });

    it('should reject empty new value', async () => {
      await expect(
        secretsService.rotateSecret('test-secret', '')
      ).rejects.toThrow('New secret value cannot be empty');
    });

    it('should emit events on secret rotation', async () => {
      const eventSpy = jest.fn();
      secretsService.on('secret:rotated', eventSpy);

      await secretsService.rotateSecret('test-secret', 'new-value');

      expect(eventSpy).toHaveBeenCalledWith({
        name: 'test-secret'
      });
    });
  });

  describe('Secret Deletion', () => {
    beforeEach(async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.deleteSecret.mockResolvedValue();
      await secretsService.storeSecret('test-secret', 'test-value');
    });

    it('should delete a secret successfully', async () => {
      await secretsService.deleteSecret('test-secret');

      expect(mockProvider.deleteSecret).toHaveBeenCalledWith('test-secret');
    });

    it('should handle deletion of non-existent secret', async () => {
      mockProvider.deleteSecret.mockRejectedValue(new Error('Secret not found'));

      await expect(
        secretsService.deleteSecret('non-existent-secret')
      ).rejects.toThrow('Failed to delete secret');
    });

    it('should emit events on secret deletion', async () => {
      const eventSpy = jest.fn();
      secretsService.on('secret:deleted', eventSpy);

      await secretsService.deleteSecret('test-secret');

      expect(eventSpy).toHaveBeenCalledWith({
        name: 'test-secret'
      });
    });
  });

  describe('Access Control', () => {
    beforeEach(async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.getSecret.mockResolvedValue('test-value');
      
      await secretsService.storeSecret('protected-secret', 'test-value', {
        accessControl: {
          allowedServices: ['auth-service', 'api-gateway'],
          allowedUsers: ['admin']
        }
      });
    });

    it('should allow access for authorized service', async () => {
      await expect(
        secretsService.getSecret('protected-secret', 'auth-service')
      ).resolves.toBe('test-value');
    });

    it('should allow access for authorized user', async () => {
      await expect(
        secretsService.getSecret('protected-secret', 'admin')
      ).resolves.toBe('test-value');
    });

    it('should deny access for unauthorized service', async () => {
      await expect(
        secretsService.getSecret('protected-secret', 'unauthorized-service')
      ).rejects.toThrow('Access denied');
    });

    it('should deny access for unauthorized user', async () => {
      await expect(
        secretsService.getSecret('protected-secret', 'unauthorized-user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('Automatic Rotation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start rotation scheduler', () => {
      const service = new SecretsManagementService({
        provider: 'local',
        rotationIntervalDays: 1
      });

      expect(setInterval).toHaveBeenCalled();
    });

    it('should rotate secrets with rotation policy', async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.rotateSecret.mockResolvedValue();

      await secretsService.storeSecret('rotate-me', 'initial-value', {
        rotationPolicy: {
          enabled: true,
          intervalDays: 1
        }
      });

      // Fast-forward time
      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 1 day

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockProvider.rotateSecret).toHaveBeenCalled();
    });
  });

  describe('Access Logging', () => {
    it('should log all secret operations', async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.getSecret.mockResolvedValue('test-value');
      mockProvider.deleteSecret.mockResolvedValue();

      // Store secret
      await secretsService.storeSecret('test-secret', 'test-value');
      
      // Get secret
      await secretsService.getSecret('test-secret');
      
      // Delete secret
      await secretsService.deleteSecret('test-secret');

      const logs = secretsService.getAccessLog();
      
      expect(logs).toHaveLength(3);
      expect(logs[0].action).toBe('write');
      expect(logs[1].action).toBe('read');
      expect(logs[2].action).toBe('delete');
    });

    it('should filter access logs', () => {
      const logs = secretsService.getAccessLog({
        secretName: 'test-secret',
        action: 'read'
      });

      expect(logs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            secretName: 'test-secret',
            action: 'read'
          })
        ])
      );
    });
  });

  describe('Vault Provider', () => {
    let vaultProvider;

    beforeEach(() => {
      const axios = require('axios');
      const mockAxios = {
        create: jest.fn(() => ({
          get: jest.fn(),
          post: jest.fn(),
          delete: jest.fn(),
          list: jest.fn()
        }))
      };
      
      axios.create = mockAxios.create;
      
      const { VaultProvider } = require('../../services/shared/security/secrets-providers');
      vaultProvider = new VaultProvider({
        vaultAddr: 'https://vault.example.com',
        vaultToken: 'test-token'
      });
    });

    it('should store secret in Vault', async () => {
      const mockPost = jest.fn().mockResolvedValue({});
      vaultProvider.client.post = mockPost;

      await vaultProvider.storeSecret('test-secret', 'test-value', {
        description: 'Test secret'
      });

      expect(mockPost).toHaveBeenCalledWith('/v1/secret/data/test-secret', {
        data: { value: 'test-value' },
        options: {},
        description: 'Test secret'
      });
    });

    it('should retrieve secret from Vault', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        data: { data: { value: 'test-value' } }
      });
      vaultProvider.client.get = mockGet;

      const result = await vaultProvider.getSecret('test-secret');

      expect(result).toBe('test-value');
      expect(mockGet).toHaveBeenCalledWith('/v1/secret/data/test-secret');
    });
  });

  describe('AWS Secrets Manager Provider', () => {
    let awsProvider;
    let mockClient;

    beforeEach(() => {
      const { AWSSecretsManagerProvider } = require('../../services/shared/security/secrets-providers');
      
      mockClient = {
        send: jest.fn()
      };

      awsProvider = new AWSSecretsManagerProvider({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      });

      awsProvider.client = mockClient;
    });

    it('should store secret in AWS Secrets Manager', async () => {
      mockClient.send.mockResolvedValue({});

      await awsProvider.storeSecret('test-secret', 'test-value', {
        description: 'Test secret'
      });

      expect(mockClient.send).toHaveBeenCalledWith({
        SecretId: 'test-secret',
        SecretString: 'test-value',
        Description: 'Test secret'
      });
    });

    it('should retrieve secret from AWS Secrets Manager', async () => {
      mockClient.send.mockResolvedValue({
        SecretString: 'test-value'
      });

      const result = await awsProvider.getSecret('test-secret');

      expect(result).toBe('test-value');
      expect(mockClient.send).toHaveBeenCalledWith({
        SecretId: 'test-secret',
        VersionStage: 'AWSCURRENT'
      });
    });
  });

  describe('Secret Migration', () => {
    beforeEach(() => {
      // Set environment variables for testing
      process.env.TEST_SECRET = 'test-value';
      process.env.ANOTHER_SECRET = 'another-value';
    });

    afterEach(() => {
      delete process.env.TEST_SECRET;
      delete process.env.ANOTHER_SECRET;
    });

    it('should migrate secrets from environment', async () => {
      mockProvider.storeSecret.mockResolvedValue();

      await SecretsMigration.migrateFromEnvironment(mockProvider, [
        'TEST_SECRET',
        'ANOTHER_SECRET'
      ]);

      expect(mockProvider.storeSecret).toHaveBeenCalledTimes(2);
      expect(mockProvider.storeSecret).toHaveBeenCalledWith('TEST_SECRET', 'test-value', {
        description: 'Migrated from environment: TEST_SECRET',
        tags: [
          { Key: 'Source', Value: 'EnvironmentMigration' },
          { Key: 'OriginalName', Value: 'TEST_SECRET' },
          { Key: 'MigratedAt', Value: expect.any(String) }
        ]
      });
    });

    it('should validate migrated secrets', async () => {
      mockProvider.getSecret.mockResolvedValue('test-value');

      await SecretsMigration.validateMigration(mockProvider, ['TEST_SECRET']);

      expect(mockProvider.getSecret).toHaveBeenCalledWith('TEST_SECRET');
    });

    it('should handle validation failures', async () => {
      mockProvider.getSecret.mockRejectedValue(new Error('Secret not found'));

      await expect(
        SecretsMigration.validateMigration(mockProvider, ['MISSING_SECRET'])
      ).rejects.toThrow('Secret not accessible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockProvider.getSecret.mockRejectedValue(new Error('ETIMEDOUT'));

      await expect(
        secretsService.getSecret('test-secret')
      ).rejects.toThrow('Failed to retrieve secret');
    });

    it('should handle authentication failures', async () => {
      mockProvider.storeSecret.mockRejectedValue(new Error('Authentication failed'));

      await expect(
        secretsService.storeSecret('test-secret', 'test-value')
      ).rejects.toThrow('Failed to store secret');
    });

    it('should handle quota exceeded errors', async () => {
      mockProvider.listSecrets.mockRejectedValue(new Error('Quota exceeded'));

      await expect(
        secretsService.getSecret('test-secret')
      ).rejects.toThrow('Failed to retrieve secret');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent secret operations', async () => {
      mockProvider.storeSecret.mockResolvedValue();
      mockProvider.getSecret.mockResolvedValue('test-value');

      // Store multiple secrets concurrently
      const storePromises = Array(100).fill().map((_, i) =>
        secretsService.storeSecret(`secret-${i}`, `value-${i}`)
      );

      await Promise.all(storePromises);

      expect(mockProvider.storeSecret).toHaveBeenCalledTimes(100);

      // Retrieve multiple secrets concurrently
      const getPromises = Array(100).fill().map((_, i) =>
        secretsService.getSecret(`secret-${i}`)
      );

      const results = await Promise.all(getPromises);

      expect(results).toHaveLength(100);
      expect(results[0]).toBe('value-0');
    });

    it('should limit access log size', async () => {
      mockProvider.storeSecret.mockResolvedValue();

      // Store more secrets than the log limit
      for (let i = 0; i < 15000; i++) {
        await secretsService.storeSecret(`secret-${i}`, `value-${i}`);
      }

      const logs = secretsService.getAccessLog();
      expect(logs.length).toBeLessThanOrEqual(10000);
    });
  });
});
