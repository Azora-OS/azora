/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API GATEWAY CONSTITUTIONAL AI INTEGRATION
Integrates Constitutional AI validation into the API Gateway
*/

import express, { Application } from 'express';
import { ConstitutionalOrchestrator } from '../services/constitutional-ai/orchestrator';
import {
  createConstitutionalMiddleware,
  createValidationRulesMiddleware,
  createComplianceMetricsMiddleware,
  createConstitutionalHealthCheck,
  ConstitutionalMiddlewareConfig
} from '../services/constitutional-ai/middleware/constitutional-middleware';
import { ConstitutionalAIConfig } from '../services/constitutional-ai/types';

/**
 * Constitutional AI Integration Configuration
 */
export interface ConstitutionalIntegrationConfig {
  // Constitutional AI configuration
  constitutional: Partial<ConstitutionalAIConfig>;
  
  // Middleware configuration
  middleware: Partial<ConstitutionalMiddlewareConfig>;
  
  // Integration options
  enableMetricsEndpoint?: boolean;
  enableHealthEndpoint?: boolean;
  enableDynamicRules?: boolean;
  metricsPath?: string;
  healthPath?: string;
}

/**
 * Default integration configuration
 */
const DEFAULT_INTEGRATION_CONFIG: ConstitutionalIntegrationConfig = {
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
  },
  enableMetricsEndpoint: true,
  enableHealthEndpoint: true,
  enableDynamicRules: true,
  metricsPath: '/constitutional/metrics',
  healthPath: '/constitutional/health'
};

/**
 * Constitutional AI Integration Manager
 * Manages the integration of Constitutional AI into the API Gateway
 */
export class ConstitutionalIntegration {
  private orchestrator: ConstitutionalOrchestrator;
  private config: ConstitutionalIntegrationConfig;
  private isInitialized: boolean = false;

  constructor(config: Partial<ConstitutionalIntegrationConfig> = {}) {
    this.config = this.mergeConfig(config);
    this.orchestrator = new ConstitutionalOrchestrator(this.config.constitutional);
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(
    userConfig: Partial<ConstitutionalIntegrationConfig>
  ): ConstitutionalIntegrationConfig {
    return {
      constitutional: {
        ...DEFAULT_INTEGRATION_CONFIG.constitutional,
        ...userConfig.constitutional
      },
      middleware: {
        ...DEFAULT_INTEGRATION_CONFIG.middleware,
        ...userConfig.middleware
      },
      enableMetricsEndpoint: userConfig.enableMetricsEndpoint ?? DEFAULT_INTEGRATION_CONFIG.enableMetricsEndpoint,
      enableHealthEndpoint: userConfig.enableHealthEndpoint ?? DEFAULT_INTEGRATION_CONFIG.enableHealthEndpoint,
      enableDynamicRules: userConfig.enableDynamicRules ?? DEFAULT_INTEGRATION_CONFIG.enableDynamicRules,
      metricsPath: userConfig.metricsPath ?? DEFAULT_INTEGRATION_CONFIG.metricsPath,
      healthPath: userConfig.healthPath ?? DEFAULT_INTEGRATION_CONFIG.healthPath
    };
  }

  /**
   * Integrate Constitutional AI into Express app
   */
  integrate(app: Application): void {
    if (this.isInitialized) {
      console.warn('Constitutional AI already integrated');
      return;
    }

    console.log('🛡️  Integrating Constitutional AI into API Gateway...');

    // Add body parser if not already present (needed for validation)
    app.use(express.json());

    // Add dynamic validation rules middleware (if enabled)
    if (this.config.enableDynamicRules) {
      app.use(createValidationRulesMiddleware(this.orchestrator));
      console.log('✓ Dynamic validation rules enabled');
    }

    // Add constitutional validation middleware
    const constitutionalMiddleware = createConstitutionalMiddleware(
      this.orchestrator,
      this.config.middleware
    );
    app.use(constitutionalMiddleware);
    console.log('✓ Constitutional validation middleware active');

    // Add metrics endpoint (if enabled)
    if (this.config.enableMetricsEndpoint && this.config.metricsPath) {
      app.get(
        this.config.metricsPath,
        createComplianceMetricsMiddleware(this.orchestrator)
      );
      console.log(`✓ Metrics endpoint: ${this.config.metricsPath}`);
    }

    // Add health check endpoint (if enabled)
    if (this.config.enableHealthEndpoint && this.config.healthPath) {
      app.get(
        this.config.healthPath,
        createConstitutionalHealthCheck(this.orchestrator)
      );
      console.log(`✓ Health endpoint: ${this.config.healthPath}`);
    }

    this.isInitialized = true;
    console.log('✅ Constitutional AI integration complete');
    this.logConfiguration();
  }

  /**
   * Log current configuration
   */
  private logConfiguration(): void {
    console.log('\n📋 Constitutional AI Configuration:');
    console.log(`   Ubuntu Validation: ${this.config.constitutional.ubuntuEnabled ? '✓' : '✗'}`);
    console.log(`   Bias Detection: ${this.config.constitutional.biasDetectionEnabled ? '✓' : '✗'}`);
    console.log(`   Privacy Filter: ${this.config.constitutional.privacyFilterEnabled ? '✓' : '✗'}`);
    console.log(`   Harm Prevention: ${this.config.constitutional.harmPreventionEnabled ? '✓' : '✗'}`);
    console.log(`   Audit Logging: ${this.config.constitutional.auditLoggingEnabled ? '✓' : '✗'}`);
    console.log(`   Min Compliance Score: ${this.config.constitutional.minComplianceScore}`);
    console.log(`   Strict Mode: ${this.config.constitutional.strictMode ? '✓' : '✗'}`);
    console.log(`   On Violation: ${this.config.middleware.onViolation}`);
    console.log('');
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<ConstitutionalIntegrationConfig>): void {
    this.config = this.mergeConfig(config);
    
    if (config.constitutional) {
      this.orchestrator.updateConfig(config.constitutional);
    }
    
    console.log('✓ Constitutional AI configuration updated');
    this.logConfiguration();
  }

  /**
   * Get orchestrator instance
   */
  getOrchestrator(): ConstitutionalOrchestrator {
    return this.orchestrator;
  }

  /**
   * Get current configuration
   */
  getConfig(): ConstitutionalIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Get compliance metrics
   */
  async getMetrics() {
    return await this.orchestrator.getComplianceMetrics();
  }

  /**
   * Check if integration is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Shutdown integration gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Constitutional AI integration...');
    await this.orchestrator.shutdown();
    this.isInitialized = false;
    console.log('✓ Constitutional AI shutdown complete');
  }
}

/**
 * Factory function to create and integrate Constitutional AI
 */
export function integrateConstitutionalAI(
  app: Application,
  config?: Partial<ConstitutionalIntegrationConfig>
): ConstitutionalIntegration {
  const integration = new ConstitutionalIntegration(config);
  integration.integrate(app);
  return integration;
}

/**
 * Export default integration instance creator
 */
export default integrateConstitutionalAI;
