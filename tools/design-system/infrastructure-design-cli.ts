#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INFRASTRUCTURE DESIGN CLI - Unified Command Interface
Bridges Design Automation Engine + Design Infrastructure Bridge
*/

import { designEngine } from './design-automation-engine'
import { designInfrastructureBridge } from './design-infrastructure-bridge'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * 🎯 INFRASTRUCTURE DESIGN CLI
 * 
 * Unified CLI for all design infrastructure operations
 * 
 * Commands:
 * - scan: Scan all infrastructure for design violations
 * - deploy: Deploy design tokens to all services
 * - validate: Validate infrastructure design compliance
 * - fix: Auto-fix design violations
 * - report: Generate comprehensive design report
 * - init: Initialize design system in service
 */
class InfrastructureDesignCLI {
  private workspaceRoot: string

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot
  }

  /**
   * SCAN: Comprehensive infrastructure scan
   */
  async scan(options: { verbose?: boolean } = {}): Promise<void> {
    console.log('🔍 INFRASTRUCTURE DESIGN CLI: Starting comprehensive scan...\n')

    // 1. Scan infrastructure services
    console.log('📦 Scanning infrastructure services...')
    const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
    console.log(`   Found ${services.length} services\n`)

    // 2. Scan for design violations
    console.log('🎨 Scanning for design violations...')
    const violations = await designEngine.scanForViolations(this.workspaceRoot)
    console.log(`   Found ${violations.length} violations\n`)

    // 3. Generate summary
    if (options.verbose) {
      console.log('📊 Detailed Violations:')
      violations.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.file}: ${v.type} - ${v.message}`)
      })
    }

    console.log(`\n✅ Scan complete: ${violations.length} violations found`)
  }

  /**
   * DEPLOY: Deploy design system to all infrastructure
   */
  async deploy(options: { 
    service?: string
    all?: boolean
    force?: boolean
  } = {}): Promise<void> {
    console.log('🚀 INFRASTRUCTURE DESIGN CLI: Deploying design system...\n')

    if (options.service) {
      // Deploy to specific service
      console.log(`📦 Deploying to ${options.service}...`)
      await designInfrastructureBridge.deployDesignTokens(
        path.join(this.workspaceRoot, options.service)
      )
      await designInfrastructureBridge.createInfrastructureDesignConfig(
        path.join(this.workspaceRoot, options.service)
      )
      console.log(`✅ Deployed to ${options.service}\n`)
    } else if (options.all) {
      // Deploy to all services
      const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      console.log(`📦 Deploying to ${services.length} services...\n`)

      for (const service of services) {
        const servicePath = path.join(this.workspaceRoot, service)
        try {
          await designInfrastructureBridge.deployDesignTokens(servicePath)
          await designInfrastructureBridge.createInfrastructureDesignConfig(servicePath)
          console.log(`   ✅ ${service}`)
        } catch (error) {
          console.log(`   ⚠️  ${service} (skipped)`)
        }
      }

      console.log(`\n✅ Deployed to ${services.length} services`)
    } else {
      console.error('❌ Specify --service <path> or --all')
      process.exit(1)
    }
  }

  /**
   * VALIDATE: Validate infrastructure design compliance
   */
  async validate(): Promise<void> {
    console.log('✅ INFRASTRUCTURE DESIGN CLI: Validating infrastructure design...\n')

    // Scan infrastructure first
    await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)

    // Validate
    const report = await designInfrastructureBridge.validateInfrastructureDesign()

    // Display results
    console.log('📊 Infrastructure Design Compliance Report\n')
    console.log(`   Total Services: ${report.totalServices}`)
    console.log(`   Compliant: ${report.compliantServices}`)
    console.log(`   Non-Compliant: ${report.nonCompliantServices.length}`)
    console.log(`   Compliance Score: ${report.complianceScore.toFixed(1)}%\n`)

    if (report.nonCompliantServices.length > 0) {
      console.log('⚠️  Non-Compliant Services:')
      report.nonCompliantServices.forEach(service => {
        console.log(`   - ${service.service}`)
        console.log(`     Design Tokens: ${service.hasDesignTokens ? '✅' : '❌'}`)
        console.log(`     Components: ${service.hasComponents ? '✅' : '❌'}`)
        console.log(`     Violations: ${service.violations}`)
      })
    }

    console.log(`\n${report.complianceScore >= 80 ? '✅' : '⚠️'} Infrastructure design ${report.complianceScore >= 80 ? 'compliant' : 'needs attention'}`)
  }

  /**
   * FIX: Auto-fix design violations
   */
  async fix(options: { 
    dryRun?: boolean
    service?: string
  } = {}): Promise<void> {
    console.log('🔧 INFRASTRUCTURE DESIGN CLI: Auto-fixing violations...\n')

    const targetPath = options.service 
      ? path.join(this.workspaceRoot, options.service)
      : this.workspaceRoot

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE: Scanning only (no changes)\n')
      const violations = await designEngine.scanForViolations(targetPath)
      console.log(`   Found ${violations.length} fixable violations\n`)
      
      violations.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.file}: ${v.type}`)
      })
      
      console.log('\n   Run without --dry-run to apply fixes')
      return
    }

    console.log('🔧 Fixing violations...')
    const fixed = await designEngine.autoFixViolations(targetPath)
    console.log(`✅ Fixed ${fixed.length} violations\n`)

    fixed.forEach(f => {
      console.log(`   ✅ ${f.file}: ${f.fix}`)
    })
  }

  /**
   * REPORT: Generate comprehensive design report
   */
  async report(options: { 
    output?: string
    format?: 'json' | 'markdown'
  } = {}): Promise<void> {
    console.log('📊 INFRASTRUCTURE DESIGN CLI: Generating comprehensive report...\n')

    // Scan infrastructure
    await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)

    // Validate
    const infrastructureReport = await designInfrastructureBridge.validateInfrastructureDesign()

    // Scan violations
    const violations = await designEngine.scanForViolations(this.workspaceRoot)

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      infrastructure: {
        totalServices: infrastructureReport.totalServices,
        compliantServices: infrastructureReport.compliantServices,
        complianceScore: infrastructureReport.complianceScore,
        nonCompliantServices: infrastructureReport.nonCompliantServices,
      },
      violations: {
        total: violations.length,
        byType: this.groupViolationsByType(violations),
        byFile: this.groupViolationsByFile(violations),
      },
      recommendations: this.generateRecommendations(infrastructureReport, violations),
    }

    // Output
    const outputPath = options.output || './infrastructure-design-report.json'
    const format = options.format || 'json'

    if (format === 'json') {
      await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    } else {
      const markdown = this.generateMarkdownReport(report)
      await fs.writeFile(outputPath.replace('.json', '.md'), markdown, 'utf-8')
    }

    console.log(`✅ Report generated: ${outputPath}`)
    console.log(`\n📊 Summary:`)
    console.log(`   Infrastructure Compliance: ${report.infrastructure.complianceScore.toFixed(1)}%`)
    console.log(`   Total Violations: ${report.violations.total}`)
    console.log(`   Recommendations: ${report.recommendations.length}`)
  }

  /**
   * INIT: Initialize design system in service
   */
  async init(servicePath: string): Promise<void> {
    console.log(`🎨 INFRASTRUCTURE DESIGN CLI: Initializing design system in ${servicePath}...\n`)

    const fullPath = path.join(this.workspaceRoot, servicePath)

    // Deploy design tokens
    await designInfrastructureBridge.deployDesignTokens(fullPath)

    // Create design config
    await designInfrastructureBridge.createInfrastructureDesignConfig(fullPath)

    // Create example component
    await designInfrastructureBridge.generateInfrastructureComponent(
      path.basename(servicePath),
      'ExampleComponent',
      'sapphire'
    )

    console.log(`✅ Design system initialized in ${servicePath}`)
    console.log(`\n   Files created:`)
    console.log(`   - design-tokens.ts`)
    console.log(`   - design.config.json`)
    console.log(`   - components/ExampleComponent.tsx`)
  }

  // Helper methods
  private groupViolationsByType(violations: any[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    violations.forEach(v => {
      grouped[v.type] = (grouped[v.type] || 0) + 1
    })
    return grouped
  }

  private groupViolationsByFile(violations: any[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    violations.forEach(v => {
      grouped[v.file] = (grouped[v.file] || 0) + 1
    })
    return grouped
  }

  private generateRecommendations(infrastructureReport: any, violations: any[]): string[] {
    const recommendations: string[] = []

    if (infrastructureReport.complianceScore < 80) {
      recommendations.push('Deploy design tokens to all services')
      recommendations.push('Run design automation engine on all services')
    }

    if (violations.length > 0) {
      recommendations.push('Run auto-fix to resolve design violations')
      recommendations.push('Update components to use Azora Gem colors')
    }

    if (infrastructureReport.nonCompliantServices.length > 0) {
      recommendations.push('Initialize design system in non-compliant services')
    }

    return recommendations
  }

  private generateMarkdownReport(report: any): string {
    return `# Infrastructure Design Report

Generated: ${report.timestamp}

## Infrastructure Compliance

- **Total Services**: ${report.infrastructure.totalServices}
- **Compliant**: ${report.infrastructure.compliantServices}
- **Compliance Score**: ${report.infrastructure.complianceScore.toFixed(1)}%

## Violations

- **Total**: ${report.violations.total}

### By Type

${Object.entries(report.violations.byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## Recommendations

${report.recommendations.map((r: string) => `- ${r}`).join('\n')}
`
  }
}

// CLI Interface
async function main() {
  const cli = new InfrastructureDesignCLI()
  const command = process.argv[2]

  try {
    switch (command) {
      case 'scan':
        await cli.scan({ verbose: process.argv.includes('--verbose') })
        break

      case 'deploy':
        const service = process.argv.find(arg => arg.startsWith('--service='))?.split('=')[1]
        const all = process.argv.includes('--all')
        await cli.deploy({ service, all })
        break

      case 'validate':
        await cli.validate()
        break

      case 'fix':
        await cli.fix({ 
          dryRun: process.argv.includes('--dry-run'),
          service: process.argv.find(arg => arg.startsWith('--service='))?.split('=')[1]
        })
        break

      case 'report':
        const output = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1]
        const format = process.argv.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'markdown' | undefined
        await cli.report({ output, format })
        break

      case 'init':
        const servicePath = process.argv[3]
        if (!servicePath) {
          console.error('Usage: infrastructure-design-cli.ts init <service-path>')
          process.exit(1)
        }
        await cli.init(servicePath)
        break

      default:
        console.log(`
🎯 INFRASTRUCTURE DESIGN CLI - Unified Command Interface

Usage:
  scan [--verbose]              Scan infrastructure for design violations
  deploy --all                  Deploy design tokens to all services
  deploy --service=<path>       Deploy design tokens to specific service
  validate                      Validate infrastructure design compliance
  fix [--dry-run] [--service=<path>]  Auto-fix design violations
  report [--output=<path>] [--format=json|markdown]  Generate comprehensive report
  init <service-path>           Initialize design system in service

Examples:
  npx tsx tools/design-system/infrastructure-design-cli.ts scan
  npx tsx tools/design-system/infrastructure-design-cli.ts deploy --all
  npx tsx tools/design-system/infrastructure-design-cli.ts validate
  npx tsx tools/design-system/infrastructure-design-cli.ts fix --dry-run
  npx tsx tools/design-system/infrastructure-design-cli.ts report --format=markdown
  npx tsx tools/design-system/infrastructure-design-cli.ts init services/api-gateway

This CLI bridges Design Automation Engine + Design Infrastructure Bridge
        `)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export default InfrastructureDesignCLI
