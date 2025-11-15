#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');
const REQUIRED_SERVICES = [
  'azora-mint',
  'api-gateway',
  'auth-service',
  'azora-education',
  'azora-forge',
  'azora-sapiens',
  'ai-family-service',
  'azora-assessment',
  'azora-pay',
  'health-monitor'
];

console.log('🔍 Validating TypeScript Setup...\n');

let allValid = true;

REQUIRED_SERVICES.forEach(service => {
  const tsconfigPath = path.join(SERVICES_DIR, service, 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log(`❌ ${service}: tsconfig.json missing`);
    allValid = false;
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (!config.extends || !config.extends.includes('tsconfig.base.json')) {
      console.log(`❌ ${service}: doesn't extend root config`);
      allValid = false;
      return;
    }

    console.log(`✅ ${service}: tsconfig.json valid`);
  } catch (error) {
    console.log(`❌ ${service}: invalid JSON - ${error.message}`);
    allValid = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ ALL SERVICES CONFIGURED CORRECTLY');
  console.log('🚀 TypeScript setup is production-ready');
  process.exit(0);
} else {
  console.log('❌ SOME SERVICES NEED ATTENTION');
  process.exit(1);
}
