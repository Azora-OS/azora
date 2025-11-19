#!/usr/bin/env node

/**
 * Comprehensive Repository Scanner
 * Scans entire repo to identify missing components, broken links, and issues
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveRepoScanner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.issues = [];
    this.missing = [];
    this.broken = [];
    this.stats = {
      services: 0,
      apps: 0,
      configs: 0,
      scripts: 0,
      docs: 0
    };
  }

  async run() {
    console.log('🔍 COMPREHENSIVE REPOSITORY SCAN\n');
    
    try {
      await this.scanProjectStructure();
      await this.scanServices();
      await this.scanApps();
      await this.scanConfigurations();
      await this.scanScripts();
      await this.scanDependencies();
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      process.exit(1);
    }
  }

  async scanProjectStructure() {
    console.log('📁 SCANNING PROJECT STRUCTURE\n');
    
    const requiredDirs = [
      'apps',
      'services', 
      'packages',
      'scripts',
      'docs',
      'infrastructure',
      'monitoring'
    ];
    
    requiredDirs.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      const exists = fs.existsSync(dirPath);
      
      console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
      
      if (!exists) {
        this.missing.push(`Directory: ${dir}`);
      }
    });
    
    // Check critical root files
    const criticalFiles = [
      'package.json',
      '.env',
      '.env.example',
      'docker-compose.yml',
      'README.md',
      'tsconfig.json'
    ];
    
    console.log('\n📄 Critical Files:');
    criticalFiles.forEach(file => {
      const exists = fs.existsSync(path.join(this.projectRoot, file));
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
      
      if (!exists) {
        this.missing.push(`Root file: ${file}`);
      }
    });
  }

  async scanServices() {
    console.log('\n⚙️ SCANNING SERVICES\n');
    
    const servicesDir = path.join(this.projectRoot, 'services');
    if (!fs.existsSync(servicesDir)) {
      this.missing.push('Services directory');
      return;
    }
    
    const services = fs.readdirSync(servicesDir).filter(item => 
      fs.statSync(path.join(servicesDir, item)).isDirectory()
    );
    
    this.stats.services = services.length;
    console.log(`Found ${services.length} services:\n`);
    
    const serviceIssues = [];
    
    services.forEach(service => {
      const servicePath = path.join(servicesDir, service);
      const issues = this.checkServiceStructure(service, servicePath);
      
      const status = issues.length === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${service}`);
      
      if (issues.length > 0) {
        issues.forEach(issue => {
          console.log(`    - ${issue}`);
          serviceIssues.push(`${service}: ${issue}`);
        });
      }
    });
    
    this.issues.push(...serviceIssues);
    
    // Check for missing core services
    const coreServices = [
      'api-gateway',
      'auth-service', 
      'azora-education',
      'azora-finance',
      'azora-marketplace',
      'health-monitor',
      'payment'
    ];
    
    console.log('\n🔧 Core Services Status:');
    coreServices.forEach(service => {
      const exists = services.includes(service);
      console.log(`  ${exists ? '✅' : '❌'} ${service}`);
      
      if (!exists) {
        this.missing.push(`Core service: ${service}`);
      }
    });
  }

  checkServiceStructure(serviceName, servicePath) {
    const issues = [];
    
    // Check required files
    const requiredFiles = [
      'package.json',
      ['index.js', 'server.js', 'app.js'],
      'health.js'
    ];
    
    requiredFiles.forEach(file => {
      if (Array.isArray(file)) {
        // Check if at least one exists
        const hasAny = file.some(f => fs.existsSync(path.join(servicePath, f)));
        if (!hasAny) {
          issues.push(`Missing main file (${file.join(' or ')})`);
        }
      } else {
        if (!fs.existsSync(path.join(servicePath, file))) {
          issues.push(`Missing ${file}`);
        }
      }
    });
    
    // Check package.json content
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts || !packageJson.scripts.start) {
          issues.push('Missing start script in package.json');
        }
        
        if (!packageJson.dependencies) {
          issues.push('No dependencies defined');
        }
        
      } catch (error) {
        issues.push('Invalid package.json format');
      }
    }
    
    return issues;
  }

  async scanApps() {
    console.log('\n🌐 SCANNING FRONTEND APPS\n');
    
    const appsDir = path.join(this.projectRoot, 'apps');
    if (!fs.existsSync(appsDir)) {
      this.missing.push('Apps directory');
      return;
    }
    
    const apps = fs.readdirSync(appsDir).filter(item => 
      fs.statSync(path.join(appsDir, item)).isDirectory()
    );
    
    this.stats.apps = apps.length;
    console.log(`Found ${apps.length} apps:\n`);
    
    const appIssues = [];
    
    apps.forEach(app => {
      const appPath = path.join(appsDir, app);
      const issues = this.checkAppStructure(app, appPath);
      
      const status = issues.length === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${app}`);
      
      if (issues.length > 0) {
        issues.forEach(issue => {
          console.log(`    - ${issue}`);
          appIssues.push(`${app}: ${issue}`);
        });
      }
    });
    
    this.issues.push(...appIssues);
    
    // Check for core apps
    const coreApps = [
      'app',
      'student-portal',
      'azora-enterprise-ui',
      'azora-marketplace-ui',
      'azora-pay-ui'
    ];
    
    console.log('\n📱 Core Apps Status:');
    coreApps.forEach(app => {
      const exists = apps.includes(app);
      console.log(`  ${exists ? '✅' : '❌'} ${app}`);
      
      if (!exists) {
        this.missing.push(`Core app: ${app}`);
      }
    });
  }

  checkAppStructure(appName, appPath) {
    const issues = [];
    
    // Check required files
    const requiredFiles = [
      'package.json',
      'next.config.js',
      '.env.local'
    ];
    
    requiredFiles.forEach(file => {
      if (!fs.existsSync(path.join(appPath, file))) {
        issues.push(`Missing ${file}`);
      }
    });
    
    // Check required directories
    const requiredDirs = [
      ['app', 'pages', 'src'],
      'lib'
    ];
    
    requiredDirs.forEach(dir => {
      if (Array.isArray(dir)) {
        const hasAny = dir.some(d => fs.existsSync(path.join(appPath, d)));
        if (!hasAny) {
          issues.push(`Missing main directory (${dir.join(' or ')})`);
        }
      } else {
        if (!fs.existsSync(path.join(appPath, dir))) {
          issues.push(`Missing ${dir} directory`);
        }
      }
    });
    
    return issues;
  }

  async scanConfigurations() {
    console.log('\n🔧 SCANNING CONFIGURATIONS\n');
    
    const configs = [
      { file: '.env', desc: 'Environment variables' },
      { file: '.env.production', desc: 'Production environment' },
      { file: 'docker-compose.yml', desc: 'Docker development' },
      { file: 'docker-compose.prod.yml', desc: 'Docker production' },
      { file: 'tsconfig.json', desc: 'TypeScript config' },
      { file: 'packages/lib/api-client.ts', desc: 'API client' },
      { file: 'nginx/nginx.conf', desc: 'Nginx config' },
      { file: 'monitoring/prometheus.yml', desc: 'Monitoring config' }
    ];
    
    configs.forEach(config => {
      const exists = fs.existsSync(path.join(this.projectRoot, config.file));
      console.log(`  ${exists ? '✅' : '❌'} ${config.desc} (${config.file})`);
      
      if (!exists) {
        this.missing.push(`Config: ${config.desc}`);
      }
    });
    
    this.stats.configs = configs.filter(c => 
      fs.existsSync(path.join(this.projectRoot, c.file))
    ).length;
  }

  async scanScripts() {
    console.log('\n📜 SCANNING SCRIPTS\n');
    
    const scriptsDir = path.join(this.projectRoot, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      this.missing.push('Scripts directory');
      return;
    }
    
    const requiredScripts = [
      'connect-frontends-backends.js',
      'health-check.js',
      'test-connections.js',
      'start-all.js',
      'full-system-launch.js'
    ];
    
    requiredScripts.forEach(script => {
      const exists = fs.existsSync(path.join(scriptsDir, script));
      console.log(`  ${exists ? '✅' : '❌'} ${script}`);
      
      if (!exists) {
        this.missing.push(`Script: ${script}`);
      }
    });
    
    // Check Windows batch files
    const batchFiles = [
      'start-all.bat',
      'launch-system.bat'
    ];
    
    console.log('\n🪟 Windows Scripts:');
    batchFiles.forEach(batch => {
      const exists = fs.existsSync(path.join(this.projectRoot, batch));
      console.log(`  ${exists ? '✅' : '❌'} ${batch}`);
      
      if (!exists) {
        this.missing.push(`Windows script: ${batch}`);
      }
    });
    
    this.stats.scripts = requiredScripts.filter(s => 
      fs.existsSync(path.join(scriptsDir, s))
    ).length;
  }

  async scanDependencies() {
    console.log('\n📦 SCANNING DEPENDENCIES\n');
    
    // Check root package.json
    const rootPackageJson = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(rootPackageJson)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
        
        console.log('📋 Root Package Info:');
        console.log(`  Name: ${pkg.name || 'Not set'}`);
        console.log(`  Version: ${pkg.version || 'Not set'}`);
        console.log(`  Scripts: ${Object.keys(pkg.scripts || {}).length}`);
        console.log(`  Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
        console.log(`  DevDependencies: ${Object.keys(pkg.devDependencies || {}).length}`);
        
        // Check for required scripts
        const requiredScripts = [
          'start:all',
          'health:check',
          'connections:test'
        ];
        
        console.log('\n📜 Required Scripts:');
        requiredScripts.forEach(script => {
          const exists = pkg.scripts && pkg.scripts[script];
          console.log(`  ${exists ? '✅' : '❌'} ${script}`);
          
          if (!exists) {
            this.missing.push(`Package script: ${script}`);
          }
        });
        
      } catch (error) {
        this.issues.push('Invalid root package.json');
      }
    }
    
    // Check node_modules
    const nodeModules = path.join(this.projectRoot, 'node_modules');
    const hasNodeModules = fs.existsSync(nodeModules);
    console.log(`\n📁 Node Modules: ${hasNodeModules ? '✅ Installed' : '❌ Missing'}`);
    
    if (!hasNodeModules) {
      this.missing.push('Node modules (run npm install)');
    }
  }

  async generateReport() {
    console.log('\n📊 COMPREHENSIVE SCAN REPORT');
    console.log('='.repeat(50));
    
    // Summary stats
    console.log('\n📈 STATISTICS:');
    console.log(`  Services: ${this.stats.services}`);
    console.log(`  Apps: ${this.stats.apps}`);
    console.log(`  Configs: ${this.stats.configs}`);
    console.log(`  Scripts: ${this.stats.scripts}`);
    
    // Issues summary
    const totalIssues = this.missing.length + this.issues.length + this.broken.length;
    console.log(`\n🚨 ISSUES FOUND: ${totalIssues}`);
    
    if (this.missing.length > 0) {
      console.log(`\n❌ MISSING COMPONENTS (${this.missing.length}):`);
      this.missing.forEach(item => console.log(`  - ${item}`));
    }
    
    if (this.issues.length > 0) {
      console.log(`\n⚠️ CONFIGURATION ISSUES (${this.issues.length}):`);
      this.issues.forEach(item => console.log(`  - ${item}`));
    }
    
    if (this.broken.length > 0) {
      console.log(`\n🔴 BROKEN COMPONENTS (${this.broken.length}):`);
      this.broken.forEach(item => console.log(`  - ${item}`));
    }
    
    // Health assessment
    console.log('\n🏥 HEALTH ASSESSMENT:');
    const healthScore = Math.max(0, 100 - (totalIssues * 2));
    
    if (healthScore >= 90) {
      console.log('🟢 EXCELLENT - System is production ready');
    } else if (healthScore >= 70) {
      console.log('🟡 GOOD - Minor issues need attention');
    } else if (healthScore >= 50) {
      console.log('🟠 FAIR - Several issues need fixing');
    } else {
      console.log('🔴 POOR - Major issues require immediate attention');
    }
    
    console.log(`   Health Score: ${healthScore}%`);
    
    // Priority fixes
    console.log('\n🔧 PRIORITY FIXES NEEDED:');
    
    let priority = 1;
    
    if (this.missing.includes('Node modules (run npm install)')) {
      console.log(`  ${priority++}. Install dependencies: npm install`);
    }
    
    if (this.missing.some(item => item.includes('Missing main file'))) {
      console.log(`  ${priority++}. Create missing service entry points`);
    }
    
    if (this.missing.some(item => item.includes('Missing package.json'))) {
      console.log(`  ${priority++}. Generate missing package.json files`);
    }
    
    if (this.missing.some(item => item.includes('Missing .env.local'))) {
      console.log(`  ${priority++}. Create app environment files`);
    }
    
    console.log(`  ${priority++}. Run connection setup: node scripts/connect-frontends-backends.js`);
    console.log(`  ${priority++}. Test system health: node scripts/health-check.js`);
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      healthScore,
      missing: this.missing,
      issues: this.issues,
      broken: this.broken,
      totalIssues
    };
    
    const reportPath = path.join(this.projectRoot, 'repo-scan-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Detailed report saved: repo-scan-report.json`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 REPOSITORY IS READY FOR LAUNCH! 🎉');
    } else {
      console.log(`\n🔧 ${totalIssues} issues found - see priority fixes above`);
    }
  }
}

// Run the scanner
if (require.main === module) {
  const scanner = new ComprehensiveRepoScanner();
  scanner.run().catch(console.error);
}

module.exports = ComprehensiveRepoScanner;