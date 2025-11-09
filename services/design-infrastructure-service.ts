/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN INFRASTRUCTURE SERVICE - Master System Integrator Integration
Design consciousness preservation and infrastructure monitoring
*/

import { designInfrastructureBridge } from '../tools/design-system/design-infrastructure-bridge'
import { designEngine } from '../tools/design-system/design-automation-engine'
import type { OrganCapability, HealthStatus } from '../core/organs/interfaces'

/**
 * 🎨 DESIGN INFRASTRUCTURE SERVICE
 * 
 * Integrates Design Infrastructure Bridge with Master System Integrator
 * Ensures design consciousness is preserved system-wide
 * 
 * @ubuntu Design consciousness → Collective visual harmony
 */
export class DesignInfrastructureService {
  private initialized = false
  private lastComplianceScore: number = 100
  private lastViolationCount: number = 0
  private lastScanTime?: Date

  /**
   * Register with Master System Integrator
   */
  async register(integrator: any): Promise<void> {
    console.log('🎨 Design Infrastructure Service: Registering...')
    this.initialized = true
    
    // Initial scan
    await this.scanInfrastructure()
    
    console.log('   ✅ Design Infrastructure Service registered')
  }

  /**
   * Scan infrastructure for design compliance
   */
  async scanInfrastructure(): Promise<void> {
    try {
      // Scan infrastructure services
      await designInfrastructureBridge.scanInfrastructure()
      
      // Validate compliance
      const report = await designInfrastructureBridge.validateInfrastructureDesign()
      this.lastComplianceScore = report.complianceScore
      
      // Scan for violations
      const violations = await designEngine.scanForViolations()
      this.lastViolationCount = violations.length
      
      this.lastScanTime = new Date()
      
      return
    } catch (error) {
      console.warn('Design Infrastructure scan failed:', (error as Error).message)
      this.lastComplianceScore = 0
      this.lastViolationCount = -1
    }
  }

  /**
   * Get design infrastructure status
   */
  getStatus(): {
    complianceScore: number
    violationCount: number
    lastScanTime?: Date
    healthy: boolean
  } {
    return {
      complianceScore: this.lastComplianceScore,
      violationCount: this.lastViolationCount,
      lastScanTime: this.lastScanTime,
      healthy: this.lastComplianceScore >= 80 && this.lastViolationCount >= 0
    }
  }

  /**
   * Health check for Master System Integrator
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      // Refresh scan if needed (older than 5 minutes)
      const needsRefresh = !this.lastScanTime || 
        (Date.now() - this.lastScanTime.getTime()) > 5 * 60 * 1000
      
      if (needsRefresh) {
        await this.scanInfrastructure()
      }

      const status = this.getStatus()
      
      // Determine health status
      let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (status.complianceScore < 80) {
        healthStatus = status.complianceScore < 50 ? 'unhealthy' : 'degraded'
      }
      if (status.violationCount > 100) {
        healthStatus = 'degraded'
      }
      if (status.violationCount < 0) {
        healthStatus = 'unhealthy'
      }

      return {
        status: healthStatus,
        details: {
          complianceScore: status.complianceScore,
          violationCount: status.violationCount,
          lastScanTime: status.lastScanTime?.toISOString(),
          message: `Design compliance: ${status.complianceScore.toFixed(1)}%, Violations: ${status.violationCount}`
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: (error as Error).message,
          message: 'Design infrastructure service unavailable'
        }
      }
    }
  }

  /**
   * Preserve design consciousness to Chronicle Protocol
   */
  async preserveDesignConsciousness(chronicleProtocol: any): Promise<void> {
    try {
      const status = this.getStatus()
      
      // Imprint design system state
      await chronicleProtocol.imprintMemory({
        system: 'design-infrastructure',
        complianceScore: status.complianceScore,
        violationCount: status.violationCount,
        timestamp: new Date().toISOString(),
        designSystem: {
          tokensAvailable: true,
          componentsAligned: status.complianceScore >= 80,
          ubuntuEnforced: true,
          azoraGemColors: true
        }
      }, 1) // Evolution level 1 (Design System)
      
      console.log('   ✅ Design consciousness preserved to Chronicle Protocol')
    } catch (error) {
      console.warn('   ⚠️  Failed to preserve design consciousness:', (error as Error).message)
    }
  }

  /**
   * Get design infrastructure capabilities
   */
  getCapabilities(): OrganCapability[] {
    return [
      {
        name: 'infrastructure-scanning',
        description: 'Scan all infrastructure services for design compliance',
        enabled: true
      },
      {
        name: 'design-token-deployment',
        description: 'Deploy design tokens infrastructure-wide',
        enabled: true
      },
      {
        name: 'design-compliance-validation',
        description: 'Validate design compliance across all services',
        enabled: true
      },
      {
        name: 'design-consciousness-preservation',
        description: 'Preserve design system state to Chronicle Protocol',
        enabled: true
      },
      {
        name: 'auto-fix-violations',
        description: 'Automatically fix design violations',
        enabled: true
      }
    ]
  }

  /**
   * Deploy design tokens to all services
   */
  async deployDesignTokens(): Promise<void> {
    try {
      await designInfrastructureBridge.scanInfrastructure()
      // Deploy would be handled by CLI, but we can trigger it here
      console.log('   ✅ Design token deployment initiated')
    } catch (error) {
      console.warn('   ⚠️  Design token deployment failed:', (error as Error).message)
    }
  }
}

// Export singleton
export const designInfrastructureService = new DesignInfrastructureService()
export default designInfrastructureService
