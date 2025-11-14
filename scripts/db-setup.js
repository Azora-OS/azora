#!/usr/bin/env node
/**
 * Azora OS Database Setup Script
 * Ubuntu Principle: "My data strengthens our foundation"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Core services with database schemas
const SERVICES = [
  'auth-service',
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-sapiens',
  'azora-nexus',
  'ai-family-service',
  'notification-service',
  'health-monitor'
];

function checkPostgres() {
  log.info('Checking PostgreSQL connection...');
  try {
    execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
    log.success('PostgreSQL is running');
    return true;
  } catch (error) {
    log.error('PostgreSQL is not running!');
    log.info('Please start PostgreSQL and try again.');
    return false;
  }
}

function setupService(serviceName) {
  const servicePath = path.join(__dirname, '..', 'services', serviceName);
  const prismaPath = path.join(servicePath, 'prisma');
  const schemaPath = path.join(prismaPath, 'schema.prisma');

  if (!fs.existsSync(prismaPath)) {
    log.warn(`Skipping ${serviceName} - no prisma directory`);
    return false;
  }

  if (!fs.existsSync(schemaPath)) {
    log.warn(`Skipping ${serviceName} - no schema.prisma`);
    return false;
  }

  log.info(`Setting up ${serviceName}...`);

  try {
    // Generate Prisma Client
    log.info(`  Generating Prisma Client for ${serviceName}...`);
    execSync('npx prisma generate', {
      cwd: servicePath,
      stdio: 'inherit'
    });

    // Push schema to database
    log.info(`  Pushing schema to database for ${serviceName}...`);
    execSync('npx prisma db push --skip-generate', {
      cwd: servicePath,
      stdio: 'inherit'
    });

    log.success(`${serviceName} setup complete`);
    return true;
  } catch (error) {
    log.error(`Failed to setup ${serviceName}: ${error.message}`);
    return false;
  }
}

function createDatabases() {
  log.info('Creating databases...');
  
  const databases = [
    'azora_auth',
    'azora_education',
    'azora_mint',
    'azora_forge',
    'azora_sapiens',
    'azora_nexus',
    'azora_family',
    'azora_notifications',
    'azora_health'
  ];

  databases.forEach(db => {
    try {
      execSync(`createdb ${db}`, { stdio: 'ignore' });
      log.success(`Created database: ${db}`);
    } catch (error) {
      // Database might already exist
      log.info(`Database ${db} already exists or couldn't be created`);
    }
  });
}

async function main() {
  console.log('\n========================================');
  console.log('   🌍 Azora OS Database Setup');
  console.log('========================================\n');

  // Check PostgreSQL
  if (!checkPostgres()) {
    process.exit(1);
  }

  console.log('');

  // Create databases
  createDatabases();

  console.log('');

  // Setup each service
  log.info(`Setting up ${SERVICES.length} services...\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (const service of SERVICES) {
    if (setupService(service)) {
      successCount++;
    } else {
      failCount++;
    }
    console.log('');
  }

  // Summary
  console.log('========================================');
  log.success(`Successfully setup ${successCount} services`);
  if (failCount > 0) {
    log.warn(`Failed to setup ${failCount} services`);
  }
  console.log('========================================\n');

  log.info('Next steps:');
  console.log('  1. Run seed data: npm run db:seed');
  console.log('  2. Start services: npm run dev');
  console.log('  3. View data: npm run db:studio');
  console.log('');
}

main().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
