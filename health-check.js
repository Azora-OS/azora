#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import axios from 'axios';
import net from 'node:net';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {'tcp'} TcpServiceType
 *
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} url
 * @property {TcpServiceType} [type]
 *
 * @typedef {Object} ServiceResult
 * @property {string} name
 * @property {'healthy' | 'unhealthy'} status
 * @property {string} responseTime
 * @property {unknown} [data]
 * @property {string} [error]
 */

/** @type {ServiceConfig[]} */
const services = [
  { name: 'API Gateway', url: 'http://localhost:4000/health' },
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
  { name: 'Mint Service', url: 'http://localhost:3002/health' },
  { name: 'LMS Service', url: 'http://localhost:3003/health' },
  { name: 'Forge Service', url: 'http://localhost:3004/health' },
  { name: 'Nexus Service', url: 'http://localhost:3005/health' },
  { name: 'Education Service', url: 'http://localhost:3007/health' },
  { name: 'Payments Service', url: 'http://localhost:3008/health' },
  { name: 'Frontend', url: 'http://localhost:3000/api/health' },
  { name: 'Database', url: 'http://localhost:5432', type: 'tcp' },
  { name: 'Redis', url: 'http://localhost:6379', type: 'tcp' },
  { name: 'Prometheus', url: 'http://localhost:9090/-/healthy' },
  { name: 'Grafana', url: 'http://localhost:3030/api/health' },
];

/**
 * @param {ServiceConfig} service
 * @returns {Promise<ServiceResult>}
 */
async function checkService(service) {
  const start = performance.now();

  try {
    if (service.type === 'tcp') {
      const url = new URL(service.url);
      const connectionOptions =
        /** @type {import('node:net').NetConnectOpts} */ ({
          host: url.hostname,
          port: url.port ? Number(url.port) : undefined,
        });

      return new Promise(resolvePromise => {
        const client = net.createConnection(connectionOptions, () => {
          const end = performance.now();
          const responseTime = Math.round(end - start);
          client.end();
          resolvePromise({
            name: service.name,
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            data: 'TCP connection successful',
          });
        });

        client.on('error', error => {
          const end = performance.now();
          const responseTime = Math.round(end - start);
          const message =
            error instanceof Error ? error.message : String(error);
          resolvePromise({
            name: service.name,
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            error: message,
          });
        });

        setTimeout(() => {
          client.destroy();
          const end = performance.now();
          const responseTime = Math.round(end - start);
          resolvePromise({
            name: service.name,
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            error: 'Connection timeout',
          });
        }, 5000);
      });
    }

    const response = await axios.get(service.url, { timeout: 5000 });
    const end = performance.now();
    const responseTime = Math.round(end - start);

    return {
      name: service.name,
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      data: response.data,
    };
  } catch (error) {
    const end = performance.now();
    const responseTime = Math.round(end - start);
    const message = error instanceof Error ? error.message : String(error);

    return {
      name: service.name,
      status: 'unhealthy',
      responseTime: `${responseTime}ms`,
      error: message,
    };
  }
}

export async function runHealthCheck() {
  console.log('🏥 AZORA OS HEALTH CHECK');
  console.log('========================');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const results = await Promise.all(services.map(checkService));

  let healthyCount = 0;
  let totalResponseTime = 0;

  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : '❌';
    console.log(
      `${icon} ${result.name}: ${result.status} (${result.responseTime})`
    );

    if (result.status === 'healthy') {
      healthyCount += 1;
      totalResponseTime += parseInt(result.responseTime, 10);
    }

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const healthPercentage = Math.round((healthyCount / services.length) * 100);
  const avgResponseTime =
    healthyCount > 0 ? Math.round(totalResponseTime / healthyCount) : 0;

  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`🎯 System Health: ${healthPercentage}%`);
  console.log(`⚡ Avg Response: ${avgResponseTime}ms`);
  console.log(`✅ Healthy: ${healthyCount}/${services.length}`);
  console.log(
    `❌ Unhealthy: ${services.length - healthyCount}/${services.length}`
  );

  if (healthPercentage === 100) {
    console.log('\n🚀 ALL SYSTEMS OPERATIONAL - SUPREME ORGANISM ACTIVE!');
  } else if (healthPercentage >= 80) {
    console.log('\n⚠️  SOME SERVICES DOWN - PARTIAL OPERATION');
  } else {
    console.log('\n🚨 CRITICAL - MULTIPLE SERVICES DOWN');
  }

  process.exit(healthPercentage < 50 ? 1 : 0);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
const modulePath = resolve(fileURLToPath(import.meta.url));

if (invokedPath && invokedPath === modulePath) {
  runHealthCheck().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
