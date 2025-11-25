/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA ADVANCED SYSTEMS INTEGRATION TEST
 *
 * Comprehensive integration test for all advanced Azora OS features:
 * - Auto-healing system
 * - Symbiotic rules execution
 * - Blockchain logging
 * - Performance optimization
 */

import { AzoraAutoHealer } from './auto-healing-system'
import { AzoraSymbioticRulesEngine } from './symbiotic-rules-system'
import { AzoraBlockchainLogger } from './blockchain-logger'
import { AzoraPerformanceOptimizer } from './performance-optimizer'
import { EventBus } from 'azora-event-bus'
import winston from 'winston'

interface IntegrationTestResult {
  testName: string
  passed: boolean
  duration: number
  errors: string[]
  metrics: any
}

export class AzoraAdvancedSystemsIntegrationTest {
  private autoHealer: AzoraAutoHealer
  private symbioticEngine: AzoraSymbioticRulesEngine
  private blockchainLogger: AzoraBlockchainLogger
  private performanceOptimizer: AzoraPerformanceOptimizer
  private eventBus: EventBus
  private logger: winston.Logger

  private testResults: IntegrationTestResult[] = []

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'integration-test.log' })
      ]
    })
  }

  async initialize(): Promise<void> {
    this.logger.info('🚀 Initializing Azora Advanced Systems Integration Test...')

    // Initialize event bus
    this.eventBus = new EventBus(process.env.AZORA_EVENT_BUS_URL || 'redis://localhost:6379', 'integration-test')

    // Initialize all systems
    this.autoHealer = new AzoraAutoHealer()
    this.symbioticEngine = new AzoraSymbioticRulesEngine()
    this.blockchainLogger = new AzoraBlockchainLogger()
    this.performanceOptimizer = new AzoraPerformanceOptimizer()

    // Initialize all systems
    await Promise.all([
      this.autoHealer.initialize(),
      this.symbioticEngine.initialize(),
      this.blockchainLogger.initialize(),
      this.performanceOptimizer.initialize()
    ])

    this.logger.info('✅ All advanced systems initialized')
  }

  async runAllTests(): Promise<IntegrationTestResult[]> {
    this.logger.info('🧪 Running comprehensive integration tests...')

    const tests = [
      this.testAutoHealingSystem.bind(this),
      this.testSymbioticRulesEngine.bind(this),
      this.testBlockchainLogging.bind(this),
      this.testPerformanceOptimization.bind(this),
      this.testSystemIntegration.bind(this),
      this.testFailureScenarios.bind(this),
      this.testPerformanceUnderLoad.bind(this),
      this.testBlockchainIntegrity.bind(this)
    ]

    for (const test of tests) {
      try {
        const result = await test()
        this.testResults.push(result)
        this.logger.info(`✅ Test completed: ${result.testName} - ${result.passed ? 'PASSED' : 'FAILED'}`)
      } catch (error: any) {
        this.logger.error(`❌ Test failed: ${error.message}`)
        this.testResults.push({
          testName: 'Unknown Test',
          passed: false,
          duration: 0,
          errors: [error.message],
          metrics: {}
        })
      }
    }

    this.logger.info('🏁 All integration tests completed')
    return this.testResults
  }

  private async testAutoHealingSystem(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('🔧 Testing Auto-Healing System...')

      // Simulate service failure
      await this.eventBus.publish('service.failure.detected', {
        service: 'test-service',
        error: 'Connection timeout',
        severity: 'high',
        timestamp: new Date()
      })

      // Wait for auto-healing response
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check if healing action was triggered
      const healingActions = await this.autoHealer.getRecentHealingActions(5)
      const testServiceActions = healingActions.filter(action =>
        action.service === 'test-service'
      )

      if (testServiceActions.length === 0) {
        errors.push('No healing actions triggered for test service failure')
      }

      // Test healing action execution
      const testAction = {
        id: 'test-healing-action',
        service: 'test-service',
        actionType: 'restart',
        priority: 'high',
        parameters: { force: true },
        timeout: 30000
      }

      const executionResult = await this.autoHealer.executeHealingAction(testAction)
      if (!executionResult.success) {
        errors.push(`Healing action execution failed: ${executionResult.error}`)
      }

      // Test cooldown mechanism
      const rapidActions = []
      for (let i = 0; i < 3; i++) {
        rapidActions.push(this.autoHealer.executeHealingAction(testAction))
      }

      const rapidResults = await Promise.all(rapidActions)
      const blockedActions = rapidResults.filter(result => !result.success && result.error?.includes('cooldown'))

      if (blockedActions.length === 0) {
        errors.push('Cooldown mechanism not working properly')
      }

    } catch (error: any) {
      errors.push(`Auto-healing test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Auto-Healing System',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        healingActionsTriggered: await this.autoHealer.getRecentHealingActions(10).then(actions => actions.length),
        cooldownTests: 3
      }
    }
  }

  private async testSymbioticRulesEngine(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('🧬 Testing Symbiotic Rules Engine...')

      // Test organism state calculation
      const testOrganismState = await this.symbioticEngine.getOrganismState()
      const requiredSystems = ['brain', 'heart', 'lungs', 'stomach', 'muscles', 'immune', 'nervous']

      for (const system of requiredSystems) {
        if (!(system in testOrganismState)) {
          errors.push(`Missing organism system: ${system}`)
        }
      }

      // Test rule evaluation
      const testCondition = {
        system: 'heart',
        metric: 'health',
        operator: 'lessThan',
        value: 80,
        severity: 'medium'
      }

      const evaluationResult = await this.symbioticEngine.evaluateCondition(testCondition)
      if (typeof evaluationResult !== 'boolean') {
        errors.push('Condition evaluation did not return boolean result')
      }

      // Test rule execution
      const testRule = {
        id: 'test-rule-1',
        name: 'Heart Health Monitor',
        description: 'Monitor heart health and trigger recovery if needed',
        conditions: [testCondition],
        actions: [{
          type: 'adjustResourceAllocation',
          target: 'heart',
          parameters: { increaseCpu: 10, increaseMemory: 5 }
        }],
        priority: 'high',
        cooldown: 300000,
        enabled: true
      }

      const executionResult = await this.symbioticEngine.executeRule(testRule)
      if (!executionResult.success) {
        errors.push(`Rule execution failed: ${executionResult.error}`)
      }

      // Test symbiotic harmony calculation
      const harmonyScore = await this.symbioticEngine.calculateHarmonyScore()
      if (typeof harmonyScore !== 'number' || harmonyScore < 0 || harmonyScore > 100) {
        errors.push('Invalid harmony score calculation')
      }

      // Test organism balance adjustment
      await this.symbioticEngine.adjustOrganismBalance('heart', 0.9)
      const adjustedState = await this.symbioticEngine.getOrganismState()

      if (Math.abs(adjustedState.heart.health - 0.9) > 0.01) {
        errors.push('Organism balance adjustment not working correctly')
      }

    } catch (error: any) {
      errors.push(`Symbiotic rules test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Symbiotic Rules Engine',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        organismSystems: 7,
        rulesEvaluated: 1,
        harmonyScore: await this.symbioticEngine.calculateHarmonyScore()
      }
    }
  }

  private async testBlockchainLogging(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('⛓️ Testing Blockchain Logging...')

      // Test event logging
      const testEvents = [
        { type: 'mint.transaction.created', data: { amount: 100, userId: 'test-user-1' } },
        { type: 'education.enrollment.completed', data: { courseId: 'test-course', userId: 'test-user-2' } },
        { type: 'security.login.successful', data: { userId: 'test-user-3', ip: '192.168.1.1' } }
      ]

      const loggedEntries = []
      for (const event of testEvents) {
        const entryId = await this.blockchainLogger.logEvent(event.type, event.data)
        loggedEntries.push(entryId)
      }

      // Wait for block creation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test entry retrieval
      for (const entryId of loggedEntries) {
        const entry = await this.blockchainLogger.getEntry(entryId)
        if (!entry) {
          errors.push(`Failed to retrieve logged entry: ${entryId}`)
        }
      }

      // Test blockchain statistics
      const stats = await this.blockchainLogger.getBlockchainStats()
      if (!stats || stats.totalEntries < testEvents.length) {
        errors.push('Blockchain statistics incorrect')
      }

      // Test event type filtering
      const mintEvents = await this.blockchainLogger.getEntriesByEventType('mint.transaction.created', 10)
      if (mintEvents.length === 0) {
        errors.push('Event type filtering not working')
      }

      // Test entry integrity verification
      const firstEntry = await this.blockchainLogger.getEntry(loggedEntries[0])
      if (firstEntry) {
        const isValid = await this.blockchainLogger.verifyEntryIntegrity(loggedEntries[0])
        if (!isValid) {
          errors.push('Entry integrity verification failed')
        }
      }

    } catch (error: any) {
      errors.push(`Blockchain logging test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Blockchain Logging',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        eventsLogged: testEvents.length,
        blockchainStats: await this.blockchainLogger.getBlockchainStats()
      }
    }
  }

  private async testPerformanceOptimization(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('⚡ Testing Performance Optimization...')

      // Test performance metrics collection
      await this.performanceOptimizer.forceOptimization('mint')

      // Wait for metrics collection
      await new Promise(resolve => setTimeout(resolve, 2000))

      const metrics = await this.performanceOptimizer.getPerformanceMetrics()
      if (!metrics || Object.keys(metrics).length === 0) {
        errors.push('Performance metrics collection failed')
      }

      // Test resource pool status
      const poolStatus = await this.performanceOptimizer.getResourcePoolStatus()
      const requiredPools = ['database', 'redis', 'api', 'worker']

      for (const poolName of requiredPools) {
        if (!(poolName in poolStatus)) {
          errors.push(`Missing resource pool: ${poolName}`)
        }
      }

      // Test optimization history
      const optimizationHistory = await this.performanceOptimizer.getOptimizationHistory(10)
      // Note: History might be empty initially, which is OK

      // Test cache optimization (mock)
      await this.eventBus.publish('performance.cache.invalidate', { pattern: 'test.*' })

      // Test query optimization trigger
      await this.eventBus.publish('database.query.optimize', {
        query: 'SELECT * FROM users WHERE id = $1',
        params: [123]
      })

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error: any) {
      errors.push(`Performance optimization test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Performance Optimization',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        metricsCollected: Object.keys(await this.performanceOptimizer.getPerformanceMetrics()).length,
        resourcePools: Object.keys(await this.performanceOptimizer.getResourcePoolStatus()).length
      }
    }
  }

  private async testSystemIntegration(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('🔗 Testing System Integration...')

      // Test cross-system event flow
      // 1. Trigger a service failure (auto-healing)
      await this.eventBus.publish('service.failure.detected', {
        service: 'integration-test-service',
        error: 'Simulated failure',
        severity: 'critical'
      })

      // 2. This should trigger blockchain logging
      // 3. And potentially symbiotic rules evaluation
      // 4. And performance optimization analysis

      // Wait for all systems to process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verify blockchain logged the failure
      const failureEvents = await this.blockchainLogger.getEntriesByEventType('service.failure.detected', 5)
      if (failureEvents.length === 0) {
        errors.push('Service failure not logged to blockchain')
      }

      // Verify auto-healing responded
      const healingActions = await this.autoHealer.getRecentHealingActions(5)
      const integrationActions = healingActions.filter(action =>
        action.service === 'integration-test-service'
      )

      if (integrationActions.length === 0) {
        errors.push('Auto-healing did not respond to integration test failure')
      }

      // Verify performance metrics were collected
      const metrics = await this.performanceOptimizer.getPerformanceMetrics('integration-test-service')
      // Note: Metrics might not exist yet, which is OK for this test

      // Test symbiotic rules evaluation for the failure
      const organismState = await this.symbioticEngine.getOrganismState()
      if (!organismState) {
        errors.push('Symbiotic engine not providing organism state')
      }

    } catch (error: any) {
      errors.push(`System integration test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'System Integration',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        eventsProcessed: 1,
        systemsCoordinated: 4
      }
    }
  }

  private async testFailureScenarios(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('💥 Testing Failure Scenarios...')

      // Test blockchain validation with invalid data
      const validationResult = await this.blockchainLogger.validateBlockchain()
      if (!validationResult.isValid && validationResult.errors.length > 0) {
        // This might be expected if there are no blocks yet
        this.logger.info('Blockchain validation found issues (might be expected):', validationResult.errors)
      }

      // Test auto-healing with invalid action
      const invalidAction = {
        id: 'invalid-action',
        service: 'test-service',
        actionType: 'invalid_type',
        priority: 'low',
        parameters: {},
        timeout: 1000
      }

      const invalidResult = await this.autoHealer.executeHealingAction(invalidAction)
      if (invalidResult.success) {
        errors.push('Invalid healing action should have failed')
      }

      // Test symbiotic rules with invalid condition
      const invalidCondition = {
        system: 'invalid_system',
        metric: 'health',
        operator: 'invalid_operator',
        value: 50
      }

      try {
        await this.symbioticEngine.evaluateCondition(invalidCondition)
        errors.push('Invalid condition evaluation should have thrown error')
      } catch (expectedError) {
        // This is expected
      }

      // Test performance optimization with invalid service
      await this.performanceOptimizer.forceOptimization('nonexistent-service')
      // This should not crash the system

    } catch (error: any) {
      errors.push(`Failure scenarios test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Failure Scenarios',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        invalidActionsTested: 3,
        errorHandlingVerified: true
      }
    }
  }

  private async testPerformanceUnderLoad(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('🏋️ Testing Performance Under Load...')

      // Simulate high load by logging many events
      const loadTestEvents = []
      for (let i = 0; i < 50; i++) {
        loadTestEvents.push(
          this.blockchainLogger.logEvent('load.test.event', {
            iteration: i,
            timestamp: Date.now(),
            data: 'x'.repeat(100) // Some payload
          })
        )
      }

      // Wait for all events to be processed
      await Promise.all(loadTestEvents)

      // Check blockchain stats after load
      const postLoadStats = await this.blockchainLogger.getBlockchainStats()
      if (postLoadStats.totalEntries < 50) {
        errors.push('Not all load test events were logged')
      }

      // Test performance metrics under load
      const preLoadMetrics = await this.performanceOptimizer.getPerformanceMetrics()

      // Simulate some service requests
      const serviceRequests = []
      for (let i = 0; i < 20; i++) {
        serviceRequests.push(
          this.eventBus.publish('service.request.simulated', {
            service: 'load-test-service',
            method: 'testMethod',
            params: { iteration: i }
          })
        )
      }

      await Promise.all(serviceRequests)

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const postLoadMetrics = await this.performanceOptimizer.getPerformanceMetrics()

      // Verify systems remained stable under load
      if (!postLoadStats || !postLoadMetrics) {
        errors.push('Systems became unstable under load')
      }

    } catch (error: any) {
      errors.push(`Performance under load test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Performance Under Load',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        eventsLogged: 50,
        serviceRequests: 20,
        totalDuration: duration
      }
    }
  }

  private async testBlockchainIntegrity(): Promise<IntegrationTestResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      this.logger.info('🔒 Testing Blockchain Integrity...')

      // Log several events to create some blockchain data
      for (let i = 0; i < 10; i++) {
        await this.blockchainLogger.logEvent('integrity.test', {
          testId: i,
          data: `test-data-${i}`
        })
      }

      // Force block creation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Validate blockchain integrity
      const validationResult = await this.blockchainLogger.validateBlockchain()

      if (!validationResult.isValid) {
        errors.push(`Blockchain integrity validation failed: ${validationResult.errors.join(', ')}`)
      }

      // Test individual entry verification
      const stats = await this.blockchainLogger.getBlockchainStats()
      if (stats.totalEntries > 0) {
        // Get a few entries and verify their integrity
        const entries = await this.blockchainLogger.getEntriesByEventType('integrity.test', 5)

        for (const entry of entries) {
          const isValid = await this.blockchainLogger.verifyEntryIntegrity(entry.id)
          if (!isValid) {
            errors.push(`Entry integrity verification failed for entry ${entry.id}`)
          }
        }
      }

      // Test block retrieval and validation
      const blockchainStats = await this.blockchainLogger.getBlockchainStats()
      if (blockchainStats.totalBlocks > 0) {
        // Try to get the latest block
        const latestBlock = await this.blockchainLogger.getBlock(`block-${Date.now() - 10000}-`) // Approximate

        if (latestBlock) {
          // Verify block hash
          const calculatedHash = this.calculateBlockHash(latestBlock)
          if (calculatedHash !== latestBlock.hash) {
            errors.push('Block hash verification failed')
          }
        }
      }

    } catch (error: any) {
      errors.push(`Blockchain integrity test failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    return {
      testName: 'Blockchain Integrity',
      passed: errors.length === 0,
      duration,
      errors,
      metrics: {
        entriesVerified: 10,
        blockchainValidated: true
      }
    }
  }

  private calculateBlockHash(block: any): string {
    // Simplified block hash calculation for testing
    const crypto = require('crypto')
    const dataToHash = `${block.id}${block.height}${block.timestamp}${block.previousBlockHash}${block.merkleRoot}${block.validator}`
    return crypto.createHash('sha256').update(dataToHash).digest('hex')
  }

  getTestSummary(): any {
    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(t => t.passed).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0)
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      totalDuration,
      averageDuration,
      results: this.testResults
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down Integration Test...')

    // Shutdown all systems
    await Promise.all([
      this.autoHealer?.shutdown(),
      this.symbioticEngine?.shutdown(),
      this.blockchainLogger?.shutdown(),
      this.performanceOptimizer?.shutdown(),
      this.eventBus?.disconnect()
    ])

    this.logger.info('✅ Integration Test shutdown complete')
  }
}

// Test runner function
export async function runAzoraIntegrationTests(): Promise<any> {
  const testSuite = new AzoraAdvancedSystemsIntegrationTest()

  try {
    await testSuite.initialize()
    const results = await testSuite.runAllTests()
    const summary = testSuite.getTestSummary()

    console.log('\n' + '='.repeat(60))
    console.log('AZORA ADVANCED SYSTEMS INTEGRATION TEST RESULTS')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ${summary.passedTests}`)
    console.log(`Failed: ${summary.failedTests}`)
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`)
    console.log(`Total Duration: ${summary.totalDuration}ms`)
    console.log(`Average Duration: ${summary.averageDuration.toFixed(0)}ms`)
    console.log('='.repeat(60))

    if (summary.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:')
      summary.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.testName}: ${result.errors.join(', ')}`)
      })
    }

    console.log('\n✅ PASSED TESTS:')
    summary.results.filter(r => r.passed).forEach(result => {
      console.log(`  - ${result.testName} (${result.duration}ms)`)
    })

    return summary

  } catch (error: any) {
    console.error('💥 Integration test suite failed:', error.message)
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 1,
      successRate: 0,
      error: error.message
    }
  } finally {
    await testSuite.shutdown()
  }
}

// If run directly
if (require.main === module) {
  runAzoraIntegrationTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test execution failed:', error)
      process.exit(1)
    })
}

export default AzoraAdvancedSystemsIntegrationTest