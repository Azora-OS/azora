#!/usr/bin/env node
/**
 * AZORA OS - Environment Variable Schema Validator
 * 
 * Validates environment variables against schema
 * Part of Layer 1: Security Foundation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable schema
const ENV_SCHEMA = {
  // Core
  NODE_ENV: {
    required: true,
    type: 'string',
    values: ['development', 'production', 'test'],
    default: 'development',
  },
  
  // Database
  DATABASE_URL: {
    required: true,
    type: 'string',
    pattern: /^postgresql:\/\//,
    description: 'PostgreSQL connection string',
  },
  
  // Redis
  REDIS_URL: {
    required: true,
    type: 'string',
    pattern: /^redis:\/\//,
    description: 'Redis connection string',
  },
  
  // Security (Critical)
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT signing secret (minimum 32 characters)',
  },
  
  JWT_REFRESH_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT refresh token secret (minimum 32 characters)',
  },
  
  SESSION_SECRET: {
    required: false,
    type: 'string',
    minLength: 32,
    description: 'Session secret (minimum 32 characters)',
  },
  
  ENCRYPTION_KEY: {
    required: false,
    type: 'string',
    minLength: 32,
    description: 'Encryption key (minimum 32 characters)',
  },
  
  // AI Services
  OPENAI_API_KEY: {
    required: false,
    type: 'string',
    pattern: /^sk-/,
    description: 'OpenAI API key',
  },
  
  // Blockchain
  CHRONICLE_CONTRACT_ADDRESS: {
    required: false,
    type: 'string',
    pattern: /^0x[a-fA-F0-9]{40}$/,
    description: 'Chronicle Protocol contract address',
  },
  
  CHRONICLE_PRIVATE_KEY: {
    required: false,
    type: 'string',
    pattern: /^0x[a-fA-F0-9]{64}$/,
    description: 'Blockchain private key (for Chronicle Protocol)',
  },
};

function validateEnvSchema() {
  console.log('\n🔍 Validating Environment Variables Against Schema...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const errors = [];
  const warnings = [];
  
  for (const [varName, schema] of Object.entries(ENV_SCHEMA)) {
    const value = process.env[varName];
    
    // Check required
    if (schema.required && (!value || value === '')) {
      errors.push({
        variable: varName,
        error: 'Required but not set',
        description: schema.description,
      });
      continue;
    }
    
    // Skip validation if not set and not required
    if (!value || value === '') {
      continue;
    }
    
    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      errors.push({
        variable: varName,
        error: `Expected type ${schema.type}, got ${typeof value}`,
      });
      continue;
    }
    
    // Pattern validation
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push({
        variable: varName,
        error: `Value does not match required pattern`,
        pattern: schema.pattern.source,
      });
      continue;
    }
    
    // Length validation
    if (schema.minLength && value.length < schema.minLength) {
      errors.push({
        variable: varName,
        error: `Minimum length is ${schema.minLength} characters`,
        actual: value.length,
      });
      continue;
    }
    
    // Values validation
    if (schema.values && !schema.values.includes(value)) {
      errors.push({
        variable: varName,
        error: `Must be one of: ${schema.values.join(', ')}`,
        actual: value,
      });
      continue;
    }
  }
  
  // Report results
  if (errors.length === 0) {
    console.log('✅ All environment variables valid!\n');
    return true;
  }
  
  console.log(`❌ Found ${errors.length} validation errors:\n`);
  
  for (const error of errors) {
    console.log(`   ❌ ${error.variable}:`);
    console.log(`      ${error.error}`);
    if (error.description) {
      console.log(`      ${error.description}`);
    }
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Fix: Update environment variables to match schema\n');
  
  return false;
}

// Load .env file if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  loadEnvFile();
  const success = validateEnvSchema();
  process.exit(success ? 0 : 1);
}

export { validateEnvSchema, ENV_SCHEMA };
