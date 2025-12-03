/**
 * Real Secrets Management Providers
 * Implements HashiCorp Vault and AWS Secrets Manager integration
 */

import { Region, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';

export interface SecretProvider {
  getSecret(name: string): Promise<string>;
  storeSecret(name: string, value: string, options?: any): Promise<void>;
  rotateSecret(name: string, newValue: string): Promise<void>;
  deleteSecret(name: string): Promise<void>;
  listSecrets(): Promise<string[]>;
}

/**
 * HashiCorp Vault Provider
 */
export class VaultProvider implements SecretProvider {
  private client: any;
  private token: string;
  private baseUrl: string;

  constructor(config: { vaultAddr: string; vaultToken: string; namespace?: string }) {
    this.baseUrl = config.vaultAddr.replace(/\/$/, '');
    this.token = config.vaultToken;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Vault-Token': this.token,
        'Content-Type': 'application/json'
      }
    });
  }

  async getSecret(name: string, mountPoint: string = 'secret'): Promise<string> {
    try {
      const response = await this.client.get(`/v1/${mountPoint}/data/${name}`);
      return response.data.data.data.value;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Secret not found: ${name}`);
      }
      throw new Error(`Vault get secret failed: ${error.message}`);
    }
  }

  async storeSecret(
    name: string, 
    value: string, 
    options?: { 
      mountPoint?: string; 
      ttl?: string; 
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const mountPoint = options?.mountPoint || 'secret';
      const payload = {
        data: { value, ...options?.metadata },
        options: {
          ttl: options?.ttl
        },
        description: options?.description || `Secret: ${name}`
      };

      await this.client.post(`/v1/${mountPoint}/data/${name}`, payload);
    } catch (error: any) {
      throw new Error(`Vault store secret failed: ${error.message}`);
    }
  }

  async rotateSecret(name: string, newValue: string, mountPoint: string = 'secret'): Promise<void> {
    try {
      // Get existing secret metadata
      const response = await this.client.get(`/v1/${mountPoint}/data/${name}`);
      const existingData = response.data.data.data;
      
      // Update with new value while preserving other metadata
      const payload = {
        data: { ...existingData, value: newValue }
      };

      await this.client.post(`/v1/${mountPoint}/data/${name}`, payload);
    } catch (error: any) {
      throw new Error(`Vault rotate secret failed: ${error.message}`);
    }
  }

  async deleteSecret(name: string, mountPoint: string = 'secret'): Promise<void> {
    try {
      await this.client.delete(`/v1/${mountPoint}/data/${name}`);
    } catch (error: any) {
      throw new Error(`Vault delete secret failed: ${error.message}`);
    }
  }

  async listSecrets(mountPoint: string = 'secret'): Promise<string[]> {
    try {
      const response = await this.client.list(`/v1/${mountPoint}/metadata`);
      return response.data.data.keys || [];
    } catch (error: any) {
      throw new Error(`Vault list secrets failed: ${error.message}`);
    }
  }

  /**
   * Create Vault policies for RBAC
   */
  async createPolicy(policyName: string, rules: Record<string, any>): Promise<void> {
    try {
      const payload = {
        policy: JSON.stringify(rules)
      };
      await this.client.post(`/v1/sys/policies/${policyName}`, payload);
    } catch (error: any) {
      throw new Error(`Vault create policy failed: ${error.message}`);
    }
  }

  /**
   * Setup Vault authentication for services
   */
  async setupAppRole(roleName: string, policies: string[]): Promise<{ roleId: string; secretId: string }> {
    try {
      // Create role
      await this.client.post(`/v1/auth/approle/role/${roleName}`, {
        token_policies: policies,
        token_ttl: '1h',
        token_max_ttl: '24h'
      });

      // Get role ID
      const roleIdResponse = await this.client.get(`/v1/auth/approle/role/${roleName}/role-id`);
      const roleId = roleIdResponse.data.data.role_id;

      // Generate secret ID
      const secretIdResponse = await this.client.post(`/v1/auth/approle/role/${roleName}/secret-id`, {});
      const secretId = secretIdResponse.data.data.secret_id;

      return { roleId, secretId };
    } catch (error: any) {
      throw new Error(`Vault setup AppRole failed: ${error.message}`);
    }
  }
}

/**
 * AWS Secrets Manager Provider
 */
export class AWSSecretsManagerProvider implements SecretProvider {
  private client: SecretsManagerClient;

  constructor(config: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } }) {
    this.client = new SecretsManagerClient({
      region: config.region,
      credentials: config.credentials
    });
  }

  async getSecret(name: string): Promise<string> {
    try {
      const { SecretString } = await this.client.send({
        SecretId: name,
        VersionStage: 'AWSCURRENT'
      } as any);

      if (!SecretString) {
        throw new Error(`Secret value is empty: ${name}`);
      }

      return SecretString;
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret not found: ${name}`);
      }
      throw new Error(`AWS Secrets Manager get secret failed: ${error.message}`);
    }
  }

  async storeSecret(
    name: string,
    value: string,
    options?: {
      description?: string;
      tags?: Array<{ Key: string; Value: string }>;
      rotationInterval?: number;
      rotationLambdaArn?: string;
    }
  ): Promise<void> {
    try {
      const params: any = {
        SecretId: name,
        SecretString: value,
        Description: options?.description || `Secret: ${name}`
      };

      if (options?.tags) {
        params.Tags = options.tags;
      }

      await this.client.send(params as any);

      // Configure rotation if specified
      if (options?.rotationInterval && options?.rotationLambdaArn) {
        await this.client.send({
          SecretId: name,
          RotationRules: {
            AutomaticallyAfterDays: options.rotationInterval
          },
          RotationLambdaARN: options.rotationLambdaArn
        } as any);
      }
    } catch (error: any) {
      throw new Error(`AWS Secrets Manager store secret failed: ${error.message}`);
    }
  }

  async rotateSecret(name: string, newValue: string): Promise<void> {
    try {
      // Update the secret value
      await this.client.send({
        SecretId: name,
        SecretString: newValue
      } as any);

      // Trigger rotation if rotation is enabled
      try {
        await this.client.send({
          SecretId: name,
          IncludeSecretVersionStages: ['AWSCURRENT', 'AWSPENDING']
        } as any);
      } catch {
        // Rotation might not be configured, which is fine
      }
    } catch (error: any) {
      throw new Error(`AWS Secrets Manager rotate secret failed: ${error.message}`);
    }
  }

  async deleteSecret(name: string, recoveryWindowInDays: number = 7): Promise<void> {
    try {
      await this.client.send({
        SecretId: name,
        RecoveryWindowInDays: recoveryWindowInDays
      } as any);
    } catch (error: any) {
      throw new Error(`AWS Secrets Manager delete secret failed: ${error.message}`);
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const secrets: string[] = [];
      let nextToken: string | undefined;

      do {
        const response = await this.client.send({
          NextToken: nextToken,
          MaxResults: 100
        } as any);

        if (response.SecretList) {
          for (const secret of response.SecretList) {
            if (secret.Name) {
              secrets.push(secret.Name);
            }
          }
        }

        nextToken = response.NextToken;
      } while (nextToken);

      return secrets;
    } catch (error: any) {
      throw new Error(`AWS Secrets Manager list secrets failed: ${error.message}`);
    }
  }

  /**
   * Setup AWS IAM policies for secret access
   */
  generateIAMPolicy(secretNames: string[], actions: string[] = ['GetSecretValue']): any {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: actions,
          Resource: secretNames.map(name => `arn:aws:secretsmanager:*:*:secret:${name}*`)
        }
      ]
    };
  }

  /**
   * Create secret with automatic rotation
   */
  async createRotatingSecret(
    name: string,
    value: string,
    rotationLambdaArn: string,
    rotationIntervalDays: number = 30,
    options?: {
      description?: string;
      tags?: Array<{ Key: string; Value: string }>;
    }
  ): Promise<void> {
    try {
      // Create the secret
      await this.storeSecret(name, value, {
        ...options,
        rotationInterval: rotationIntervalDays,
        rotationLambdaArn
      });

      // Enable rotation
      await this.client.send({
        SecretId: name,
        RotationRules: {
          AutomaticallyAfterDays: rotationIntervalDays
        },
        RotationLambdaARN: rotationLambdaArn
      } as any);
    } catch (error: any) {
      throw new Error(`AWS Secrets Manager create rotating secret failed: ${error.message}`);
    }
  }
}

/**
 * Provider Factory
 */
export class SecretsProviderFactory {
  static create(config: {
    provider: 'vault' | 'aws-secrets-manager' | 'local';
    vaultAddr?: string;
    vaultToken?: string;
    awsRegion?: string;
    awsCredentials?: { accessKeyId: string; secretAccessKey: string };
  }): SecretProvider {
    switch (config.provider) {
      case 'vault':
        if (!config.vaultAddr || !config.vaultToken) {
          throw new Error('Vault provider requires vaultAddr and vaultToken');
        }
        return new VaultProvider({
          vaultAddr: config.vaultAddr,
          vaultToken: config.vaultToken
        });

      case 'aws-secrets-manager':
        if (!config.awsRegion) {
          throw new Error('AWS Secrets Manager provider requires awsRegion');
        }
        return new AWSSecretsManagerProvider({
          region: config.awsRegion,
          credentials: config.awsCredentials
        });

      case 'local':
        throw new Error('Local provider should be handled directly in SecretsManagementService');

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }
}

/**
 * Migration utilities
 */
export class SecretsMigration {
  static async migrateFromEnvironment(
    provider: SecretProvider,
    secretNames: string[],
    options?: {
      prefix?: string;
      tags?: Array<{ Key: string; Value: string }>;
      description?: string;
    }
  ): Promise<void> {
    for (const secretName of secretNames) {
      const secretValue = process.env[secretName];
      if (!secretValue) {
        console.warn(`Environment variable not found: ${secretName}`);
        continue;
      }

      const finalName = options?.prefix ? `${options.prefix}${secretName}` : secretName;

      try {
        await provider.storeSecret(finalName, secretValue, {
          description: options?.description || `Migrated from environment: ${secretName}`,
          tags: options?.tags || [
            { Key: 'Source', Value: 'EnvironmentMigration' },
            { Key: 'OriginalName', Value: secretName },
            { Key: 'MigratedAt', Value: new Date().toISOString() }
          ]
        });
        console.log(`✅ Migrated secret: ${secretName} -> ${finalName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate secret ${secretName}:`, error);
      }
    }
  }

  static async validateMigration(provider: SecretProvider, secretNames: string[]): Promise<void> {
    console.log('🔍 Validating secret migration...');
    
    for (const secretName of secretNames) {
      try {
        await provider.getSecret(secretName);
        console.log(`✅ Secret accessible: ${secretName}`);
      } catch (error) {
        console.error(`❌ Secret not accessible: ${secretName}`, error);
        throw error;
      }
    }
    
    console.log('✅ All secrets validated successfully');
  }
}

export default {
  VaultProvider,
  AWSSecretsManagerProvider,
  SecretsProviderFactory,
  SecretsMigration
};
