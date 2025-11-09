#!/usr/bin/env node

import axios from 'axios';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const services = [
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
  { name: 'Mint Service', url: 'http://localhost:3002/health' },
  { name: 'LMS Service', url: 'http://localhost:3003/health' },
  { name: 'Forge Service', url: 'http://localhost:3004/health' },
  { name: 'Nexus Service', url: 'http://localhost:3005/health' },
  { name: 'Education Service', url: 'http://localhost:3007/health' },
  { name: 'Payments Service', url: 'http://localhost:3008/health' }
];

async function checkService(service) {
  try {
    const response = await axios.get(service.url, { timeout: 5000 });
    return {
      name: service.name,
      status: '✅ healthy',
      data: response.data
    };
  } catch (error) {
    return {
      name: service.name,
      status: '❌ unhealthy',
      error: error.message
    };
  }
}

export async function runQuickHealthCheck() {
  console.log('🏥 AZORA OS CORE SERVICES HEALTH CHECK');
  console.log('=====================================');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const results = await Promise.all(services.map(checkService));

  let healthyCount = 0;

  results.forEach((result) => {
    console.log(`${result.status}: ${result.name}`);

    if (result.status.includes('healthy')) {
      healthyCount += 1;
    }
  });

  const healthPercentage = Math.round((healthyCount / services.length) * 100);

  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`🎯 Core Services Health: ${healthPercentage}%`);
  console.log(`✅ Healthy: ${healthyCount}/${services.length}`);
  console.log(`❌ Unhealthy: ${services.length - healthyCount}/${services.length}`);

  if (healthPercentage === 100) {
    console.log('\n🚀 ALL CORE SERVICES OPERATIONAL!');
  } else {
    console.log('\n⚠️  SOME SERVICES DOWN');
  }

  process.exit(healthPercentage < 50 ? 1 : 0);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
const modulePath = resolve(fileURLToPath(import.meta.url));

if (invokedPath && invokedPath === modulePath) {
  runQuickHealthCheck().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}