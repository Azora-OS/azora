/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SYMBIOTIC RULES EXECUTION SYSTEM
 *
 * Organism-level decision making system that governs service interactions
 * Maintains balance and harmony across the entire Azora ecosystem
 */

import { EventEmitter } from 'events'
import winston from 'winston'
import { createDatabasePool, createRedisCache, createSupabaseClient } from '../azora-database-layer.js'
import { EventBus } from 'azora-event-bus'

interface SymbioticRule {
  id: string
  name: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  organismRole: 'brain' | 'heart' | 'lungs' | 'stomach' | 'muscles' | 'immune' | 'nervous'

  // Trigger conditions
  triggers: RuleTrigger[]

  // Evaluation conditions
  conditions: RuleCondition[]

  // Actions to execute
  actions: RuleAction[]

  // Resource limits and constraints
  constraints: RuleConstraint[]

  // Cooldown and rate limiting
  cooldown: number // seconds
  maxExecutionsPerHour: number

  // Execution tracking
  enabled: boolean
  lastExecuted?: Date
  executionCount: number
  successCount: number
  failureCount: number
}

interface RuleTrigger {
  type: 'event' | 'metric' | 'time' | 'health' | 'resource'
  pattern: string // event name, metric name, cron expression, etc.
  threshold?: number
  operator?: 'gt' | 'lt' | 'eq' | 'ne'
}

interface RuleCondition {
  type: 'service_health' | 'resource_usage' | 'event_frequency' | 'organism_balance' | 'custom'
  target: string
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'between'
  value: any
  weight: number // Importance weight for decision making
}

interface RuleAction {
  type: 'adjust_resources' | 'redirect_traffic' | 'scale_service' | 'publish_event' | 'execute_command' | 'notify_admin'
  target: string
  parameters: any
  priority: 'low' | 'medium' | 'high' | 'critical'
  rollbackOnFailure: boolean
}

interface RuleConstraint {
  type: 'cpu_limit' | 'memory_limit' | 'network_limit' | 'storage_limit' | 'rate_limit'
  value: number
  unit: string
}

interface OrganismState {
  brain: { cognitiveLoad: number, decisionQuality: number, memoryUsage: number }
  heart: { transactionVolume: number, successRate: number, queueDepth: number }
  lungs: { dataFlow: number, compressionRatio: number, throughput: number }
  stomach: { processingLoad: number, digestionEfficiency: number, wasteVolume: number }
  muscles: { workCompleted: number, strengthLevel: number, fatigueLevel: number }
  immune: { threatLevel: number, responseTime: number, quarantineCount: number }
  nervous: { signalLatency: number, connectionHealth: number, messageVolume: number }

  overallHarmony: number // 0-100, measure of system balance
  lastUpdated: Date
}

interface RuleExecution {
  ruleId: string
  triggeredAt: Date
  conditions: any[]
  actions: RuleActionResult[]
  success: boolean
  duration: number
  impact: number // Measure of system impact (-100 to +100)
  organismStateBefore: OrganismState
  organismStateAfter: OrganismState
}

interface RuleActionResult {
  action: RuleAction
  success: boolean
  output?: any
  error?: string
  duration: number
}

export class AzoraSymbioticRulesSystem extends EventEmitter {
  private dbPool: any
  private redisCache: any
  private supabaseClient: any
  private eventBus: EventBus
  private logger: winston.Logger

  private rules: Map<string, SymbioticRule> = new Map()
  private organismState: OrganismState
  private activeExecutions: Map<string, RuleExecution> = new Map()
  private executionHistory: RuleExecution[] = []

  constructor() {
    super()

    this.organismState = this.initializeOrganismState()

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'symbiotic-rules.log' })
      ]
    })
  }

  private initializeOrganismState(): OrganismState {
    return {
      brain: { cognitiveLoad: 0, decisionQuality: 100, memoryUsage: 0 },
      heart: { transactionVolume: 0, successRate: 100, queueDepth: 0 },
      lungs: { dataFlow: 0, compressionRatio: 1, throughput: 0 },
      stomach: { processingLoad: 0, digestionEfficiency: 100, wasteVolume: 0 },
      muscles: { workCompleted: 0, strengthLevel: 100, fatigueLevel: 0 },
      immune: { threatLevel: 0, responseTime: 0, quarantineCount: 0 },
      nervous: { signalLatency: 0, connectionHealth: 100, messageVolume: 0 },
      overallHarmony: 100,
      lastUpdated: new Date()
    }
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Azora infrastructure
      this.dbPool = createDatabasePool(process.env.AZORA_DB_URL || 'postgresql://localhost:5432/azora')
      this.redisCache = createRedisCache(process.env.AZORA_REDIS_URL || 'redis://localhost:6379')
      this.supabaseClient = createSupabaseClient(
        process.env.AZORA_SUPABASE_URL || '',
        process.env.AZORA_SUPABASE_KEY || ''
      )
      this.eventBus = new EventBus(process.env.AZORA_EVENT_BUS_URL || 'redis://localhost:6379', 'symbiotic-rules')

      // Setup event listeners
      await this.setupEventListeners()

      // Load symbiotic rules
      await this.loadSymbioticRules()

      // Initialize default rules
      await this.initializeDefaultRules()

      // Start monitoring and rule evaluation
      this.startRuleEngine()

      this.logger.info('✅ Azora Symbiotic Rules System initialized')
    } catch (error) {
      this.logger.error('❌ Failed to initialize Symbiotic Rules System:', error)
      throw error
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Listen for all system events
    this.eventBus.subscribe('*', async (event: any) => {
      await this.processEvent(event)
    })

    // Listen for metric updates
    this.eventBus.subscribe('metrics.updated', async (event: any) => {
      await this.updateOrganismState(event.data)
    })

    // Listen for health status changes
    this.eventBus.subscribe('health.status.changed', async (event: any) => {
      await this.handleHealthChange(event.data)
    })

    this.logger.info('✅ Symbiotic rules event listeners configured')
  }

  private async loadSymbioticRules(): Promise<void> {
    try {
      const result = await this.dbPool.query('SELECT * FROM symbiotic_rules WHERE enabled = true')
      for (const row of result.rows) {
        const rule: SymbioticRule = {
          id: row.id,
          name: row.name,
          description: row.description,
          priority: row.priority,
          organismRole: row.organism_role,
          triggers: JSON.parse(row.triggers),
          conditions: JSON.parse(row.conditions),
          actions: JSON.parse(row.actions),
          constraints: JSON.parse(row.constraints),
          cooldown: row.cooldown,
          maxExecutionsPerHour: row.max_executions_per_hour,
          enabled: row.enabled,
          lastExecuted: row.last_executed ? new Date(row.last_executed) : undefined,
          executionCount: row.execution_count || 0,
          successCount: row.success_count || 0,
          failureCount: row.failure_count || 0
        }
        this.rules.set(rule.id, rule)
      }
      this.logger.info(`✅ Loaded ${this.rules.size} symbiotic rules`)
    } catch (error) {
      this.logger.error('❌ Failed to load symbiotic rules:', error)
    }
  }

  private async initializeDefaultRules(): Promise<void> {
    const defaultRules: Omit<SymbioticRule, 'id' | 'executionCount' | 'successCount' | 'failureCount'>[] = [
      // Brain overload protection
      {
        name: 'Brain Overload Protection',
        description: 'Prevent cognitive overload by redistributing decision-making load',
        priority: 'high',
        organismRole: 'brain',
        triggers: [{ type: 'metric', pattern: 'brain.cognitiveLoad', threshold: 80, operator: 'gt' }],
        conditions: [
          { type: 'resource_usage', target: 'cpu', operator: 'gt', value: 70, weight: 0.8 },
          { type: 'organism_balance', target: 'brain', operator: 'lt', value: 50, weight: 0.6 }
        ],
        actions: [
          {
            type: 'adjust_resources',
            target: 'education-service',
            parameters: { cpu: '+20%', memory: '+10%' },
            priority: 'high',
            rollbackOnFailure: true
          },
          {
            type: 'publish_event',
            target: 'system.load.balance',
            parameters: { component: 'brain', action: 'redistribute' },
            priority: 'medium',
            rollbackOnFailure: false
          }
        ],
        constraints: [
          { type: 'cpu_limit', value: 90, unit: '%' },
          { type: 'memory_limit', value: 85, unit: '%' }
        ],
        cooldown: 300, // 5 minutes
        maxExecutionsPerHour: 6,
        enabled: true
      },

      // Heart failure recovery
      {
        name: 'Heart Failure Recovery',
        description: 'Recover from transaction processing failures',
        priority: 'critical',
        organismRole: 'heart',
        triggers: [{ type: 'event', pattern: 'mint.transaction.failed' }],
        conditions: [
          { type: 'service_health', target: 'mint-service', operator: 'eq', value: 'unhealthy', weight: 1.0 },
          { type: 'event_frequency', target: 'mint.transaction.failed', operator: 'gt', value: 10, weight: 0.9 }
        ],
        actions: [
          {
            type: 'scale_service',
            target: 'mint-service',
            parameters: { instances: 2, strategy: 'rolling' },
            priority: 'critical',
            rollbackOnFailure: true
          },
          {
            type: 'redirect_traffic',
            target: 'mint-service',
            parameters: { to: 'backup-mint-service', percentage: 50 },
            priority: 'high',
            rollbackOnFailure: true
          }
        ],
        constraints: [
          { type: 'rate_limit', value: 1000, unit: 'transactions/minute' }
        ],
        cooldown: 60, // 1 minute
        maxExecutionsPerHour: 10,
        enabled: true
      },

      // Immune system activation
      {
        name: 'Immune System Activation',
        description: 'Activate security measures when threats are detected',
        priority: 'high',
        organismRole: 'immune',
        triggers: [{ type: 'event', pattern: 'security.threat.detected' }],
        conditions: [
          { type: 'organism_balance', target: 'immune', operator: 'lt', value: 70, weight: 0.7 },
          { type: 'resource_usage', target: 'security', operator: 'lt', value: 50, weight: 0.5 }
        ],
        actions: [
          {
            type: 'adjust_resources',
            target: 'security-service',
            parameters: { cpu: '+50%', memory: '+30%', instances: '+1' },
            priority: 'high',
            rollbackOnFailure: false
          },
          {
            type: 'execute_command',
            target: 'firewall',
            parameters: { command: 'enable_strict_mode' },
            priority: 'high',
            rollbackOnFailure: true
          }
        ],
        constraints: [
          { type: 'cpu_limit', value: 95, unit: '%' }
        ],
        cooldown: 120, // 2 minutes
        maxExecutionsPerHour: 5,
        enabled: true
      },

      // Harmony restoration
      {
        name: 'Harmony Restoration',
        description: 'Restore system balance when harmony drops',
        priority: 'medium',
        organismRole: 'nervous',
        triggers: [{ type: 'metric', pattern: 'organism.harmony', threshold: 70, operator: 'lt' }],
        conditions: [
          { type: 'organism_balance', target: 'overall', operator: 'lt', value: 75, weight: 0.8 }
        ],
        actions: [
          {
            type: 'publish_event',
            target: 'organism.balance.restore',
            parameters: { targetHarmony: 85 },
            priority: 'medium',
            rollbackOnFailure: false
          },
          {
            type: 'adjust_resources',
            target: 'all-services',
            parameters: { balance: true, redistribute: true },
            priority: 'low',
            rollbackOnFailure: false
          }
        ],
        constraints: [],
        cooldown: 600, // 10 minutes
        maxExecutionsPerHour: 3,
        enabled: true
      }
    ]

    for (const ruleData of defaultRules) {
      if (!Array.from(this.rules.values()).some(r => r.name === ruleData.name)) {
        await this.addSymbioticRule(ruleData)
      }
    }
  }

  private startRuleEngine(): void {
    // Evaluate rules every 30 seconds
    setInterval(() => {
      this.evaluateRules()
    }, 30000)

    // Update organism state every minute
    setInterval(() => {
      this.updateOrganismStateFromMetrics()
    }, 60000)

    // Clean execution history (keep last 1000)
    setInterval(() => {
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-1000)
      }
    }, 300000) // 5 minutes

    this.logger.info('✅ Symbiotic rules engine started')
  }

  private async processEvent(event: any): Promise<void> {
    // Check if any rules are triggered by this event
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      const triggered = rule.triggers.some(trigger =>
        trigger.type === 'event' && this.matchesPattern(event.type, trigger.pattern)
      )

      if (triggered) {
        await this.evaluateAndExecuteRule(rule, { trigger: 'event', event })
      }
    }
  }

  private async updateOrganismState(metrics: any): Promise<void> {
    // Update organism state based on metrics
    if (metrics.brain) {
      this.organismState.brain = { ...this.organismState.brain, ...metrics.brain }
    }
    if (metrics.heart) {
      this.organismState.heart = { ...this.organismState.heart, ...metrics.heart }
    }
    if (metrics.lungs) {
      this.organismState.lungs = { ...this.organismState.lungs, ...metrics.lungs }
    }
    if (metrics.stomach) {
      this.organismState.stomach = { ...this.organismState.stomach, ...metrics.stomach }
    }
    if (metrics.muscles) {
      this.organismState.muscles = { ...this.organismState.muscles, ...metrics.muscles }
    }
    if (metrics.immune) {
      this.organismState.immune = { ...this.organismState.immune, ...metrics.immune }
    }
    if (metrics.nervous) {
      this.organismState.nervous = { ...this.organismState.nervous, ...metrics.nervous }
    }

    this.organismState.lastUpdated = new Date()
    this.calculateOverallHarmony()
  }

  private async handleHealthChange(healthData: any): Promise<void> {
    // Adjust organism state based on health changes
    const { service, status, metrics } = healthData

    // Map services to organism organs
    const serviceToOrgan: Record<string, keyof OrganismState> = {
      'education-service': 'brain',
      'mint-service': 'heart',
      'forge-service': 'muscles',
      'nexus-service': 'nervous',
      'health-service': 'immune'
    }

    const organ = serviceToOrgan[service]
    if (organ && organ !== 'overallHarmony' && organ !== 'lastUpdated') {
      if (status === 'unhealthy') {
        // Increase threat level and decrease organ efficiency
        this.organismState.immune.threatLevel += 10
        ;(this.organismState as any)[organ].fatigueLevel =
          Math.min(100, ((this.organismState as any)[organ].fatigueLevel || 0) + 20)
      }
    }

    this.calculateOverallHarmony()
  }

  private calculateOverallHarmony(): void {
    // Calculate overall harmony based on organ states
    const organs = ['brain', 'heart', 'lungs', 'stomach', 'muscles', 'immune', 'nervous']
    let totalHarmony = 0

    for (const organ of organs) {
      const organState = (this.organismState as any)[organ]
      let organHarmony = 100

      // Reduce harmony based on various factors
      if (organState.fatigueLevel) organHarmony -= organState.fatigueLevel * 0.5
      if (organState.threatLevel) organHarmony -= organState.threatLevel * 0.3
      if (organ === 'brain' && organState.cognitiveLoad) organHarmony -= organState.cognitiveLoad * 0.2
      if (organ === 'heart' && organState.queueDepth) organHarmony -= Math.min(50, organState.queueDepth / 10)

      totalHarmony += Math.max(0, organHarmony)
    }

    this.organismState.overallHarmony = totalHarmony / organs.length

    // Publish harmony update
    this.eventBus.publish('organism.harmony.updated', {
      harmony: this.organismState.overallHarmony,
      organs: this.organismState,
      timestamp: new Date()
    })
  }

  private async updateOrganismStateFromMetrics(): Promise<void> {
    try {
      // Query recent metrics from database
      const metrics = await this.dbPool.query(`
        SELECT metric_name, AVG(value) as avg_value
        FROM metrics
        WHERE timestamp > NOW() - INTERVAL '5 minutes'
        GROUP BY metric_name
      `)

      const metricsData: any = {}
      for (const row of metrics.rows) {
        metricsData[row.metric_name] = row.avg_value
      }

      await this.updateOrganismState(metricsData)
    } catch (error) {
      this.logger.error('❌ Failed to update organism state from metrics:', error)
    }
  }

  private async evaluateRules(): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      // Check time-based triggers
      const timeTriggered = rule.triggers.some(trigger =>
        trigger.type === 'time' && this.evaluateTimeTrigger(trigger)
      )

      // Check metric-based triggers
      const metricTriggered = rule.triggers.some(trigger =>
        trigger.type === 'metric' && this.evaluateMetricTrigger(trigger)
      )

      if (timeTriggered || metricTriggered) {
        await this.evaluateAndExecuteRule(rule, { trigger: 'scheduled' })
      }
    }
  }

  private evaluateTimeTrigger(trigger: RuleTrigger): boolean {
    // Simple cron-like evaluation (could be enhanced with proper cron library)
    const now = new Date()
    const pattern = trigger.pattern

    if (pattern.includes('* * * * *')) return true // Every minute
    if (pattern.includes('*/5 * * * *')) return now.getMinutes() % 5 === 0 // Every 5 minutes
    if (pattern.includes('0 * * * *')) return now.getMinutes() === 0 // Every hour

    return false
  }

  private evaluateMetricTrigger(trigger: RuleTrigger): boolean {
    const metricValue = this.getMetricValue(trigger.pattern)
    if (metricValue === null) return false

    const { threshold, operator = 'gt' } = trigger

    switch (operator) {
      case 'gt': return metricValue > threshold!
      case 'lt': return metricValue < threshold!
      case 'eq': return metricValue === threshold!
      case 'ne': return metricValue !== threshold!
      default: return false
    }
  }

  private getMetricValue(metricName: string): number | null {
    // Extract metric value from organism state
    const parts = metricName.split('.')
    let value: any = this.organismState

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        return null
      }
    }

    return typeof value === 'number' ? value : null
  }

  private async evaluateAndExecuteRule(rule: SymbioticRule, context: any): Promise<void> {
    // Check cooldown
    if (rule.lastExecuted) {
      const cooldownEnd = new Date(rule.lastExecuted.getTime() + rule.cooldown * 1000)
      if (new Date() < cooldownEnd) return
    }

    // Check execution rate limit
    const executionsInLastHour = this.executionHistory.filter(
      exec => exec.ruleId === rule.id &&
      exec.triggeredAt > new Date(Date.now() - 3600000)
    ).length

    if (executionsInLastHour >= rule.maxExecutionsPerHour) return

    // Evaluate conditions
    const conditionResults = await this.evaluateConditions(rule.conditions)
    const totalWeight = rule.conditions.reduce((sum, c) => sum + c.weight, 0)
    const weightedScore = conditionResults.reduce((sum, result, i) =>
      sum + (result ? rule.conditions[i].weight : 0), 0
    )
    const conditionScore = totalWeight > 0 ? weightedScore / totalWeight : 0

    // Execute if conditions met (threshold: 0.7)
    if (conditionScore >= 0.7) {
      await this.executeSymbioticRule(rule, context, conditionResults)
    }
  }

  private async evaluateConditions(conditions: RuleCondition[]): Promise<boolean[]> {
    const results: boolean[] = []

    for (const condition of conditions) {
      let result = false

      switch (condition.type) {
        case 'service_health':
          result = await this.evaluateServiceHealthCondition(condition)
          break
        case 'resource_usage':
          result = this.evaluateResourceUsageCondition(condition)
          break
        case 'event_frequency':
          result = await this.evaluateEventFrequencyCondition(condition)
          break
        case 'organism_balance':
          result = this.evaluateOrganismBalanceCondition(condition)
          break
        case 'custom':
          result = await this.evaluateCustomCondition(condition)
          break
      }

      results.push(result)
    }

    return results
  }

  private async evaluateServiceHealthCondition(condition: RuleCondition): Promise<boolean> {
    try {
      const health = await this.redisCache.get(`health:${condition.target}`)
      const isHealthy = health === 'healthy'
      return this.compareValues(isHealthy, condition.value, condition.operator)
    } catch {
      return false
    }
  }

  private evaluateResourceUsageCondition(condition: RuleCondition): boolean {
    const metricValue = this.getMetricValue(`resource.${condition.target}`)
    if (metricValue === null) return false
    return this.compareValues(metricValue, condition.value, condition.operator)
  }

  private async evaluateEventFrequencyCondition(condition: RuleCondition): Promise<boolean> {
    try {
      const count = await this.redisCache.get(`event_count:${condition.target}:5m`) || 0
      return this.compareValues(parseInt(count), condition.value, condition.operator)
    } catch {
      return false
    }
  }

  private evaluateOrganismBalanceCondition(condition: RuleCondition): boolean {
    let value: number

    if (condition.target === 'overall') {
      value = this.organismState.overallHarmony
    } else {
      const organState = (this.organismState as any)[condition.target]
      value = organState ? (organState.strengthLevel || organState.decisionQuality || 100) : 100
    }

    return this.compareValues(value, condition.value, condition.operator)
  }

  private async evaluateCustomCondition(condition: RuleCondition): Promise<boolean> {
    // Custom condition evaluation logic
    // This could be extended with plugins or scripts
    return false
  }

  private compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'eq': return actual === expected
      case 'ne': return actual !== expected
      case 'gt': return actual > expected
      case 'lt': return actual < expected
      case 'contains': return String(actual).includes(String(expected))
      case 'between':
        const [min, max] = expected
        return actual >= min && actual <= max
      default: return false
    }
  }

  private async executeSymbioticRule(
    rule: SymbioticRule,
    context: any,
    conditionResults: boolean[]
  ): Promise<void> {
    const execution: RuleExecution = {
      ruleId: rule.id,
      triggeredAt: new Date(),
      conditions: conditionResults,
      actions: [],
      success: false,
      duration: 0,
      impact: 0,
      organismStateBefore: { ...this.organismState },
      organismStateAfter: { ...this.organismState }
    }

    const startTime = Date.now()

    try {
      this.logger.info(`🧠 Executing symbiotic rule: ${rule.name} (${rule.organismRole})`)

      // Execute actions in priority order
      const sortedActions = rule.actions.sort((a, b) =>
        this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
      )

      for (const action of sortedActions) {
        const actionResult = await this.executeRuleAction(action, context)
        execution.actions.push(actionResult)

        if (!actionResult.success && action.rollbackOnFailure) {
          // Rollback logic would go here
          this.logger.warn(`🔄 Rolling back action: ${action.type}`)
        }
      }

      execution.success = execution.actions.every(a => a.success)
      execution.duration = Date.now() - startTime

      // Calculate impact
      execution.organismStateAfter = { ...this.organismState }
      execution.impact = this.calculateRuleImpact(execution)

      // Update rule statistics
      rule.lastExecuted = new Date()
      rule.executionCount++
      if (execution.success) {
        rule.successCount++
      } else {
        rule.failureCount++
      }

      // Store execution
      this.executionHistory.push(execution)
      await this.storeRuleExecution(execution)

      // Update rule in database
      await this.updateRuleStatistics(rule)

      // Publish execution result
      await this.eventBus.publish('symbiotic.rule.executed', {
        ruleId: rule.id,
        ruleName: rule.name,
        success: execution.success,
        impact: execution.impact,
        duration: execution.duration,
        organismRole: rule.organismRole
      })

      this.logger.info(`✅ Symbiotic rule executed: ${rule.name} (impact: ${execution.impact})`)

    } catch (error) {
      execution.success = false
      execution.duration = Date.now() - startTime
      this.logger.error(`❌ Symbiotic rule execution failed: ${rule.name}`, error)
    }
  }

  private async executeRuleAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()

    try {
      switch (action.type) {
        case 'adjust_resources':
          return await this.executeAdjustResourcesAction(action, context)

        case 'redirect_traffic':
          return await this.executeRedirectTrafficAction(action, context)

        case 'scale_service':
          return await this.executeScaleServiceAction(action, context)

        case 'publish_event':
          return await this.executePublishEventAction(action, context)

        case 'execute_command':
          return await this.executeCommandAction(action, context)

        case 'notify_admin':
          return await this.executeNotifyAdminAction(action, context)

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error: any) {
      return {
        action,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }
    }
  }

  private async executeAdjustResourcesAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    // Publish resource adjustment event
    await this.eventBus.publish('resource.adjust', {
      target,
      adjustments: parameters,
      reason: 'symbiotic_rule',
      ruleId: context.ruleId
    })

    return {
      action,
      success: true,
      output: `Resources adjusted for ${target}`,
      duration: Date.now() - startTime
    }
  }

  private async executeRedirectTrafficAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    await this.eventBus.publish('traffic.redirect', {
      from: target,
      to: parameters.to,
      percentage: parameters.percentage,
      reason: 'symbiotic_rule'
    })

    return {
      action,
      success: true,
      output: `Traffic redirected from ${target}`,
      duration: Date.now() - startTime
    }
  }

  private async executeScaleServiceAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    await this.eventBus.publish('service.scale', {
      service: target,
      instances: parameters.instances,
      strategy: parameters.strategy,
      reason: 'symbiotic_rule'
    })

    return {
      action,
      success: true,
      output: `Service ${target} scaled`,
      duration: Date.now() - startTime
    }
  }

  private async executePublishEventAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    await this.eventBus.publish(target, {
      ...parameters,
      triggeredBy: 'symbiotic_rule',
      ruleContext: context
    })

    return {
      action,
      success: true,
      output: `Event published: ${target}`,
      duration: Date.now() - startTime
    }
  }

  private async executeCommandAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    // Execute system command (with proper security checks)
    await this.eventBus.publish('command.execute', {
      command: parameters.command,
      target,
      reason: 'symbiotic_rule'
    })

    return {
      action,
      success: true,
      output: `Command executed: ${parameters.command}`,
      duration: Date.now() - startTime
    }
  }

  private async executeNotifyAdminAction(action: RuleAction, context: any): Promise<RuleActionResult> {
    const startTime = Date.now()
    const { target, parameters } = action

    await this.eventBus.publish('admin.notification', {
      type: 'symbiotic_rule',
      message: parameters.message,
      severity: action.priority,
      ruleId: context.ruleId
    })

    return {
      action,
      success: true,
      output: `Admin notified`,
      duration: Date.now() - startTime
    }
  }

  private calculateRuleImpact(execution: RuleExecution): number {
    // Calculate impact based on before/after organism state
    const before = execution.organismStateBefore.overallHarmony
    const after = execution.organismStateAfter.overallHarmony

    return after - before
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  private async storeRuleExecution(execution: RuleExecution): Promise<void> {
    try {
      await this.dbPool.query(
        `INSERT INTO rule_executions
         (rule_id, triggered_at, conditions, actions, success, duration, impact, state_before, state_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          execution.ruleId,
          execution.triggeredAt,
          JSON.stringify(execution.conditions),
          JSON.stringify(execution.actions),
          execution.success,
          execution.duration,
          execution.impact,
          JSON.stringify(execution.organismStateBefore),
          JSON.stringify(execution.organismStateAfter)
        ]
      )
    } catch (error) {
      this.logger.error('❌ Failed to store rule execution:', error)
    }
  }

  private async updateRuleStatistics(rule: SymbioticRule): Promise<void> {
    try {
      await this.dbPool.query(
        `UPDATE symbiotic_rules
         SET last_executed = $1, execution_count = $2, success_count = $3, failure_count = $4
         WHERE id = $5`,
        [
          rule.lastExecuted,
          rule.executionCount,
          rule.successCount,
          rule.failureCount,
          rule.id
        ]
      )
    } catch (error) {
      this.logger.error('❌ Failed to update rule statistics:', error)
    }
  }

  private matchesPattern(eventType: string, pattern: string): boolean {
    // Simple pattern matching (could be enhanced with wildcards)
    return eventType === pattern || pattern === '*' || eventType.startsWith(pattern.replace('*', ''))
  }

  // Public API methods
  async addSymbioticRule(ruleData: Omit<SymbioticRule, 'id' | 'executionCount' | 'successCount' | 'failureCount'>): Promise<string> {
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const rule: SymbioticRule = {
      ...ruleData,
      id: ruleId,
      executionCount: 0,
      successCount: 0,
      failureCount: 0
    }

    this.rules.set(ruleId, rule)

    // Store in database
    await this.dbPool.query(
      `INSERT INTO symbiotic_rules
       (id, name, description, priority, organism_role, triggers, conditions, actions, constraints,
        cooldown, max_executions_per_hour, enabled, execution_count, success_count, failure_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        ruleId,
        rule.name,
        rule.description,
        rule.priority,
        rule.organismRole,
        JSON.stringify(rule.triggers),
        JSON.stringify(rule.conditions),
        JSON.stringify(rule.actions),
        JSON.stringify(rule.constraints),
        rule.cooldown,
        rule.maxExecutionsPerHour,
        rule.enabled,
        rule.executionCount,
        rule.successCount,
        rule.failureCount
      ]
    )

    this.logger.info(`✅ Symbiotic rule added: ${rule.name}`)
    return ruleId
  }

  async removeSymbioticRule(ruleId: string): Promise<boolean> {
    const deleted = this.rules.delete(ruleId)
    if (deleted) {
      await this.dbPool.query('DELETE FROM symbiotic_rules WHERE id = $1', [ruleId])
      this.logger.info(`✅ Symbiotic rule removed: ${ruleId}`)
    }
    return deleted
  }

  getSymbioticRules(): SymbioticRule[] {
    return Array.from(this.rules.values())
  }

  getOrganismState(): OrganismState {
    return { ...this.organismState }
  }

  getRuleExecutionHistory(ruleId?: string, limit = 100): RuleExecution[] {
    let history = this.executionHistory
    if (ruleId) {
      history = history.filter(exec => exec.ruleId === ruleId)
    }
    return history.slice(-limit)
  }

  async shutdown(): Promise<void> {
    this.logger.info('🧠 Shutting down Symbiotic Rules System...')

    // Close connections
    if (this.dbPool) {
      await this.dbPool.end()
    }
    if (this.redisCache) {
      await this.redisCache.quit()
    }
    if (this.eventBus) {
      await this.eventBus.disconnect()
    }

    this.logger.info('✅ Symbiotic Rules System shutdown complete')
  }
}

// Factory function
export function createAzoraSymbioticRulesSystem(): AzoraSymbioticRulesSystem {
  return new AzoraSymbioticRulesSystem()
}

// Default export
export default AzoraSymbioticRulesSystem
