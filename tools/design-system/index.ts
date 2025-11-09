/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN SYSTEM TOOLS - Unified Export
Main entry point for all design system automation tools
*/

// Core Engines
export { designEngine, DesignAutomationEngine } from './design-automation-engine'
export { designInfrastructureBridge, DesignInfrastructureBridge } from './design-infrastructure-bridge'

// CLI
export { default as InfrastructureDesignCLI } from './infrastructure-design-cli'

// Tests
export { default as InfrastructureIntegrationTests } from './infrastructure-integration-tests'

// Types
export type {
  DesignViolation,
  ComponentValidationResult,
  DesignSystemReport,
  ViolationSeverity,
  ViolationType
} from './types'

export type {
  InfrastructureDesignReport,
  NonCompliantService,
  DesignInfrastructureStatus,
  DesignHealthStatus
} from './types'

// Re-export design tokens for convenience
export { AZORA_GEM_TOKENS, AZORA_GEM_COLORS } from '../../apps/azora-ui/lib/design-system/azora-gem-tokens'

/**
 * 🎨 DESIGN SYSTEM TOOLS
 * 
 * Complete design automation and infrastructure integration
 * 
 * Usage:
 * ```typescript
 * import { designEngine, designInfrastructureBridge } from '@azora/design-system-tools'
 * 
 * // Scan for violations
 * const violations = await designEngine.scanForViolations()
 * 
 * // Deploy design tokens
 * await designInfrastructureBridge.deployDesignTokens(servicePath)
 * ```
 */
export default {
  designEngine,
  designInfrastructureBridge,
  version: '1.0.0'
}
