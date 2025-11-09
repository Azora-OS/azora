import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

interface SecretConfig {
  key: string
  value: string
  encrypted: boolean
  lastRotated?: Date
  expiresAt?: Date
}

export class SecretsManager {
  private secrets: Map<string, SecretConfig> = new Map()
  private encryptionKey: Buffer
  private secretsPath: string

  constructor(secretsPath: string = './secrets', masterKey?: string) {
    this.secretsPath = secretsPath
    this.encryptionKey = masterKey 
      ? crypto.scryptSync(masterKey, 'salt', 32)
      : crypto.randomBytes(32)
  }

  // Initialize secrets manager
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.secretsPath, { recursive: true })
      await this.loadSecrets()
      console.log('✅ Secrets manager initialized')
    } catch (error) {
      console.error('❌ Failed to initialize secrets manager:', error)
      throw error
    }
  }

  // Store encrypted secret
  async setSecret(key: string, value: string, expiresInDays?: number): Promise<void> {
    const encrypted = this.encrypt(value)
    const config: SecretConfig = {
      key,
      value: encrypted,
      encrypted: true,
      lastRotated: new Date(),
      ...(expiresInDays && { expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) })
    }

    this.secrets.set(key, config)
    await this.saveSecrets()
    console.log(`🔐 Secret '${key}' stored securely`)
  }

  // Retrieve and decrypt secret
  getSecret(key: string): string | null {
    const config = this.secrets.get(key)
    if (!config) return null

    // Check expiration
    if (config.expiresAt && config.expiresAt < new Date()) {
      console.warn(`⚠️ Secret '${key}' has expired`)
      return null
    }

    return config.encrypted ? this.decrypt(config.value) : config.value
  }

  // Check if secret exists
  hasSecret(key: string): boolean {
    return this.secrets.has(key)
  }

  // Delete secret
  async deleteSecret(key: string): Promise<boolean> {
    const deleted = this.secrets.delete(key)
    if (deleted) {
      await this.saveSecrets()
      console.log(`🗑️ Secret '${key}' deleted`)
    }
    return deleted
  }

  // Rotate secret (generate new value)
  async rotateSecret(key: string, newValue: string): Promise<void> {
    if (!this.secrets.has(key)) {
      throw new Error(`Secret '${key}' not found`)
    }

    await this.setSecret(key, newValue)
    console.log(`🔄 Secret '${key}' rotated`)
  }

  // List all secret keys (not values)
  listSecrets(): Array<{ key: string; lastRotated?: Date; expiresAt?: Date }> {
    return Array.from(this.secrets.values()).map(config => ({
      key: config.key,
      lastRotated: config.lastRotated,
      expiresAt: config.expiresAt
    }))
  }

  // Check for expiring secrets
  getExpiringSecrets(daysThreshold: number = 7): string[] {
    const threshold = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000)
    return Array.from(this.secrets.values())
      .filter(config => config.expiresAt && config.expiresAt <= threshold)
      .map(config => config.key)
  }

  // Encrypt value
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey)
    cipher.setAAD(Buffer.from('azora-secrets'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  // Decrypt value
  private decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey)
    decipher.setAAD(Buffer.from('azora-secrets'))
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // Load secrets from file
  private async loadSecrets(): Promise<void> {
    try {
      const secretsFile = path.join(this.secretsPath, 'secrets.json')
      const data = await fs.readFile(secretsFile, 'utf8')
      const secretsData = JSON.parse(data)
      
      for (const [key, config] of Object.entries(secretsData)) {
        this.secrets.set(key, {
          ...config as SecretConfig,
          lastRotated: config.lastRotated ? new Date(config.lastRotated) : undefined,
          expiresAt: config.expiresAt ? new Date(config.expiresAt) : undefined
        })
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('No existing secrets file found, starting fresh')
    }
  }

  // Save secrets to file
  private async saveSecrets(): Promise<void> {
    const secretsFile = path.join(this.secretsPath, 'secrets.json')
    const secretsData = Object.fromEntries(this.secrets.entries())
    await fs.writeFile(secretsFile, JSON.stringify(secretsData, null, 2))
  }

  // Generate secure random secret
  static generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Validate secret strength
  static validateSecretStrength(secret: string): { valid: boolean; score: number; issues: string[] } {
    const issues: string[] = []
    let score = 0

    if (secret.length < 16) issues.push('Too short (minimum 16 characters)')
    else if (secret.length >= 32) score += 2
    else score += 1

    if (!/[a-z]/.test(secret)) issues.push('Missing lowercase letters')
    else score += 1

    if (!/[A-Z]/.test(secret)) issues.push('Missing uppercase letters')
    else score += 1

    if (!/[0-9]/.test(secret)) issues.push('Missing numbers')
    else score += 1

    if (!/[^a-zA-Z0-9]/.test(secret)) issues.push('Missing special characters')
    else score += 1

    return {
      valid: issues.length === 0 && score >= 4,
      score,
      issues
    }
  }
}