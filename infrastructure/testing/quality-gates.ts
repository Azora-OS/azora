import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export class QualityGates {
  private results: Record<string, boolean> = {}

  async runAllChecks(): Promise<boolean> {
    const checks = [
      this.checkCodeCoverage(),
      this.checkLinting(),
      this.checkSecurity(),
      this.checkPerformance(),
      this.checkDependencies()
    ]

    const results = await Promise.all(checks)
    return results.every(result => result)
  }

  async checkCodeCoverage(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('npm run test:coverage')
      const coverage = this.parseCoverage(stdout)
      this.results.coverage = coverage >= 80
      return this.results.coverage
    } catch {
      this.results.coverage = false
      return false
    }
  }

  async checkLinting(): Promise<boolean> {
    try {
      await execAsync('npm run lint')
      this.results.linting = true
      return true
    } catch {
      this.results.linting = false
      return false
    }
  }

  async checkSecurity(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('npm audit --audit-level=high')
      this.results.security = !stdout.includes('vulnerabilities')
      return this.results.security
    } catch {
      this.results.security = false
      return false
    }
  }

  async checkPerformance(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('k6 run infrastructure/testing/k6-load-test.js')
      this.results.performance = !stdout.includes('failed')
      return this.results.performance
    } catch {
      this.results.performance = false
      return false
    }
  }

  async checkDependencies(): Promise<boolean> {
    try {
      await execAsync('npm outdated')
      this.results.dependencies = true
      return true
    } catch {
      this.results.dependencies = false
      return false
    }
  }

  private parseCoverage(output: string): number {
    const match = output.match(/All files\s+\|\s+(\d+\.?\d*)/)
    return match ? parseFloat(match[1]) : 0
  }

  getResults() {
    return this.results
  }
}