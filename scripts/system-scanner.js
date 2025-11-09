#!/usr/bin/env node

/*
AZORA OS SYSTEM SCANNER
Full Repository Analysis and Service Discovery
*/

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class SystemScanner {
  constructor() {
    this.services = [];
    this.frontends = [];
    this.databases = [];
    this.configs = [];
    this.ports = new Set();
  }

  async scanDirectory(dir, depth = 0) {
    if (depth > 3) return; // Limit recursion depth
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
          const fullPath = path.join(dir, item.name);
          await this.analyzeDirectory(fullPath, item.name);
          await this.scanDirectory(fullPath, depth + 1);
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  async analyzeDirectory(dirPath, dirName) {
    const packageJsonPath = path.join(dirPath, 'package.json');
    const dockerfilePath = path.join(dirPath, 'Dockerfile');
    const prismaSchemaPaths = [
      path.join(dirPath, 'prisma', 'schema.prisma'),
      path.join(dirPath, 'schema.prisma')
    ];

    // Check for package.json (Node.js service/app)
    if (await this.fileExists(packageJsonPath)) {
      const packageData = await this.readPackageJson(packageJsonPath);
      const relativePath = path.relative(rootDir, dirPath);
      
      const serviceInfo = {
        name: dirName,
        path: relativePath,
        type: this.determineType(relativePath, packageData),
        port: this.extractPort(packageData, dirPath),
        hasDocker: await this.fileExists(dockerfilePath),
        scripts: packageData.scripts || {},
        dependencies: Object.keys(packageData.dependencies || {}),
        devDependencies: Object.keys(packageData.devDependencies || {}),
        description: packageData.description || ''
      };

      if (serviceInfo.type === 'service') {
        this.services.push(serviceInfo);
      } else if (serviceInfo.type === 'frontend') {
        this.frontends.push(serviceInfo);
      }

      if (serviceInfo.port) {
        this.ports.add(serviceInfo.port);
      }
    }

    // Check for Prisma schemas
    for (const schemaPath of prismaSchemaPaths) {
      if (await this.fileExists(schemaPath)) {
        this.databases.push({
          name: dirName,
          path: path.relative(rootDir, schemaPath),
          type: 'prisma'
        });
        break;
      }
    }

    // Check for config files
    const configFiles = ['docker-compose.yml', '.env.example', 'tsconfig.json', 'hardhat.config.js'];
    for (const configFile of configFiles) {
      if (await this.fileExists(path.join(dirPath, configFile))) {
        this.configs.push({
          name: dirName,
          file: configFile,
          path: path.relative(rootDir, path.join(dirPath, configFile))
        });
      }
    }
  }

  determineType(relativePath, packageData) {
    if (relativePath.startsWith('apps/') || relativePath.includes('-ui')) {
      return 'frontend';
    }
    if (relativePath.startsWith('services/')) {
      return 'service';
    }
    if (packageData.dependencies && (
      packageData.dependencies.react || 
      packageData.dependencies.next || 
      packageData.dependencies.vite
    )) {
      return 'frontend';
    }
    if (packageData.dependencies && (
      packageData.dependencies.express || 
      packageData.dependencies.fastify ||
      packageData.dependencies['@prisma/client']
    )) {
      return 'service';
    }
    return 'unknown';
  }

  extractPort(packageData, dirPath) {
    // Check scripts for port numbers
    if (packageData.scripts) {
      for (const script of Object.values(packageData.scripts)) {
        const portMatch = script.match(/(?:port|PORT)[\s=:]+(\d+)/);
        if (portMatch) {
          return parseInt(portMatch[1]);
        }
      }
    }

    // Check for common port patterns in directory name
    const dirName = path.basename(dirPath);
    const portMappings = {
      'api-gateway': 4000,
      'auth-service': 4001,
      'azora-mint': 4002,
      'azora-forge': 4003,
      'azora-nexus': 4004,
      'azora-oracle': 3005,
      'azora-education': 4006,
      'azora-lms': 4007,
      'azora-aegis': 4008,
      'azora-covenant': 4009,
      'payments': 4010,
      'main-app': 3000,
      'app': 3000,
      'enterprise-ui': 3001,
      'marketplace-ui': 3002,
      'pay-ui': 3003,
      'student-portal': 3004
    };

    return portMappings[dirName] || null;
  }

  async readPackageJson(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  generateLaunchScript() {
    const coreServices = this.services.filter(s => 
      ['api-gateway', 'auth-service', 'azora-mint', 'azora-oracle'].includes(s.name)
    );
    
    const otherServices = this.services.filter(s => 
      !['api-gateway', 'auth-service', 'azora-mint', 'azora-oracle'].includes(s.name)
    );

    let script = '#!/bin/bash\n\n';
    script += '# Azora OS Launch Script - Generated by System Scanner\n\n';
    
    script += '# Core Services (Launch First)\n';
    coreServices.forEach(service => {
      const cmd = this.getStartCommand(service);
      script += `echo "🚀 Starting ${service.name}..."\n`;
      script += `cd ${service.path} && ${cmd} &\n`;
      script += 'sleep 2\n\n';
    });

    script += '# Other Services\n';
    otherServices.forEach(service => {
      const cmd = this.getStartCommand(service);
      script += `echo "🔧 Starting ${service.name}..."\n`;
      script += `cd ${service.path} && ${cmd} &\n`;
      script += 'sleep 1\n\n';
    });

    script += '# Frontend Applications\n';
    this.frontends.forEach(app => {
      const cmd = this.getStartCommand(app);
      script += `echo "🎨 Starting ${app.name}..."\n`;
      script += `cd ${app.path} && ${cmd} &\n`;
      script += 'sleep 1\n\n';
    });

    script += 'echo "✅ All services launched!"\n';
    script += 'wait\n';

    return script;
  }

  getStartCommand(service) {
    if (service.scripts.dev) return 'npm run dev';
    if (service.scripts.start) return 'npm start';
    if (await this.fileExists(path.join(rootDir, service.path, 'mock-server.js'))) {
      return 'node mock-server.js';
    }
    return 'npm run dev';
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: this.services.length,
        totalFrontends: this.frontends.length,
        totalDatabases: this.databases.length,
        totalConfigs: this.configs.length,
        portsUsed: Array.from(this.ports).sort((a, b) => a - b)
      },
      services: this.services.sort((a, b) => a.name.localeCompare(b.name)),
      frontends: this.frontends.sort((a, b) => a.name.localeCompare(b.name)),
      databases: this.databases,
      configs: this.configs,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Port conflicts
    const portCounts = {};
    this.services.concat(this.frontends).forEach(item => {
      if (item.port) {
        portCounts[item.port] = (portCounts[item.port] || 0) + 1;
      }
    });

    Object.entries(portCounts).forEach(([port, count]) => {
      if (count > 1) {
        recommendations.push({
          type: 'warning',
          message: `Port ${port} is used by ${count} services - potential conflict`
        });
      }
    });

    // Missing Docker files
    const servicesWithoutDocker = this.services.filter(s => !s.hasDocker);
    if (servicesWithoutDocker.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${servicesWithoutDocker.length} services missing Dockerfile for containerization`
      });
    }

    // Services without proper start scripts
    const servicesWithoutStart = this.services.filter(s => 
      !s.scripts.dev && !s.scripts.start
    );
    if (servicesWithoutStart.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `${servicesWithoutStart.length} services missing start scripts`
      });
    }

    return recommendations;
  }

  async run() {
    console.log('🔍 AZORA OS SYSTEM SCANNER');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 Scanning repository structure...');
    await this.scanDirectory(rootDir);
    
    const report = this.generateReport();
    
    console.log('\n📋 SCAN RESULTS:');
    console.log(`   Services: ${report.summary.totalServices}`);
    console.log(`   Frontends: ${report.summary.totalFrontends}`);
    console.log(`   Databases: ${report.summary.totalDatabases}`);
    console.log(`   Configs: ${report.summary.totalConfigs}`);
    console.log(`   Ports Used: ${report.summary.portsUsed.join(', ')}`);

    console.log('\n🔧 CORE SERVICES:');
    const coreServices = ['api-gateway', 'auth-service', 'azora-mint', 'azora-oracle'];
    this.services.filter(s => coreServices.includes(s.name)).forEach(service => {
      console.log(`   ✅ ${service.name.padEnd(20)} → Port ${service.port || 'N/A'}`);
    });

    console.log('\n🎨 FRONTEND APPLICATIONS:');
    this.frontends.forEach(app => {
      console.log(`   🌐 ${app.name.padEnd(20)} → Port ${app.port || 'N/A'}`);
    });

    console.log('\n⚠️  RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      const icon = rec.type === 'warning' ? '⚠️ ' : 'ℹ️ ';
      console.log(`   ${icon} ${rec.message}`);
    });

    // Save detailed report
    const reportPath = path.join(rootDir, 'SYSTEM-SCAN-REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    // Generate launch script
    const launchScript = this.generateLaunchScript();
    const scriptPath = path.join(rootDir, 'scripts', 'launch-all.sh');
    await fs.writeFile(scriptPath, launchScript);
    console.log(`🚀 Launch script generated: ${scriptPath}`);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ System scan complete!');
  }
}

const scanner = new SystemScanner();
scanner.run().catch(console.error);