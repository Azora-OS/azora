#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 STARTING AZORA CORE SERVICES');
console.log('================================');

const services = [
  { name: 'api-gateway', port: 4000, path: 'services/api-gateway' },
  { name: 'auth-service', port: 4001, path: 'services/auth-service' },
  { name: 'azora-education', port: 4002, path: 'services/azora-education' },
  { name: 'azora-finance', port: 4003, path: 'services/azora-finance' },
  { name: 'azora-marketplace', port: 4004, path: 'services/azora-marketplace' },
  { name: 'health-monitor', port: 4005, path: 'services/health-monitor' },
  { name: 'azora-aegis', port: 4006, path: 'services/azora-aegis' }
];

const processes = [];

function startService(service) {
  const servicePath = path.join(__dirname, '..', service.path);
  
  console.log(`🔄 Starting ${service.name} on port ${service.port}...`);
  
  const child = spawn('node', ['server.js'], {
    cwd: servicePath,
    env: { ...process.env, PORT: service.port },
    stdio: 'pipe'
  });
  
  child.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
  });
  
  child.on('close', (code) => {
    console.log(`[${service.name}] Process exited with code ${code}`);
  });
  
  processes.push({ name: service.name, process: child });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`✅ ${service.name} started`);
      resolve();
    }, 2000);
  });
}

async function startAllServices() {
  for (const service of services) {
    await startService(service);
  }
  
  console.log('\n🎉 All services started!');
  console.log('\n📊 Service Status:');
  services.forEach(service => {
    console.log(`   ${service.name}: http://localhost:${service.port}/health`);
  });
  
  console.log('\n⚡ Ubuntu: "We serve because we prosper together!"');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  processes.forEach(({ name, process }) => {
    console.log(`   Stopping ${name}...`);
    process.kill();
  });
  process.exit(0);
});

startAllServices().catch(console.error);