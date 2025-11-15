#!/usr/bin/env node

/**
 * Production-Grade Repository Cleanup Script
 * Azora OS - Constitutional AI Operating System
 * 
 * This script organizes the repository for production readiness by:
 * 1. Archiving non-essential files
 * 2. Consolidating configurations
 * 3. Organizing services
 * 4. Cleaning documentation
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARCHIVE = path.join(ROOT, '.archive');

// Core production services to keep
const CORE_SERVICES = [
  'api-gateway',
  'auth-service',
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-sapiens',
  'ai-family-service',
  'health-monitor'
];

// Core production apps to keep
const CORE_APPS = [
  'student-portal',
  'enterprise-ui',
  'marketplace-ui',
  'pay-ui'
];

// Files to keep in root
const ROOT_KEEP_FILES = [
  'package.json',
  'package-lock.json',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  '.gitignore',
  '.env.example',
  'docker-compose.yml',
  'docker-compose.prod.yml',
  'tsconfig.json',
  'jest.config.js',
  'next.config.js',
  'tailwind.config.ts',
  'turbo.json',
  'vercel.json',
  'PRODUCTION-CLEANUP-PLAN.md'
];

// Patterns to archive
const ARCHIVE_PATTERNS = {
  reports: /^(AGENT-|.*-STATUS|.*-REPORT|.*-COMPLETE|.*-SUMMARY|SPRINT-|IMPLEMENTATION-|INTEGRATION-|DEPLOYMENT-|DATABASE-|FRONTEND-|BACKEND-|PAYMENT-|SECURITY-|MONITORING-|SERVICES-|MISSING-|REALITY-|HONEST-|QUICK-|FINAL-|MILESTONE-|BREAKTHROUGH-|COMPREHENSIVE-|DEEP-|CRITICAL-|IMMEDIATE-|ACTION-|STRATEGIC-|TEAM-|ANALYST-|SENIOR-|CODEBASE-|REPO-|RESTORATION-|WALLET-|BLOCKCHAIN-|AZLLAMA-|AI-|AUTH_|CORE_|FINANCIAL_|MARKETPLACE_|MULTI_|PERSISTENT-|PRODUCTION_|SECURITY_|DEMO-|TESTING-|START-HERE|TODO|STATUS|SUMMARY|ACKNOWLEDGMENTS|AZORA-IDENTITY|CONSTITUTIONAL-|QUALITY-|SCHEMA-|EXTENSION-|FIX-|MOBILE-|MASSIVE-|MASTER-|PUSH-TO-|AZORA-FORGE-|AZORA-MINT-|AZORA-SAPIENS-).*\.md$/i,
  scripts: /^(deploy-|start-|stop-|launch-|test-|check-|cleanup|restore-|health-|quick-).*\.(sh|bat|ps1)$/i,
  configs: /^(\.env\.|docker-compose\.|tsconfig\..*|jest\..*|next\..*|components\.json|db\.json|vercel\.json)$/i
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${path.relative(ROOT, dir)}`);
  }
}

function moveFile(src, dest) {
  try {
    ensureDir(path.dirname(dest));
    fs.renameSync(src, dest);
    console.log(`📦 Moved: ${path.basename(src)} → ${path.relative(ROOT, dest)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error moving ${src}:`, error.message);
    return false;
  }
}

function archiveRootFiles() {
  console.log('\n📋 Phase 1: Archiving Root Files\n');
  
  const reportsDir = path.join(ARCHIVE, 'reports');
  const scriptsDir = path.join(ARCHIVE, 'scripts');
  const configsDir = path.join(ARCHIVE, 'configs');
  
  ensureDir(reportsDir);
  ensureDir(scriptsDir);
  ensureDir(configsDir);
  
  const rootFiles = fs.readdirSync(ROOT);
  let moved = 0;
  
  rootFiles.forEach(file => {
    const filePath = path.join(ROOT, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && !ROOT_KEEP_FILES.includes(file)) {
      // Archive reports
      if (ARCHIVE_PATTERNS.reports.test(file)) {
        moveFile(filePath, path.join(reportsDir, file));
        moved++;
      }
      // Archive old scripts
      else if (ARCHIVE_PATTERNS.scripts.test(file)) {
        moveFile(filePath, path.join(scriptsDir, file));
        moved++;
      }
      // Archive duplicate configs
      else if (file.startsWith('.env.') && file !== '.env.example') {
        moveFile(filePath, path.join(configsDir, file));
        moved++;
      }
    }
  });
  
  console.log(`\n✅ Phase 1 Complete: ${moved} files archived\n`);
}

function archiveServices() {
  console.log('\n🔧 Phase 2: Organizing Services\n');
  
  const servicesDir = path.join(ROOT, 'services');
  const archiveServicesDir = path.join(ARCHIVE, 'services');
  
  if (!fs.existsSync(servicesDir)) {
    console.log('⚠️  No services directory found');
    return;
  }
  
  ensureDir(archiveServicesDir);
  
  const services = fs.readdirSync(servicesDir);
  let kept = 0;
  let archived = 0;
  
  services.forEach(service => {
    const servicePath = path.join(servicesDir, service);
    const stat = fs.statSync(servicePath);
    
    if (stat.isDirectory()) {
      if (CORE_SERVICES.includes(service)) {
        console.log(`✅ Keeping core service: ${service}`);
        kept++;
      } else {
        // Check if service has package.json (indicates it's real)
        const hasPackageJson = fs.existsSync(path.join(servicePath, 'package.json'));
        const hasCode = fs.existsSync(path.join(servicePath, 'src')) || 
                       fs.existsSync(path.join(servicePath, 'index.js')) ||
                       fs.existsSync(path.join(servicePath, 'index.ts'));
        
        if (!hasPackageJson || !hasCode) {
          moveFile(servicePath, path.join(archiveServicesDir, service));
          archived++;
        } else {
          console.log(`⚠️  Non-core service with code: ${service} (manual review needed)`);
        }
      }
    }
  });
  
  console.log(`\n✅ Phase 2 Complete: ${kept} core services kept, ${archived} archived\n`);
}

function archiveApps() {
  console.log('\n🎨 Phase 3: Organizing Apps\n');
  
  const appsDir = path.join(ROOT, 'apps');
  const archiveAppsDir = path.join(ARCHIVE, 'apps');
  
  if (!fs.existsSync(appsDir)) {
    console.log('⚠️  No apps directory found');
    return;
  }
  
  ensureDir(archiveAppsDir);
  
  const apps = fs.readdirSync(appsDir);
  let kept = 0;
  let archived = 0;
  
  apps.forEach(app => {
    const appPath = path.join(appsDir, app);
    const stat = fs.statSync(appPath);
    
    if (stat.isDirectory()) {
      if (CORE_APPS.includes(app)) {
        console.log(`✅ Keeping core app: ${app}`);
        kept++;
      } else {
        const hasPackageJson = fs.existsSync(path.join(appPath, 'package.json'));
        const hasCode = fs.existsSync(path.join(appPath, 'src')) || 
                       fs.existsSync(path.join(appPath, 'pages')) ||
                       fs.existsSync(path.join(appPath, 'app'));
        
        if (!hasPackageJson || !hasCode) {
          moveFile(appPath, path.join(archiveAppsDir, app));
          archived++;
        } else {
          console.log(`⚠️  Non-core app with code: ${app} (manual review needed)`);
        }
      }
    }
  });
  
  console.log(`\n✅ Phase 3 Complete: ${kept} core apps kept, ${archived} archived\n`);
}

function organizeDocs() {
  console.log('\n📚 Phase 4: Organizing Documentation\n');
  
  const docsDir = path.join(ROOT, 'docs');
  const archiveDocsDir = path.join(ARCHIVE, 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.log('⚠️  No docs directory found');
    return;
  }
  
  ensureDir(archiveDocsDir);
  
  // Move status reports from docs to archive
  const statusReportsDir = path.join(docsDir, 'status-reports');
  if (fs.existsSync(statusReportsDir)) {
    moveFile(statusReportsDir, path.join(archiveDocsDir, 'status-reports'));
  }
  
  const businessReportsDir = path.join(docsDir, 'business-reports');
  if (fs.existsSync(businessReportsDir)) {
    moveFile(businessReportsDir, path.join(archiveDocsDir, 'business-reports'));
  }
  
  console.log('\n✅ Phase 4 Complete: Documentation organized\n');
}

function generateReport() {
  console.log('\n📊 Generating Cleanup Report\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    rootFiles: fs.readdirSync(ROOT).filter(f => {
      const stat = fs.statSync(path.join(ROOT, f));
      return stat.isFile();
    }).length,
    services: fs.existsSync(path.join(ROOT, 'services')) 
      ? fs.readdirSync(path.join(ROOT, 'services')).length 
      : 0,
    apps: fs.existsSync(path.join(ROOT, 'apps'))
      ? fs.readdirSync(path.join(ROOT, 'apps')).length
      : 0,
    archived: {
      reports: fs.existsSync(path.join(ARCHIVE, 'reports'))
        ? fs.readdirSync(path.join(ARCHIVE, 'reports')).length
        : 0,
      services: fs.existsSync(path.join(ARCHIVE, 'services'))
        ? fs.readdirSync(path.join(ARCHIVE, 'services')).length
        : 0,
      apps: fs.existsSync(path.join(ARCHIVE, 'apps'))
        ? fs.readdirSync(path.join(ARCHIVE, 'apps')).length
        : 0
    }
  };
  
  const reportPath = path.join(ROOT, 'CLEANUP-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📊 Cleanup Report:');
  console.log(`   Root files: ${report.rootFiles}`);
  console.log(`   Active services: ${report.services}`);
  console.log(`   Active apps: ${report.apps}`);
  console.log(`   Archived reports: ${report.archived.reports}`);
  console.log(`   Archived services: ${report.archived.services}`);
  console.log(`   Archived apps: ${report.archived.apps}`);
  console.log(`\n📄 Full report saved to: CLEANUP-REPORT.json\n`);
}

function main() {
  console.log('\n🧹 Azora OS Production Cleanup\n');
  console.log('═══════════════════════════════════════\n');
  
  // Create archive structure
  ensureDir(ARCHIVE);
  
  // Run cleanup phases
  archiveRootFiles();
  archiveServices();
  archiveApps();
  organizeDocs();
  
  // Generate report
  generateReport();
  
  console.log('═══════════════════════════════════════\n');
  console.log('✅ Cleanup Complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Review CLEANUP-REPORT.json');
  console.log('   2. Test core services: npm run dev');
  console.log('   3. Update documentation');
  console.log('   4. Commit changes: git add . && git commit -m "chore: production cleanup"');
  console.log('\n');
}

// Run cleanup
if (require.main === module) {
  main();
}

module.exports = { main };
