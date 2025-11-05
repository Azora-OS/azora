/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Elara Workspaces - Development & Orchestration Platform
 * Powered by Elara AI (Constitutional Superintelligence)
 * 
 * Export all workspace subsystems:
 * - System Orchestrator: Manages all 9 Azora services
 * - Code Intelligence: AI-powered code analysis with Constitutional compliance
 * - Dev Environment: Full IDE with collaboration features
 */

import systemOrchestrator from './system-orchestrator'
import codeIntelligence from './code-intelligence'
import devEnvironment from './dev-environment'

export {
  systemOrchestrator,
  codeIntelligence,
  devEnvironment,
}

export default {
  orchestrator: systemOrchestrator,
  codeIntelligence,
  devEnvironment,
  
  /**
   * Initialize all Elara Workspace systems
   */
  async initialize() {
    console.log('🚀 Initializing Elara Workspaces (Powered by Elara AI)...')
    
    await systemOrchestrator?.initialize()
    await codeIntelligence?.analyzeCodebase(process.cwd())
    await devEnvironment?.initialize({ rootPath: process.cwd() })
    
    console.log('✅ Elara Workspaces fully operational')
    
    return {
      orchestrator: systemOrchestrator,
      codeIntelligence,
      devEnvironment,
    }
  },
  
  /**
   * Get complete system status
   */
  getStatus() {
    return {
      orchestrator: systemOrchestrator?.getSystemStatus(),
      codeIntelligence: codeIntelligence?.getStatistics(),
      devEnvironment: devEnvironment?.getStatus(),
      timestamp: Date.now(),
    }
  },
}
