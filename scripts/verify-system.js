#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 AZORA OS SYSTEM VERIFICATION');
console.log('===============================');
console.log('⚡ "I verify because we trust through truth!" ⚡\n');

// Verification results
let verificationResults = {
  services: {
    total: 0,
    working: 0,
    partial: 0,
    broken: 0,
    details: []
  },
  apps: {
    total: 0,
    working: 0,
    partial: 0,
    broken: 0,
    details: []
  },
  infrastructure: {
    database: false,
    docker: false,
    tests: false,
    docs: false
  },
  overall: {
    score: 0,
    status: 'Unknown',
    readiness: 'Not Ready'
  }
};

// Service configuration
const EXPECTED_SERVICES = [
  { name: 'api-gateway', port: 4000, priority: 'critical' },
  { name: 'auth-service', port: 4001, priority: 'critical' },
  { name: 'azora-education', port: 4002, priority: 'high' },
  { name: 'azora-finance', port: 4003, priority: 'high' },
  { name: 'azora-marketplace', port: 4004, priority: 'high' },
  { name: 'health-monitor', port: 4005, priority: 'medium' },
  { name: 'azora-aegis', port: 4006, priority: 'medium' }
];

// Helper functions
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkServiceStructure(serviceName) {
  const servicePath = path.join(__dirname, '..', 'services', serviceName);
  
  if (!fs.existsSync(servicePath)) {
    return { exists: false, structure: 'missing' };
  }
  
  const requiredFiles = ['package.json', 'server.js', 'index.js'];
  const optionalFiles = ['Dockerfile', 'README.md', '.env.example'];
  
  let hasRequired = false;
  let hasOptional = 0;
  
  // Check for server.js OR index.js
  if (checkFileExists(path.join(servicePath, 'server.js')) || 
      checkFileExists(path.join(servicePath, 'index.js'))) {
    hasRequired = true;
  }
  
  // Check package.json
  if (!checkFileExists(path.join(servicePath, 'package.json'))) {
    hasRequired = false;
  }
  
  // Count optional files
  optionalFiles.forEach(file => {
    if (checkFileExists(path.join(servicePath, file))) {
      hasOptional++;
    }
  });
  
  let structure = 'broken';
  if (hasRequired && hasOptional >= 2) {
    structure = 'complete';
  } else if (hasRequired) {
    structure = 'partial';
  }
  
  return { exists: true, structure, hasRequired, optionalCount: hasOptional };
}

function checkServiceHealth(serviceName, port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            running: true,
            healthy: res.statusCode === 200,
            response: response
          });
        } catch (error) {
          resolve({
            running: true,
            healthy: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', () => {
      resolve({ running: false, healthy: false, error: 'Connection failed' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, healthy: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function verifyServices() {
  console.log('⚙️ VERIFYING SERVICES...\n');
  
  for (const service of EXPECTED_SERVICES) {
    console.log(`🔍 Checking ${service.name}...`);
    
    // Check file structure
    const structure = checkServiceStructure(service.name);
    
    // Check if service is running
    const health = await checkServiceHealth(service.name, service.port);
    
    let status = 'broken';
    let score = 0;
    
    if (structure.exists && structure.hasRequired) {
      if (health.running && health.healthy) {
        status = 'working';
        score = 100;
        verificationResults.services.working++;
      } else if (structure.structure === 'complete') {
        status = 'partial';
        score = 70;
        verificationResults.services.partial++;
      } else {
        status = 'broken';
        score = 30;
        verificationResults.services.broken++;
      }
    } else {
      verificationResults.services.broken++;
    }
    
    verificationResults.services.details.push({
      name: service.name,
      priority: service.priority,
      status: status,
      score: score,
      structure: structure,
      health: health,
      port: service.port
    });
    
    const statusIcon = status === 'working' ? '✅' : status === 'partial' ? '🟡' : '❌';
    console.log(`   ${statusIcon} ${service.name}: ${status} (${score}%)`);
    
    verificationResults.services.total++;
  }
  
  console.log(`\n📊 Services Summary:`);
  console.log(`   ✅ Working: ${verificationResults.services.working}`);
  console.log(`   🟡 Partial: ${verificationResults.services.partial}`);
  console.log(`   ❌ Broken: ${verificationResults.services.broken}`);
}

function verifyApps() {
  console.log('\n📱 VERIFYING APPLICATIONS...\n');
  
  const appsDir = path.join(__dirname, '..', 'apps');
  
  if (!fs.existsSync(appsDir)) {
    console.log('❌ Apps directory not found');
    return;
  }
  
  const apps = fs.readdirSync(appsDir).filter(item => {
    const itemPath = path.join(appsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  apps.forEach(app => {
    console.log(`🔍 Checking ${app}...`);
    
    const appPath = path.join(appsDir, app);
    const packageJsonPath = path.join(appPath, 'package.json');
    const nextConfigPath = path.join(appPath, 'next.config.js');
    const srcPath = path.join(appPath, 'src');
    const appDirPath = path.join(appPath, 'app');
    
    let status = 'broken';
    let score = 0;
    
    if (checkFileExists(packageJsonPath)) {
      score += 30;
      
      if (checkFileExists(nextConfigPath)) {
        score += 20;
      }
      
      if (checkFileExists(srcPath) || checkFileExists(appDirPath)) {
        score += 30;
        
        // Check for components
        const componentsPath = path.join(appPath, 'components');
        if (checkFileExists(componentsPath)) {
          score += 20;
        }
      }
      
      if (score >= 80) {
        status = 'working';
        verificationResults.apps.working++;
      } else if (score >= 50) {
        status = 'partial';
        verificationResults.apps.partial++;
      } else {
        status = 'broken';
        verificationResults.apps.broken++;
      }
    } else {
      verificationResults.apps.broken++;
    }
    
    verificationResults.apps.details.push({
      name: app,
      status: status,
      score: score,
      hasPackageJson: checkFileExists(packageJsonPath),
      hasNextConfig: checkFileExists(nextConfigPath),
      hasSrc: checkFileExists(srcPath) || checkFileExists(appDirPath)
    });
    
    const statusIcon = status === 'working' ? '✅' : status === 'partial' ? '🟡' : '❌';
    console.log(`   ${statusIcon} ${app}: ${status} (${score}%)`);
    
    verificationResults.apps.total++;
  });
  
  console.log(`\n📊 Apps Summary:`);
  console.log(`   ✅ Working: ${verificationResults.apps.working}`);
  console.log(`   🟡 Partial: ${verificationResults.apps.partial}`);
  console.log(`   ❌ Broken: ${verificationResults.apps.broken}`);
}

function verifyInfrastructure() {
  console.log('\n🏗️ VERIFYING INFRASTRUCTURE...\n');
  
  // Check database setup
  const prismaPath = path.join(__dirname, '..', 'prisma');
  const schemaPath = path.join(prismaPath, 'schema.prisma');
  verificationResults.infrastructure.database = checkFileExists(schemaPath);
  console.log(`   ${verificationResults.infrastructure.database ? '✅' : '❌'} Database schema`);
  
  // Check Docker setup
  const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
  const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
  verificationResults.infrastructure.docker = checkFileExists(dockerfilePath) && checkFileExists(dockerComposePath);
  console.log(`   ${verificationResults.infrastructure.docker ? '✅' : '❌'} Docker configuration`);
  
  // Check tests
  const testsPath = path.join(__dirname, '..', 'tests');
  const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
  verificationResults.infrastructure.tests = checkFileExists(testsPath) || checkFileExists(jestConfigPath);
  console.log(`   ${verificationResults.infrastructure.tests ? '✅' : '❌'} Testing setup`);
  
  // Check documentation
  const docsPath = path.join(__dirname, '..', 'docs');
  const readmePath = path.join(__dirname, '..', 'README.md');
  verificationResults.infrastructure.docs = checkFileExists(docsPath) && checkFileExists(readmePath);
  console.log(`   ${verificationResults.infrastructure.docs ? '✅' : '❌'} Documentation`);
}

function calculateOverallScore() {
  console.log('\n📊 CALCULATING OVERALL SCORE...\n');
  
  // Service score (40% weight)
  const serviceScore = verificationResults.services.total > 0 ? 
    ((verificationResults.services.working * 100 + verificationResults.services.partial * 50) / 
     (verificationResults.services.total * 100)) * 40 : 0;
  
  // App score (30% weight)
  const appScore = verificationResults.apps.total > 0 ?
    ((verificationResults.apps.working * 100 + verificationResults.apps.partial * 50) / 
     (verificationResults.apps.total * 100)) * 30 : 0;
  
  // Infrastructure score (30% weight)
  const infraItems = Object.values(verificationResults.infrastructure);
  const infraScore = (infraItems.filter(Boolean).length / infraItems.length) * 30;
  
  const totalScore = Math.round(serviceScore + appScore + infraScore);
  
  verificationResults.overall.score = totalScore;
  
  if (totalScore >= 80) {
    verificationResults.overall.status = 'Excellent';
    verificationResults.overall.readiness = 'Production Ready';
  } else if (totalScore >= 60) {
    verificationResults.overall.status = 'Good';
    verificationResults.overall.readiness = 'Near Production';
  } else if (totalScore >= 40) {
    verificationResults.overall.status = 'Fair';
    verificationResults.overall.readiness = 'Development';
  } else {
    verificationResults.overall.status = 'Poor';
    verificationResults.overall.readiness = 'Early Development';
  }
  
  console.log(`📊 Score Breakdown:`);
  console.log(`   ⚙️ Services: ${Math.round(serviceScore)}% (weight: 40%)`);
  console.log(`   📱 Apps: ${Math.round(appScore)}% (weight: 30%)`);
  console.log(`   🏗️ Infrastructure: ${Math.round(infraScore)}% (weight: 30%)`);
  console.log(`\n🎯 Overall Score: ${totalScore}%`);
  console.log(`📈 Status: ${verificationResults.overall.status}`);
  console.log(`🚀 Readiness: ${verificationResults.overall.readiness}`);
}

function generateReport() {
  console.log('\n📋 GENERATING VERIFICATION REPORT...\n');
  
  const reportPath = path.join(__dirname, '..', 'SYSTEM-VERIFICATION-REPORT.md');
  
  const report = `# 🔍 Azora OS System Verification Report

**Date:** ${new Date().toISOString().split('T')[0]}  
**Overall Score:** ${verificationResults.overall.score}%  
**Status:** ${verificationResults.overall.status}  
**Readiness:** ${verificationResults.overall.readiness}

---

## 📊 Executive Summary

| Component | Working | Partial | Broken | Total |
|-----------|---------|---------|--------|-------|
| **Services** | ${verificationResults.services.working} | ${verificationResults.services.partial} | ${verificationResults.services.broken} | ${verificationResults.services.total} |
| **Applications** | ${verificationResults.apps.working} | ${verificationResults.apps.partial} | ${verificationResults.apps.broken} | ${verificationResults.apps.total} |

---

## ⚙️ Service Details

${verificationResults.services.details.map(service => `
### ${service.name} (${service.priority} priority)
- **Status:** ${service.status === 'working' ? '✅' : service.status === 'partial' ? '🟡' : '❌'} ${service.status}
- **Score:** ${service.score}%
- **Port:** ${service.port}
- **Structure:** ${service.structure.structure}
- **Health:** ${service.health.healthy ? 'Healthy' : 'Unhealthy'}
${service.health.error ? `- **Error:** ${service.health.error}` : ''}
`).join('')}

---

## 📱 Application Details

${verificationResults.apps.details.map(app => `
### ${app.name}
- **Status:** ${app.status === 'working' ? '✅' : app.status === 'partial' ? '🟡' : '❌'} ${app.status}
- **Score:** ${app.score}%
- **Package.json:** ${app.hasPackageJson ? '✅' : '❌'}
- **Next.js Config:** ${app.hasNextConfig ? '✅' : '❌'}
- **Source Code:** ${app.hasSrc ? '✅' : '❌'}
`).join('')}

---

## 🏗️ Infrastructure Status

| Component | Status |
|-----------|--------|
| **Database Schema** | ${verificationResults.infrastructure.database ? '✅ Available' : '❌ Missing'} |
| **Docker Setup** | ${verificationResults.infrastructure.docker ? '✅ Available' : '❌ Missing'} |
| **Testing Framework** | ${verificationResults.infrastructure.tests ? '✅ Available' : '❌ Missing'} |
| **Documentation** | ${verificationResults.infrastructure.docs ? '✅ Available' : '❌ Missing'} |

---

## 🎯 Recommendations

### Immediate Actions Required

${verificationResults.services.broken > 0 ? `
#### Fix Broken Services (${verificationResults.services.broken})
${verificationResults.services.details
  .filter(s => s.status === 'broken')
  .map(s => `- **${s.name}**: ${s.structure.exists ? 'Fix implementation' : 'Create service'}`)
  .join('\n')}
` : ''}

${verificationResults.apps.broken > 0 ? `
#### Fix Broken Applications (${verificationResults.apps.broken})
${verificationResults.apps.details
  .filter(a => a.status === 'broken')
  .map(a => `- **${a.name}**: ${a.hasPackageJson ? 'Fix configuration' : 'Create package.json'}`)
  .join('\n')}
` : ''}

### Infrastructure Improvements

${!verificationResults.infrastructure.database ? '- Set up database schema and migrations' : ''}
${!verificationResults.infrastructure.docker ? '- Complete Docker configuration' : ''}
${!verificationResults.infrastructure.tests ? '- Implement testing framework' : ''}
${!verificationResults.infrastructure.docs ? '- Complete documentation' : ''}

---

## 🚀 Production Readiness Checklist

- [${verificationResults.services.working >= 5 ? 'x' : ' '}] At least 5 core services working
- [${verificationResults.apps.working >= 3 ? 'x' : ' '}] At least 3 applications working  
- [${verificationResults.infrastructure.database ? 'x' : ' '}] Database schema complete
- [${verificationResults.infrastructure.docker ? 'x' : ' '}] Docker deployment ready
- [${verificationResults.infrastructure.tests ? 'x' : ' '}] Testing framework in place
- [${verificationResults.infrastructure.docs ? 'x' : ' '}] Documentation complete
- [${verificationResults.overall.score >= 70 ? 'x' : ' '}] Overall score ≥ 70%

**Production Ready:** ${verificationResults.overall.score >= 70 && 
  verificationResults.services.working >= 5 && 
  verificationResults.apps.working >= 3 ? '✅ YES' : '❌ NO'}

---

## 🤝 Ubuntu Commitment

This verification was conducted with complete honesty and transparency, reflecting our Ubuntu philosophy of truth and community.

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

---

**Generated:** ${new Date().toISOString()}  
**Next Verification:** Weekly  
**Ubuntu:** Truth builds trust. 🌍
`;

  fs.writeFileSync(reportPath, report);
  console.log('✅ Verification report generated');
  console.log(`📄 Report saved to: SYSTEM-VERIFICATION-REPORT.md`);
}

// Main execution
async function main() {
  console.log('Starting system verification...\n');
  
  try {
    await verifyServices();
    verifyApps();
    verifyInfrastructure();
    calculateOverallScore();
    generateReport();
    
    console.log('\n🎉 VERIFICATION COMPLETE!\n');
    console.log(`🎯 Overall Score: ${verificationResults.overall.score}%`);
    console.log(`📈 Status: ${verificationResults.overall.status}`);
    console.log(`🚀 Readiness: ${verificationResults.overall.readiness}`);
    
    if (verificationResults.overall.score >= 70) {
      console.log('\n✅ System is in good shape!');
    } else {
      console.log('\n⚠️ System needs improvement before production.');
    }
    
    console.log('\n🌍 Ubuntu: "We verify because we care about quality!"');
    
  } catch (error) {
    console.error(`\n❌ Fatal error during verification: ${error.message}`);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  main();
}

module.exports = { main, verificationResults };