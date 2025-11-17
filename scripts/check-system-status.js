#!/usr/bin/env node

const http = require('http');

const services = [
  {
    "name": "azora-api-gateway",
    "port": 4000,
    "path": "services/azora-api-gateway"
  },
  {
    "name": "azora-education",
    "port": 4001,
    "path": "services/azora-education"
  },
  {
    "name": "azora-finance",
    "port": 4002,
    "path": "services/azora-finance"
  },
  {
    "name": "azora-marketplace",
    "port": 4003,
    "path": "services/azora-marketplace"
  },
  {
    "name": "azora-auth",
    "port": 4004,
    "path": "services/azora-auth"
  },
  {
    "name": "azora-ai",
    "port": 4005,
    "path": "services/azora-ai"
  },
  {
    "name": "azora-blockchain",
    "port": 4009,
    "path": "services/azora-blockchain"
  },
  {
    "name": "azora-analytics",
    "port": 4010,
    "path": "services/azora-analytics"
  },
  {
    "name": "azora-student-portal",
    "port": 3000,
    "path": "apps/azora-student-portal"
  },
  {
    "name": "azora-enterprise-ui",
    "port": 3001,
    "path": "apps/azora-enterprise-ui"
  },
  {
    "name": "azora-marketplace-ui",
    "port": 3002,
    "path": "apps/azora-marketplace-ui"
  },
  {
    "name": "azora-pay-ui",
    "port": 3003,
    "path": "apps/azora-pay-ui"
  }
];

console.log('🔍 UBUNTU SYSTEM STATUS CHECK');
console.log('============================\n');

async function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${service.port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ ...service, status: 'healthy', response: result });
        } catch {
          resolve({ ...service, status: 'unhealthy', error: 'Invalid response' });
        }
      });
    });
    
    req.on('error', () => {
      resolve({ ...service, status: 'offline', error: 'Connection failed' });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ...service, status: 'timeout', error: 'Request timeout' });
    });
  });
}

async function checkAllServices() {
  const results = await Promise.all(services.map(checkService));
  
  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : 
                 result.status === 'offline' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name} (:${result.port}) - ${result.status.toUpperCase()}`);
  });
  
  const healthy = results.filter(r => r.status === 'healthy').length;
  const total = results.length;
  
  console.log(`\n📊 System Health: ${healthy}/${total} services healthy`);
  
  if (healthy === total) {
    console.log('🌟 Ubuntu System: FULLY OPERATIONAL! 🚀');
  } else {
    console.log('🔧 Ubuntu System: Needs attention');
  }
}

checkAllServices();