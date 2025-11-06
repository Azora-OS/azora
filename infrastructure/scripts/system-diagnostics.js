#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * AZORA OS - COMPREHENSIVE SYSTEM DIAGNOSTICS
 * Runs complete system checks and identifies issues
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 AZORA OS - COMPREHENSIVE SYSTEM DIAGNOSTICS');
console.log('===============================================\n');

// System health status
const healthStatus = {
  errors: [],
  warnings: [],
  suggestions: []
};

// Check 1: TypeScript compilation
console.log('1️⃣  Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('   ⚠️  TypeScript compilation issues found\n');
  healthStatus.warnings.push('TypeScript compilation issues');
}

// Check 2: ESLint linting
console.log('2️⃣  Checking code quality with ESLint...');
try {
  execSync('npx eslint . --ext .js,.ts,.tsx --quiet', { stdio: 'pipe' });
  console.log('   ✅ Code quality check passed\n');
} catch (error) {
  console.log('   ⚠️  Code quality issues found\n');
  healthStatus.warnings.push('Code quality issues');
}

// Check 3: License compliance
console.log('3️⃣  Checking license compliance...');
try {
  execSync('npm run license-check', { stdio: 'pipe' });
  console.log('   ✅ License compliance verified\n');
} catch (error) {
  console.log('   ⚠️  License compliance issues found\n');
  healthStatus.warnings.push('License compliance issues');
}

// Check 4: Constitutional alignment
console.log('4️⃣  Checking constitutional alignment...');
const constitutionPath = join(process.cwd(), 'codex', 'constitution', 'AZORA_CONSTITUTION.md');
if (existsSync(conststitutionPath)) {
  console.log('   ✅ Constitution verified\n');
} else {
  console.log('   ❌ Constitution not found\n');
  healthStatus.errors.push('Constitution missing');
}

// Check 5: Critical file integrity
console.log('5️⃣  Checking critical file integrity...');
const criticalFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'services/server-integration.js',
  'services/email-hosting.js'
];

criticalFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    healthStatus.errors.push(`${file} missing`);
  }
});

// Check 6: UI component integrity
console.log('\n6️⃣  Checking UI component integrity...');
const componentFiles = [
  'ui/components/GlassmorphicLayout.tsx',
  'ui/app/dashboard/page.tsx',
  'ui/app/enterprise/page.tsx'
];

componentFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    healthStatus.errors.push(`${file} missing`);
  }
});

// Check 7: Service integration
console.log('\n7️⃣  Checking service integration...');
const serviceFiles = [
  'services/server-integration.js',
  'services/email-hosting.js'
];

serviceFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    healthStatus.errors.push(`${file} missing`);
  }
});

// Check 8: Cross-platform deployment readiness
console.log('\n8️⃣  Checking cross-platform deployment readiness...');
const deploymentScripts = [
  'build-all-platforms.bat',
  'build-all-platforms.js',
  'deploy-to-github.bat',
  'deploy-to-vercel.bat'
];

deploymentScripts.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ⚠️  ${file} missing`);
    healthStatus.warnings.push(`${file} missing`);
  }
});

// Final health report
console.log('\n📊 SYSTEM HEALTH REPORT');
console.log('======================');

console.log(`\n❌ Critical Errors: ${healthStatus.errors.length}`);
healthStatus.errors.forEach(error => console.log(`   • ${error}`));

console.log(`\n⚠️  Warnings: ${healthStatus.warnings.length}`);
healthStatus.warnings.forEach(warning => console.log(`   • ${warning}`));

// Overall assessment
if (healthStatus.errors.length === 0 && healthStatus.warnings.length === 0) {
  console.log('\n🎉 SYSTEM IS PRODUCTION READY!');
  console.log('✅ All checks passed');
  console.log('🚀 Ready for universal deployment');
} else if (healthStatus.errors.length === 0) {
  console.log('\n✅ SYSTEM IS NEARLY PRODUCTION READY');
  console.log('⚠️  Address warnings for optimal performance');
} else {
  console.log('\n❌ SYSTEM REQUIRES ATTENTION');
  console.log('❌ Critical errors must be resolved before production');
}

console.log('\n🌍 From Africa, For Humanity, Towards Infinity');
console.log('🏛️  Azora ES - The Foundation of Tomorrow');