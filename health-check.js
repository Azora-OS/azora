#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const axios = require('axios');
const { performance } = require('perf_hooks');

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
  { name: 'Grafana', url: 'http://localhost:3030/api/health' }
];

async function checkService(service) {
  const start = performance.now();
  try {
    if (service.type === 'tcp') {
      // For TCP connections (database, Redis)
      const url = new URL(service.url);
      const net = require('net');
      
      return new Promise((resolve) => {
        const client = net.createConnection({ host: url.hostname, port: url.port }, () => {
          const end = performance.now();
          const responseTime = Math.round(end - start);
          client.end();
          resolve({
            name: service.name,
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            data: 'TCP connection successful'
          });
        });
        
        client.on('error', (error) => {
          const end = performance.now();
          const responseTime = Math.round(end - start);
          resolve({
            name: service.name,
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            error: error.message
          });
        });
        
        setTimeout(() => {
          client.destroy();
          const end = performance.now();
          const responseTime = Math.round(end - start);
          resolve({
            name: service.name,
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            error: 'Connection timeout'
          });
        }, 5000);
      });
    } else {
      // For HTTP endpoints
      const response = await axios.get(service.url, { timeout: 5000 });
      const end = performance.now();
      const responseTime = Math.round(end - start);
      
      return {
        name: service.name,
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        data: response.data
      };
    }
  } catch (error) {
    const end = performance.now();
    const responseTime = Math.round(end - start);
    
    return {
      name: service.name,
      status: 'unhealthy',
      responseTime: `${responseTime}ms`,
      error: error.message
    };
  }
}

async function runHealthCheck() {
  console.log('🏥 AZORA OS HEALTH CHECK');
  console.log('========================');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  const results = await Promise.all(services.map(checkService));
  
  let healthyCount = 0;
  let totalResponseTime = 0;

  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status} (${result.responseTime})`);
    
    if (result.status === 'healthy') {
      healthyCount++;
      totalResponseTime += parseInt(result.responseTime);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const healthPercentage = Math.round((healthyCount / services.length) * 100);
  const avgResponseTime = healthyCount > 0 ? Math.round(totalResponseTime / healthyCount) : 0;

  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`🎯 System Health: ${healthPercentage}%`);
  console.log(`⚡ Avg Response: ${avgResponseTime}ms`);
  console.log(`✅ Healthy: ${healthyCount}/${services.length}`);
  console.log(`❌ Unhealthy: ${services.length - healthyCount}/${services.length}`);

  if (healthPercentage === 100) {
    console.log('\n🚀 ALL SYSTEMS OPERATIONAL - SUPREME ORGANISM ACTIVE!');
  } else if (healthPercentage >= 80) {
    console.log('\n⚠️  SOME SERVICES DOWN - PARTIAL OPERATION');
  } else {
    console.log('\n🚨 CRITICAL - MULTIPLE SERVICES DOWN');
  }

  process.exit(healthPercentage < 50 ? 1 : 0);
}

if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };