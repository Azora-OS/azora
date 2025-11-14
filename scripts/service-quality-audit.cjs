#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

function analyzeService(servicePath, serviceName) {
  const analysis = {
    name: serviceName,
    score: 0,
    files: 0,
    features: [],
    missing: []
  };

  const checks = [
    { path: 'prisma/schema.prisma', points: 2, name: 'Schema' },
    { path: 'src/routes', points: 1, name: 'Routes', isDir: true },
    { path: 'src/controllers', points: 1, name: 'Controllers', isDir: true },
    { path: 'src/services', points: 1, name: 'Services', isDir: true },
    { path: 'tests', points: 1, name: 'Tests', isDir: true },
    { path: '__tests__', points: 1, name: 'Tests', isDir: true },
    { path: 'README.md', points: 1, name: 'Docs' },
    { path: 'Dockerfile', points: 1, name: 'Docker' }
  ];

  checks.forEach(check => {
    const fullPath = path.join(servicePath, check.path);
    try {
      const exists = check.isDir ? 
        fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() : 
        fs.existsSync(fullPath);
      
      if (exists) {
        analysis.score += check.points;
        analysis.features.push(check.name);
      } else {
        analysis.missing.push(check.name);
      }
    } catch (e) {}
  });

  const countFiles = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    try {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          count += countFiles(fullPath);
        } else if (/\.(ts|js)$/.test(file)) {
          count++;
        }
      });
    } catch (e) {}
    return count;
  };
  
  analysis.files = countFiles(servicePath);

  if (analysis.score >= 7 && analysis.files >= 5) {
    analysis.category = 'WELL';
  } else if (analysis.score >= 3 || analysis.files >= 2) {
    analysis.category = 'PARTIAL';
  } else {
    analysis.category = 'PLACEHOLDER';
  }

  return analysis;
}

function main() {
  console.log('🔍 Azora OS Service Quality Audit\n');

  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => {
      const servicePath = path.join(SERVICES_DIR, name);
      try {
        return fs.statSync(servicePath).isDirectory() && 
               !name.endsWith('.md') && 
               !name.endsWith('.js');
      } catch (e) {
        return false;
      }
    });

  const results = { WELL: [], PARTIAL: [], PLACEHOLDER: [] };

  services.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const analysis = analyzeService(servicePath, serviceName);
    results[analysis.category].push(analysis);
  });

  Object.keys(results).forEach(cat => {
    results[cat].sort((a, b) => b.score - a.score);
  });

  console.log('📊 QUALITY DISTRIBUTION\n');
  console.log(`✅ Well-Implemented: ${results.WELL.length} (${Math.round(results.WELL.length / services.length * 100)}%)`);
  console.log(`⚠️  Partial: ${results.PARTIAL.length} (${Math.round(results.PARTIAL.length / services.length * 100)}%)`);
  console.log(`❌ Placeholder: ${results.PLACEHOLDER.length} (${Math.round(results.PLACEHOLDER.length / services.length * 100)}%)`);
  console.log(`📦 Total: ${services.length}\n`);

  console.log('\n✅ WELL-IMPLEMENTED SERVICES\n');
  results.WELL.forEach(s => {
    console.log(`  ${s.name} (Score: ${s.score}, Files: ${s.files})`);
  });

  console.log('\n\n⚠️  PARTIAL (Top 15)\n');
  results.PARTIAL.slice(0, 15).forEach(s => {
    console.log(`  ${s.name} (Score: ${s.score}, Files: ${s.files})`);
  });

  console.log('\n\n❌ PLACEHOLDER (Sample)\n');
  results.PLACEHOLDER.slice(0, 15).forEach(s => {
    console.log(`  ${s.name} (Score: ${s.score}, Files: ${s.files})`);
  });

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: services.length,
      wellImplemented: results.WELL.length,
      partial: results.PARTIAL.length,
      placeholder: results.PLACEHOLDER.length,
      percentages: {
        well: Math.round(results.WELL.length / services.length * 100),
        partial: Math.round(results.PARTIAL.length / services.length * 100),
        placeholder: Math.round(results.PLACEHOLDER.length / services.length * 100)
      }
    },
    services: results
  };

  const reportPath = path.join(SERVICES_DIR, 'SERVICE-QUALITY-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n\n📄 Report saved: SERVICE-QUALITY-REPORT.json`);
}

main();
