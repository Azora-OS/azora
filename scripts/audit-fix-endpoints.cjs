#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

// Patterns that indicate mock/incomplete endpoints
const MOCK_PATTERNS = [
  /res\.json\(\[\]\)/,
  /res\.send\(\[\]\)/,
  /return \[\]/,
  /TODO/i,
  /MOCK/i,
  /mock data/i,
  /placeholder/i,
  /not implemented/i,
  /coming soon/i
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      MOCK_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString()
          });
        }
      });
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

function scanService(servicePath) {
  const results = {
    service: path.basename(servicePath),
    files: {}
  };
  
  const files = [
    'index.js', 'index.ts', 'server.js', 'server.ts',
    'src/index.js', 'src/index.ts', 'src/server.js', 'src/server.ts'
  ];
  
  files.forEach(file => {
    const filePath = path.join(servicePath, file);
    if (fs.existsSync(filePath)) {
      const issues = scanFile(filePath);
      if (issues.length > 0) {
        results.files[file] = issues;
      }
    }
  });
  
  return Object.keys(results.files).length > 0 ? results : null;
}

function main() {
  console.log('🔍 Auditing API Endpoints for Mock/Incomplete Implementations\n');
  
  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => {
      const servicePath = path.join(SERVICES_DIR, name);
      return fs.statSync(servicePath).isDirectory();
    });
  
  const problematicServices = [];
  
  services.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const result = scanService(servicePath);
    
    if (result) {
      problematicServices.push(result);
    }
  });
  
  console.log(`📊 Audit Results:\n`);
  console.log(`Total Services: ${services.length}`);
  console.log(`Services with Mock/Incomplete Endpoints: ${problematicServices.length}\n`);
  
  if (problematicServices.length > 0) {
    console.log('⚠️  Services Requiring Implementation:\n');
    
    problematicServices.forEach(service => {
      console.log(`\n📦 ${service.service}`);
      Object.entries(service.files).forEach(([file, issues]) => {
        console.log(`   📄 ${file}`);
        issues.forEach(issue => {
          console.log(`      Line ${issue.line}: ${issue.content.substring(0, 80)}`);
        });
      });
    });
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      totalServices: services.length,
      problematicServices: problematicServices.length,
      details: problematicServices
    };
    
    const reportPath = path.join(__dirname, '../ENDPOINT-AUDIT-REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Detailed report saved to: ENDPOINT-AUDIT-REPORT.json`);
  } else {
    console.log('✅ All services appear to have complete implementations!');
  }
}

main();
