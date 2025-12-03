const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');
const Redis = require('ioredis');
const EventEmitter = require('events');
const { execSync } = require('child_process');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3038;

// Initialize Redis for configuration storage
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-config-manager' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'config-manager.log' })
  ]
});

// Configuration Schema Validator
class ConfigValidator {
  constructor() {
    this.schemas = new Map();
    this.validationRules = new Map();
    this.initializeDefaultSchemas();
  }

  initializeDefaultSchemas() {
    // Database configuration schema
    this.addSchema('database', {
      type: 'object',
      required: ['host', 'port', 'database'],
      properties: {
        host: { type: 'string', minLength: 1 },
        port: { type: 'number', minimum: 1, maximum: 65535 },
        database: { type: 'string', minLength: 1 },
        username: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 8 },
        ssl: { type: 'boolean' },
        poolSize: { type: 'number', minimum: 1, maximum: 100 },
        timeout: { type: 'number', minimum: 1000 }
      }
    });

    // Redis configuration schema
    this.addSchema('redis', {
      type: 'object',
      required: ['host', 'port'],
      properties: {
        host: { type: 'string', minLength: 1 },
        port: { type: 'number', minimum: 1, maximum: 65535 },
        password: { type: 'string' },
        db: { type: 'number', minimum: 0, maximum: 15 },
        maxRetriesPerRequest: { type: 'number', minimum: 0 },
        retryDelayOnFailover: { type: 'number', minimum: 100 }
      }
    });

    // Service configuration schema
    this.addSchema('service', {
      type: 'object',
      required: ['name', 'port', 'environment'],
      properties: {
        name: { type: 'string', minLength: 1, pattern: '^[a-z0-9-]+$' },
        port: { type: 'number', minimum: 1, maximum: 65535 },
        environment: { type: 'string', enum: ['development', 'staging', 'production'] },
        logLevel: { type: 'string', enum: ['error', 'warn', 'info', 'debug'] },
        corsOrigins: { type: 'array', items: { type: 'string', format: 'uri' } },
        rateLimit: {
          type: 'object',
          properties: {
            windowMs: { type: 'number', minimum: 1000 },
            max: { type: 'number', minimum: 1 }
          }
        }
      }
    });

    // Ubuntu tokenomics configuration schema
    this.addSchema('ubuntu-tokenomics', {
      type: 'object',
      required: ['totalSupply', 'distribution'],
      properties: {
        totalSupply: { type: 'number', minimum: 0 },
        distribution: {
          type: 'object',
          required: ['community', 'development', 'treasury'],
          properties: {
            community: { type: 'number', minimum: 0, maximum: 100 },
            development: { type: 'number', minimum: 0, maximum: 100 },
            treasury: { type: 'number', minimum: 0, maximum: 100 },
            staking: { type: 'number', minimum: 0, maximum: 100 }
          },
          additionalProperties: false
        },
        rewardRates: {
          type: 'object',
          properties: {
            proofOfValue: { type: 'number', minimum: 0 },
            contribution: { type: 'number', minimum: 0 },
            staking: { type: 'number', minimum: 0 }
          }
        }
      }
    });
  }

  addSchema(name, schema) {
    this.schemas.set(name, schema);
    logger.info(`Configuration schema added`, { name });
  }

  validate(schemaName, config) {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    const result = this.validateObject(config, schema);
    return result;
  }

  validateObject(obj, schema, path = '') {
    const errors = [];
    const warnings = [];

    // Type validation
    if (schema.type && typeof obj !== schema.type) {
      errors.push(`${path}: Expected type ${schema.type}, got ${typeof obj}`);
      return { valid: false, errors, warnings };
    }

    // Required properties
    if (schema.required && typeof obj === 'object' && obj !== null) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in obj)) {
          errors.push(`${path}${requiredProp}: Required property missing`);
        }
      }
    }

    // Property validation
    if (schema.properties && typeof obj === 'object' && obj !== null) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in obj) {
          const propPath = path ? `${path}.${propName}` : propName;
          const propResult = this.validateObject(obj[propName], propSchema, propPath);
          errors.push(...propResult.errors);
          warnings.push(...propResult.warnings);
        }
      }
    }

    // Array validation
    if (schema.items && Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemResult = this.validateObject(item, schema.items, `${path}[${index}]`);
        errors.push(...itemResult.errors);
        warnings.push(...itemResult.warnings);
      });
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(obj)) {
      errors.push(`${path}: Value must be one of ${schema.enum.join(', ')}`);
    }

    // Pattern validation
    if (schema.pattern && typeof obj === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(obj)) {
        errors.push(`${path}: Value does not match required pattern`);
      }
    }

    // String length validation
    if (typeof obj === 'string') {
      if (schema.minLength !== undefined && obj.length < schema.minLength) {
        errors.push(`${path}: String too short (min: ${schema.minLength})`);
      }
      if (schema.maxLength !== undefined && obj.length > schema.maxLength) {
        errors.push(`${path}: String too long (max: ${schema.maxLength})`);
      }
    }

    // Number range validation
    if (typeof obj === 'number') {
      if (schema.minimum !== undefined && obj < schema.minimum) {
        errors.push(`${path}: Number too small (min: ${schema.minimum})`);
      }
      if (schema.maximum !== undefined && obj > schema.maximum) {
        errors.push(`${path}: Number too large (max: ${schema.maximum})`);
      }
    }

    // URI format validation
    if (schema.format === 'uri' && typeof obj === 'string') {
      try {
        new URL(obj);
      } catch {
        errors.push(`${path}: Invalid URI format`);
      }
    }

    // Ubuntu-specific validations
    this.validateUbuntuRules(obj, path, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateUbuntuRules(obj, path, errors, warnings) {
    // Ubuntu community principles validation
    if (path.includes('ubuntu-tokenomics') && obj.distribution) {
      const total = Object.values(obj.distribution).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 100) > 0.01) {
        errors.push(`${path}.distribution: Distribution must sum to 100%`);
      }

      // Community should have significant share
      if (obj.distribution.community < 30) {
        warnings.push(`${path}.distribution.community: Community share should be at least 30% for Ubuntu principles`);
      }
    }

    // Service naming conventions
    if (path.includes('service') && obj.name) {
      if (!obj.name.includes('azora')) {
        warnings.push(`${path}.name: Service names should include 'azora' for Ubuntu branding`);
      }
    }
  }

  getSchema(name) {
    return this.schemas.get(name);
  }

  listSchemas() {
    return Array.from(this.schemas.keys());
  }
}

// Migration System
class MigrationSystem {
  constructor() {
    this.migrations = new Map();
    this.executedMigrations = new Set();
    this.migrationPath = path.join(__dirname, 'migrations');
    this.initializeMigrations();
  }

  initializeMigrations() {
    // Database migrations
    this.addMigration('001_initial_database_setup', {
      description: 'Initialize database schema and basic tables',
      version: '1.0.0',
      up: async () => {
        logger.info('Running migration: 001_initial_database_setup');
        // In production, would execute actual database migrations
        await new Promise(resolve => setTimeout(resolve, 100));
      },
      down: async () => {
        logger.info('Rolling back migration: 001_initial_database_setup');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    this.addMigration('002_add_user_indexes', {
      description: 'Add performance indexes to user tables',
      version: '1.0.1',
      up: async () => {
        logger.info('Running migration: 002_add_user_indexes');
        await new Promise(resolve => setTimeout(resolve, 150));
      },
      down: async () => {
        logger.info('Rolling back migration: 002_add_user_indexes');
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    });

    this.addMigration('003_ubuntu_tokenomics_integration', {
      description: 'Integrate Ubuntu tokenomics system',
      version: '1.1.0',
      up: async () => {
        logger.info('Running migration: 003_ubuntu_tokenomics_integration');
        await new Promise(resolve => setTimeout(resolve, 200));
      },
      down: async () => {
        logger.info('Rolling back migration: 003_ubuntu_tokenomics_integration');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    });

    this.addMigration('004_enhance_security_config', {
      description: 'Enhance security configuration and audit logging',
      version: '1.1.1',
      up: async () => {
        logger.info('Running migration: 004_enhance_security_config');
        await new Promise(resolve => setTimeout(resolve, 100));
      },
      down: async () => {
        logger.info('Rolling back migration: 004_enhance_security_config');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  }

  addMigration(name, migration) {
    this.migrations.set(name, {
      name,
      ...migration,
      createdAt: new Date().toISOString()
    });
    logger.info(`Migration added`, { name, version: migration.version });
  }

  async runMigrations(targetVersion = null) {
    const migrationNames = Array.from(this.migrations.keys()).sort();
    const results = [];

    for (const migrationName of migrationNames) {
      if (this.executedMigrations.has(migrationName)) {
        continue;
      }

      const migration = this.migrations.get(migrationName);
      
      if (targetVersion && this.compareVersions(migration.version, targetVersion) > 0) {
        break;
      }

      try {
        const startTime = Date.now();
        await migration.up();
        const duration = Date.now() - startTime;

        this.executedMigrations.add(migrationName);
        
        // Record migration execution
        await this.recordMigrationExecution(migrationName, 'up', duration);

        results.push({
          name: migrationName,
          version: migration.version,
          status: 'success',
          duration,
          description: migration.description
        });

        logger.info(`Migration executed successfully`, { 
          migration: migrationName, 
          version: migration.version,
          duration 
        });

      } catch (error) {
        results.push({
          name: migrationName,
          version: migration.version,
          status: 'failed',
          error: error.message,
          description: migration.description
        });

        logger.error(`Migration failed`, { 
          migration: migrationName, 
          error: error.message 
        });

        throw error;
      }
    }

    return results;
  }

  async rollbackMigration(migrationName) {
    const migration = this.migrations.get(migrationName);
    if (!migration) {
      throw new Error(`Migration '${migrationName}' not found`);
    }

    if (!this.executedMigrations.has(migrationName)) {
      throw new Error(`Migration '${migrationName}' has not been executed`);
    }

    try {
      const startTime = Date.now();
      await migration.down();
      const duration = Date.now() - startTime;

      this.executedMigrations.delete(migrationName);
      
      // Record rollback
      await this.recordMigrationExecution(migrationName, 'down', duration);

      logger.info(`Migration rolled back successfully`, { 
        migration: migrationName,
        duration 
      });

      return {
        name: migrationName,
        version: migration.version,
        status: 'rolled_back',
        duration
      };

    } catch (error) {
      logger.error(`Migration rollback failed`, { 
        migration: migrationName, 
        error: error.message 
      });
      throw error;
    }
  }

  async recordMigrationExecution(migrationName, direction, duration) {
    try {
      const record = {
        migration: migrationName,
        direction,
        duration,
        executedAt: new Date().toISOString()
      };

      await redis.lpush('migration_history', JSON.stringify(record));
      await redis.ltrim('migration_history', 0, 999); // Keep last 1000 records
    } catch (error) {
      logger.error('Failed to record migration execution', { error });
    }
  }

  async getMigrationHistory() {
    try {
      const records = await redis.lrange('migration_history', 0, -1);
      return records.map(record => JSON.parse(record)).reverse();
    } catch (error) {
      logger.error('Failed to get migration history', { error });
      return [];
    }
  }

  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  listMigrations() {
    return Array.from(this.migrations.values()).map(m => ({
      name: m.name,
      version: m.version,
      description: m.description,
      executed: this.executedMigrations.has(m.name),
      createdAt: m.createdAt
    }));
  }
}

// Configuration Manager
class ConfigManager extends EventEmitter {
  constructor() {
    super();
    this.validator = new ConfigValidator();
    this.migrationSystem = new MigrationSystem();
    this.configurations = new Map();
    this.configHistory = [];
    this.watchers = new Map();
    this.loadConfigurations();
  }

  async loadConfigurations() {
    try {
      // Load configurations from Redis
      const configKeys = await redis.keys('config:*');
      
      for (const key of configKeys) {
        const configName = key.replace('config:', '');
        const configData = await redis.get(key);
        
        if (configData) {
          const config = JSON.parse(configData);
          this.configurations.set(configName, {
            ...config,
            loadedAt: new Date().toISOString()
          });
        }
      }

      logger.info(`Loaded ${this.configurations.size} configurations`);
    } catch (error) {
      logger.error('Failed to load configurations', { error });
    }
  }

  async setConfiguration(name, config, schemaName = null, options = {}) {
    try {
      // Validate configuration if schema provided
      let validationResult = null;
      if (schemaName) {
        validationResult = this.validator.validate(schemaName, config);
        if (!validationResult.valid) {
          throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Store configuration
      const configData = {
        name,
        config,
        schema: schemaName,
        version: options.version || '1.0.0',
        environment: options.environment || process.env.NODE_ENV || 'development',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validation: validationResult,
        tags: options.tags || []
      };

      await redis.setex(`config:${name}`, 86400, JSON.stringify(configData)); // 24 hours

      this.configurations.set(name, configData);

      // Add to history
      this.configHistory.push({
        action: 'set',
        name,
        version: configData.version,
        timestamp: new Date().toISOString(),
        validation: validationResult
      });

      // Keep history bounded
      if (this.configHistory.length > 1000) {
        this.configHistory = this.configHistory.slice(-1000);
      }

      this.emit('configurationSet', { name, configData, validationResult });

      logger.info(`Configuration set`, { name, version: configData.version, schema: schemaName });

      return {
        success: true,
        name,
        version: configData.version,
        validation: validationResult,
        ubuntu: 'Configuration set with Ubuntu wisdom'
      };

    } catch (error) {
      this.emit('configurationError', { name, error });
      logger.error('Failed to set configuration', { name, error: error.message });
      throw error;
    }
  }

  async getConfiguration(name) {
    const config = this.configurations.get(name);
    
    if (!config) {
      throw new Error(`Configuration '${name}' not found`);
    }

    return {
      ...config,
      ubuntu: 'Configuration retrieved with Ubuntu care'
    };
  }

  async deleteConfiguration(name) {
    try {
      await redis.del(`config:${name}`);
      this.configurations.delete(name);

      // Add to history
      this.configHistory.push({
        action: 'delete',
        name,
        timestamp: new Date().toISOString()
      });

      this.emit('configurationDeleted', { name });

      logger.info(`Configuration deleted`, { name });

      return {
        success: true,
        name,
        ubuntu: 'Configuration deleted with Ubuntu renewal'
      };

    } catch (error) {
      this.emit('configurationError', { name, error });
      logger.error('Failed to delete configuration', { name, error: error.message });
      throw error;
    }
  }

  async validateConfiguration(name, schemaName) {
    const config = this.configurations.get(name);
    if (!config) {
      throw new Error(`Configuration '${name}' not found`);
    }

    const validationResult = this.validator.validate(schemaName, config.config);
    
    return {
      name,
      schema: schemaName,
      validation: validationResult,
      ubuntu: 'Configuration validated with Ubuntu diligence'
    };
  }

  async runMigrations(targetVersion = null) {
    try {
      const results = await this.migrationSystem.runMigrations(targetVersion);
      
      this.emit('migrationsRun', { results });
      
      return {
        success: true,
        results,
        ubuntu: 'Migrations completed with Ubuntu progress'
      };

    } catch (error) {
      this.emit('migrationError', { error });
      logger.error('Failed to run migrations', { error });
      throw error;
    }
  }

  async rollbackMigration(migrationName) {
    try {
      const result = await this.migrationSystem.rollbackMigration(migrationName);
      
      this.emit('migrationRolledBack', { result });
      
      return {
        success: true,
        result,
        ubuntu: 'Migration rolled back with Ubuntu care'
      };

    } catch (error) {
      this.emit('migrationError', { error });
      logger.error('Failed to rollback migration', { error });
      throw error;
    }
  }

  listConfigurations() {
    return Array.from(this.configurations.values()).map(config => ({
      name: config.name,
      version: config.version,
      environment: config.environment,
      schema: config.schema,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      tags: config.tags,
      validation: config.validation
    }));
  }

  getConfigurationHistory() {
    return this.configHistory.slice(-50); // Last 50 changes
  }

  async exportConfigurations(format = 'json') {
    const configs = this.listConfigurations();
    
    if (format === 'json') {
      return {
        exportedAt: new Date().toISOString(),
        configurations: configs,
        ubuntu: 'Configurations exported with Ubuntu transparency'
      };
    } else if (format === 'yaml') {
      // In production, would use actual YAML library
      return {
        format: 'yaml',
        data: configs,
        note: 'YAML format would be implemented in production',
        ubuntu: 'Configurations exported with Ubuntu transparency'
      };
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async importConfigurations(data, options = {}) {
    const results = [];
    
    for (const configData of data.configurations) {
      try {
        const result = await this.setConfiguration(
          configData.name,
          configData.config,
          configData.schema,
          {
            version: configData.version,
            environment: configData.environment,
            tags: configData.tags,
            ...options
          }
        );
        
        results.push(result);
      } catch (error) {
        results.push({
          name: configData.name,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      results,
      ubuntu: 'Configurations imported with Ubuntu care'
    };
  }
}

const configManager = new ConfigManager();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for configuration harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const configs = configManager.listConfigurations();
    const migrations = configManager.migrationSystem.listMigrations();
    
    res.json({
      service: 'azora-config-manager',
      status: 'healthy',
      ubuntu: 'I organize our ecosystem with Ubuntu wisdom',
      timestamp: new Date().toISOString(),
      port: PORT,
      summary: {
        configurations: configs.length,
        migrations: migrations.length,
        executedMigrations: migrations.filter(m => m.executed).length,
        schemas: configManager.validator.listSchemas().length
      },
      features: {
        configValidation: '✅ Active',
        migrationSystem: '✅ Active',
        versionControl: '✅ Active',
        ubuntuWisdom: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-config-manager',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu configuration management for ecosystem organization',
    principles: [
      'My validation protects our collective integrity',
      'My migrations guide our shared evolution',
      'My organization sustains our Ubuntu harmony',
      'My wisdom nurtures our community growth'
    ],
    service: 'azora-config-manager',
    ubuntu: 'Ubuntu configuration management'
  });
});

// ========== CONFIGURATION MANAGEMENT ENDPOINTS ==========

// POST /api/config - Set configuration
app.post('/api/config', async (req, res) => {
  try {
    const { name, config, schema, options = {} } = req.body;

    if (!name || !config) {
      return res.status(400).json({
        error: 'Name and config are required',
        ubuntu: 'Ubuntu clarity: Complete configuration details enable proper management'
      });
    }

    const result = await configManager.setConfiguration(name, config, schema, options);

    console.log(`⚙️ Configuration set: ${name}`);

    res.json(result);
  } catch (error) {
    logger.error('Error setting configuration:', error);
    res.status(500).json({
      error: 'Failed to set configuration',
      message: error.message,
      ubuntu: 'We handle configuration errors with Ubuntu grace'
    });
  }
});

// GET /api/config/:name - Get configuration
app.get('/api/config/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const config = await configManager.getConfiguration(name);

    res.json(config);
  } catch (error) {
    logger.error('Error getting configuration:', error);
    res.status(404).json({
      error: 'Configuration not found',
      ubuntu: 'Ubuntu guidance: Check configuration name'
    });
  }
});

// DELETE /api/config/:name - Delete configuration
app.delete('/api/config/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await configManager.deleteConfiguration(name);

    console.log(`🗑️ Configuration deleted: ${name}`);

    res.json(result);
  } catch (error) {
    logger.error('Error deleting configuration:', error);
    res.status(500).json({
      error: 'Failed to delete configuration',
      ubuntu: 'We handle deletion errors with Ubuntu grace'
    });
  }
});

// GET /api/config - List all configurations
app.get('/api/config', (req, res) => {
  try {
    const configs = configManager.listConfigurations();

    res.json({
      configurations: configs,
      total: configs.length,
      ubuntu: 'Configurations show Ubuntu organization'
    });
  } catch (error) {
    logger.error('Error listing configurations:', error);
    res.status(500).json({
      error: 'Failed to list configurations',
      ubuntu: 'We handle listing errors with Ubuntu grace'
    });
  }
});

// POST /api/config/:name/validate - Validate configuration
app.post('/api/config/:name/validate', async (req, res) => {
  try {
    const { name } = req.params;
    const { schema } = req.body;

    if (!schema) {
      return res.status(400).json({
        error: 'Schema is required for validation',
        ubuntu: 'Ubuntu clarity: Specify schema for validation'
      });
    }

    const result = await configManager.validateConfiguration(name, schema);

    res.json(result);
  } catch (error) {
    logger.error('Error validating configuration:', error);
    res.status(500).json({
      error: 'Failed to validate configuration',
      ubuntu: 'We handle validation errors with Ubuntu grace'
    });
  }
});

// ========== MIGRATION ENDPOINTS ==========

// POST /api/migrations/run - Run migrations
app.post('/api/migrations/run', async (req, res) => {
  try {
    const { targetVersion } = req.body;
    const result = await configManager.runMigrations(targetVersion);

    console.log(`🔄 Migrations executed: ${result.results.length}`);

    res.json(result);
  } catch (error) {
    logger.error('Error running migrations:', error);
    res.status(500).json({
      error: 'Failed to run migrations',
      ubuntu: 'We handle migration errors with Ubuntu grace'
    });
  }
});

// POST /api/migrations/rollback/:name - Rollback migration
app.post('/api/migrations/rollback/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await configManager.rollbackMigration(name);

    console.log(`🔄 Migration rolled back: ${name}`);

    res.json(result);
  } catch (error) {
    logger.error('Error rolling back migration:', error);
    res.status(500).json({
      error: 'Failed to rollback migration',
      ubuntu: 'We handle rollback errors with Ubuntu grace'
    });
  }
});

// GET /api/migrations - List migrations
app.get('/api/migrations', (req, res) => {
  try {
    const migrations = configManager.migrationSystem.listMigrations();

    res.json({
      migrations,
      total: migrations.length,
      ubuntu: 'Migrations show Ubuntu evolution'
    });
  } catch (error) {
    logger.error('Error listing migrations:', error);
    res.status(500).json({
      error: 'Failed to list migrations',
      ubuntu: 'We handle listing errors with Ubuntu grace'
    });
  }
});

// GET /api/migrations/history - Get migration history
app.get('/api/migrations/history', async (req, res) => {
  try {
    const history = await configManager.migrationSystem.getMigrationHistory();

    res.json({
      history,
      total: history.length,
      ubuntu: 'Migration history shows Ubuntu progress'
    });
  } catch (error) {
    logger.error('Error getting migration history:', error);
    res.status(500).json({
      error: 'Failed to get migration history',
      ubuntu: 'We handle history errors with Ubuntu grace'
    });
  }
});

// ========== SC MANAGEMENT ENDPOINTS ==========

// GET /api/schemas - List available schemas
app.get('/api/schemas', (req, res) => {
  try {
    const schemas = configManager.validator.listSchemas();

    res.json({
      schemas,
      total: schemas.length,
      ubuntu: 'Schemas show Ubuntu structure'
    });
  } catch (error) {
    logger.error('Error listing schemas:', error);
    res.status(500).json({
      error: 'Failed to list schemas',
      ubuntu: 'We handle schema errors with Ubuntu grace'
    });
  }
});

// GET /api/schemas/:name - Get specific schema
app.get('/api/schemas/:name', (req, res) => {
  try {
    const { name } = req.params;
    const schema = configManager.validator.getSchema(name);

    if (!schema) {
      return res.status(404).json({
        error: 'Schema not found',
        ubuntu: 'Ubuntu guidance: Check schema name'
      });
    }

    res.json({
      name,
      schema,
      ubuntu: 'Schema shows Ubuntu structure'
    });
  } catch (error) {
    logger.error('Error getting schema:', error);
    res.status(500).json({
      error: 'Failed to get schema',
      ubuntu: 'We handle schema errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY ENDPOINTS ==========

// GET /api/history - Get configuration history
app.get('/api/history', (req, res) => {
  try {
    const history = configManager.getConfigurationHistory();

    res.json({
      history,
      total: history.length,
      ubuntu: 'History shows Ubuntu evolution'
    });
  } catch (error) {
    logger.error('Error getting history:', error);
    res.status(500).json({
      error: 'Failed to get history',
      ubuntu: 'We handle history errors with Ubuntu grace'
    });
  }
});

// POST /api/export - Export configurations
app.post('/api/export', async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    const result = await configManager.exportConfigurations(format);

    console.log(`📤 Configurations exported in ${format} format`);

    res.json(result);
  } catch (error) {
    logger.error('Error exporting configurations:', error);
    res.status(500).json({
      error: 'Failed to export configurations',
      ubuntu: 'We handle export errors with Ubuntu grace'
    });
  }
});

// POST /api/import - Import configurations
app.post('/api/import', async (req, res) => {
  try {
    const { data, options = {} } = req.body;

    if (!data || !data.configurations) {
      return res.status(400).json({
        error: 'Configuration data is required',
        ubuntu: 'Ubuntu clarity: Provide configuration data for import'
      });
    }

    const result = await configManager.importConfigurations(data, options);

    console.log(`📥 Configurations imported: ${result.results.length}`);

    res.json(result);
  } catch (error) {
    logger.error('Error importing configurations:', error);
    res.status(500).json({
      error: 'Failed to import configurations',
      ubuntu: 'We handle import errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Config Manager Error:', error);
  res.status(500).json({
    error: 'Ubuntu config manager error',
    ubuntu: 'We handle configuration errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Config manager endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available configuration endpoints',
    availableEndpoints: [
      '/api/config',
      '/api/config/:name',
      '/api/config/:name/validate',
      '/api/migrations/run',
      '/api/migrations/rollback/:name',
      '/api/migrations',
      '/api/migrations/history',
      '/api/schemas',
      '/api/schemas/:name',
      '/api/history',
      '/api/export',
      '/api/import',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`⚙️ Azora Config Manager running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I organize our ecosystem with Ubuntu wisdom!"');
  console.log(`✅ Configuration Validation: Active`);
  console.log(`🔄 Migration System: Active`);
  console.log(`📋 Version Control: Active`);
  console.log(`🏗️ Schema Management: Active`);
  console.log(`📚 Configuration History: Active`);
  console.log(`🌍 Ubuntu: Configuration management through ecosystem organization`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (redis) await redis.quit();
  process.exit(0);
});

module.exports = app;
