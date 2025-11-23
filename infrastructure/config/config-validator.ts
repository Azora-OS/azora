import { z } from 'zod'

// Service-specific configuration schemas
export const serviceSchemas = {
  auth: z.object({
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('24h'),
    BCRYPT_ROUNDS: z.string().transform(Number).default(12),
    MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default(5),
    LOCKOUT_TIME: z.string().transform(Number).default(900000), // 15 minutes
  }),

  database: z.object({
    DATABASE_URL: z.string().url(),
    DB_POOL_MIN: z.string().transform(Number).default(2),
    DB_POOL_MAX: z.string().transform(Number).default(20),
    DB_CONNECTION_TIMEOUT: z.string().transform(Number).default(20000),
    DB_IDLE_TIMEOUT: z.string().transform(Number).default(30000),
  }),

  redis: z.object({
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().transform(Number).default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.string().transform(Number).default(0),
    REDIS_CONNECT_TIMEOUT: z.string().transform(Number).default(10000),
  }),

  api: z.object({
    API_GATEWAY_URL: z.string().url(),
    RATE_LIMIT_WINDOW: z.string().transform(Number).default(900000),
    RATE_LIMIT_MAX: z.string().transform(Number).default(100),
    REQUEST_TIMEOUT: z.string().transform(Number).default(30000),
    MAX_REQUEST_SIZE: z.string().default('10mb'),
  }),

  monitoring: z.object({
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    SENTRY_DSN: z.string().url().optional(),
    PROMETHEUS_PORT: z.string().transform(Number).default(9090),
    HEALTH_CHECK_INTERVAL: z.string().transform(Number).default(30000),
  }),

  external: z.object({
    OPENAI_API_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
  })
}

export class ConfigValidator {
  private validationResults: Map<string, { valid: boolean; errors: string[] }> = new Map()

  // Validate all service configurations
  async validateAll(): Promise<{ valid: boolean; results: Record<string, any> }> {
    const results: Record<string, any> = {}
    let allValid = true

    for (const [serviceName, schema] of Object.entries(serviceSchemas)) {
      const result = await this.validateService(serviceName, schema)
      results[serviceName] = result
      if (!result.valid) {allValid = false}
    }

    return { valid: allValid, results }
  }

  // Validate specific service configuration
  async validateService(serviceName: string, schema: z.ZodSchema): Promise<{ valid: boolean; errors: string[]; config?: any }> {
    try {
      const config = schema.parse(process.env)
      this.validationResults.set(serviceName, { valid: true, errors: [] })
      
      console.log(`✅ ${serviceName} configuration valid`)
      return { valid: true, errors: [], config }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        this.validationResults.set(serviceName, { valid: false, errors })
        
        console.error(`❌ ${serviceName} configuration invalid:`)
        errors.forEach(err => console.error(`  - ${err}`))
        
        return { valid: false, errors }
      }
      throw error
    }
  }

  // Get validation results
  getValidationResults(): Map<string, { valid: boolean; errors: string[] }> {
    return this.validationResults
  }

  // Check if all configurations are valid
  isAllValid(): boolean {
    return Array.from(this.validationResults.values()).every(result => result.valid)
  }

  // Get configuration health report
  getHealthReport(): {
    overall: 'healthy' | 'warning' | 'critical'
    services: Record<string, 'healthy' | 'warning' | 'critical'>
    issues: string[]
  } {
    const services: Record<string, 'healthy' | 'warning' | 'critical'> = {}
    const issues: string[] = []
    let criticalCount = 0
    let warningCount = 0

    for (const [serviceName, result] of this.validationResults) {
      if (result.valid) {
        services[serviceName] = 'healthy'
      } else {
        const hasCriticalErrors = result.errors.some(error => 
          error.includes('required') || error.includes('invalid')
        )
        
        if (hasCriticalErrors) {
          services[serviceName] = 'critical'
          criticalCount++
          issues.push(`${serviceName}: Critical configuration errors`)
        } else {
          services[serviceName] = 'warning'
          warningCount++
          issues.push(`${serviceName}: Configuration warnings`)
        }
      }
    }

    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (criticalCount > 0) {overall = 'critical'}
    else if (warningCount > 0) {overall = 'warning'}

    return { overall, services, issues }
  }

  // Generate configuration documentation
  generateDocumentation(): string {
    let doc = '# Azora OS Configuration Documentation\n\n'
    
    for (const [serviceName, schema] of Object.entries(serviceSchemas)) {
      doc += `## ${serviceName.toUpperCase()} Service\n\n`
      
      // Extract schema properties (simplified)
      doc += '| Variable | Type | Default | Description |\n'
      doc += '|----------|------|---------|-------------|\n'
      
      // This would need more sophisticated schema introspection
      doc += '| See schema definition | - | - | - |\n\n'
    }
    
    return doc
  }

  // Validate environment-specific requirements
  validateEnvironmentRequirements(environment: 'development' | 'staging' | 'production'): {
    valid: boolean
    missing: string[]
    recommendations: string[]
  } {
    const missing: string[] = []
    const recommendations: string[] = []

    const requirements = {
      development: {
        required: ['DATABASE_URL', 'JWT_SECRET'],
        recommended: ['REDIS_HOST', 'LOG_LEVEL']
      },
      staging: {
        required: ['DATABASE_URL', 'JWT_SECRET', 'REDIS_HOST', 'SENTRY_DSN'],
        recommended: ['STRIPE_SECRET_KEY', 'OPENAI_API_KEY']
      },
      production: {
        required: [
          'DATABASE_URL', 'JWT_SECRET', 'REDIS_HOST', 'SENTRY_DSN',
          'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'
        ],
        recommended: ['OPENAI_API_KEY', 'SENDGRID_API_KEY']
      }
    }

    const envReqs = requirements[environment]
    
    // Check required variables
    for (const variable of envReqs.required) {
      if (!process.env[variable]) {
        missing.push(variable)
      }
    }

    // Check recommended variables
    for (const variable of envReqs.recommended) {
      if (!process.env[variable]) {
        recommendations.push(`Consider setting ${variable} for optimal functionality`)
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      recommendations
    }
  }
}

// Singleton instance
export const configValidator = new ConfigValidator()

// Helper function to validate configuration on startup
export async function validateConfiguration(): Promise<void> {
  console.log('🔍 Validating configuration...')
  
  const { valid, results } = await configValidator.validateAll()
  
  if (!valid) {
    console.error('❌ Configuration validation failed')
    process.exit(1)
  }
  
  const healthReport = configValidator.getHealthReport()
  console.log(`✅ Configuration validation complete - Status: ${healthReport.overall}`)
  
  if (healthReport.issues.length > 0) {
    console.warn('⚠️ Configuration issues:')
    healthReport.issues.forEach(issue => console.warn(`  - ${issue}`))
  }
}