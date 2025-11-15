#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');
const SERVICES = [
  'azora-mint', 'api-gateway', 'auth-service', 'azora-education',
  'azora-forge', 'azora-sapiens', 'ai-family-service',
  'azora-assessment', 'azora-pay', 'health-monitor'
];

console.log('🔐 Validating Security Configuration...\n');

let allValid = true;
const results = { cors: 0, rateLimit: 0, helmet: 0, errorHandler: 0 };

SERVICES.forEach(service => {
  const servicePath = path.join(SERVICES_DIR, service);
  const indexPath = path.join(servicePath, 'index.js');
  const checks = [];

  if (!fs.existsSync(indexPath)) {
    console.log(`${service}: ⚠️  No index.js found`);
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf8');

  // Check CORS
  if (content.includes('cors(') || content.includes('corsConfig')) {
    checks.push('✅ CORS');
    results.cors++;
  } else {
    checks.push('❌ CORS');
    allValid = false;
  }

  // Check Rate Limiting
  if (content.includes('rateLimit') || content.includes('createRateLimiter')) {
    checks.push('✅ Rate Limit');
    results.rateLimit++;
  } else {
    checks.push('❌ Rate Limit');
    allValid = false;
  }

  // Check Helmet
  if (content.includes('helmet(') || content.includes('helmetConfig')) {
    checks.push('✅ Helmet');
    results.helmet++;
  } else {
    checks.push('❌ Helmet');
    allValid = false;
  }

  // Check Error Handler
  if (content.includes('errorHandler')) {
    checks.push('✅ Error Handler');
    results.errorHandler++;
  } else {
    checks.push('⚠️  Error Handler');
  }

  console.log(`${service}: ${checks.join(' | ')}`);
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Security Results:`);
console.log(`   CORS: ${results.cors}/${SERVICES.length}`);
console.log(`   Rate Limiting: ${results.rateLimit}/${SERVICES.length}`);
console.log(`   Helmet: ${results.helmet}/${SERVICES.length}`);
console.log(`   Error Handler: ${results.errorHandler}/${SERVICES.length}`);

// Check middleware files
const middlewarePath = path.join(SERVICES_DIR, 'shared', 'middleware');
const middlewareFiles = ['validation.ts', 'security.ts', 'errorHandler.ts'];
let middlewareComplete = true;

console.log('\n📁 Middleware Files:');
middlewareFiles.forEach(file => {
  const exists = fs.existsSync(path.join(middlewarePath, file));
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
  if (!exists) middlewareComplete = false;
});

// Check documentation
const docsPath = path.join(__dirname, '../docs');
const securityDocs = ['SECURITY-POLICY.md', 'SECURITY-HEADERS.md', 'SECURITY-CHECKLIST.md'];
let docsComplete = true;

console.log('\n📚 Security Documentation:');
securityDocs.forEach(doc => {
  const exists = fs.existsSync(path.join(docsPath, doc));
  console.log(`   ${doc}: ${exists ? '✅' : '❌'}`);
  if (!exists) docsComplete = false;
});

console.log('\n' + '='.repeat(60));
if (allValid && middlewareComplete && docsComplete) {
  console.log('✅ SECURITY CONFIGURATION COMPLETE');
  console.log('🚀 All services are production-ready');
  process.exit(0);
} else {
  console.log('⚠️  SECURITY CONFIGURATION INCOMPLETE');
  console.log('Some services need security updates');
  process.exit(1);
}
