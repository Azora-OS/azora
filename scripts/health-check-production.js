#!/usr/bin/env node

const axios = require('axios');

console.log('🏥 AZORA PRODUCTION HEALTH CHECK');
console.log('================================');
console.log('⚡ Ubuntu: "I monitor because we care together!" ⚡\n');

const services = [
  { name: 'API Gateway', url: 'http://localhost:4000/health' },
  { name: 'Auth Service', url: 'http://localhost:3001/health' },
  { name: 'Education Service', url: 'http://localhost:3010/health' },
  { name: 'Mint Service', url: 'http://localhost:3002/health' },
  { name: 'Prometheus', url: 'http://localhost:9090/-/healthy' },
  { name: 'Grafana', url: 'http://localhost:3000/api/health' }
];

async function checkHealth() {
  let healthy = 0;
  let total = services.length;

  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      if (response.status === 200) {
        console.log(`✅ ${service.name}: Healthy`);
        healthy++;
      } else {
        console.log(`⚠️ ${service.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: ${error.message}`);
    }
  }

  console.log(`\n📊 HEALTH SUMMARY`);
  console.log(`===============`);
  console.log(`✅ Healthy: ${healthy}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((healthy/total)*100)}%`);
  
  const status = healthy === total ? '🟢 ALL SYSTEMS OPERATIONAL' : 
                 healthy >= total * 0.8 ? '🟡 DEGRADED PERFORMANCE' : 
                 '🔴 SYSTEM OUTAGE';
  
  console.log(`🎯 Status: ${status}`);
  console.log(`🌍 Ubuntu: "We monitor because we succeed together!"`);

  process.exit(healthy === total ? 0 : 1);
}

checkHealth();