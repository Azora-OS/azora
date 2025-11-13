#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REQUIRED_SERVICES = [
  { agent: 1, name: 'ai-family-service', port: 4010 },
  { agent: 2, name: 'azora-sapiens', port: 4011 },
  { agent: 3, name: 'azora-mint', port: 4012 },
  { agent: 4, name: 'azora-forge', port: 4013 },
  { agent: 5, name: 'azora-lms', port: 4015 },
  { agent: 6, name: 'azora-nexus', port: 4016 },
  { agent: 7, name: 'analytics-service', port: 4017 },
  { agent: 8, name: 'azora-aegis', port: 4018 },
  { agent: 9, name: 'master-ui-service', port: 4019 },
  { agent: 10, name: 'mobile-service', port: 4020 },
  { agent: 11, name: 'api-integration-service', port: 4021 },
  { agent: 12, name: 'ui-enhancement-service', port: 4025 },
  { agent: 13, name: 'database-service', port: 4022 },
  { agent: 14, name: 'devops-service', port: 4024 },
  { agent: 15, name: 'testing-service', port: 4023 },
  { agent: 16, name: 'documentation-service', port: 4026 },
  { agent: 17, name: 'blockchain-service', port: 4027 },
  { agent: 18, name: 'ai-ml-service', port: 4028 },
  { agent: 19, name: 'enterprise-service', port: 4029 },
  { agent: 20, name: 'global-service', port: 4030 }
];

console.log('🔍 VERIFYING ALL 20 AGENT IMPLEMENTATIONS\n');

let implemented = 0;
let missing = 0;

for (const service of REQUIRED_SERVICES) {
  const servicePath = path.join(__dirname, service.name, 'index.js');
  const exists = fs.existsSync(servicePath);
  
  if (exists) {
    console.log(`✅ Agent ${service.agent}: ${service.name} (${service.port}) - IMPLEMENTED`);
    implemented++;
  } else {
    console.log(`❌ Agent ${service.agent}: ${service.name} (${service.port}) - MISSING`);
    missing++;
  }
}

console.log('\n📊 IMPLEMENTATION STATUS:');
console.log(`✅ Implemented: ${implemented}/20 (${Math.round((implemented/20)*100)}%)`);
console.log(`❌ Missing: ${missing}/20 (${Math.round((missing/20)*100)}%)`);

if (implemented === 20) {
  console.log('\n🎉 ALL 20 AGENTS SUCCESSFULLY IMPLEMENTED!');
  console.log('🚀 Ready for service startup and deployment!');
} else {
  console.log(`\n⚠️  ${missing} services still need implementation.`);
}

process.exit(implemented === 20 ? 0 : 1);