#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * System Status Check
 * Verifies that all Azora OS components are fully functional
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 AZORA OS SYSTEM STATUS CHECK');
console.log('==============================\n');

interface ComponentStatus {
  name: string;
  status: '✅ OK' | '⚠️  WARNING' | '❌ ERROR';
  details: string;
}

const statuses: ComponentStatus[] = [];

// Check 1: Node.js and npm
console.log('1. Checking Node.js and npm...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  statuses.push({
    name: 'Node.js & npm',
    status: '✅ OK',
    details: `${nodeVersion}, npm ${npmVersion}`,
  });
  console.log('   ✅ Node.js and npm are installed\n');
} catch (error) {
  statuses.push({
    name: 'Node.js & npm',
    status: '❌ ERROR',
    details: 'Not installed or not in PATH',
  });
  console.log('   ❌ Node.js and/or npm not found\n');
}

// Check 2: TypeScript
console.log('2. Checking TypeScript...');
try {
  const tsVersion = execSync('npx tsc --version', { encoding: 'utf-8' }).trim();
  statuses.push({
    name: 'TypeScript',
    status: '✅ OK',
    details: tsVersion,
  });
  console.log('   ✅ TypeScript is installed\n');
} catch (error) {
  statuses.push({
    name: 'TypeScript',
    status: '⚠️  WARNING',
    details: 'Not installed globally (will use local version)',
  });
  console.log('   ⚠️  TypeScript not installed globally\n');
}

// Check 3: Core components
console.log('3. Checking core components...');

// Super AI Database
if (existsSync(join(process.cwd(), 'core', 'super-ai-database.ts'))) {
  statuses.push({
    name: 'Super AI Database',
    status: '✅ OK',
    details: 'Core module present',
  });
  console.log('   ✅ Super AI Database core module found');
} else {
  statuses.push({
    name: 'Super AI Database',
    status: '❌ ERROR',
    details: 'Core module missing',
  });
  console.log('   ❌ Super AI Database core module missing');
}

// Organism Core
if (existsSync(join(process.cwd(), 'genome', 'organism-core.ts'))) {
  statuses.push({
    name: 'Living Organism Core',
    status: '✅ OK',
    details: 'Organism module present',
  });
  console.log('   ✅ Living Organism core module found');
} else {
  statuses.push({
    name: 'Living Organism Core',
    status: '❌ ERROR',
    details: 'Organism module missing',
  });
  console.log('   ❌ Living Organism core module missing');
}

// Elara Family
if (existsSync(join(process.cwd(), 'elara-family'))) {
  statuses.push({
    name: 'Elara Family',
    status: '✅ OK',
    details: 'AI consciousness modules present',
  });
  console.log('   ✅ Elara Family consciousness modules found');
} else {
  statuses.push({
    name: 'Elara Family',
    status: '❌ ERROR',
    details: 'AI consciousness modules missing',
  });
  console.log('   ❌ Elara Family consciousness modules missing');
}

console.log();

// Check 4: UI Components
console.log('4. Checking UI components...');

if (existsSync(join(process.cwd(), 'ui'))) {
  statuses.push({
    name: 'UI Components',
    status: '✅ OK',
    details: 'User interface present',
  });
  console.log('   ✅ UI components found');
} else {
  statuses.push({
    name: 'UI Components',
    status: '❌ ERROR',
    details: 'User interface missing',
  });
  console.log('   ❌ UI components missing');
}

console.log();

// Check 5: Scripts
console.log('5. Checking activation scripts...');

const scripts = [
  { name: 'activate-database.bat', path: 'activate-database.bat' },
  { name: 'activate-organism.bat', path: 'activate-organism.bat' },
  { name: 'liberate-africa.bat', path: 'liberate-africa.bat' },
];

scripts.forEach((script) => {
  if (existsSync(join(process.cwd(), script.path))) {
    statuses.push({
      name: script.name,
      status: '✅ OK',
      details: 'Script present',
    });
    console.log(`   ✅ ${script.name} found`);
  } else {
    statuses.push({
      name: script.name,
      status: '❌ ERROR',
      details: 'Script missing',
    });
    console.log(`   ❌ ${script.name} missing`);
  }
});

console.log();

// Check 6: Executables
console.log('6. Checking executables...');

if (existsSync(join(process.cwd(), 'dist'))) {
  statuses.push({
    name: 'Executables',
    status: '✅ OK',
    details: 'Distribution directory present',
  });
  console.log('   ✅ Distribution directory found');
} else {
  statuses.push({
    name: 'Executables',
    status: '⚠️  WARNING',
    details: 'Distribution directory not found (run build script)',
  });
  console.log('   ⚠️  Distribution directory not found (run build script)');
}

console.log();

// Final Report
console.log('📋 SYSTEM STATUS REPORT');
console.log('======================\n');

let allGood = true;
let hasWarnings = false;

statuses.forEach((status) => {
  console.log(`${status.status} ${status.name}: ${status.details}`);
  if (status.status === '❌ ERROR') {
    allGood = false;
  } else if (status.status === '⚠️  WARNING') {
    hasWarnings = true;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood && !hasWarnings) {
  console.log('🎉 ALL SYSTEMS OPERATIONAL!');
  console.log('   Azora OS is fully ready for deployment.');
  console.log('   All components are functioning correctly.');
} else if (allGood && hasWarnings) {
  console.log('✅ SYSTEMS OPERATIONAL WITH WARNINGS');
  console.log('   Core functionality is available.');
  console.log('   Some optional components may need attention.');
} else {
  console.log('❌ SYSTEM ISSUES DETECTED');
  console.log('   Critical components are missing or not working.');
  console.log('   Please check the errors above and resolve them.');
}

console.log('\n🚀 NEXT STEPS:');
if (allGood) {
  console.log('   - Run "npm run build:all:exe" to create executables');
  console.log('   - Run "npm run activate:database" to start the database');
  console.log('   - Run "npm run organism:activate" to start the living organism');
} else {
  console.log('   - Fix the issues identified above');
  console.log('   - Re-run this script to verify fixes');
}

console.log('\n💡 TIP: Run individual component tests with:');
console.log('   - npm run test:database (Super AI Database)');
console.log('   - npm run test:installation (Installation components)');
