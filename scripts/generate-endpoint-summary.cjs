#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

function countEndpoints(servicePath) {
  const routesPath = path.join(servicePath, 'routes.js');
  if (!fs.existsSync(routesPath)) {
    return 0;
  }
  
  const content = fs.readFileSync(routesPath, 'utf8');
  const matches = content.match(/router\.(get|post|put|patch|delete)\(/g);
  return matches ? matches.length : 0;
}

function main() {
  console.log('📊 Endpoint Implementation Summary\n');
  
  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => fs.statSync(path.join(SERVICES_DIR, name)).isDirectory());
  
  let totalEndpoints = 0;
  const implemented = [];
  
  services.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const count = countEndpoints(servicePath);
    
    if (count > 0) {
      implemented.push({ name: serviceName, count });
      totalEndpoints += count;
    }
  });
  
  implemented.sort((a, b) => b.count - a.count);
  
  console.log('Services with Real Endpoints:\n');
  implemented.forEach(({ name, count }) => {
    console.log(`  ${name.padEnd(40)} ${count} endpoints`);
  });
  
  console.log(`\n✅ Total Services: ${implemented.length}`);
  console.log(`✅ Total Endpoints: ${totalEndpoints}`);
  console.log(`\n📈 Progress: ${totalEndpoints} real endpoints implemented`);
}

main();
