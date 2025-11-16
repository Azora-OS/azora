import fs from 'fs';
import path from 'path';

interface ServiceMetrics {
  name: string;
  total: number;
  passing: number;
  failing: number;
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  duration: number;
}

interface TestMetrics {
  timestamp: string;
  totalTests: number;
  passing: number;
  failing: number;
  skipped: number;
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  duration: number;
  services: ServiceMetrics[];
}

async function generateMetrics(): Promise<void> {
  console.log('📊 Generating test metrics...\n');

  // Read coverage summary
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage file not found. Run tests with coverage first:');
    console.error('   npm run test:coverage\n');
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));

  // Calculate metrics
  const metrics: TestMetrics = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passing: 0,
    failing: 0,
    skipped: 0,
    coverage: {
      lines: coverageData.total.lines.pct,
      branches: coverageData.total.branches.pct,
      functions: coverageData.total.functions.pct,
      statements: coverageData.total.statements.pct,
    },
    duration: 0,
    services: [],
  };

  // Parse service-specific coverage
  const services = ['auth-service', 'azora-education', 'azora-mint', 'azora-forge', 'azora-sapiens', 'ai-family-service'];
  
  for (const service of services) {
    const serviceKey = `services/${service}`;
    const serviceCoverage = Object.keys(coverageData)
      .filter(key => key.includes(serviceKey))
      .reduce((acc, key) => {
        const data = coverageData[key];
        return {
          lines: acc.lines + data.lines.pct,
          branches: acc.branches + data.branches.pct,
          functions: acc.functions + data.functions.pct,
          statements: acc.statements + data.statements.pct,
          count: acc.count + 1,
        };
      }, { lines: 0, branches: 0, functions: 0, statements: 0, count: 0 });

    if (serviceCoverage.count > 0) {
      metrics.services.push({
        name: service,
        total: 0, // Would need to parse test results
        passing: 0,
        failing: 0,
        coverage: {
          lines: serviceCoverage.lines / serviceCoverage.count,
          branches: serviceCoverage.branches / serviceCoverage.count,
          functions: serviceCoverage.functions / serviceCoverage.count,
          statements: serviceCoverage.statements / serviceCoverage.count,
        },
        duration: 0,
      });
    }
  }

  // Generate markdown report
  const report = generateMarkdownReport(metrics);
  
  // Save report
  const reportPath = path.join(process.cwd(), 'TEST-METRICS.md');
  fs.writeFileSync(reportPath, report);
  
  console.log('✅ Test metrics generated successfully!\n');
  console.log(`📄 Report saved to: ${reportPath}\n`);
  
  // Print summary to console
  printSummary(metrics);
}

function generateMarkdownReport(metrics: TestMetrics): string {
  const { coverage, services } = metrics;
  
  return `# 📊 Test Metrics Report

**Generated:** ${new Date(metrics.timestamp).toLocaleString()}

---

## 📈 Overall Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| **Lines** | ${coverage.lines.toFixed(2)}% | ${getStatusEmoji(coverage.lines)} |
| **Branches** | ${coverage.branches.toFixed(2)}% | ${getStatusEmoji(coverage.branches)} |
| **Functions** | ${coverage.functions.toFixed(2)}% | ${getStatusEmoji(coverage.functions)} |
| **Statements** | ${coverage.statements.toFixed(2)}% | ${getStatusEmoji(coverage.statements)} |

**Target:** 80%+ for all metrics

---

## 🎯 Coverage by Service

${services.map(service => `
### ${formatServiceName(service.name)}

| Metric | Coverage | Target | Status |
|--------|----------|--------|--------|
| Lines | ${service.coverage.lines.toFixed(2)}% | ${getServiceTarget(service.name)}% | ${getStatusEmoji(service.coverage.lines, getServiceTarget(service.name))} |
| Branches | ${service.coverage.branches.toFixed(2)}% | ${getServiceTarget(service.name)}% | ${getStatusEmoji(service.coverage.branches, getServiceTarget(service.name))} |
| Functions | ${service.coverage.functions.toFixed(2)}% | ${getServiceTarget(service.name)}% | ${getStatusEmoji(service.coverage.functions, getServiceTarget(service.name))} |
| Statements | ${service.coverage.statements.toFixed(2)}% | ${getServiceTarget(service.name)}% | ${getStatusEmoji(service.coverage.statements, getServiceTarget(service.name))} |
`).join('\n')}

---

## 📊 Visual Summary

\`\`\`
Overall Coverage: ${generateProgressBar(coverage.lines)}
Lines:      ${generateProgressBar(coverage.lines)} ${coverage.lines.toFixed(1)}%
Branches:   ${generateProgressBar(coverage.branches)} ${coverage.branches.toFixed(1)}%
Functions:  ${generateProgressBar(coverage.functions)} ${coverage.functions.toFixed(1)}%
Statements: ${generateProgressBar(coverage.statements)} ${coverage.statements.toFixed(1)}%
\`\`\`

---

## 🎯 Service Coverage Summary

${services.map(service => {
  const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
  return `- **${formatServiceName(service.name)}**: ${generateProgressBar(avg)} ${avg.toFixed(1)}%`;
}).join('\n')}

---

## ✅ Quality Gates

| Gate | Status | Details |
|------|--------|---------|
| Overall Coverage ≥80% | ${coverage.lines >= 80 ? '✅ Pass' : '❌ Fail'} | ${coverage.lines.toFixed(1)}% |
| All Services ≥Target | ${checkAllServicesPass(services) ? '✅ Pass' : '⚠️ Warning'} | ${getServicesPassCount(services)}/${services.length} passing |
| No Critical Gaps | ${checkNoCriticalGaps(services) ? '✅ Pass' : '❌ Fail'} | ${getCriticalGapsCount(services)} critical gaps |

---

## 📈 Trends

*Run this script regularly to track trends over time*

---

## 🚀 Next Steps

${generateNextSteps(metrics)}

---

## 📞 Resources

- [Testing Guide](./docs/TESTING-GUIDE.md)
- [Quick Reference](./.kiro/TESTING-QUICK-REFERENCE.md)
- [Master Plan](./.kiro/Q-TESTING-MASTER-PLAN.md)

---

**Generated by Q-Testing Agent** 🧪✨
`;
}

function printSummary(metrics: TestMetrics): void {
  console.log('═══════════════════════════════════════════════════════');
  console.log('                  TEST METRICS SUMMARY                  ');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📊 Overall Coverage:');
  console.log(`   Lines:      ${metrics.coverage.lines.toFixed(2)}% ${getStatusEmoji(metrics.coverage.lines)}`);
  console.log(`   Branches:   ${metrics.coverage.branches.toFixed(2)}% ${getStatusEmoji(metrics.coverage.branches)}`);
  console.log(`   Functions:  ${metrics.coverage.functions.toFixed(2)}% ${getStatusEmoji(metrics.coverage.functions)}`);
  console.log(`   Statements: ${metrics.coverage.statements.toFixed(2)}% ${getStatusEmoji(metrics.coverage.statements)}\n`);
  
  console.log('🎯 Service Coverage:');
  metrics.services.forEach(service => {
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    console.log(`   ${formatServiceName(service.name).padEnd(20)} ${avg.toFixed(2)}% ${getStatusEmoji(avg, getServiceTarget(service.name))}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

function getStatusEmoji(value: number, target: number = 80): string {
  if (value >= target) return '✅';
  if (value >= target - 10) return '⚠️';
  return '❌';
}

function formatServiceName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getServiceTarget(serviceName: string): number {
  const criticalServices = ['auth-service', 'azora-mint'];
  const highPriorityServices = ['azora-education'];
  
  if (criticalServices.includes(serviceName)) return 95;
  if (highPriorityServices.includes(serviceName)) return 90;
  return 85;
}

function generateProgressBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function checkAllServicesPass(services: ServiceMetrics[]): boolean {
  return services.every(service => {
    const target = getServiceTarget(service.name);
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    return avg >= target;
  });
}

function getServicesPassCount(services: ServiceMetrics[]): number {
  return services.filter(service => {
    const target = getServiceTarget(service.name);
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    return avg >= target;
  }).length;
}

function checkNoCriticalGaps(services: ServiceMetrics[]): boolean {
  return !services.some(service => {
    const criticalServices = ['auth-service', 'azora-mint'];
    if (!criticalServices.includes(service.name)) return false;
    
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    return avg < 95;
  });
}

function getCriticalGapsCount(services: ServiceMetrics[]): number {
  return services.filter(service => {
    const criticalServices = ['auth-service', 'azora-mint'];
    if (!criticalServices.includes(service.name)) return false;
    
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    return avg < 95;
  }).length;
}

function generateNextSteps(metrics: TestMetrics): string {
  const steps: string[] = [];
  
  if (metrics.coverage.lines < 80) {
    steps.push('- 🎯 Increase overall line coverage to 80%+');
  }
  
  metrics.services.forEach(service => {
    const target = getServiceTarget(service.name);
    const avg = (service.coverage.lines + service.coverage.branches + service.coverage.functions + service.coverage.statements) / 4;
    
    if (avg < target) {
      steps.push(`- 📝 Improve ${formatServiceName(service.name)} coverage to ${target}% (currently ${avg.toFixed(1)}%)`);
    }
  });
  
  if (steps.length === 0) {
    steps.push('- ✅ All coverage targets met! Consider:');
    steps.push('  - Adding more edge case tests');
    steps.push('  - Improving test quality');
    steps.push('  - Adding performance tests');
  }
  
  return steps.join('\n');
}

// Run the script
generateMetrics().catch(error => {
  console.error('❌ Error generating metrics:', error);
  process.exit(1);
});
