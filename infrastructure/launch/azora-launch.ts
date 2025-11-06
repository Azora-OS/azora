#!/usr/bin/env node

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * AZORA OS LAUNCHER
 *
 * Main entry point for launching Azora OS
 */

import { spawn } from 'child_process';

// Launch all core services
const services = [
  'genome/elara-master-launcher.ts',
  'scripts/constitutional-service-launcher.ts',
];

console.log('🚀 Launching Azora OS...');
console.log('========================');

services.forEach((service, index) => {
  console.log(`   🚀 Launching service ${index + 1}: ${service}`);
  const child = spawn('npx', ['tsx', service], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', error => {
    console.error(`❌ Failed to launch ${service}:`, error);
  });

  child.on('exit', code => {
    console.log(`   ✅ Service ${service} exited with code ${code}`);
  });
});

console.log('\n🎉 Azora OS launch sequence initiated!');
console.log('   Services are starting in the background.');
console.log('   Use "npm run status" to check service status.');

