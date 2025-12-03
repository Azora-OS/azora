/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API GATEWAY WITH CONSTITUTIONAL AI - EXAMPLE USAGE
Demonstrates how to configure and use Constitutional AI in the API Gateway
*/

import { AzoraAPIGateway } from './api-gateway-master';
import { 
  VALIDATION_PROFILES, 
  CUSTOM_RULES,
  ValidationRuleBuilder,
  getValidationProfileForEnvironment 
} from './constitutional-validation-rules';

/**
 * Example 1: Basic usage with default configuration
 */
export function createBasicGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 2: Gateway with strict validation profile
 */
export function createStrictGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: VALIDATION_PROFILES.STRICT
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 3: Gateway with custom educational rules
 */
export function createEducationalGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: CUSTOM_RULES.EDUCATIONAL
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 4: Gateway with environment-based configuration
 */
export function createEnvironmentGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: getValidationProfileForEnvironment()
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 5: Gateway with custom validation rules using builder
 */
export function createCustomGateway() {
  const customConfig = new ValidationRuleBuilder(VALIDATION_PROFILES.STANDARD)
    .withUbuntu(true, 75)
    .withBiasDetection(true, true)
    .withPrivacyFilter(true, true)
    .withHarmPrevention(true, 4)
    .withMinComplianceScore(75)
    .withViolationAction('block')
    .withSkipPaths(['/api/internal', '/api/dev'])
    .withStrictMode(false)
    .build();

  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: customConfig
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 6: Gateway with runtime configuration updates
 */
export async function createDynamicGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: VALIDATION_PROFILES.STANDARD
  });
  
  gateway.start(8080);
  
  // Update configuration at runtime
  const integration = gateway.getConstitutionalIntegration();
  if (integration) {
    integration.updateConfig({
      constitutional: {
        strictMode: true,
        minComplianceScore: 80
      }
    });
  }
  
  return gateway;
}

/**
 * Example 7: Gateway with metrics monitoring
 */
export async function createMonitoredGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: {
      ...VALIDATION_PROFILES.STANDARD,
      enableMetricsEndpoint: true,
      enableHealthEndpoint: true,
      metricsPath: '/constitutional/metrics',
      healthPath: '/constitutional/health'
    }
  });
  
  gateway.start(8080);
  
  // Monitor metrics periodically
  const integration = gateway.getConstitutionalIntegration();
  if (integration) {
    setInterval(async () => {
      const metrics = await integration.getMetrics();
      console.log('Constitutional AI Metrics:', metrics);
    }, 60000); // Every minute
  }
  
  return gateway;
}

/**
 * Example 8: Gateway with graceful shutdown
 */
export async function createGracefulGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true
  });
  
  gateway.start(8080);
  
  // Handle shutdown signals
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await gateway.shutdown();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await gateway.shutdown();
    process.exit(0);
  });
  
  return gateway;
}

/**
 * Example 9: Gateway with disabled Constitutional AI
 */
export function createUnprotectedGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: false
  });
  
  gateway.start(8080);
  return gateway;
}

/**
 * Example 10: Production-ready gateway configuration
 */
export function createProductionGateway() {
  const gateway = new AzoraAPIGateway({
    enableConstitutionalAI: true,
    constitutionalConfig: {
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
        includeMetadata: false
      },
      enableMetricsEndpoint: true,
      enableHealthEndpoint: true,
      enableDynamicRules: true,
      metricsPath: '/constitutional/metrics',
      healthPath: '/constitutional/health'
    }
  });
  
  // Start gateway
  const port = parseInt(process.env.PORT || '8080', 10);
  gateway.start(port);
  
  // Setup graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await gateway.shutdown();
    process.exit(0);
  });
  
  return gateway;
}

// Export default production configuration
export default createProductionGateway;
