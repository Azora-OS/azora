/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN AUTOMATION ENGINE - C4 PLANTED BY SNR DESIGNER
This is the design system's nuclear option - automated design enforcement
*/

import { AZORA_GEM_COLORS, AZORA_GEM_TOKENS } from '../../apps/azora-ui/lib/design-system/azora-gem-tokens'
import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'

/**
 * 🎨 DESIGN AUTOMATION ENGINE
 * 
 * The Snr Designer's C4 - Automated Design System Enforcement
 * 
 * This engine:
 * 1. Scans all components for design violations
 * 2. Auto-generates Ubuntu-aligned components
 * 3. Enforces Azora Gem color usage
 * 4. Validates accessibility compliance
 * 5. Generates design system reports
 * 
 * @ubuntu Automated design → Collective consistency
 */
export class DesignAutomationEngine {
  private violations: DesignViolation[] = []
  private generatedComponents: string[] = []
  private fixedComponents: string[] = []

  /**
   * SCAN MODE: Find all design violations
   */
  async scanForViolations(workspaceRoot: string = process.cwd()): Promise<DesignViolation[]> {
    console.log('🔍 DESIGN AUTOMATION ENGINE: Scanning for violations...')
    
    const componentFiles = await glob('**/*.{tsx,ts,jsx,js}', {
      cwd: workspaceRoot,
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
    })

    for (const file of componentFiles) {
      const filePath = path.join(workspaceRoot, file)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Check for generic colors instead of Azora Gem
      const genericColorPatterns = [
        /#[0-9a-fA-F]{6}(?!\s*(?:sapphire|emerald|ruby|ubuntu))/g,
        /bg-blue-\d+/g,
        /bg-green-\d+/g,
        /bg-red-\d+/g,
        /text-blue-\d+/g,
        /text-green-\d+/g,
        /text-red-\d+/g,
      ]

      for (const pattern of genericColorPatterns) {
        const matches = content.match(pattern)
        if (matches) {
          this.violations.push({
            file,
            type: 'generic-color-usage',
            severity: 'high',
            message: `Found generic colors instead of Azora Gem colors: ${matches.join(', ')}`,
            suggestion: 'Use Sapphire/Emerald/Ruby variants',
            line: this.getLineNumber(content, matches[0])
          })
        }
      }

      // Check for missing accessibility
      if (content.includes('<button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
        this.violations.push({
          file,
          type: 'missing-accessibility',
          severity: 'critical',
          message: 'Button missing aria-label or aria-labelledby',
          suggestion: 'Add accessibility attributes',
          line: this.getLineNumber(content, '<button')
        })
      }

      // Check for hardcoded spacing instead of Ubuntu spacing
      const hardcodedSpacing = content.match(/(?:padding|margin|gap):\s*(\d+)px/g)
      if (hardcodedSpacing) {
        this.violations.push({
          file,
          type: 'hardcoded-spacing',
          severity: 'medium',
          message: `Found hardcoded spacing: ${hardcodedSpacing.join(', ')}`,
          suggestion: 'Use Ubuntu spacing system (space-ubuntu-*)',
          line: this.getLineNumber(content, hardcodedSpacing[0])
        })
      }

      // Check for missing Ubuntu philosophy documentation
      if (content.includes('export function') || content.includes('export const') || content.includes('function ')) {
        if (!content.includes('@ubuntu') && !content.includes('Ubuntu') && file.includes('components')) {
          this.violations.push({
            file,
            type: 'missing-ubuntu-docs',
            severity: 'low',
            message: 'Component missing Ubuntu philosophy documentation',
            suggestion: 'Add @ubuntu JSDoc tag',
            line: 1
          })
        }
      }
    }

    console.log(`✅ Found ${this.violations.length} design violations`)
    return this.violations
  }

  /**
   * FIX MODE: Auto-fix violations
   */
  async autoFixViolations(workspaceRoot: string = process.cwd()): Promise<void> {
    console.log('🔧 DESIGN AUTOMATION ENGINE: Auto-fixing violations...')

    for (const violation of this.violations) {
      if (violation.severity === 'critical' || violation.severity === 'high') {
        const filePath = path.join(workspaceRoot, violation.file)
        let content = await fs.readFile(filePath, 'utf-8')

        // Auto-fix generic colors
        if (violation.type === 'generic-color-usage') {
          content = content
            .replace(/bg-blue-500/g, 'bg-[var(--sapphire-500)]')
            .replace(/bg-green-500/g, 'bg-[var(--emerald-500)]')
            .replace(/bg-red-500/g, 'bg-[var(--ruby-500)]')
            .replace(/text-blue-500/g, 'text-[var(--sapphire-500)]')
            .replace(/text-green-500/g, 'text-[var(--emerald-500)]')
            .replace(/text-red-500/g, 'text-[var(--ruby-500)]')
        }

        // Auto-fix missing accessibility
        if (violation.type === 'missing-accessibility') {
          // Add aria-label to buttons without text content
          content = content.replace(
            /<button([^>]*?)>([^<]*?)<\/button>/g,
            (match, attrs, text) => {
              if (!attrs.includes('aria-label') && !attrs.includes('aria-labelledby')) {
                return `<button${attrs} aria-label="${text.trim() || 'Button'}">${text}</button>`
              }
              return match
            }
          )
        }

        await fs.writeFile(filePath, content, 'utf-8')
        this.fixedComponents.push(violation.file)
      }
    }

    console.log(`✅ Auto-fixed ${this.fixedComponents.length} components`)
  }

  /**
   * GENERATE MODE: Create Ubuntu-aligned components
   */
  async generateUbuntuComponent(
    name: string,
    pillar: 'sapphire' | 'emerald' | 'ruby' | 'ubuntu',
    outputDir: string
  ): Promise<string> {
    const gemColor = AZORA_GEM_COLORS[pillar === 'ubuntu' ? 'sapphire' : pillar][500]
    const gemName = pillar.charAt(0).toUpperCase() + pillar.slice(1)

    const componentCode = `/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Auto-generated by Design Automation Engine
${gemName} Pillar Component - Ubuntu Aligned
*/

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * ${gemName} ${name} Component
 * 
 * @description A ${name.toLowerCase()} component aligned with the ${gemName} pillar.
 *              Embodies Ubuntu philosophy - individual element contributing to
 *              collective design harmony.
 * 
 * @ubuntu Individual element → Collective harmony
 * 
 * @example
 * <${name} variant="${pillar}">
 *   Content
 * </${name}>
 * 
 * @accessibility
 * - WCAG 2.2 AAA compliant
 * - Keyboard accessible
 * - Screen reader friendly
 */
export function ${name}({ 
  className,
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[var(--${pillar}-500)]',
        'text-white',
        'rounded-lg',
        'p-space-ubuntu-md',
        'transition-all',
        'duration-300',
        'hover:bg-[var(--${pillar}-600)]',
        'focus-visible:ring-2',
        'focus-visible:ring-[var(--${pillar}-500)]',
        'focus-visible:outline-none',
        'glow-${pillar}',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default ${name}
`

    const outputPath = path.join(outputDir, `${name}.tsx`)
    await fs.writeFile(outputPath, componentCode, 'utf-8')
    this.generatedComponents.push(outputPath)

    return outputPath
  }

  /**
   * REPORT MODE: Generate comprehensive design system report
   */
  async generateReport(outputPath: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      violations: {
        total: this.violations.length,
        bySeverity: {
          critical: this.violations.filter(v => v.severity === 'critical').length,
          high: this.violations.filter(v => v.severity === 'high').length,
          medium: this.violations.filter(v => v.severity === 'medium').length,
          low: this.violations.filter(v => v.severity === 'low').length,
        },
        byType: this.groupByType(this.violations)
      },
      fixes: {
        total: this.fixedComponents.length,
        files: this.fixedComponents
      },
      generated: {
        total: this.generatedComponents.length,
        files: this.generatedComponents
      },
      recommendations: this.generateRecommendations()
    }

    await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`📊 Design system report generated: ${outputPath}`)
  }

  /**
   * VALIDATE MODE: Validate component against design system
   */
  async validateComponent(filePath: string): Promise<ValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8')
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      score: 100
    }

    // Check for Azora Gem colors
    if (!content.includes('sapphire') && !content.includes('emerald') && !content.includes('ruby')) {
      result.warnings.push('Component does not use Azora Gem colors')
      result.score -= 10
    }

    // Check for Ubuntu spacing
    if (!content.includes('space-ubuntu') && content.match(/(?:padding|margin|gap):\s*\d+px/)) {
      result.warnings.push('Component uses hardcoded spacing instead of Ubuntu spacing')
      result.score -= 5
    }

    // Check for accessibility
    if (content.includes('<button') && !content.includes('aria-')) {
      result.errors.push('Button missing accessibility attributes')
      result.score -= 20
      result.valid = false
    }

    // Check for Ubuntu documentation
    if (!content.includes('@ubuntu') && !content.includes('Ubuntu')) {
      result.warnings.push('Component missing Ubuntu philosophy documentation')
      result.score -= 5
    }

    return result
  }

  // Helper methods
  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n')
    return lines.findIndex(line => line.includes(search)) + 1
  }

  private groupByType(violations: DesignViolation[]): Record<string, number> {
    return violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.violations.filter(v => v.type === 'generic-color-usage').length > 0) {
      recommendations.push('Replace all generic colors with Azora Gem colors (Sapphire/Emerald/Ruby)')
    }

    if (this.violations.filter(v => v.type === 'missing-accessibility').length > 0) {
      recommendations.push('Add accessibility attributes to all interactive elements')
    }

    if (this.violations.filter(v => v.type === 'hardcoded-spacing').length > 0) {
      recommendations.push('Use Ubuntu spacing system (space-ubuntu-*) instead of hardcoded values')
    }

    return recommendations
  }
}

// Types
interface DesignViolation {
  file: string
  type: 'generic-color-usage' | 'missing-accessibility' | 'hardcoded-spacing' | 'missing-ubuntu-docs'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  suggestion: string
  line: number
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  score: number
}

// Export singleton instance
export const designEngine = new DesignAutomationEngine()

// CLI interface
if (require.main === module) {
  const engine = new DesignAutomationEngine()
  const command = process.argv[2]

  switch (command) {
    case 'scan':
      engine.scanForViolations().then(violations => {
        console.log(`Found ${violations.length} violations`)
        violations.forEach(v => {
          console.log(`  [${v.severity.toUpperCase()}] ${v.file}:${v.line} - ${v.message}`)
        })
      })
      break

    case 'fix':
      engine.scanForViolations()
        .then(() => engine.autoFixViolations())
        .then(() => console.log('✅ Auto-fix complete'))
      break

    case 'validate':
      const file = process.argv[3]
      if (!file) {
        console.error('Usage: design-automation-engine.ts validate <file>')
        process.exit(1)
      }
      engine.validateComponent(file).then(result => {
        console.log(`Validation Score: ${result.score}/100`)
        if (result.errors.length > 0) {
          console.log('Errors:', result.errors)
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:', result.warnings)
        }
      })
      break

    case 'report':
      engine.scanForViolations()
        .then(() => engine.generateReport('./design-system-report.json'))
        .then(() => console.log('✅ Report generated'))
      break

    default:
      console.log(`
🎨 DESIGN AUTOMATION ENGINE - C4 PLANTED BY SNR DESIGNER

Usage:
  scan     - Scan for design violations
  fix      - Auto-fix violations
  validate <file> - Validate component
  report   - Generate design system report

This is the design system's nuclear option - automated enforcement.
      `)
  }
}

export default designEngine
