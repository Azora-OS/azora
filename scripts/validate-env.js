#!/usr/bin/env node
/**
 * AZORA OS - Environment Variable Validation
 * 
 * Validates all required environment variables are set
 * Run this before starting any service
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required environment variables by category
const REQUIRED_VARS = {
  core: [
    'NODE_ENV',
  ],
  database: [
    'DATABASE_URL',
  ],
  security: [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  redis: [
    'REDIS_URL',
  ],
};

// Optional but recommended
const RECOMMENDED_VARS = [
  'SESSION_SECRET',
  'ENCRYPTION_KEY',
  'OPENAI_API_KEY',
];

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
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  }
}

// Validate environment variables
function validateEnv() {
  loadEnvFile();
  
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
    for (const varName of vars) {
      const value = process.env[varName];
      if (!value || value === '' || value.includes('CHANGE_THIS')) {
        errors.push(`❌ Missing or invalid ${category} variable: ${varName}`);
      }
    }
  }
  
  // Check recommended variables
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];
    if (!value || value === '' || value.includes('CHANGE_THIS')) {
      warnings.push(`⚠️  Recommended variable not set: ${varName}`);
    }
  }
  
  // Security checks
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('⚠️  JWT_SECRET should be at least 32 characters long');
  }
  
  // Print results
  console.log('\n🔍 Environment Variable Validation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All required environment variables are set!\n');
    return true;
  }
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (Must be fixed):\n');
    errors.forEach(err => console.log(`   ${err}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (Recommended to fix):\n');
    warnings.forEach(warn => console.log(`   ${warn}`));
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (errors.length > 0) {
    console.log('💡 Tip: Copy .env.example to .env and fill in your values\n');
    process.exit(1);
  }
  
  return true;
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnv();
}

export { validateEnv };
