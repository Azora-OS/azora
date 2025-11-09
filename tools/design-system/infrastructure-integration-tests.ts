#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INFRASTRUCTURE INTEGRATION TESTS - Design System + Infrastructure
Tests the complete integration between design automation and infrastructure
*/

import { designEngine } from './design-automation-engine'
import { designInfrastructureBridge } from './design-infrastructure-bridge'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * 🧪 INFRASTRUCTURE INTEGRATION TESTS
 * 
 * Comprehensive tests for design infrastructure integration
 * 
 * Tests:
 * 1. Infrastructure scanning
 * 2. Design token deployment
 * 3. Component validation
 * 4. Infrastructure compliance
 * 5. End-to-end integration
 */
export class InfrastructureIntegrationTests {
  private testResults: TestResult[] = []
  private workspaceRoot: string

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot
  }

  /**
   * TEST 1: Infrastructure Scanning
   */
  async testInfrastructureScanning(): Promise<TestResult> {
    console.log('🧪 TEST 1: Infrastructure Scanning...')
    
    try {
      const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      
      const passed = services.length > 0
      const result: TestResult = {
        name: 'Infrastructure Scanning',
        passed,
        message: passed 
          ? `✅ Found ${services.length} infrastructure services`
          : '❌ No services found',
        details: {
          servicesFound: services.length,
          services: services.slice(0, 5), // First 5 for brevity
        }
      }

      this.testResults.push(result)
      return result
    } catch (error: any) {
      const result: TestResult = {
        name: 'Infrastructure Scanning',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * TEST 2: Design Token Deployment
   */
  async testDesignTokenDeployment(): Promise<TestResult> {
    console.log('🧪 TEST 2: Design Token Deployment...')
    
    try {
      // Find a test service
      const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      if (services.length === 0) {
        return {
          name: 'Design Token Deployment',
          passed: false,
          message: '❌ No services to test',
          details: {}
        }
      }

      const testService = services[0]
      const servicePath = path.join(this.workspaceRoot, testService)

      // Deploy design tokens
      await designInfrastructureBridge.deployDesignTokens(servicePath)

      // Verify deployment
      const tokensPath = path.join(servicePath, 'design-tokens.ts')
      const tokensExist = await this.fileExists(tokensPath)

      const passed = tokensExist
      const result: TestResult = {
        name: 'Design Token Deployment',
        passed,
        message: passed
          ? `✅ Design tokens deployed to ${testService}`
          : `❌ Design tokens not found in ${testService}`,
        details: {
          testService,
          tokensPath,
          tokensExist
        }
      }

      this.testResults.push(result)
      return result
    } catch (error: any) {
      const result: TestResult = {
        name: 'Design Token Deployment',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * TEST 3: Design Config Creation
   */
  async testDesignConfigCreation(): Promise<TestResult> {
    console.log('🧪 TEST 3: Design Config Creation...')
    
    try {
      const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      if (services.length === 0) {
        return {
          name: 'Design Config Creation',
          passed: false,
          message: '❌ No services to test',
          details: {}
        }
      }

      const testService = services[0]
      const servicePath = path.join(this.workspaceRoot, testService)

      // Create design config
      await designInfrastructureBridge.createInfrastructureDesignConfig(servicePath)

      // Verify config
      const configPath = path.join(servicePath, 'design.config.json')
      const configExists = await this.fileExists(configPath)

      if (configExists) {
        const configContent = await fs.readFile(configPath, 'utf-8')
        const config = JSON.parse(configContent)

        const passed = config.designSystem && config.compliance && config.ubuntu
        const result: TestResult = {
          name: 'Design Config Creation',
          passed,
          message: passed
            ? `✅ Design config created for ${testService}`
            : `❌ Invalid design config in ${testService}`,
          details: {
            testService,
            configPath,
            configValid: passed,
            configKeys: Object.keys(config)
          }
        }

        this.testResults.push(result)
        return result
      } else {
        const result: TestResult = {
          name: 'Design Config Creation',
          passed: false,
          message: `❌ Design config not found in ${testService}`,
          details: { testService, configPath }
        }
        this.testResults.push(result)
        return result
      }
    } catch (error: any) {
      const result: TestResult = {
        name: 'Design Config Creation',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * TEST 4: Component Validation
   */
  async testComponentValidation(): Promise<TestResult> {
    console.log('🧪 TEST 4: Component Validation...')
    
    try {
      const violations = await designEngine.scanForViolations(this.workspaceRoot)
      
      // Test passes if scanning works (violations are expected)
      const passed = true
      const result: TestResult = {
        name: 'Component Validation',
        passed,
        message: `✅ Component validation complete: ${violations.length} violations found`,
        details: {
          violationsFound: violations.length,
          violationTypes: this.groupViolationsByType(violations)
        }
      }

      this.testResults.push(result)
      return result
    } catch (error: any) {
      const result: TestResult = {
        name: 'Component Validation',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * TEST 5: Infrastructure Compliance Validation
   */
  async testInfrastructureCompliance(): Promise<TestResult> {
    console.log('🧪 TEST 5: Infrastructure Compliance Validation...')
    
    try {
      await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      const report = await designInfrastructureBridge.validateInfrastructureDesign()

      const passed = report.totalServices > 0
      const result: TestResult = {
        name: 'Infrastructure Compliance Validation',
        passed,
        message: passed
          ? `✅ Compliance validation complete: ${report.complianceScore.toFixed(1)}%`
          : '❌ No services found for validation',
        details: {
          totalServices: report.totalServices,
          compliantServices: report.compliantServices,
          complianceScore: report.complianceScore,
          nonCompliantCount: report.nonCompliantServices.length
        }
      }

      this.testResults.push(result)
      return result
    } catch (error: any) {
      const result: TestResult = {
        name: 'Infrastructure Compliance Validation',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * TEST 6: End-to-End Integration
   */
  async testEndToEndIntegration(): Promise<TestResult> {
    console.log('🧪 TEST 6: End-to-End Integration...')
    
    try {
      // 1. Scan infrastructure
      const services = await designInfrastructureBridge.scanInfrastructure(this.workspaceRoot)
      if (services.length === 0) {
        return {
          name: 'End-to-End Integration',
          passed: false,
          message: '❌ No services found',
          details: {}
        }
      }

      // 2. Deploy to first service
      const testService = services[0]
      const servicePath = path.join(this.workspaceRoot, testService)
      await designInfrastructureBridge.deployDesignTokens(servicePath)
      await designInfrastructureBridge.createInfrastructureDesignConfig(servicePath)

      // 3. Validate
      const tokensExist = await this.fileExists(path.join(servicePath, 'design-tokens.ts'))
      const configExists = await this.fileExists(path.join(servicePath, 'design.config.json'))

      // 4. Scan for violations
      const violations = await designEngine.scanForViolations(servicePath)

      const passed = tokensExist && configExists
      const result: TestResult = {
        name: 'End-to-End Integration',
        passed,
        message: passed
          ? `✅ End-to-end integration successful for ${testService}`
          : `❌ Integration incomplete for ${testService}`,
        details: {
          testService,
          tokensDeployed: tokensExist,
          configCreated: configExists,
          violationsFound: violations.length
        }
      }

      this.testResults.push(result)
      return result
    } catch (error: any) {
      const result: TestResult = {
        name: 'End-to-End Integration',
        passed: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      }
      this.testResults.push(result)
      return result
    }
  }

  /**
   * RUN ALL TESTS
   */
  async runAllTests(): Promise<TestSuiteResult> {
    console.log('🧪 INFRASTRUCTURE INTEGRATION TESTS\n')
    console.log('=' .repeat(60))

    await this.testInfrastructureScanning()
    await this.testDesignTokenDeployment()
    await this.testDesignConfigCreation()
    await this.testComponentValidation()
    await this.testInfrastructureCompliance()
    await this.testEndToEndIntegration()

    const passed = this.testResults.filter(t => t.passed).length
    const total = this.testResults.length
    const score = (passed / total) * 100

    const suiteResult: TestSuiteResult = {
      timestamp: new Date().toISOString(),
      totalTests: total,
      passedTests: passed,
      failedTests: total - passed,
      score,
      results: this.testResults
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${total - passed}`)
    console.log(`Score: ${score.toFixed(1)}%`)
    console.log('\nResults:')
    this.testResults.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}: ${result.message}`)
    })

    return suiteResult
  }

  // Helper methods
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private groupViolationsByType(violations: any[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    violations.forEach(v => {
      grouped[v.type] = (grouped[v.type] || 0) + 1
    })
    return grouped
  }
}

// Types
interface TestResult {
  name: string
  passed: boolean
  message: string
  details: Record<string, any>
}

interface TestSuiteResult {
  timestamp: string
  totalTests: number
  passedTests: number
  failedTests: number
  score: number
  results: TestResult[]
}

// CLI Interface
if (require.main === module) {
  const tests = new InfrastructureIntegrationTests()
  tests.runAllTests()
    .then(result => {
      // Save results
      const outputPath = './infrastructure-integration-test-results.json'
      return fs.writeFile(
        outputPath,
        JSON.stringify(result, null, 2),
        'utf-8'
      ).then(() => {
        console.log(`\n✅ Test results saved to ${outputPath}`)
        process.exit(result.failedTests > 0 ? 1 : 0)
      })
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error)
      process.exit(1)
    })
}

export default InfrastructureIntegrationTests
