#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 AZORA COMPLETE REPOSITORY SCAN');
console.log('=================================\n');

const requiredFiles = {
  services: [
    'package.json', 'Dockerfile', 'healthcheck.js', 'jest.config.js', 
    'server.js', 'index.js', '.env.example', 'README.md'
  ],
  servicesDirs: ['tests', 'src', 'prisma'],
  apps: ['package.json', 'next.config.js', 'tsconfig.json'],
  infrastructure: ['docker-compose.yml', 'Dockerfile'],
  docs: ['README.md', 'API.md', 'DEPLOYMENT.md']
};

let missing = [];
let incomplete = [];
let complete = [];

function scanDirectory(dirPath, expectedFiles = [], expectedDirs = []) {
  if (!fs.existsSync(dirPath)) {
    return { status: 'MISSING', files: [], dirs: [] };
  }

  const items = fs.readdirSync(dirPath);
  const files = items.filter(item => fs.statSync(path.join(dirPath, item)).isFile());
  const dirs = items.filter(item => fs.statSync(path.join(dirPath, item)).isDirectory());

  const missingFiles = expectedFiles.filter(file => !files.includes(file));
  const missingDirs = expectedDirs.filter(dir => !dirs.includes(dir));

  return {
    status: missingFiles.length === 0 && missingDirs.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    files,
    dirs,
    missingFiles,
    missingDirs
  };
}

// Scan services
console.log('🏢 SCANNING SERVICES...\n');
const servicesPath = path.join(__dirname, '..', 'services');
if (fs.existsSync(servicesPath)) {
  const services = fs.readdirSync(servicesPath).filter(item => 
    fs.statSync(path.join(servicesPath, item)).isDirectory()
  );

  services.forEach(service => {
    const servicePath = path.join(servicesPath, service);
    const scan = scanDirectory(servicePath, requiredFiles.services, requiredFiles.servicesDirs);
    
    if (scan.status === 'COMPLETE') {
      complete.push(`✅ services/${service}`);
    } else {
      incomplete.push({
        path: `services/${service}`,
        missing: [...(scan.missingFiles || []), ...(scan.missingDirs || [])]
      });
    }
    
    console.log(`${scan.status === 'COMPLETE' ? '✅' : '⚠️'} ${service}: ${scan.status}`);
    if (scan.missingFiles?.length > 0) {
      console.log(`   Missing files: ${scan.missingFiles.join(', ')}`);
    }
    if (scan.missingDirs?.length > 0) {
      console.log(`   Missing dirs: ${scan.missingDirs.join(', ')}`);
    }
  });
}

// Scan apps
console.log('\n📱 SCANNING APPS...\n');
const appsPath = path.join(__dirname, '..', 'apps');
if (fs.existsSync(appsPath)) {
  const apps = fs.readdirSync(appsPath).filter(item => 
    fs.statSync(path.join(appsPath, item)).isDirectory()
  );

  apps.forEach(app => {
    const appPath = path.join(appsPath, app);
    const scan = scanDirectory(appPath, requiredFiles.apps);
    
    if (scan.status === 'COMPLETE') {
      complete.push(`✅ apps/${app}`);
    } else {
      incomplete.push({
        path: `apps/${app}`,
        missing: scan.missingFiles || []
      });
    }
    
    console.log(`${scan.status === 'COMPLETE' ? '✅' : '⚠️'} ${app}: ${scan.status}`);
    if (scan.missingFiles?.length > 0) {
      console.log(`   Missing: ${scan.missingFiles.join(', ')}`);
    }
  });
}

// Scan infrastructure
console.log('\n🏗️ SCANNING INFRASTRUCTURE...\n');
const infraPath = path.join(__dirname, '..', 'infrastructure');
if (fs.existsSync(infraPath)) {
  const infraDirs = fs.readdirSync(infraPath).filter(item => 
    fs.statSync(path.join(infraPath, item)).isDirectory()
  );

  infraDirs.forEach(dir => {
    const dirPath = path.join(infraPath, dir);
    const scan = scanDirectory(dirPath);
    
    console.log(`${scan.files.length > 0 ? '✅' : '⚠️'} infrastructure/${dir}: ${scan.files.length} files`);
  });
}

// Scan packages
console.log('\n📦 SCANNING PACKAGES...\n');
const packagesPath = path.join(__dirname, '..', 'packages');
if (fs.existsSync(packagesPath)) {
  const packages = fs.readdirSync(packagesPath).filter(item => 
    fs.statSync(path.join(packagesPath, item)).isDirectory()
  );

  packages.forEach(pkg => {
    const pkgPath = path.join(packagesPath, pkg);
    const hasPackageJson = fs.existsSync(path.join(pkgPath, 'package.json'));
    
    console.log(`${hasPackageJson ? '✅' : '⚠️'} packages/${pkg}: ${hasPackageJson ? 'COMPLETE' : 'MISSING package.json'}`);
  });
}

// Check root files
console.log('\n📄 SCANNING ROOT FILES...\n');
const rootFiles = [
  'package.json', 'docker-compose.yml', 'README.md', 'LICENSE',
  'jest.config.js', 'tsconfig.json', '.gitignore', '.env.example'
];

rootFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (!exists) missing.push(file);
});

// Summary
console.log('\n📊 SCAN SUMMARY');
console.log('===============');
console.log(`✅ Complete: ${complete.length}`);
console.log(`⚠️ Incomplete: ${incomplete.length}`);
console.log(`❌ Missing: ${missing.length}`);

if (incomplete.length > 0) {
  console.log('\n🔧 ITEMS NEEDING ATTENTION:');
  incomplete.forEach(item => {
    console.log(`⚠️ ${item.path}: Missing ${item.missing.join(', ')}`);
  });
}

if (missing.length > 0) {
  console.log('\n❌ MISSING ROOT FILES:');
  missing.forEach(file => console.log(`   - ${file}`));
}

const overallHealth = incomplete.length === 0 && missing.length === 0 ? 'EXCELLENT' : 
                     incomplete.length < 5 && missing.length < 3 ? 'GOOD' : 'NEEDS_WORK';

console.log(`\n🎯 OVERALL REPOSITORY HEALTH: ${overallHealth}`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    complete: complete.length,
    incomplete: incomplete.length,
    missing: missing.length,
    health: overallHealth
  },
  complete,
  incomplete,
  missing
};

fs.writeFileSync(path.join(__dirname, '..', 'repo-scan-report.json'), JSON.stringify(report, null, 2));
console.log('\n💾 Detailed report saved: repo-scan-report.json');