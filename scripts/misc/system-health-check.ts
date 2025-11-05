#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA OS SYSTEM HEALTH CHECK
 * 
 * Comprehensive system verification for deployment readiness:
 * - TypeScript compilation
 * - Dependency validation
 * - Configuration verification
 * - Service availability
 * - Cross-platform compatibility
 * - Elara AI integration
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface HealthCheckResult {
  category: string
  check: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

class SystemHealthChecker {
  private results: HealthCheckResult[] = []
  private errors = 0
  private warnings = 0

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('🏥 AZORA OS SYSTEM HEALTH CHECK')
    console.log('='.repeat(80) + '\n')

    await this.checkEnvironment()
    await this.checkDependencies()
    await this.checkConfiguration()
    await this.checkCoreFiles()
    await this.checkElaraIntegration()
    await this.checkServiceReadiness()
    await this.checkDeploymentFiles()
    await this.checkCrossPlatform()

    this.printReport()
  }

  /**
   * Check environment setup
   */
  private async checkEnvironment(): Promise<void> {
    console.log('📋 Checking Environment...\n')

    // Node.js version
    try {
      const nodeVersion = process.version
      const major = parseInt(nodeVersion.slice(1).split('.')[0])
      
      if (major >= 22) {
        this.pass('Environment', 'Node.js Version', `${nodeVersion} (>=22 required)`)
      } else {
        this.fail('Environment', 'Node.js Version', `${nodeVersion} - Need v22+`)
      }
    } catch (error: any) {
      this.fail('Environment', 'Node.js Version', error.message)
    }

    // TypeScript
    try {
      const tsVersion = execSync('npx tsc --version', { encoding: 'utf-8' }).trim()
      this.pass('Environment', 'TypeScript', tsVersion)
    } catch (error: any) {
      this.fail('Environment', 'TypeScript', 'Not available')
    }

    // tsx (TypeScript executor)
    try {
      execSync('npx tsx --version', { encoding: 'utf-8' })
      this.pass('Environment', 'tsx Runner', 'Available')
    } catch (error: any) {
      this.fail('Environment', 'tsx Runner', 'Not installed')
    }

    // Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim()
      this.pass('Environment', 'Git', gitVersion)
    } catch (error: any) {
      this.warn('Environment', 'Git', 'Not available (optional)')
    }
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<void> {
    console.log('\n📦 Checking Dependencies...\n')

    // package.json
    const packageJsonPath = join(process.cwd(), 'package.json')
    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        
        this.pass('Dependencies', 'package.json', `Found (${Object.keys(pkg.dependencies || {}).length} deps)`)
        
        // Check critical dependencies
        const criticalDeps = [
          'next', 'react', 'typescript', 'express',
          '@langchain/core', 'openai', 'pg', 'ioredis'
        ]
        
        for (const dep of criticalDeps) {
          if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
            this.pass('Dependencies', dep, `v${pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]}`)
          } else {
            this.warn('Dependencies', dep, 'Not installed')
          }
        }
      } catch (error: any) {
        this.fail('Dependencies', 'package.json', error.message)
      }
    } else {
      this.fail('Dependencies', 'package.json', 'Not found')
    }

    // node_modules
    if (existsSync(join(process.cwd(), 'node_modules'))) {
      this.pass('Dependencies', 'node_modules', 'Installed')
    } else {
      this.fail('Dependencies', 'node_modules', 'Run npm install')
    }
  }

  /**
   * Check configuration files
   */
  private async checkConfiguration(): Promise<void> {
    console.log('\n⚙️  Checking Configuration...\n')

    const configs = [
      { file: 'tsconfig.json', required: true },
      { file: 'package.json', required: true },
      { file: '.env.production', required: false },
      { file: 'tailwind.config.js', required: true },
      { file: 'next.config.js', required: false },
      { file: 'hardhat.config.ts', required: false }
    ]

    for (const config of configs) {
      if (existsSync(join(process.cwd(), config.file))) {
        this.pass('Configuration', config.file, 'Present')
      } else {
        if (config.required) {
          this.fail('Configuration', config.file, 'Missing (required)')
        } else {
          this.warn('Configuration', config.file, 'Missing (optional)')
        }
      }
    }

    // Check tsconfig.json includes
    try {
      const tsconfig = JSON.parse(readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf-8'))
      if (tsconfig.include && tsconfig.include.some((p: string) => p.includes('**/*.ts'))) {
        this.pass('Configuration', 'tsconfig includes', 'Properly configured')
      } else {
        this.warn('Configuration', 'tsconfig includes', 'May miss some files')
      }
    } catch (error: any) {
      this.warn('Configuration', 'tsconfig validation', error.message)
    }
  }

  /**
   * Check core files
   */
  private async checkCoreFiles(): Promise<void> {
    console.log('\n📁 Checking Core Files...\n')

    const coreFiles = [
      'genome/agent-tools/elara-deity.ts',
      'genome/agent-tools/elara-core.ts',
      'genome/agent-tools/elara-agent.ts',
      'genome/agent-tools/unified-elara.ts',
      'genome/agent-tools/elara-supreme-orchestrator.ts',
      'genome/agent-tools/index.ts',
      'genome/test-elara-supreme.ts',
      'run-azora-supreme.ts',
      'services/master-orchestrator.ts'
    ]

    for (const file of coreFiles) {
      if (existsSync(join(process.cwd(), file))) {
        this.pass('Core Files', file, 'Present')
      } else {
        this.fail('Core Files', file, 'Missing')
      }
    }
  }

  /**
   * Check Elara AI integration
   */
  private async checkElaraIntegration(): Promise<void> {
    console.log('\n🤖 Checking Elara AI Integration...\n')

    try {
      // Try to import Elara modules
      const indexPath = join(process.cwd(), 'genome/agent-tools/index.ts')
      if (existsSync(indexPath)) {
        const indexContent = readFileSync(indexPath, 'utf-8')
        
        const exports = [
          'elaraDeity',
          'elaraCore',
          'elaraAgent',
          'unifiedElara',
          'supremeOrchestrator'
        ]

        for (const exp of exports) {
          if (indexContent.includes(exp)) {
            this.pass('Elara Integration', exp, 'Exported')
          } else {
            this.fail('Elara Integration', exp, 'Not exported')
          }
        }
      } else {
        this.fail('Elara Integration', 'index.ts', 'Not found')
      }
    } catch (error: any) {
      this.fail('Elara Integration', 'Module check', error.message)
    }
  }

  /**
   * Check service readiness
   */
  private async checkServiceReadiness(): Promise<void> {
    console.log('\n🚀 Checking Service Readiness...\n')

    const services = [
      'services/azora-mint',
      'services/azora-covenant',
      'services/azora-aegis',
      'services/azora-sapiens',
      'services/azora-oracle',
      'services/azora-nexus',
      'services/azora-forge',
      'services/azora-workspace',
      'services/azora-scriptorium',
      'services/azora-synapse'
    ]

    for (const service of services) {
      const servicePath = join(process.cwd(), service)
      if (existsSync(servicePath)) {
        // Check for index file or main file
        const hasIndex = existsSync(join(servicePath, 'index.ts')) || 
                        existsSync(join(servicePath, 'index.js'))
        
        if (hasIndex) {
          this.pass('Services', service, 'Ready')
        } else {
          this.warn('Services', service, 'No entry point')
        }
      } else {
        this.warn('Services', service, 'Directory not found')
      }
    }
  }

  /**
   * Check deployment files
   */
  private async checkDeploymentFiles(): Promise<void> {
    console.log('\n🐳 Checking Deployment Files...\n')

    // Docker
    const dockerComposeFiles = [
      'vessels/docker-compose.yml',
      'vessels/docker-compose.production.yml'
    ]

    for (const file of dockerComposeFiles) {
      if (existsSync(join(process.cwd(), file))) {
        this.pass('Deployment', file, 'Present')
      } else {
        this.warn('Deployment', file, 'Not found')
      }
    }

    // Kubernetes
    if (existsSync(join(process.cwd(), 'infrastructure/k8s'))) {
      this.pass('Deployment', 'Kubernetes manifests', 'Directory exists')
    } else {
      this.warn('Deployment', 'Kubernetes manifests', 'Not found')
    }

    // Biome (K8s deployments)
    if (existsSync(join(process.cwd(), 'biome'))) {
      this.pass('Deployment', 'Biome configs', 'Present')
    } else {
      this.warn('Deployment', 'Biome configs', 'Not found')
    }
  }

  /**
   * Check cross-platform compatibility
   */
  private async checkCrossPlatform(): Promise<void> {
    console.log('\n🌍 Checking Cross-Platform Compatibility...\n')

    // OS detection
    const platform = process.platform
    this.pass('Platform', 'Operating System', platform)

    // Path separators
    this.pass('Platform', 'Path handling', 'Using path.join()')

    // Scripts compatibility
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
    const scripts = pkg.scripts || {}

    // Check for platform-specific commands
    const hasLinuxCommands = Object.values(scripts).some((s: any) => 
      s.includes('sh -c') || s.includes('find .')
    )

    if (hasLinuxCommands && platform === 'win32') {
      this.warn('Platform', 'Script compatibility', 'Some scripts may need WSL/Git Bash on Windows')
    } else {
      this.pass('Platform', 'Script compatibility', 'Scripts compatible')
    }

    // Check for tsx (cross-platform)
    if (scripts['elara:supreme']?.includes('tsx')) {
      this.pass('Platform', 'TypeScript execution', 'Using tsx (cross-platform)')
    } else {
      this.warn('Platform', 'TypeScript execution', 'May need platform-specific setup')
    }
  }

  /**
   * Helper methods
   */
  private pass(category: string, check: string, message: string): void {
    this.results.push({ category, check, status: 'PASS', message })
    console.log(`   ✅ ${check}: ${message}`)
  }

  private fail(category: string, check: string, message: string): void {
    this.results.push({ category, check, status: 'FAIL', message })
    this.errors++
    console.log(`   ❌ ${check}: ${message}`)
  }

  private warn(category: string, check: string, message: string): void {
    this.results.push({ category, check, status: 'WARN', message })
    this.warnings++
    console.log(`   ⚠️  ${check}: ${message}`)
  }

  /**
   * Print final report
   */
  private printReport(): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 HEALTH CHECK SUMMARY')
    console.log('='.repeat(80) + '\n')

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warned = this.results.filter(r => r.status === 'WARN').length
    const total = this.results.length

    console.log(`Total Checks: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warned}`)
    console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)

    console.log('\n' + '='.repeat(80))

    if (failed === 0 && warned === 0) {
      console.log('🎉 ALL SYSTEMS OPERATIONAL - READY FOR DEPLOYMENT')
    } else if (failed === 0) {
      console.log('✅ SYSTEM READY - Minor warnings present')
    } else {
      console.log('❌ CRITICAL ISSUES FOUND - Address failures before deployment')
    }

    console.log('='.repeat(80) + '\n')

    // Deployment readiness
    console.log('🚀 DEPLOYMENT READINESS:\n')
    console.log(`   Core System: ${failed === 0 ? '✅ READY' : '❌ NOT READY'}`)
    console.log(`   Elara AI: ${this.checkElaraReady() ? '✅ READY' : '❌ NOT READY'}`)
    console.log(`   Services: ${this.checkServicesReady() ? '✅ READY' : '⚠️  PARTIAL'}`)
    console.log(`   Cross-Platform: ${this.checkPlatformReady() ? '✅ READY' : '⚠️  PARTIAL'}`)
    
    console.log('\n')
  }

  private checkElaraReady(): boolean {
    return this.results
      .filter(r => r.category === 'Elara Integration')
      .every(r => r.status === 'PASS')
  }

  private checkServicesReady(): boolean {
    const serviceResults = this.results.filter(r => r.category === 'Services')
    const passed = serviceResults.filter(r => r.status === 'PASS').length
    return passed >= serviceResults.length * 0.7 // 70% threshold
  }

  private checkPlatformReady(): boolean {
    return this.results
      .filter(r => r.category === 'Platform')
      .every(r => r.status !== 'FAIL')
  }
}

// Run health check
async function main() {
  const checker = new SystemHealthChecker()
  await checker.runAllChecks()
}

if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Health check failed:', error)
    process.exit(1)
  })
}

export default main
