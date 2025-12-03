#!/usr/bin/env node

/**
 * Health Check Script
 * Monitors all service health endpoints
 */

const fetch = require('node-fetch');

const SERVICES = {
  "api-gateway": 4000,
  "auth-service": 4001,
  "azora-education": 4002,
  "azora-finance": 4003,
  "azora-marketplace": 4004,
  "health-monitor": 4005,
  "azora-aegis": 4006,
  "ai-family-service": 4010,
  "azora-sapiens": 4011,
  "notification-service": 4012,
  "payment": 4013,
  "analytics-service": 4014,
  "enterprise": 4020
};

async function checkServiceHealth(serviceName, port) {
  const url = `http://localhost:${port}/health`;
  
  try {
    const response = await fetch(url, { timeout: 3000 });
    const data = await response.json();
    
    return {
      service: serviceName,
      status: response.ok ? 'healthy' : 'unhealthy',
      port,
      response: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'offline',
      port,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkAllServices() {
  console.log('🏥 Checking service health...\n');
  
  const healthChecks = await Promise.all(
    Object.entries(SERVICES).map(([service, port]) => 
      checkServiceHealth(service, port)
    )
  );
  
  const healthy = healthChecks.filter(h => h.status === 'healthy').length;
  const total = healthChecks.length;
  
  healthChecks.forEach(check => {
    const icon = check.status === 'healthy' ? '✅' : 
                 check.status === 'unhealthy' ? '⚠️' : '❌';
    console.log(`${icon} ${check.service} (${check.port}): ${check.status}`);
  });
  
  console.log(`\n📊 Health Summary: ${healthy}/${total} services healthy`);
  
  return { healthy, total, checks: healthChecks };
}

if (require.main === module) {
  checkAllServices()
    .then(result => {
      process.exit(result.healthy === result.total ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkAllServices };
