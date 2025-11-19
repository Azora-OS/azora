import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const services = [
  'api-gateway',
  'auth-service', 
  'azora-education',
  'azora-finance',
  'health-monitor'
];

const apps = [
  'student-portal',
  'azora-enterprise-ui',
  'azora-marketplace-ui', 
  'azora-pay-ui',
  'master-ui'
];

console.log('🔧 Setting up service dependencies...\n');

// Install dependencies for services
services.forEach(service => {
  const servicePath = path.join(process.cwd(), 'services', service);
  if (fs.existsSync(path.join(servicePath, 'package.json'))) {
    console.log(`Installing dependencies for ${service}...`);
    try {
      execSync('npm install', { cwd: servicePath, stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to install dependencies for ${service}`);
    }
  }
});

// Install dependencies for apps
apps.forEach(app => {
  const appPath = path.join(process.cwd(), 'apps', app);
  if (fs.existsSync(path.join(appPath, 'package.json'))) {
    console.log(`Installing dependencies for ${app}...`);
    try {
      execSync('npm install', { cwd: appPath, stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to install dependencies for ${app}`);
    }
  }
});

console.log('\n✅ Setup complete!');