#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

const QUALITY_CRITERIA = {
  WELL_IMPLEMENTED: {
    minScore: 7,
    minFiles: 5,
    description: 'Complete implementation with tests, docs, and proper structure'
  },
  PARTIAL: {
    minScore: 3,
    minFiles: 2,
    description: 'Basic structure with some logic, needs enhancement'
  },
  PLACEHOLDER: {
    description: 'Minimal implementation, mostly health checks'
  }
};

function analyzeService(servicePath, serviceName) {
  const analysis = {
    name: serviceName,
    score: 0,
    files: 0,
    features: [],
    missing: [],
    category: 'PLACEHOLDER'
  };

  // Check for key implementation files
  const checks = [
    { path: 'prisma/schema.prisma', points: 2, name: 'Database Schema' },
    { path: 'src/routes', points: 1, name: 'Routes', isDir: true },
    { path: 'src/controllers', points: 1, name: 'Controllers', isDir: true },
    { path: 'src/services', points: 1, name: 'Services', isDir: true },
    { path: 'tests', points: 1, name: 'Tests', isDir: true },
    { path: '__tests__', points: 1, name: 'Tests', isDir: true },
    { path: 'README.md', points: 1, name: 'Documentation' },
    { path: 'Dockerfile', points: 1, name: 'Docker Support' },
    { path: 'package.json', points: 1, name: 'Package Config' }
  ];

  checks.forEach(check => {
    const fullPath = path.join(servicePath, check.path);
    const exists = check.isDir ? fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() : fs.existsSync(fullPath);
    
    if (exists) {
      analysis.score += check.points;
      analysis.features.push(check.name);
    } else {
      analysis.missing.push(check.name);
    }
  });

  // Count implementation files
  try {
    const countFiles = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      let count = 0;
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          count += countFiles(fullPath);
        } else if (/\.(ts|js)$/.test(file) && !file.includes('.test.') && !file.includes('.spec.')) {
          count++;
        }
      });
      return count;
    };
    analysis.files = countFiles(servicePath);
  } catch (err) {
    analysis.files = 0;
  }

  // Determine category
  if (analysis.score >= QUALITY_CRITERIA.WELL_IMPLEMENTED.minScore && 
      analysis.files >= QUALITY_CRITERIA.WELL_IMPLEMENTED.minFiles) {
    analysis.category = 'WELL_IMPLEMENTED';
  } else if (analysis.score >= QUALITY_CRITERIA.PARTIAL.minScore || 
             analysis.files >= QUALITY_CRITERIA.PARTIAL.minFiles) {
    analysis.category = 'PARTIAL';
  }

  return analysis;
}

function main() {
  console.log('🔍 Azora OS Service Quality Audit\n');
  console.log('═'.repeat(80));

  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => {
      const servicePath = path.join(SERVICES_DIR, name);
      return fs.statSync(servicePath).isDirectory() && 
             !name.endsWith('.md') && 
             !name.endsWith('.js') &&
             !name.endsWith('.ts');
    });

  const results = {
    WELL_IMPLEMENTED: [],
    PARTIAL: [],
    PLACEHOLDER: []
  };

  services.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const analysis = analyzeService(servicePath, serviceName);
    results[analysis.category].push(analysis);
  });

  // Sort by score within each category
  Object.keys(results).forEach(category => {
    results[category].sort((a, b) => b.score - a.score);
  });

  // Display results
  console.log('\n📊 QUALITY DISTRIBUTION\n');
  console.log(`✅ Well-Implemented: ${results.WELL_IMPLEMENTED.length} (${Math.round(results.WELL_IMPLEMENTED.length / services.length * 100)}%)`);
  console.log(`⚠️  Partially Implemented: ${results.PARTIAL.length} (${Math.round(results.PARTIAL.length / services.length * 100)}%)`);
  console.log(`❌ Placeholders: ${results.PLACEHOLDER.length} (${Math.round(results.PLACEHOLDER.length / services.length * 100)}%)`);
  console.log(`📦 Total Services: ${services.length}\n`);

  // Well-implemented services
  console.log('═'.repeat(80));
  console.log('\n✅ WELL-IMPLEMENTED SERVICES\n');
  results.WELL_IMPLEMENTED.forEach(s => {
    console.log(`  ${s.name}`);
    console.log(`    Score: ${s.score}/12 | Files: ${s.files}`);
    console.log(`    Features: ${s.features.join(', ')}`);
    console.log('');
  });

  // Partial services (top 10)
  console.log('═'.repeat(80));
  console.log('\n⚠️  PARTIALLY IMPLEMENTED (Top 10)\n');
  results.PARTIAL.slice(0, 10).forEach(s => {
    console.log(`  ${s.name}`);
    console.log(`    Score: ${s.score}/12 | Files: ${s.files}`);
    console.log(`    Missing: ${s.missing.slice(0, 3).join(', ')}`);
    console.log('');
  });

  // Placeholder services (sample)
  console.log('═'.repeat(80));
  console.log('\n❌ PLACEHOLDER SERVICES (Sample)\n');
  results.PLACEHOLDER.slice(0, 10).forEach(s => {
    console.log(`  ${s.name} (Score: ${s.score}, Files: ${s.files})`);
  });

  // Generate improvement recommendations
  console.log('\n═'.repeat(80));
  console.log('\n💡 IMPROVEMENT RECOMMENDATIONS\n');
  
  const priorityServices = results.PARTIAL
    .filter(s => s.score >= 4)
    .slice(0, 5);
  
  console.log('🎯 Priority Services (Close to Well-Implemented):\n');
  priorityServices.forEach(s => {
    console.log(`  ${s.name}`);
    console.log(`    Add: ${s.missing.slice(0, 2).join(', ')}`);
  });

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: services.length,
      wellImplemented: results.WELL_IMPLEMENTED.length,
      partial: results.PARTIAL.length,
      placeholder: results.PLACEHOLDER.length
    },
    services: results
  };

  const reportPath = path.join(SERVICES_DIR, 'SERVICE-QUALITY-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
}

main();
