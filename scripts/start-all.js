import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting all services...');

const services = [
  { name: 'api-gateway', port: 4000 },
  { name: 'auth-service', port: 4001 },
  { name: 'azora-education', port: 4002 },
  { name: 'azora-mint', port: 4003 },
  { name: 'azora-forge', port: 4004 },
  { name: 'azora-studyspaces', port: 4009 },
  { name: 'elara-incubator', port: 4007 },
  { name: 'azora-sapiens', port: 3001 },
  { name: 'health-monitor', port: 4005 }
];

services.forEach(service => {
  const servicePath = path.join(__dirname, '..', 'services', service.name);
  if (fs.existsSync(servicePath)) {
    console.log(`🚀 Starting ${service.name}...`);
    // Using shell: true for windows compatibility
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const proc = spawn(npmCmd, ['start'], {
      cwd: servicePath,
      stdio: 'pipe',
      shell: true,
      detached: true
    });

    proc.unref();
  }
});

console.log('✅ Services starting...');
