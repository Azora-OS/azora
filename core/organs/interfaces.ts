/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Core organ capability contracts for Azora OS
 *
 * These interfaces define the common contract that every organ/capability
 * must implement in order to integrate with the organism and the
 * Master System Integrator.
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  checks: {
    database: boolean
    externalServices: boolean
    constitutionalGovernor: boolean
  }
  vitals: {
    uptime: number
    memoryUsage: number
    cpuUsage: number
  }
  notes?: string[]
}

export interface OrganCapability {
  /**
   * Unique human‑readable name of the organ capability
   */
  name: string

  /**
   * List of constitutional requirement IDs applicable to this capability
   */
  constitutionalRequirements: string[]

  /**
   * Health probe providing standardized status and vitals
   */
  healthCheck(): Promise<HealthStatus>

  /**
   * Optional registration hook executed by the Master System Integrator
   */
  register?(integrator: { on: Function; emit: Function }): Promise<void> | void
}

export interface SystemStatus {
  initialized: boolean
  servicesOnline: number
  totalServices: number
  health: number // 0..100 aggregated health score
  uptime: number // milliseconds
}
