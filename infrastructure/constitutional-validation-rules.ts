/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CONSTITUTIONAL VALIDATION RULES CONFIGURATION
Defines validation rules for different API endpoints and use cases
*/

import { ConstitutionalIntegrationConfig } from './api-gateway-constitutional-integration';

/**
 * Validation rule profiles for different scenarios
 */
export const VALIDATION_PROFILES = {
  /**
   * Strict profile - Maximum validation
   * Use for: Public-facing AI, educational content, user-generated content
   */
  STRICT: {
    constitutional: {
      ubuntuEnabled: true,
      ubuntuThreshold: 80,
      biasDetectionEnabled: true,
      autoMitigateBias: true,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      harmPreventionEnabled: true,
      harmSeverityThreshold: 3,
      blockHarmfulContent: true,
      auditLoggingEnabled: true,
      auditLogRetention: 90,
      validationTimeout: 5000,
      parallelValidation: true,
      minComplianceScore: 80,
      strictMode: true
    },
    middleware: {
      enabled: true,
      skipPaths: ['/health', '/metrics', '/status'],
      skipMethods: ['OPTIONS', 'HEAD'],
      onViolation: 'block',
      includeMetadata: true
    }
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Standard profile - Balanced validation
   * Use for: General API endpoints, internal tools
   */
  STANDARD: {
    constitutional: {
      ubuntuEnabled: true,
      ubuntuThreshold: 70,
      biasDetectionEnabled: true,
      autoMitigateBias: true,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      harmPreventionEnabled: true,
      harmSeverityThreshold: 5,
      blockHarmfulContent: true,
      auditLoggingEnabled: true,
      auditLogRetention: 90,
      validationTimeout: 5000,
      parallelValidation: true,
      minComplianceScore: 70,
      strictMode: false
    },
    middleware: {
      enabled: true,
      skipPaths: ['/health', '/metrics', '/status', '/constitutional'],
      skipMethods: ['OPTIONS', 'HEAD'],
      onViolation: 'block',
      includeMetadata: false
    }
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Lenient profile - Minimal validation
   * Use for: Internal APIs, development, testing
   */
  LENIENT: {
    constitutional: {
      ubuntuEnabled: true,
      ubuntuThreshold: 60,
      biasDetectionEnabled: true,
      autoMitigateBias: false,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      harmPreventionEnabled: true,
      harmSeverityThreshold: 7,
      blockHarmfulContent: true,
      auditLoggingEnabled: true,
      auditLogRetention: 30,
      validationTimeout: 3000,
      parallelValidation: true,
      minComplianceScore: 60,
      strictMode: false
    },
    middleware: {
      enabled: true,
      skipPaths: ['/health', '/metrics', '/status', '/constitutional', '/internal'],
      skipMethods: ['OPTIONS', 'HEAD'],
      onViolation: 'warn',
      includeMetadata: true
    }
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Development profile - Logging only
   * Use for: Local development, debugging
   */
  DEVELOPMENT: {
    constitutional: {
      ubuntuEnabled: true,
      ubuntuThreshold: 50,
      biasDetectionEnabled: true,
      autoMitigateBias: false,
      privacyFilterEnabled: false,
      piiRedactionEnabled: false,
      harmPreventionEnabled: true,
      harmSeverityThreshold: 8,
      blockHarmfulContent: false,
      auditLoggingEnabled: true,
      auditLogRetention: 7,
      validationTimeout: 2000,
      parallelValidation: true,
      minComplianceScore: 50,
      strictMode: false
    },
    middleware: {
      enabled: true,
      skipPaths: ['/health', '/metrics', '/status'],
      skipMethods: ['OPTIONS', 'HEAD'],
      onViolation: 'log',
      includeMetadata: true
    }
  } as Partial<ConstitutionalIntegrationConfig>
};

/**
 * Endpoint-specific validation rules
 * Maps API paths to validation profiles
 */
export const ENDPOINT_RULES = {
  // AI-powered endpoints - Strict validation
  '/api/ai': VALIDATION_PROFILES.STRICT,
  '/api/chat': VALIDATION_PROFILES.STRICT,
  '/api/education/ai': VALIDATION_PROFILES.STRICT,
  '/api/sapiens': VALIDATION_PROFILES.STRICT,
  
  // User-facing endpoints - Standard validation
  '/api/education': VALIDATION_PROFILES.STANDARD,
  '/api/mint': VALIDATION_PROFILES.STANDARD,
  '/api/forge': VALIDATION_PROFILES.STANDARD,
  
  // Internal endpoints - Lenient validation
  '/api/internal': VALIDATION_PROFILES.LENIENT,
  '/api/admin': VALIDATION_PROFILES.LENIENT,
  
  // Development endpoints - Development profile
  '/api/dev': VALIDATION_PROFILES.DEVELOPMENT,
  '/api/test': VALIDATION_PROFILES.DEVELOPMENT
};

/**
 * Get validation profile based on environment
 */
export function getValidationProfileForEnvironment(): Partial<ConstitutionalIntegrationConfig> {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return VALIDATION_PROFILES.STRICT;
    case 'development':
      return VALIDATION_PROFILES.DEVELOPMENT;
    case 'test':
      return VALIDATION_PROFILES.LENIENT;
    default:
      // Treat staging and any other environment as standard
      return VALIDATION_PROFILES.STANDARD;
  }
}

/**
 * Get validation profile for specific endpoint
 */
export function getValidationProfileForEndpoint(
  path: string
): Partial<ConstitutionalIntegrationConfig> {
  // Check for exact match
  const exactMatch = ENDPOINT_RULES[path as keyof typeof ENDPOINT_RULES];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Check for prefix match
  for (const [rulePath, profile] of Object.entries(ENDPOINT_RULES)) {
    if (path.startsWith(rulePath)) {
      return profile;
    }
  }
  
  // Default to environment-based profile
  return getValidationProfileForEnvironment();
}

/**
 * Custom validation rules for specific use cases
 */
export const CUSTOM_RULES = {
  /**
   * Educational content - Extra strict on bias and harm
   */
  EDUCATIONAL: {
    constitutional: {
      ...VALIDATION_PROFILES.STRICT.constitutional,
      ubuntuThreshold: 85,
      harmSeverityThreshold: 2,
      minComplianceScore: 85
    },
    middleware: VALIDATION_PROFILES.STRICT.middleware
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Financial content - Extra strict on privacy
   */
  FINANCIAL: {
    constitutional: {
      ...VALIDATION_PROFILES.STRICT.constitutional,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      piiTypes: ['email', 'phone', 'ssn', 'credit_card', 'bank_account']
    },
    middleware: {
      ...VALIDATION_PROFILES.STRICT.middleware,
      onViolation: 'block'
    }
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Healthcare content - Maximum privacy protection
   */
  HEALTHCARE: {
    constitutional: {
      ...VALIDATION_PROFILES.STRICT.constitutional,
      privacyFilterEnabled: true,
      piiRedactionEnabled: true,
      piiTypes: ['email', 'phone', 'ssn', 'medical_record', 'health_info'],
      auditLogRetention: 365 // HIPAA compliance
    },
    middleware: {
      ...VALIDATION_PROFILES.STRICT.middleware,
      onViolation: 'block',
      includeMetadata: false // Don't leak validation details
    }
  } as Partial<ConstitutionalIntegrationConfig>,

  /**
   * Public API - Balanced with rate limiting
   */
  PUBLIC_API: {
    constitutional: {
      ...VALIDATION_PROFILES.STANDARD.constitutional,
      validationTimeout: 3000 // Faster timeout for public API
    },
    middleware: {
      ...VALIDATION_PROFILES.STANDARD.middleware,
      onViolation: 'block'
    }
  } as Partial<ConstitutionalIntegrationConfig>
};

/**
 * Validation rule builder for custom configurations
 */
export class ValidationRuleBuilder {
  private config: Partial<ConstitutionalIntegrationConfig>;

  constructor(baseProfile: Partial<ConstitutionalIntegrationConfig> = VALIDATION_PROFILES.STANDARD) {
    this.config = JSON.parse(JSON.stringify(baseProfile)); // Deep clone
  }

  /**
   * Enable/disable Ubuntu validation
   */
  withUbuntu(enabled: boolean, threshold?: number): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.ubuntuEnabled = enabled;
    if (threshold !== undefined) {
      this.config.constitutional.ubuntuThreshold = threshold;
    }
    return this;
  }

  /**
   * Enable/disable bias detection
   */
  withBiasDetection(enabled: boolean, autoMitigate?: boolean): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.biasDetectionEnabled = enabled;
    if (autoMitigate !== undefined) {
      this.config.constitutional.autoMitigateBias = autoMitigate;
    }
    return this;
  }

  /**
   * Enable/disable privacy filter
   */
  withPrivacyFilter(enabled: boolean, redactPII?: boolean): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.privacyFilterEnabled = enabled;
    if (redactPII !== undefined) {
      this.config.constitutional.piiRedactionEnabled = redactPII;
    }
    return this;
  }

  /**
   * Enable/disable harm prevention
   */
  withHarmPrevention(enabled: boolean, threshold?: number): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.harmPreventionEnabled = enabled;
    if (threshold !== undefined) {
      this.config.constitutional.harmSeverityThreshold = threshold;
    }
    return this;
  }

  /**
   * Set minimum compliance score
   */
  withMinComplianceScore(score: number): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.minComplianceScore = score;
    return this;
  }

  /**
   * Set violation action
   */
  withViolationAction(action: 'block' | 'warn' | 'log'): this {
    if (!this.config.middleware) {this.config.middleware = {};}
    this.config.middleware.onViolation = action;
    return this;
  }

  /**
   * Add skip paths
   */
  withSkipPaths(paths: string[]): this {
    if (!this.config.middleware) {this.config.middleware = {};}
    this.config.middleware.skipPaths = [
      ...(this.config.middleware.skipPaths || []),
      ...paths
    ];
    return this;
  }

  /**
   * Enable strict mode
   */
  withStrictMode(enabled: boolean): this {
    if (!this.config.constitutional) {this.config.constitutional = {};}
    this.config.constitutional.strictMode = enabled;
    return this;
  }

  /**
   * Build final configuration
   */
  build(): Partial<ConstitutionalIntegrationConfig> {
    return this.config;
  }
}

/**
 * Export default configuration based on environment
 */
export default getValidationProfileForEnvironment();
