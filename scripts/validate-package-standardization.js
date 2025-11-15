#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');
const REQUIRED_SERVICES = [
  'azora-mint', 'api-gateway', 'auth-service', 'azora-education',
  'azora-forge', 'azora-sapiens', 'ai-family-service',
  'azora-assessment', 'azora-pay', 'health-monitor'
];

const REQUIRED_SCRIPTS = ['dev', 'build', 'start', 'test'];

console.log('🔍 Validating Package Standardization...\n');

let allValid = true;
const results = { readme: 0, env: 0, scripts: 0, jest: 0 };

REQUIRED_SERVICES.forEach(service => {
  const servicePath = path.join(SERVICES_DIR, service);
  const checks = [];

  // Check README.md
  if (fs.existsSync(path.join(servicePath, 'README.md'))) {
    checks.push('✅ README');
    results.readme++;
  } else {
    checks.push('❌ README');
    allValid = false;
  }

  // Check .env.example
  if (fs.existsSync(path.join(servicePath, '.env.example'))) {
    checks.push('✅ .env.example');
    results.env++;
  } else {
    checks.push('❌ .env.example');
    allValid = false;
  }

  // Check package.json scripts
  const pkgPath = path.join(servicePath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const hasAllScripts = REQUIRED_SCRIPTS.every(s => pkg.scripts && pkg.scripts[s]);
    if (hasAllScripts) {
      checks.push('✅ scripts');
      results.scripts++;
    } else {
      checks.push('❌ scripts');
      allValid = false;
    }
  }

  // Check jest.config.js (optional for services with tests)
  if (fs.existsSync(path.join(servicePath, '__tests__')) || 
      fs.existsSync(path.join(servicePath, 'tests'))) {
    if (fs.existsSync(path.join(servicePath, 'jest.config.js'))) {
      checks.push('✅ jest');
      results.jest++;
    } else {
      checks.push('⚠️  jest');
    }
  }

  console.log(`${service}: ${checks.join(' | ')}`);
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Results:`);
console.log(`   README.md: ${results.readme}/${REQUIRED_SERVICES.length}`);
console.log(`   .env.example: ${results.env}/${REQUIRED_SERVICES.length}`);
console.log(`   npm scripts: ${results.scripts}/${REQUIRED_SERVICES.length}`);
console.log(`   jest.config.js: ${results.jest} (where applicable)`);

if (allValid) {
  console.log('\n✅ ALL PACKAGES STANDARDIZED');
  console.log('🚀 Package standardization complete');
  process.exit(0);
} else {
  console.log('\n❌ SOME PACKAGES NEED ATTENTION');
  process.exit(1);
}
