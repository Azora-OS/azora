#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Azora OS Security Audit\n');

const servicesDir = path.join(__dirname, '../services');
const services = fs.readdirSync(servicesDir).filter(f => 
  fs.statSync(path.join(servicesDir, f)).isDirectory()
);

const checks = {
  helmet: 0,
  cors: 0,
  rateLimit: 0,
  csrf: 0,
  validation: 0,
  errorHandler: 0
};

services.forEach(service => {
  const indexPath = path.join(servicesDir, service, 'index.js');
  if (!fs.existsSync(indexPath)) return;
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  console.log(`\n📦 ${service}`);
  
  if (content.includes('helmet')) {
    console.log('  ✅ Helmet.js');
    checks.helmet++;
  } else {
    console.log('  ❌ Helmet.js missing');
  }
  
  if (content.includes('cors')) {
    console.log('  ✅ CORS');
    checks.cors++;
  } else {
    console.log('  ❌ CORS missing');
  }
  
  if (content.includes('rateLimit') || content.includes('rateLimiter')) {
    console.log('  ✅ Rate Limiting');
    checks.rateLimit++;
  } else {
    console.log('  ❌ Rate Limiting missing');
  }
  
  if (content.includes('csrf')) {
    console.log('  ✅ CSRF Protection');
    checks.csrf++;
  } else {
    console.log('  ⚠️  CSRF Protection missing');
  }
  
  if (content.includes('validate') || content.includes('validation')) {
    console.log('  ✅ Input Validation');
    checks.validation++;
  } else {
    console.log('  ⚠️  Input Validation missing');
  }
  
  if (content.includes('errorHandler')) {
    console.log('  ✅ Error Handler');
    checks.errorHandler++;
  } else {
    console.log('  ❌ Error Handler missing');
  }
});

console.log('\n\n📊 Security Summary\n');
console.log(`Services Audited: ${services.length}`);
console.log(`Helmet.js: ${checks.helmet}/${services.length}`);
console.log(`CORS: ${checks.cors}/${services.length}`);
console.log(`Rate Limiting: ${checks.rateLimit}/${services.length}`);
console.log(`CSRF Protection: ${checks.csrf}/${services.length}`);
console.log(`Input Validation: ${checks.validation}/${services.length}`);
console.log(`Error Handler: ${checks.errorHandler}/${services.length}`);

const total = Object.values(checks).reduce((a, b) => a + b, 0);
const max = services.length * 6;
const percentage = Math.round((total / max) * 100);

console.log(`\n🎯 Security Score: ${percentage}%`);

if (percentage >= 80) {
  console.log('✅ Security posture: EXCELLENT');
} else if (percentage >= 60) {
  console.log('⚠️  Security posture: GOOD (improvements needed)');
} else {
  console.log('❌ Security posture: NEEDS ATTENTION');
}
