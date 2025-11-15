#!/usr/bin/env node

/**
 * Production Structure Verification Script
 * Verifies that the repository follows production-grade structure
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const REQUIRED_STRUCTURE = {
  directories: [
    'apps',
    'services',
    'packages',
    'infrastructure',
    'docs',
    'scripts',
    'tests',
    'prisma',
    '.github'
  ],
  files: [
    'package.json',
    'README.md',
    'LICENSE',
    '.gitignore',
    '.env.example',
    'docker-compose.yml',
    'docker-compose.prod.yml',
    'tsconfig.json'
  ]
};

const CORE_SERVICES = [
  'api-gateway',
  'auth-service',
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-sapiens',
  'ai-family-service',
  'health-monitor'
];

const CORE_APPS = [
  'student-portal',
  'enterprise-ui',
  'marketplace-ui',
  'pay-ui'
];

function checkExists(itemPath, type = 'file') {
  const exists = fs.existsSync(itemPath);
  const icon = exists ? '✅' : '❌';
  const name = path.relative(ROOT, itemPath);
  console.log(`${icon} ${type}: ${name}`);
  return exists;
}

function verifyStructure() {
  console.log('\n📁 Verifying Directory Structure\n');
  
  let passed = 0;
  let failed = 0;
  
  // Check required directories
  REQUIRED_STRUCTURE.directories.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (checkExists(dirPath, 'dir')) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log('\n📄 Verifying Required Files\n');
  
  // Check required files
  REQUIRED_STRUCTURE.files.forEach(file => {
    const filePath = path.join(ROOT, file);
    if (checkExists(filePath, 'file')) {
      passed++;
    } else {
      failed++;
    }
  });
  
  return { passed, failed };
}

function verifyServices() {
  console.log('\n🔧 Verifying Core Services\n');
  
  const servicesDir = path.join(ROOT, 'services');
  let passed = 0;
  let failed = 0;
  
  if (!fs.existsSync(servicesDir)) {
    console.log('❌ Services directory not found');
    return { passed: 0, failed: CORE_SERVICES.length };
  }
  
  CORE_SERVICES.forEach(service => {
    const servicePath = path.join(servicesDir, service);
    const packagePath = path.join(servicePath, 'package.json');
    
    if (fs.existsSync(servicePath) && fs.existsSync(packagePath)) {
      console.log(`✅ ${service}`);
      passed++;
    } else {
      console.log(`❌ ${service} (missing or incomplete)`);
      failed++;
    }
  });
  
  return { passed, failed };
}

function verifyApps() {
  console.log('\n🎨 Verifying Core Apps\n');
  
  const appsDir = path.join(ROOT, 'apps');
  let passed = 0;
  let failed = 0;
  
  if (!fs.existsSync(appsDir)) {
    console.log('❌ Apps directory not found');
    return { passed: 0, failed: CORE_APPS.length };
  }
  
  CORE_APPS.forEach(app => {
    const appPath = path.join(appsDir, app);
    const packagePath = path.join(appPath, 'package.json');
    
    if (fs.existsSync(appPath) && fs.existsSync(packagePath)) {
      console.log(`✅ ${app}`);
      passed++;
    } else {
      console.log(`❌ ${app} (missing or incomplete)`);
      failed++;
    }
  });
  
  return { passed, failed };
}

function countRootFiles() {
  console.log('\n📊 Root Directory Analysis\n');
  
  const items = fs.readdirSync(ROOT);
  const files = items.filter(item => {
    const itemPath = path.join(ROOT, item);
    return fs.statSync(itemPath).isFile();
  });
  
  console.log(`Total root files: ${files.length}`);
  
  if (files.length > 25) {
    console.log('⚠️  Warning: More than 25 files in root (consider cleanup)');
  } else if (files.length <= 20) {
    console.log('✅ Root directory is clean');
  }
  
  return files.length;
}

function generateReport(results) {
  console.log('\n═══════════════════════════════════════\n');
  console.log('📊 Verification Summary\n');
  
  const total = results.structure.passed + results.structure.failed +
                results.services.passed + results.services.failed +
                results.apps.passed + results.apps.failed;
  
  const passed = results.structure.passed + results.services.passed + results.apps.passed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`Structure: ${results.structure.passed}/${results.structure.passed + results.structure.failed}`);
  console.log(`Services: ${results.services.passed}/${CORE_SERVICES.length}`);
  console.log(`Apps: ${results.apps.passed}/${CORE_APPS.length}`);
  console.log(`Root files: ${results.rootFiles}`);
  console.log(`\nOverall: ${passed}/${total} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('\n✅ Repository structure is production-ready!');
  } else if (percentage >= 80) {
    console.log('\n⚠️  Repository structure is mostly ready (minor issues)');
  } else {
    console.log('\n❌ Repository structure needs cleanup');
    console.log('   Run: npm run cleanup:production');
  }
  
  console.log('\n═══════════════════════════════════════\n');
}

function main() {
  console.log('\n🔍 Azora OS Structure Verification\n');
  console.log('═══════════════════════════════════════\n');
  
  const results = {
    structure: verifyStructure(),
    services: verifyServices(),
    apps: verifyApps(),
    rootFiles: countRootFiles()
  };
  
  generateReport(results);
}

if (require.main === module) {
  main();
}

module.exports = { main };
