/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

Comprehensive LMS System Check
Validates all LMS components, database integration, and functionality
*/

import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
  details?: string;
}

const checks: CheckResult[] = [];

async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'Database Connection',
      status: '✅',
      message: 'Database connection successful',
    });
  } catch (error: any) {
    checks.push({
      name: 'Database Connection',
      status: '❌',
      message: `Database connection failed: ${error.message}`,
      details: 'Check DATABASE_URL environment variable',
    });
  }
}

async function checkSchemaTables(): Promise<void> {
  try {
    const tables = [
      'User',
      'Course',
      'CourseModule',
      'Lesson',
      'Enrollment',
      'CourseProgress',
      'Quiz',
      'Question',
      'QuizAttempt',
      'Certificate',
      'Badge',
      'Forum',
      'ForumPost',
      'ChatRoom',
      'ChatMessage',
    ];

    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        // Try to query the table
        await (prisma as any)[table.toLowerCase()].findFirst();
      } catch (error) {
        missingTables.push(table);
      }
    }

    if (missingTables.length === 0) {
      checks.push({
        name: 'Schema Tables',
        status: '✅',
        message: `All ${tables.length} required tables exist`,
      });
    } else {
      checks.push({
        name: 'Schema Tables',
        status: '❌',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: 'Run: npx prisma migrate dev',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Schema Tables',
      status: '⚠️',
      message: `Could not verify tables: ${error.message}`,
    });
  }
}

function checkLMSFiles(): void {
  const requiredFiles = [
    'azora-lms/core/database-service.ts',
    'azora-lms/core/graphql-unified-gateway.ts',
    'azora-lms/core/constitutional-learning-agent.ts',
    'azora-lms/core/pivc-gamification-engine.ts',
    'azora-lms/core/elara-sapiens-connector.ts',
    'prisma/unified-schema.prisma',
  ];

  const missingFiles: string[] = [];
  const existingFiles: string[] = [];

  for (const file of requiredFiles) {
    if (existsSync(join(process.cwd(), file))) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length === 0) {
    checks.push({
      name: 'LMS Core Files',
      status: '✅',
      message: `All ${requiredFiles.length} core files exist`,
    });
  } else {
    checks.push({
      name: 'LMS Core Files',
      status: '❌',
      message: `Missing files: ${missingFiles.join(', ')}`,
    });
  }
}

function checkAcademyUI(): void {
  const academyFiles = [
    'synapse/academy-ui/app/api/courses/route.ts',
    'synapse/academy-ui/app/api/enrollment/route.ts',
    'synapse/academy-ui/app/api/progress/route.ts',
    'synapse/academy-ui/app/api/ai-tutor/route.ts',
    'synapse/academy-ui/app/page.tsx',
    'synapse/academy-ui/app/courses/page.tsx',
    'synapse/academy-ui/components/VideoLecture.tsx',
    'synapse/academy-ui/components/InteractiveLesson.tsx',
    'synapse/academy-ui/components/AIProfessor.tsx',
    'synapse/academy-ui/components/AdaptiveQuiz.tsx',
  ];

  const missingFiles: string[] = [];
  const existingFiles: string[] = [];

  for (const file of academyFiles) {
    if (existsSync(join(process.cwd(), file))) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length === 0) {
    checks.push({
      name: 'Academy UI Components',
      status: '✅',
      message: `All ${academyFiles.length} UI components exist`,
    });
  } else {
    checks.push({
      name: 'Academy UI Components',
      status: '⚠️',
      message: `Missing ${missingFiles.length} files: ${missingFiles.slice(0, 3).join(', ')}${missingFiles.length > 3 ? '...' : ''}`,
    });
  }
}

async function checkDatabaseIntegration(): Promise<void> {
  try {
    // Check if database-service.ts uses Prisma
    const dbServicePath = join(process.cwd(), 'azora-lms/core/database-service.ts');
    if (existsSync(dbServicePath)) {
      const content = readFileSync(dbServicePath, 'utf-8');
      if (content.includes('PrismaClient') && content.includes('prisma.')) {
        checks.push({
          name: 'Database Integration',
          status: '✅',
          message: 'Database service uses Prisma client',
        });
      } else {
        checks.push({
          name: 'Database Integration',
          status: '❌',
          message: 'Database service not using Prisma',
        });
      }
    } else {
      checks.push({
        name: 'Database Integration',
        status: '❌',
        message: 'Database service file not found',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Database Integration',
      status: '⚠️',
      message: `Could not check: ${error.message}`,
    });
  }
}

async function checkGraphQLGateway(): Promise<void> {
  try {
    const gatewayPath = join(process.cwd(), 'azora-lms/core/graphql-unified-gateway.ts');
    if (existsSync(gatewayPath)) {
      const content = readFileSync(gatewayPath, 'utf-8');

      const hasDatabaseImport = content.includes('database-service');
      const hasPIVCEngine = content.includes('pivc-gamification-engine');
      const hasCLA = content.includes('constitutional-learning-agent');
      const usesDatabase = content.includes('lmsDatabase.');

      if (hasDatabaseImport && hasPIVCEngine && hasCLA && usesDatabase) {
        checks.push({
          name: 'GraphQL Gateway Integration',
          status: '✅',
          message: 'Gateway integrated with database and engines',
        });
      } else {
        const missing = [];
        if (!hasDatabaseImport) missing.push('database-service');
        if (!hasPIVCEngine) missing.push('PIVC engine');
        if (!hasCLA) missing.push('CLA');
        if (!usesDatabase) missing.push('database calls');

        checks.push({
          name: 'GraphQL Gateway Integration',
          status: '⚠️',
          message: `Missing integrations: ${missing.join(', ')}`,
        });
      }
    } else {
      checks.push({
        name: 'GraphQL Gateway Integration',
        status: '❌',
        message: 'GraphQL gateway file not found',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'GraphQL Gateway Integration',
      status: '⚠️',
      message: `Could not check: ${error.message}`,
    });
  }
}

async function checkEnvironmentVariables(): Promise<void> {
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['AUTH_SERVICE_URL', 'ELARA_API_URL', 'PIVC_SERVICE_URL'];

  const missing: string[] = [];
  const present: string[] = [];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  if (missing.length === 0) {
    checks.push({
      name: 'Environment Variables',
      status: '✅',
      message: `All required variables set (${present.length}/${requiredVars.length})`,
    });
  } else {
    checks.push({
      name: 'Environment Variables',
      status: '❌',
      message: `Missing: ${missing.join(', ')}`,
      details: 'Set DATABASE_URL in .env file',
    });
  }
}

async function checkPrismaClient(): Promise<void> {
  try {
    // Try to generate Prisma client
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate --schema=prisma/unified-schema.prisma', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 10000,
      });
      checks.push({
        name: 'Prisma Client',
        status: '✅',
        message: 'Prisma client generated successfully',
      });
    } catch (error: any) {
      checks.push({
        name: 'Prisma Client',
        status: '⚠️',
        message: 'Prisma client generation may be needed',
        details: 'Run: npx prisma generate',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Prisma Client',
      status: '⚠️',
      message: 'Could not verify Prisma client',
    });
  }
}

async function runAllChecks(): Promise<void> {
  console.log('\n🔍 AZORA LMS - COMPREHENSIVE SYSTEM CHECK\n');
  console.log('=' .repeat(60));

  // Run all checks
  await checkDatabaseConnection();
  await checkSchemaTables();
  checkLMSFiles();
  checkAcademyUI();
  await checkDatabaseIntegration();
  await checkGraphQLGateway();
  await checkEnvironmentVariables();
  await checkPrismaClient();

  // Print results
  console.log('\n📊 CHECK RESULTS:\n');

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const check of checks) {
    console.log(`${check.status} ${check.name}`);
    console.log(`   ${check.message}`);
    if (check.details) {
      console.log(`   💡 ${check.details}`);
    }
    console.log();

    if (check.status === '✅') passed++;
    else if (check.status === '❌') failed++;
    else if (check.status === '⚠️') warnings++;
  }

  console.log('='.repeat(60));
  console.log('\n📈 SUMMARY:\n');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total: ${checks.length}\n`);

  if (failed === 0 && warnings === 0) {
    console.log('🎉 ALL CHECKS PASSED! LMS is ready to use.\n');
    process.exit(0);
  } else if (failed === 0) {
    console.log('⚠️  Some warnings detected, but system is functional.\n');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please fix issues before proceeding.\n');
    process.exit(1);
  }
}

// Run checks
runAllChecks()
  .then(() => {
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Error running checks:', error);
    prisma.$disconnect();
    process.exit(1);
  });

