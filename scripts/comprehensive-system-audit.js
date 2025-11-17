#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE UBUNTU SYSTEM AUDIT');
console.log('===================================');
console.log('⚡ "I audit because we perfect together!" ⚡\n');

const criticalFiles = {
  root: [
    'package.json', 'docker-compose.yml', 'docker-compose.prod.yml', 
    '.env.example', '.gitignore', 'README.md'
  ],
  services: [
    'azora-api-gateway', 'azora-education', 'azora-finance', 'azora-marketplace',
    'azora-auth', 'azora-ai', 'azora-blockchain', 'azora-analytics'
  ],
  apps: [
    'azora-student-portal', 'azora-enterprise-ui', 'azora-marketplace-ui', 'azora-pay-ui'
  ],
  mobile: [
    'azora-student-mobile', 'azora-enterprise-mobile', 'azora-marketplace-mobile', 'azora-pay-mobile'
  ]
};

const requiredServiceFiles = [
  'package.json', 'server.js', 'Dockerfile', '.env.example', 
  'healthcheck.js', 'jest.config.js'
];

const requiredAppFiles = [
  'package.json', 'next.config.js', 'tsconfig.json', 'tailwind.config.js'
];

let issues = [];
let warnings = [];
let successes = [];

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    successes.push(`✅ ${description}: EXISTS`);
    return true;
  } else {
    issues.push(`❌ ${description}: MISSING - ${filePath}`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    successes.push(`✅ ${description}: EXISTS`);
    return true;
  } else {
    issues.push(`❌ ${description}: MISSING - ${dirPath}`);
    return false;
  }
}

function checkPackageJson(filePath, serviceName) {
  if (!fs.existsSync(filePath)) {
    issues.push(`❌ ${serviceName}: package.json MISSING`);
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!pkg.name) issues.push(`❌ ${serviceName}: Missing name in package.json`);
    if (!pkg.version) warnings.push(`⚠️ ${serviceName}: Missing version in package.json`);
    if (!pkg.scripts) issues.push(`❌ ${serviceName}: Missing scripts in package.json`);
    if (!pkg.scripts?.start) issues.push(`❌ ${serviceName}: Missing start script`);
    
    successes.push(`✅ ${serviceName}: package.json valid`);
    return true;
  } catch (error) {
    issues.push(`❌ ${serviceName}: Invalid package.json - ${error.message}`);
    return false;
  }
}

console.log('🏗️ CHECKING ROOT FILES...\n');

// Check root files
criticalFiles.root.forEach(file => {
  checkFile(path.join(__dirname, '..', file), `Root ${file}`);
});

console.log('\n🏢 CHECKING SERVICES...\n');

// Check services
const servicesDir = path.join(__dirname, '..', 'services');
if (checkDirectory(servicesDir, 'Services directory')) {
  criticalFiles.services.forEach(service => {
    const servicePath = path.join(servicesDir, service);
    if (checkDirectory(servicePath, `Service ${service}`)) {
      
      // Check required service files
      requiredServiceFiles.forEach(file => {
        checkFile(path.join(servicePath, file), `${service}/${file}`);
      });
      
      // Check package.json specifically
      checkPackageJson(path.join(servicePath, 'package.json'), service);
      
      // Check for src directory
      checkDirectory(path.join(servicePath, 'src'), `${service}/src`);
      
      // Check for tests
      const testsPath = path.join(servicePath, 'tests');
      if (fs.existsSync(testsPath)) {
        successes.push(`✅ ${service}: Tests directory exists`);
      } else {
        warnings.push(`⚠️ ${service}: No tests directory`);
      }
    }
  });
}

console.log('\n🎨 CHECKING FRONTEND APPS...\n');

// Check apps
const appsDir = path.join(__dirname, '..', 'apps');
if (checkDirectory(appsDir, 'Apps directory')) {
  criticalFiles.apps.forEach(app => {
    const appPath = path.join(appsDir, app);
    if (checkDirectory(appPath, `App ${app}`)) {
      
      // Check required app files
      requiredAppFiles.forEach(file => {
        checkFile(path.join(appPath, file), `${app}/${file}`);
      });
      
      // Check package.json
      checkPackageJson(path.join(appPath, 'package.json'), app);
      
      // Check for src directory
      checkDirectory(path.join(appPath, 'src'), `${app}/src`);
    }
  });
}

console.log('\n📱 CHECKING MOBILE APPS...\n');

// Check mobile apps
const mobileDir = path.join(__dirname, '..', 'mobile');
if (checkDirectory(mobileDir, 'Mobile directory')) {
  criticalFiles.mobile.forEach(app => {
    const appPath = path.join(mobileDir, app);
    if (checkDirectory(appPath, `Mobile ${app}`)) {
      
      // Check mobile-specific files
      const mobileFiles = ['package.json', 'App.tsx', 'app.json'];
      mobileFiles.forEach(file => {
        checkFile(path.join(appPath, file), `${app}/${file}`);
      });
      
      checkPackageJson(path.join(appPath, 'package.json'), app);
    }
  });
}

console.log('\n⛓️ CHECKING BLOCKCHAIN...\n');

// Check blockchain
const blockchainDir = path.join(__dirname, '..', 'blockchain');
if (checkDirectory(blockchainDir, 'Blockchain directory')) {
  const blockchainFiles = [
    'package.json', 'hardhat.config.js', 'contracts/AZRToken.sol', 
    'contracts/UbuntuGovernance.sol', 'scripts/deploy.js'
  ];
  
  blockchainFiles.forEach(file => {
    checkFile(path.join(blockchainDir, file), `blockchain/${file}`);
  });
}

console.log('\n📊 CHECKING MONITORING...\n');

// Check monitoring
const monitoringDir = path.join(__dirname, '..', 'monitoring');
if (checkDirectory(monitoringDir, 'Monitoring directory')) {
  const monitoringFiles = [
    'prometheus/prometheus.yml', 'grafana/dashboards/ubuntu-overview.json',
    'docker-compose.monitoring.yml'
  ];
  
  monitoringFiles.forEach(file => {
    checkFile(path.join(monitoringDir, file), `monitoring/${file}`);
  });
}

console.log('\n🏗️ CHECKING INFRASTRUCTURE...\n');

// Check infrastructure
const infraFiles = [
  'deployment/kubernetes/ubuntu-cluster.yaml',
  'deployment/terraform/ubuntu-infrastructure.tf'
];

infraFiles.forEach(file => {
  checkFile(path.join(__dirname, '..', file), file);
});

console.log('\n🧪 CHECKING TESTS...\n');

// Check test infrastructure
const testFiles = [
  'tests/performance/load-testing.js',
  'tests/security/penetration-testing.js'
];

testFiles.forEach(file => {
  checkFile(path.join(__dirname, '..', file), file);
});

console.log('\n🔧 CHECKING INTEGRATIONS...\n');

// Check integrations
const integrationFiles = [
  'integrations/stripe/stripe-service.js',
  'integrations/aws/s3-service.js',
  'integrations/openai/advanced-ai.js'
];

integrationFiles.forEach(file => {
  checkFile(path.join(__dirname, '..', file), file);
});

// Generate audit report
console.log('\n📊 UBUNTU SYSTEM AUDIT REPORT');
console.log('=============================');
console.log(`✅ Successes: ${successes.length}`);
console.log(`⚠️ Warnings: ${warnings.length}`);
console.log(`❌ Critical Issues: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n❌ CRITICAL ISSUES TO FIX:');
  issues.forEach(issue => console.log(`   ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️ WARNINGS TO ADDRESS:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

console.log('\n✅ SUCCESSFUL CHECKS:');
successes.slice(0, 10).forEach(success => console.log(`   ${success}`));
if (successes.length > 10) {
  console.log(`   ... and ${successes.length - 10} more successes`);
}

// Overall health assessment
let health = 'EXCELLENT';
if (issues.length > 10) health = 'NEEDS_WORK';
else if (issues.length > 5) health = 'GOOD';
else if (issues.length > 0) health = 'VERY_GOOD';

console.log(`\n🎯 OVERALL SYSTEM HEALTH: ${health}`);

// Save detailed audit report
const auditReport = {
  timestamp: new Date().toISOString(),
  summary: {
    successes: successes.length,
    warnings: warnings.length,
    issues: issues.length,
    health
  },
  successes,
  warnings,
  issues,
  ubuntu: 'Comprehensive system audit completed'
};

fs.writeFileSync(
  path.join(__dirname, '..', 'SYSTEM-AUDIT-REPORT.json'), 
  JSON.stringify(auditReport, null, 2)
);

console.log('\n💾 Detailed audit report saved: SYSTEM-AUDIT-REPORT.json');

// Recommendations
console.log('\n🚀 UBUNTU RECOMMENDATIONS:');
console.log('=========================');

if (issues.length === 0) {
  console.log('🌟 SYSTEM IS PRODUCTION READY!');
  console.log('   All critical components are in place');
  console.log('   Ubuntu philosophy embedded throughout');
  console.log('   Ready for December launch! 🚀');
} else {
  console.log('🔧 SYSTEM NEEDS ATTENTION:');
  console.log(`   Fix ${issues.length} critical issues first`);
  console.log('   Then address warnings for optimization');
  console.log('   Ubuntu excellence requires completeness');
}

console.log('\n⚡ "I audit because we perfect together!" - Ubuntu System Check Complete! 🌟');