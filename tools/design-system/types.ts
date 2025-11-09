/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN SYSTEM TYPES
Type definitions for design system tools
*/

/**
 * Design violation severity levels
 */
export type ViolationSeverity = 'error' | 'warning' | 'info'

/**
 * Design violation types
 */
export type ViolationType = 
  | 'generic-color-usage'
  | 'missing-accessibility'
  | 'hardcoded-spacing'
  | 'missing-ubuntu-docs'
  | 'missing-design-tokens'
  | 'non-compliant-component'

/**
 * Design violation
 */
export interface DesignViolation {
  file: string
  line: number
  type: ViolationType
  severity: ViolationSeverity
  message: string
  suggestion?: string
}

/**
 * Component validation result
 */
export interface ComponentValidationResult {
  file: string
  score: number
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Design system report
 */
export interface DesignSystemReport {
  timestamp: string
  violations: DesignViolation[]
  complianceScore: number
  recommendations: string[]
  generatedComponents: string[]
  fixedComponents: string[]
}

/**
 * Infrastructure design report
 */
export interface InfrastructureDesignReport {
  timestamp: string
  totalServices: number
  compliantServices: number
  nonCompliantServices: NonCompliantService[]
  complianceScore: number
  violations: DesignViolation[]
}

/**
 * Non-compliant service details
 */
export interface NonCompliantService {
  service: string
  hasDesignTokens: boolean
  hasComponents: boolean
  violations: number
  details?: {
    missingTokens?: boolean
    missingConfig?: boolean
    violationTypes?: ViolationType[]
  }
}

/**
 * Design infrastructure status
 */
export interface DesignInfrastructureStatus {
  complianceScore: number
  violationCount: number
  lastScanTime?: Date
  healthy: boolean
}

/**
 * Health status for design infrastructure
 */
export interface DesignHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    complianceScore: number
    violationCount: number
    lastScanTime?: string
    message: string
    error?: string
  }
}
