#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

const services = [
  'api-gateway',
  'auth-service', 
  'azora-education',
  'azora-finance',
  'health-monitor'
];

const apps = [
  'student-portal',
  'azora-enterprise-ui',
  'azora-marketplace-ui',
  'azora-pay-ui',
  'master-ui'
];

console.log('🚀 Starting Azora OS Development Environment...\n');

// Start core services
services.forEach((service, index) => {
  const servicePath = path.join(process.cwd(), 'services', service);
  const port = 4000 + index;
  
  console.log(`Starting ${service} on port ${port}...`);
  
  const child = spawn('npx', ['nodemon', 'index.js'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port.toString() }
  });

  child.on('error', (err) => {
    console.error(`Failed to start ${service}:`, err.message);
  });
});

// Start frontend apps
apps.forEach((app, index) => {
  const appPath = path.join(process.cwd(), 'apps', app);
  const port = 3000 + index;
  
  console.log(`Starting ${app} on port ${port}...`);
  
  const child = spawn('npx', ['next', 'dev'], {
    cwd: appPath,
    stdio: 'inherit', 
    shell: true,
    env: { ...process.env, PORT: port.toString() }
  });

  child.on('error', (err) => {
    console.error(`Failed to start ${app}:`, err.message);
  });
});

console.log('\n✅ Development environment started!');
console.log('📊 API Gateway: http://localhost:4000');
console.log('🎓 Student Portal: http://localhost:3000');
console.log('🏢 Enterprise UI: http://localhost:3001');
console.log('🛒 Marketplace UI: http://localhost:3002');
console.log('💳 Pay UI: http://localhost:3003');
console.log('🔧 Master UI: http://localhost:3004');