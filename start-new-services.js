#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Services to start
const services = [
  {
    name: 'Audit Logging Service',
    path: './services/audit-logging-service',
    port: 3005
  },
  {
    name: 'Tamper-Proof Data Service',
    path: './services/tamper-proof-data-service',
    port: 3006
  },
  {
    name: 'Shield Service',
    path: './services/shield_service',
    port: 3007
  }
];

console.log('🚀 Starting new Azora OS services...\n');

// Start each service
services.forEach(service => {
  console.log(`🔧 Starting ${service.name} on port ${service.port}...`);

  const serviceProcess = spawn('npm', ['start'], {
    cwd: path.resolve(service.path),
    stdio: 'inherit',
    shell: true
  });

  serviceProcess.on('error', (error) => {
    console.error(`❌ Failed to start ${service.name}:`, error.message);
  });

  serviceProcess.on('close', (code) => {
    console.log(`⚠️  ${service.name} exited with code ${code}`);
  });
});

console.log('\n✅ All new services startup processes initiated!');
console.log('📝 Note: Services may take a few seconds to fully start.');
console.log('🔗 Check individual service logs for status updates.');
