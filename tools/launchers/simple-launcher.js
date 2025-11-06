/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
ECHO is off.
See LICENSE file for details. 
*/ 
ECHO is off.
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 AZORA OS - Simple Launcher');
console.log('=============================');

// Core services to launch
const services = [
  {
    name: 'Azora Mint',
    path: 'services/azora-mint',
    command: 'npm',
    args: ['run', 'dev'],
    port: 4300
  },
  {
    name: 'Azora Sapiens',
    path: 'services/azora-sapiens',
    command: 'node',
    args: ['sapiens-service.js'],
    port: 4200
  },
  {
    name: 'Azora Nexus',
    path: 'services/azora-nexus',
    command: 'npx',
    args: ['tsx', 'index.ts'],
    port: 3006
  }
];

const processes = [];

// Function to launch a service
function launchService(service) {
  console.log(`🚀 Launching ${service.name} on port ${service.port}...`);
  
  const servicePath = path.join(__dirname, service.path);
  const process = spawn(service.command, service.args, {
    cwd: servicePath,
    stdio: 'inherit'
  });
  
  process.on('close', (code) => {
    console.log(`🛑 ${service.name} exited with code ${code}`);
  });
  
  processes.push({
    name: service.name,
    process: process
  });
}

// Launch all services
services.forEach(service => {
  launchService(service);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  processes.forEach(proc => {
    proc.process.kill();
  });
  process.exit(0);
});

console.log('\n✨ All services launched! Press Ctrl+C to stop.');