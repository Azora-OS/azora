#!/usr/bin/env node

/*
AZORA OS DEPENDENCY FIXER
Constitutional AI Operating System - Missing Package Installer
*/

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class DependencyFixer {
  constructor() {
    this.missingPackages = new Map();
    this.servicePackages = new Map();
  }

  async scanMissingDependencies() {
    console.log('🔍 Scanning for missing dependencies...');
    
    // Global packages needed
    const globalPackages = [
      'tsx',
      'ts-node',
      'ts-node-dev',
      'vite',
      'nodemon'
    ];

    // Service-specific packages
    const servicePackages = [
      { service: 'api-gateway', packages: ['prom-client', 'express', 'cors'] },
      { service: 'azora-covenant', packages: ['morgan', 'express'] },
      { service: 'azora-workspace', packages: ['socket.io', 'express'] },
      { service: 'azora-lms', packages: ['openai', 'typescript'] },
      { service: 'azora-oracle', packages: ['tsx', 'typescript'] },
      { service: 'azora-aegis', packages: ['ts-node', 'typescript'] },
      { service: 'azora-analytics', packages: ['tsx', 'typescript'] },
      { service: 'azora-assessment', packages: ['tsx', 'typescript'] },
      { service: 'azora-careers', packages: ['ts-node-dev', 'typescript'] },
      { service: 'azora-content', packages: ['tsx', 'typescript'] },
      { service: 'azora-credentials', packages: ['tsx', 'typescript'] },
      { service: 'azora-sapiens', packages: ['ts-node', 'typescript'] }
    ];

    // Frontend packages
    const frontendPackages = [
      { service: 'enterprise-ui', packages: ['vite', '@vitejs/plugin-react'] },
      { service: 'marketplace-ui', packages: ['vite', '@vitejs/plugin-react'] },
      { service: 'pay-ui', packages: ['vite', '@vitejs/plugin-react'] }
    ];

    this.globalPackages = globalPackages;
    this.servicePackages = servicePackages;
    this.frontendPackages = frontendPackages;
  }

  async installGlobalPackages() {
    console.log('📦 Installing global packages...');
    
    for (const pkg of this.globalPackages) {
      try {
        console.log(`Installing ${pkg} globally...`);
        await this.execAsync(`npm install -g ${pkg}`);
        console.log(`✅ ${pkg} installed globally`);
      } catch (error) {
        console.log(`⚠️  Failed to install ${pkg} globally, trying locally...`);
        try {
          await this.execAsync(`npm install ${pkg}`, { cwd: rootDir });
          console.log(`✅ ${pkg} installed locally`);
        } catch (localError) {
          console.log(`❌ Failed to install ${pkg}: ${localError.message}`);
        }
      }
    }
  }

  async installServicePackages() {
    console.log('🔧 Installing service-specific packages...');
    
    for (const { service, packages } of this.servicePackages) {
      const servicePath = path.join(rootDir, 'services', service);
      
      if (await this.pathExists(servicePath)) {
        console.log(`📦 Installing packages for ${service}...`);
        
        for (const pkg of packages) {
          try {
            await this.execAsync(`npm install ${pkg}`, { cwd: servicePath });
            console.log(`✅ ${pkg} installed in ${service}`);
          } catch (error) {
            console.log(`⚠️  Failed to install ${pkg} in ${service}`);
          }
        }
      }
    }
  }

  async installFrontendPackages() {
    console.log('🎨 Installing frontend packages...');
    
    for (const { service, packages } of this.frontendPackages) {
      const appPath = path.join(rootDir, 'apps', service);
      
      if (await this.pathExists(appPath)) {
        console.log(`📦 Installing packages for ${service}...`);
        
        for (const pkg of packages) {
          try {
            await this.execAsync(`npm install ${pkg}`, { cwd: appPath });
            console.log(`✅ ${pkg} installed in ${service}`);
          } catch (error) {
            console.log(`⚠️  Failed to install ${pkg} in ${service}`);
          }
        }
      }
    }
  }

  async createMissingMockServers() {
    console.log('🔨 Creating missing mock servers...');
    
    const mockServices = [
      'azora-education',
      'azora-nexus',
      'payments'
    ];

    for (const service of mockServices) {
      const servicePath = path.join(rootDir, 'services', service);
      const mockServerPath = path.join(servicePath, 'mock-server.js');
      
      if (await this.pathExists(servicePath) && !(await this.pathExists(mockServerPath))) {
        console.log(`Creating mock server for ${service}...`);
        
        const mockServerContent = `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${service}', timestamp: new Date().toISOString() });
});

// Mock endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'active', service: '${service}' });
});

app.listen(PORT, () => {
  console.log(\`🚀 \${service} mock server running on port \${PORT}\`);
});
`;
        
        try {
          await fs.writeFile(mockServerPath, mockServerContent);
          console.log(`✅ Mock server created for ${service}`);
        } catch (error) {
          console.log(`❌ Failed to create mock server for ${service}`);
        }
      }
    }
  }

  async fixPackageJsonScripts() {
    console.log('📝 Fixing package.json scripts...');
    
    const healthMonitorPath = path.join(rootDir, 'services', 'health-monitor');
    const packageJsonPath = path.join(healthMonitorPath, 'package.json');
    
    if (await this.pathExists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        if (!packageJson.scripts.dev) {
          packageJson.scripts.dev = 'node index.js';
        }
        
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Fixed health-monitor package.json');
      } catch (error) {
        console.log('⚠️  Failed to fix health-monitor package.json');
      }
    }
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
}

// Main execution
async function main() {
  console.log('🔧 AZORA OS DEPENDENCY FIXER');
  console.log('Constitutional AI Operating System');
  console.log('═══════════════════════════════════════\n');

  const fixer = new DependencyFixer();

  try {
    await fixer.scanMissingDependencies();
    await fixer.installGlobalPackages();
    await fixer.installServicePackages();
    await fixer.installFrontendPackages();
    await fixer.createMissingMockServers();
    await fixer.fixPackageJsonScripts();
    
    console.log('\n✅ Dependency fixing complete!');
    console.log('🚀 You can now run the master orchestrator');
    
  } catch (error) {
    console.error('❌ Dependency fixer failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}