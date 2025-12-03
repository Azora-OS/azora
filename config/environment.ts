/**
 * Environment Configuration Management
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Server Configuration
  PORT: z.string().transform(Number).default('4000'),
  HOST: z.string().default('localhost'),
  
  // Database Configuration
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().transform(Number).default('5432'),
  POSTGRES_DB: z.string().default('azora_dev'),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_SSL: z.string().transform(val => val === 'true').default('false'),
  
  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.string().transform(val => val === 'true').default('false'),
  
  // MongoDB Configuration
  MONGO_URI: z.string().optional(),
  MONGO_PASSWORD: z.string().optional(),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32).default('azora-ubuntu-security-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32).default('azora-session-secret-change-in-production'),
  
  // API Configuration
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
  API_RATE_WINDOW: z.string().transform(Number).default('900000'),
  
  // External Services
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Cloud Configuration
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Vault Configuration
  VAULT_ADDR: z.string().optional(),
  VAULT_TOKEN: z.string().optional(),
  
  // Monitoring Configuration
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Ubuntu Philosophy
  UBUNTU_MODE: z.enum(['development', 'production']).default('development')
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Export validated configuration
export const config = {
  env: env.NODE_ENV,
  ubuntu: {
    mode: env.UBUNTU_MODE,
    philosophy: 'My security ensures our freedom',
    community: 'I can because we can'
  },
  server: {
    port: env.PORT,
    host: env.HOST,
    cors: {
      origin: env.NODE_ENV === 'production' 
        ? ['https://azora.world', 'https://api.azora.world']
        : ['http://localhost:3000'],
      credentials: true
    }
  },
  database: {
    postgres: {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DB,
      username: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      ssl: env.POSTGRES_SSL,
      pool: {
        min: env.NODE_ENV === 'production' ? 5 : 1,
        max: env.NODE_ENV === 'production' ? 20 : 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      tls: env.REDIS_TLS,
      cluster: env.NODE_ENV === 'production' ? [
        { host: 'azora-redis-001.cache.amazonaws.com', port: 6379 },
        { host: 'azora-redis-002.cache.amazonaws.com', port: 6379 },
        { host: 'azora-redis-003.cache.amazonaws.com', port: 6379 }
      ] : undefined
    },
    mongodb: {
      uri: env.MONGO_URI || `mongodb://localhost:27017/azora_${env.NODE_ENV}`,
      options: {
        maxPoolSize: env.NODE_ENV === 'production' ? 10 : 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    }
  },
  auth: {
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
    },
    bcrypt: {
      rounds: env.BCRYPT_ROUNDS
    },
    session: {
      secret: env.SESSION_SECRET
    }
  },
  security: {
    rateLimit: {
      windowMs: env.API_RATE_WINDOW,
      max: env.API_RATE_LIMIT
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: env.NODE_ENV === 'production'
      }
    }
  },
  services: {
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET
    },
    email: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    aws: {
      region: env.AWS_REGION,
      credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      } : undefined
    },
    vault: {
      addr: env.VAULT_ADDR,
      token: env.VAULT_TOKEN
    }
  },
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN
    },
    logging: {
      level: env.LOG_LEVEL
    }
  }
};

// Configuration validation helper
export function validateConfig(): boolean {
  try {
    // Critical production checks
    if (env.NODE_ENV === 'production') {
      const required = [
        'JWT_SECRET',
        'SESSION_SECRET',
        'POSTGRES_PASSWORD'
      ];
      
      const missing = required.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
      }
      
      // Security checks
      if (env.JWT_SECRET === 'azora-ubuntu-security-secret-key-change-in-production') {
        throw new Error('JWT_SECRET must be changed in production');
      }
      
      if (env.SESSION_SECRET === 'azora-session-secret-change-in-production') {
        throw new Error('SESSION_SECRET must be changed in production');
      }
    }
    
    console.log('✅ Configuration validated successfully');
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔧 Ubuntu Mode: ${env.UBUNTU_MODE}`);
    console.log(`💡 Philosophy: ${config.ubuntu.philosophy}`);
    
    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    return false;
  }
}

// Export for use in other modules
export default config;
