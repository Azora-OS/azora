/**
 * SERVICE VALIDATOR
 * Validates service configurations and dependencies
 */

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class ServiceValidator {
  validateServiceConfig(config: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.name) errors.push('Service name is required')
    if (!config.port) warnings.push('No port specified')
    if (!config.healthEndpoint) warnings.push('No health endpoint defined')

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateEnvironment(required: string[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    required.forEach(key => {
      if (!process.env[key]) {
        errors.push(`Missing required environment variable: ${key}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  async validateDependencies(dependencies: string[]): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    for (const dep of dependencies) {
      try {
        await import(dep)
      } catch {
        errors.push(`Missing dependency: ${dep}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

export const serviceValidator = new ServiceValidator()
