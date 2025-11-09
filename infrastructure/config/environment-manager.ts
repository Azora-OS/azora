import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  API_GATEWAY_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().transform(s => s.split(',')),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default(100),
})

export type Environment = z.infer<typeof envSchema>

class EnvironmentManager {
  private config: Environment | null = null
  private configPath: string
  private watchers: Map<string, (config: Environment) => void> = new Map()

  constructor(configPath: string = './config') {
    this.configPath = configPath
  }

  // Load and validate environment configuration
  async loadConfig(): Promise<Environment> {
    try {
      const envFile = path.join(this.configPath, `.env.${process.env.NODE_ENV || 'development'}`)
      
      // Load environment file if it exists
      try {
        const envContent = await fs.readFile(envFile, 'utf8')
        this.parseEnvFile(envContent)
      } catch (error) {
        console.warn(`Environment file ${envFile} not found, using process.env`)
      }

      // Validate configuration
      this.config = envSchema.parse(process.env)
      
      console.log(`✅ Configuration loaded for ${this.config.NODE_ENV} environment`)
      return this.config
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ Configuration validation failed:')
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
      } else {
        console.error('❌ Failed to load configuration:', error)
      }
      throw error
    }
  }

  // Parse .env file content
  private parseEnvFile(content: string): void {
    const lines = content.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value
        }
      }
    }
  }

  // Get current configuration
  getConfig(): Environment {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.')
    }
    return this.config
  }

  // Get specific configuration value
  get<K extends keyof Environment>(key: K): Environment[K] {
    return this.getConfig()[key]
  }

  // Watch for configuration changes
  watch(id: string, callback: (config: Environment) => void): void {
    this.watchers.set(id, callback)
  }

  // Stop watching configuration changes
  unwatch(id: string): void {
    this.watchers.delete(id)
  }

  // Hot reload configuration
  async reloadConfig(): Promise<Environment> {
    const oldConfig = this.config
    const newConfig = await this.loadConfig()
    
    // Notify watchers of changes
    if (JSON.stringify(oldConfig) !== JSON.stringify(newConfig)) {
      console.log('🔄 Configuration changed, notifying watchers...')
      for (const [id, callback] of this.watchers) {
        try {
          callback(newConfig)
        } catch (error) {
          console.error(`Error in configuration watcher ${id}:`, error)
        }
      }
    }
    
    return newConfig
  }

  // Validate required secrets
  validateSecrets(): boolean {
    const requiredSecrets = ['JWT_SECRET', 'DATABASE_URL']
    const missing = requiredSecrets.filter(secret => !process.env[secret])
    
    if (missing.length > 0) {
      console.error('❌ Missing required secrets:', missing)
      return false
    }
    
    return true
  }
}

// Singleton instance
export const environmentManager = new EnvironmentManager()

// Helper functions
export async function loadEnvironment(): Promise<Environment> {
  return await environmentManager.loadConfig()
}

export function getConfig(): Environment {
  return environmentManager.getConfig()
}

export function getConfigValue<K extends keyof Environment>(key: K): Environment[K] {
  return environmentManager.get(key)
}