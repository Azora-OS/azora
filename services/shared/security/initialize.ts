/**
 * Security Services Initialization
 * Initializes all security services for Phase 1 implementation
 */

import {
  initializeKeyManagement,
  initializeSecretsManagement,
  initializeGDPRCompliance
} from './index';

interface SecurityConfig {
  // Key Management
  keyManagement?: {
    provider: 'kms' | 'vault' | 'local';
    kmsRegion?: string;
    vaultAddr?: string;
    vaultToken?: string;
    rotationIntervalDays?: number;
  };

  // Secrets Management
  secretsManagement?: {
    provider: 'vault' | 'aws-secrets-manager' | 'local';
    vaultAddr?: string;
    vaultToken?: string;
    awsRegion?: string;
    rotationIntervalDays?: number;
    encryptionKey?: string;
  };

  // GDPR Compliance
  gdprCompliance?: {
    organizationName: string;
    dataProtectionOfficer?: string;
    privacyPolicyUrl?: string;
  };
}

/**
 * Initialize all security services
 */
export async function initializeSecurityServices(config: SecurityConfig): Promise<{
  keyManagement: any;
  secretsManagement: any;
  gdprCompliance: any;
}> {
  try {
    console.log('🔐 Initializing Security Services...');

    // Initialize Key Management
    console.log('  ├─ Initializing Key Management Service...');
    const keyManagement = initializeKeyManagement(
      config.keyManagement || {
        provider: process.env.KEY_MANAGEMENT_PROVIDER as any || 'local',
        rotationIntervalDays: 90
      }
    );
    console.log('  ├─ ✅ Key Management Service initialized');

    // Initialize Secrets Management
    console.log('  ├─ Initializing Secrets Management Service...');
    const secretsManagement = initializeSecretsManagement(
      config.secretsManagement || {
        provider: process.env.SECRETS_PROVIDER as any || 'local',
        rotationIntervalDays: 30,
        encryptionKey: process.env.ENCRYPTION_KEY
      }
    );
    console.log('  ├─ ✅ Secrets Management Service initialized');

    // Initialize GDPR Compliance
    console.log('  ├─ Initializing GDPR Compliance Service...');
    const gdprCompliance = initializeGDPRCompliance(
      config.gdprCompliance || {
        organizationName: process.env.ORGANIZATION_NAME || 'Azora OS',
        dataProtectionOfficer: process.env.DPO_EMAIL,
        privacyPolicyUrl: process.env.PRIVACY_POLICY_URL
      }
    );
    console.log('  ├─ ✅ GDPR Compliance Service initialized');

    console.log('✅ All Security Services initialized successfully\n');

    return {
      keyManagement,
      secretsManagement,
      gdprCompliance
    };
  } catch (error) {
    console.error('❌ Failed to initialize security services:', error);
    throw error;
  }
}

/**
 * Setup security middleware for Express app
 */
export function setupSecurityMiddleware(app: any): void {
  try {
    console.log('🔒 Setting up Security Middleware...');

    const {
      configureSecurityHeaders,
      configureRateLimiting,
      configureSanitization,
      configureCORS
    } = require('./index');

    // Configure CORS
    console.log('  ├─ Configuring CORS...');
    configureCORS(app);
    console.log('  ├─ ✅ CORS configured');

    // Configure Security Headers
    console.log('  ├─ Configuring Security Headers...');
    configureSecurityHeaders(app);
    console.log('  ├─ ✅ Security Headers configured');

    // Configure Rate Limiting
    console.log('  ├─ Configuring Rate Limiting...');
    configureRateLimiting(app);
    console.log('  ├─ ✅ Rate Limiting configured');

    // Configure Data Sanitization
    console.log('  ├─ Configuring Data Sanitization...');
    configureSanitization(app);
    console.log('  ├─ ✅ Data Sanitization configured');

    console.log('✅ Security Middleware setup complete\n');
  } catch (error) {
    console.error('❌ Failed to setup security middleware:', error);
    throw error;
  }
}

/**
 * Migrate secrets from environment to secrets management
 */
export async function migrateSecretsFromEnvironment(
  secretsManagement: any,
  secretNames: string[]
): Promise<void> {
  try {
    console.log('🔄 Migrating Secrets from Environment...');

    for (const secretName of secretNames) {
      const secretValue = process.env[secretName];
      if (secretValue) {
        await secretsManagement.storeSecret(secretName, secretValue, {
          metadata: { migratedAt: new Date() }
        });
        console.log(`  ├─ ✅ Migrated ${secretName}`);
      }
    }

    console.log('✅ Secrets migration complete\n');
  } catch (error) {
    console.error('❌ Failed to migrate secrets:', error);
    throw error;
  }
}

/**
 * Generate encryption keys for services
 */
export async function generateEncryptionKeys(
  keyManagement: any,
  services: string[]
): Promise<void> {
  try {
    console.log('🔑 Generating Encryption Keys...');

    for (const service of services) {
      const keyId = `${service}-key`;
      await keyManagement.generateKey(keyId, 'aes-256-gcm');
      console.log(`  ├─ ✅ Generated key for ${service}`);
    }

    console.log('✅ Encryption keys generation complete\n');
  } catch (error) {
    console.error('❌ Failed to generate encryption keys:', error);
    throw error;
  }
}

/**
 * Setup GDPR compliance documentation
 */
export async function setupGDPRDocumentation(
  gdprCompliance: any
): Promise<void> {
  try {
    console.log('📋 Setting up GDPR Documentation...');

    // Create Data Processing Agreement
    console.log('  ├─ Creating Data Processing Agreement...');
    await gdprCompliance.createDPA(
      'Azora OS',
      'Data Processors',
      {
        processingPurpose: 'Provide educational and financial services',
        dataCategories: [
          'Personal Identification Data',
          'Contact Information',
          'Educational Records',
          'Financial Information'
        ],
        recipients: ['Internal Services', 'Third-party Processors'],
        retentionPeriod: 365
      }
    );
    console.log('  ├─ ✅ Data Processing Agreement created');

    // Create Privacy Impact Assessment
    console.log('  ├─ Creating Privacy Impact Assessment...');
    await gdprCompliance.createPIA(
      'User Data Processing',
      {
        description: 'Assessment of user data processing activities',
        dataCategories: [
          'Personal Identification Data',
          'Contact Information',
          'Educational Records'
        ],
        riskLevel: 'medium',
        mitigationMeasures: [
          'Encryption at rest and in transit',
          'Access control and authentication',
          'Regular security audits',
          'Data minimization practices'
        ]
      }
    );
    console.log('  ├─ ✅ Privacy Impact Assessment created');

    console.log('✅ GDPR documentation setup complete\n');
  } catch (error) {
    console.error('❌ Failed to setup GDPR documentation:', error);
    throw error;
  }
}

/**
 * Complete Phase 1 security implementation
 */
export async function implementPhase1Security(app: any): Promise<void> {
  try {
    console.log('\n🚀 Starting Phase 1: Security & Compliance Implementation\n');

    // Initialize security services
    const services = await initializeSecurityServices({});

    // Setup security middleware
    setupSecurityMiddleware(app);

    // Generate encryption keys
    await generateEncryptionKeys(services.keyManagement, [
      'auth-service',
      'api-gateway',
      'database',
      'cache'
    ]);

    // Migrate secrets from environment
    await migrateSecretsFromEnvironment(services.secretsManagement, [
      'JWT_SECRET',
      'DATABASE_URL',
      'REDIS_URL',
      'API_KEY',
      'ENCRYPTION_KEY'
    ]);

    // Setup GDPR documentation
    await setupGDPRDocumentation(services.gdprCompliance);

    console.log('✅ Phase 1 Security & Compliance Implementation Complete!\n');
    console.log('📊 Summary:');
    console.log('  ✅ Key Management Service initialized');
    console.log('  ✅ Secrets Management Service initialized');
    console.log('  ✅ GDPR Compliance Service initialized');
    console.log('  ✅ Security Middleware configured');
    console.log('  ✅ Encryption keys generated');
    console.log('  ✅ Secrets migrated from environment');
    console.log('  ✅ GDPR documentation created\n');
  } catch (error) {
    console.error('❌ Phase 1 implementation failed:', error);
    throw error;
  }
}

export default {
  initializeSecurityServices,
  setupSecurityMiddleware,
  migrateSecretsFromEnvironment,
  generateEncryptionKeys,
  setupGDPRDocumentation,
  implementPhase1Security
};
