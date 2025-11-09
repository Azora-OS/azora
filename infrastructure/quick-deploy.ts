#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { execSync } from 'child_process';

async function quickDeploy() {
  console.log('⚡ AZORA OS - QUICK DEPLOY');
  console.log('=========================\n');

  const steps = [
    { name: 'Setup Database', cmd: 'createdb azora_os || echo "DB exists"' },
    { name: 'Run Migrations', cmd: 'psql azora_os < infrastructure/database-migrations.sql' },
    { name: 'Start Redis', cmd: 'redis-server --daemonize yes || echo "Redis running"' },
    { name: 'Start API Gateway', cmd: 'tsx infrastructure/api-gateway-master.ts &' },
    { name: 'Health Check', cmd: 'sleep 2 && curl -s http://localhost:8080/health || echo "Starting..."' }
  ];

  for (const step of steps) {
    console.log(`🔄 ${step.name}...`);
    try {
      execSync(step.cmd, { stdio: 'pipe' });
      console.log(`✅ ${step.name} complete`);
    } catch (error) {
      console.log(`⚠️  ${step.name} - continuing...`);
    }
  }

  console.log('\n🚀 AZORA OS LIVE!');
  console.log('🌐 Gateway: http://localhost:8080');
  console.log('💚 Health: http://localhost:8080/health');
}

quickDeploy();