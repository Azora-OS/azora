const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all services...');

const services = [
  { name: 'api-gateway', port: 4000 },
  { name: 'auth-service', port: 4001 },
  { name: 'azora-education', port: 4002 },
  { name: 'health-monitor', port: 4005 }
];

services.forEach(service => {
  const servicePath = path.join(__dirname, '..', 'services', service.name);
  if (require('fs').existsSync(servicePath)) {
    console.log(`🚀 Starting ${service.name}...`);
    const proc = spawn('npm', ['start'], { cwd: servicePath, stdio: 'pipe' });
    proc.unref();
  }
});

console.log('✅ Services starting...');
