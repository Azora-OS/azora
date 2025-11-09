#!/usr/bin/env node

/*
AZORA OS MASTER ORCHESTRATOR
Supreme Launch System - Constitutional AI Operating System
*/

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class AzoraOrchestrator {
  constructor() {
    this.services = new Map();
    this.frontends = new Map();
    this.processes = [];
    this.isShuttingDown = false;
  }

  async scanServices() {
    console.log('🔍 Scanning Azora OS ecosystem...');

    const servicesDir = path.join(rootDir, 'services');
    const appsDir = path.join(rootDir, 'apps');

    // Core Services Discovery
    const coreServices = [
      { name: 'api-gateway', port: 4000, path: 'services/api-gateway', cmd: 'npm run dev' },
      { name: 'auth-service', port: 4001, path: 'services/auth-service', cmd: 'npm run dev' },
      { name: 'azora-mint', port: 4002, path: 'services/azora-mint', cmd: 'node mock-server.js' },
      { name: 'azora-forge', port: 4003, path: 'services/azora-forge', cmd: 'node mock-server.js' },
      { name: 'azora-nexus', port: 4004, path: 'services/azora-nexus', cmd: 'node mock-server.js' },
      { name: 'azora-oracle', port: 4005, path: 'services/azora-oracle', cmd: 'npm run dev' },
      { name: 'azora-education', port: 4006, path: 'services/azora-education', cmd: 'node mock-server.js' },
      { name: 'azora-lms', port: 4007, path: 'services/azora-lms', cmd: 'npm run dev' },
      { name: 'azora-aegis', port: 4008, path: 'services/azora-aegis', cmd: 'npm run dev' },
      { name: 'azora-covenant', port: 4009, path: 'services/azora-covenant', cmd: 'npm run dev' },
      { name: 'payments', port: 4010, path: 'services/payments', cmd: 'node mock-server.js' }
    ];

    // Frontend Applications Discovery
    const frontendApps = [
      { name: 'main-app', port: 3000, path: 'apps/app', cmd: 'npm run dev' },
      { name: 'enterprise-ui', port: 3001, path: 'apps/enterprise-ui', cmd: 'npm run dev' },
      { name: 'marketplace-ui', port: 3002, path: 'apps/marketplace-ui', cmd: 'npm run dev' },
      { name: 'pay-ui', port: 3003, path: 'apps/pay-ui', cmd: 'npm run dev' },
      { name: 'student-portal', port: 3006, path: 'apps/student-portal', cmd: 'npm run dev' }
    ];

    // Advanced Services Discovery
    const advancedServices = [
      { name: 'azora-analytics', port: 4011, path: 'services/azora-analytics', cmd: 'npm run dev' },
      { name: 'azora-assessment', port: 4012, path: 'services/azora-assessment', cmd: 'npm run dev' },
      { name: 'azora-careers', port: 4013, path: 'services/azora-careers', cmd: 'npm run dev' },
      { name: 'azora-content', port: 4014, path: 'services/azora-content', cmd: 'npm run dev' },
      { name: 'azora-credentials', port: 4015, path: 'services/azora-credentials', cmd: 'npm run dev' },
      { name: 'azora-workspace', port: 4016, path: 'services/azora-workspace', cmd: 'npm run dev' },
      { name: 'azora-sapiens', port: 4017, path: 'services/azora-sapiens', cmd: 'npm run dev' },
      { name: 'health-monitor', port: 4018, path: 'services/health-monitor', cmd: 'node index.js' }
    ];

    coreServices.forEach(service => this.services.set(service.name, service));
    frontendApps.forEach(app => this.frontends.set(app.name, app));
    advancedServices.forEach(service => this.services.set(service.name, service));

    console.log(`✅ Discovered ${this.services.size} services and ${this.frontends.size} frontend apps`);
  }

  async checkDependencies() {
    console.log('🔧 Checking dependencies...');

    const checkCommands = [
      'node --version',
      'npm --version',
      'docker --version'
    ];

    for (const cmd of checkCommands) {
      try {
        await this.execAsync(cmd);
        console.log(`✅ ${cmd.split(' ')[0]} available`);
      } catch (error) {
        console.log(`❌ ${cmd.split(' ')[0]} not available`);
      }
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');

    // Root dependencies
    await this.execAsync('npm install', { cwd: rootDir });

    // Service dependencies
    for (const [name, service] of this.services) {
      const servicePath = path.join(rootDir, service.path);
      if (await this.pathExists(path.join(servicePath, 'package.json'))) {
        console.log(`📦 Installing ${name} dependencies...`);
        try {
          await this.execAsync('npm install', { cwd: servicePath });
        } catch (error) {
          console.log(`⚠️  ${name} dependency installation failed`);
        }
      }
    }

    // Frontend dependencies
    for (const [name, app] of this.frontends) {
      const appPath = path.join(rootDir, app.path);
      if (await this.pathExists(path.join(appPath, 'package.json'))) {
        console.log(`📦 Installing ${name} dependencies...`);
        try {
          await this.execAsync('npm install', { cwd: appPath });
        } catch (error) {
          console.log(`⚠️  ${name} dependency installation failed`);
        }
      }
    }
  }

  async launchServices() {
    console.log('🚀 Launching Azora OS services...');

    // Launch core services first
    const coreOrder = ['api-gateway', 'auth-service', 'azora-mint', 'azora-oracle'];

    for (const serviceName of coreOrder) {
      if (this.services.has(serviceName)) {
        await this.launchService(serviceName, this.services.get(serviceName));
        await this.delay(2000); // 2 second delay between core services
      }
    }

    // Launch remaining services
    for (const [name, service] of this.services) {
      if (!coreOrder.includes(name)) {
        await this.launchService(name, service);
        await this.delay(1000); // 1 second delay
      }
    }
  }

  async launchFrontends() {
    console.log('🎨 Launching frontend applications...');

    for (const [name, app] of this.frontends) {
      await this.launchFrontend(name, app);
      await this.delay(1500); // 1.5 second delay between frontends
    }
  }

  async launchService(name, service) {
    const servicePath = path.join(rootDir, service.path);

    if (!(await this.pathExists(servicePath))) {
      console.log(`⚠️  Service ${name} path not found: ${servicePath}`);
      return;
    }

    console.log(`🔥 Starting ${name} on port ${service.port}...`);

    const [command, ...args] = service.cmd.split(' ');
    const process = spawn(command, args, {
      cwd: servicePath,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.log(`[${name}] ERROR: ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.log(`❌ ${name} exited with code ${code}`);
      }
    });

    this.processes.push({ name, process, port: service.port });
  }

  async launchFrontend(name, app) {
    const appPath = path.join(rootDir, app.path);

    if (!(await this.pathExists(appPath))) {
      console.log(`⚠️  Frontend ${name} path not found: ${appPath}`);
      return;
    }

    console.log(`🎨 Starting ${name} on port ${app.port}...`);

    const [command, ...args] = app.cmd.split(' ');
    const process = spawn(command, args, {
      cwd: appPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.log(`[${name}] ERROR: ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.log(`❌ ${name} exited with code ${code}`);
      }
    });

    this.processes.push({ name, process, port: app.port });
  }

  async healthCheck() {
    console.log('🏥 Performing health checks...');

    const healthChecks = [
      { name: 'API Gateway', url: 'http://localhost:4000/health' },
      { name: 'Auth Service', url: 'http://localhost:4001/health' },
      { name: 'Azora Oracle', url: 'http://localhost:4005/health' },
      { name: 'Main App', url: 'http://localhost:3000' }
    ];

    for (const check of healthChecks) {
      try {
        const response = await fetch(check.url);
        if (response.ok) {
          console.log(`✅ ${check.name} is healthy`);
        } else {
          console.log(`⚠️  ${check.name} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${check.name} is not responding`);
      }
    }
  }

  async showStatus() {
    console.log('\n🌟 AZORA OS STATUS DASHBOARD 🌟');
    console.log('═══════════════════════════════════════');

    console.log('\n🔧 CORE SERVICES:');
    const coreServices = ['api-gateway', 'auth-service', 'azora-mint', 'azora-oracle'];
    coreServices.forEach(name => {
      const service = this.services.get(name);
      if (service) {
        console.log(`  ✅ ${name.padEnd(20)} → http://localhost:${service.port}`);
      }
    });

    console.log('\n🎨 FRONTEND APPLICATIONS:');
    for (const [name, app] of this.frontends) {
      console.log(`  🌐 ${name.padEnd(20)} → http://localhost:${app.port}`);
    }

    console.log('\n⚙️  ADVANCED SERVICES:');
    for (const [name, service] of this.services) {
      if (!coreServices.includes(name)) {
        console.log(`  🔹 ${name.padEnd(20)} → http://localhost:${service.port}`);
      }
    }

    console.log('\n🚀 QUICK ACCESS:');
    console.log('  🌐 Main Dashboard    → http://localhost:3000');
    console.log('  💼 Enterprise UI     → http://localhost:3001');
    console.log('  🛒 Marketplace       → http://localhost:3002');
    console.log('  💰 Pay Dashboard     → http://localhost:3003');
    console.log('  🎓 Student Portal    → http://localhost:3004');
    console.log('  👻 Chamber of Ghosts → http://localhost:3005');
    console.log('  🚪 API Gateway       → http://localhost:4000');

    console.log('\n═══════════════════════════════════════');
    console.log('🌟 Azora OS - Constitutional AI Operating System');
    console.log('   "Ngiyakwazi ngoba sikwazi" - "I can because we can"');
    console.log('═══════════════════════════════════════');
    console.log('\n🔄 Orchestrator running... Press Ctrl+C to shutdown');
  }

  async shutdown() {
    console.log('\n🛑 Shutting down Azora OS...');
    this.isShuttingDown = true;

    for (const proc of this.processes) {
      console.log(`🔥 Stopping ${proc.name}...`);
      proc.process.kill('SIGTERM');
    }

    setTimeout(() => {
      console.log('✅ Azora OS shutdown complete');
      process.exit(0);
    }, 2000);
  }

  async execAsync(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log('🌟 AZORA OS MASTER ORCHESTRATOR 🌟');
  console.log('Constitutional AI Operating System');
  console.log('═══════════════════════════════════════\n');

  const orchestrator = new AzoraOrchestrator();

  // Setup graceful shutdown
  process.on('SIGINT', () => orchestrator.shutdown());
  process.on('SIGTERM', () => orchestrator.shutdown());

  try {
    await orchestrator.scanServices();
    await orchestrator.checkDependencies();

    const args = process.argv.slice(2);

    if (args.includes('--install-deps')) {
      await orchestrator.installDependencies();
    }

    if (args.includes('--services-only')) {
      await orchestrator.launchServices();
    } else if (args.includes('--frontends-only')) {
      await orchestrator.launchFrontends();
    } else {
      if (!args.includes('--no-install')) {
        await orchestrator.installDependencies();
      }
      await orchestrator.launchServices();
      await orchestrator.delay(5000); // Wait for services to stabilize
      await orchestrator.launchFrontends();
    }

    await orchestrator.delay(10000); // Wait for everything to start
    await orchestrator.healthCheck();
    await orchestrator.showStatus();

    // Keep running
    setInterval(() => {}, 1000);

  } catch (error) {
    console.error('❌ Orchestrator failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} else {
  // Normalize paths for cross-platform compatibility
  const normalizedMetaUrl = decodeURI(import.meta.url);
  const normalizedArgv = `file://${process.argv[1]}`;

  if (normalizedMetaUrl === normalizedArgv) {
    main();
  } else {
    // Force main() call for Windows compatibility
    main();
  }
}