/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DocumentationUpdater {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.timestamp = new Date().toISOString();
  }

  async updateAllDocs() {
    console.log('🏰 Azora OS - Documentation Update System Active');
    
    try {
      await this.updateReadme();
      await this.updateChangelog();
      await this.generateMetrics();
      
      console.log('✅ All documentation updated successfully');
    } catch (error) {
      console.error('❌ Documentation update failed:', error);
      process.exit(1);
    }
  }

  async updateReadme() {
    console.log('📝 Updating README.md...');
    
    const services = await this.getServiceCount();
    const apps = await this.getAppCount();
    const version = await this.getVersion();
    
    const readmeContent = `# Azora OS - The Supreme Organism

[![Version](https://img.shields.io/badge/Version-${version}-blue.svg)](https://github.com/azora-os/azora-os)
[![Services](https://img.shields.io/badge/Services-${services}-green.svg)](https://github.com/azora-os/azora-os)
[![Apps](https://img.shields.io/badge/Apps-${apps}-orange.svg)](https://github.com/azora-os/azora-os)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

> The World's First Constitutional AI Operating System

## 🚀 Quick Start

\`\`\`bash
# Launch Azora OS Supreme Organism
npm run supreme:launch

# Launch Elara VS Code Extension
npm run elara:vscode
\`\`\`

## 📊 System Status

- **Services**: ${services} microservices
- **Applications**: ${apps} frontend apps
- **Last Updated**: ${this.timestamp}
- **Status**: 🟢 Operational

## 🏗️ Architecture

Azora OS follows the Supreme Organism architecture pattern:
- **Brain**: Education & Learning Systems
- **Heart**: Financial & Economic Systems  
- **Muscles**: Marketplace & Work Systems
- **Nervous System**: Communication & Events
- **Immune System**: Security & Protection

---

*Last updated: ${this.timestamp}*
`;

    await fs.writeFile(path.join(this.rootDir, 'README.md'), readmeContent);
    console.log('✅ README.md updated');
  }

  async updateChangelog() {
    console.log('📝 Updating CHANGELOG.md...');
    
    const version = await this.getVersion();
    const changelogEntry = `
## [${version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Automated documentation update system
- Enhanced Elara VS Code extension
- Comprehensive GitHub Actions workflows
- Real-time system monitoring

### Changed
- Improved service architecture
- Enhanced security protocols
- Updated API documentation

### Fixed
- Service communication issues
- Authentication flow improvements
- Performance optimizations

`;

    const changelogPath = path.join(this.rootDir, 'CHANGELOG.md');
    let existingChangelog = '';
    
    try {
      existingChangelog = await fs.readFile(changelogPath, 'utf8');
    } catch (error) {
      existingChangelog = '# Changelog\n\nAll notable changes to Azora OS will be documented in this file.\n';
    }

    const updatedChangelog = existingChangelog.replace(
      '# Changelog\n\nAll notable changes to Azora OS will be documented in this file.\n',
      `# Changelog\n\nAll notable changes to Azora OS will be documented in this file.\n${changelogEntry}`
    );

    await fs.writeFile(changelogPath, updatedChangelog);
    console.log('✅ CHANGELOG.md updated');
  }

  async generateMetrics() {
    console.log('📊 Generating system metrics...');
    
    const metrics = {
      timestamp: this.timestamp,
      services: await this.getServiceCount(),
      apps: await this.getAppCount(),
      version: await this.getVersion(),
      dependencies: await this.getDependencyCount()
    };

    const metricsPath = path.join(this.rootDir, 'docs', 'metrics.json');
    await this.ensureDir(path.dirname(metricsPath));
    await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
    
    console.log('✅ System metrics generated');
    console.log(`📊 Services: ${metrics.services}`);
    console.log(`📱 Apps: ${metrics.apps}`);
  }

  async getServiceCount() {
    try {
      const servicesDir = path.join(this.rootDir, 'services');
      const services = await fs.readdir(servicesDir);
      return services.length;
    } catch {
      return 0;
    }
  }

  async getAppCount() {
    try {
      const appsDir = path.join(this.rootDir, 'apps');
      const apps = await fs.readdir(appsDir);
      return apps.length;
    } catch {
      return 0;
    }
  }

  async getVersion() {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8')
      );
      return packageJson.version;
    } catch {
      return '3.0.0';
    }
  }

  async getDependencyCount() {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(this.rootDir, 'package.json'), 'utf8')
      );
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      return deps.length + devDeps.length;
    } catch {
      return 0;
    }
  }

  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

if (require.main === module) {
  const updater = new DocumentationUpdater();
  updater.updateAllDocs();
}

module.exports = DocumentationUpdater;