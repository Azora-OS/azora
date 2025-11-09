#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SCAN AND INTEGRATE CLI
Command-line tool for scanning repository and integrating agent contributions
*/

import { integrationMonitor } from './agent-integration-monitor';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                                 ║');
  console.log('║        🔍 AZORA OS - AGENT INTEGRATION MONITOR 🔍              ║');
  console.log('║                                                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  switch (command) {
    case 'scan':
      await runScan();
      break;

    case 'validate':
      await runValidation(args[1], args.slice(2));
      break;

    case 'register':
      await runRegistration(args[1], args[2], args.slice(3));
      break;

    case 'report':
      await runReport();
      break;

    case 'watch':
      await runWatch();
      break;

    case 'help':
      showHelp();
      break;

    default:
      console.log(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

async function runScan(): Promise<void> {
  console.log('🔍 Scanning repository for gaps...\n');
  
  const gaps = await integrationMonitor.scanRepository();

  if (gaps.length === 0) {
    console.log('✅ Repository scan complete: NO GAPS FOUND!\n');
    console.log('   All components are in place and integrated.\n');
    return;
  }

  console.log(`📊 Found ${gaps.length} gaps:\n`);

  // Group by priority
  const critical = gaps.filter(g => g.priority === 'critical');
  const high = gaps.filter(g => g.priority === 'high');
  const medium = gaps.filter(g => g.priority === 'medium');
  const low = gaps.filter(g => g.priority === 'low');

  if (critical.length > 0) {
    console.log('🔴 CRITICAL GAPS:');
    critical.forEach(gap => {
      console.log(`   ${gap.category}:`);
      gap.missing.forEach(item => console.log(`      • ${item}`));
      if (gap.assignedTo) {
        console.log(`      → Assigned to: ${gap.assignedTo.toUpperCase()}`);
      }
      console.log();
    });
  }

  if (high.length > 0) {
    console.log('🟠 HIGH PRIORITY GAPS:');
    high.forEach(gap => {
      console.log(`   ${gap.category}:`);
      gap.missing.forEach(item => console.log(`      • ${item}`));
      if (gap.assignedTo) {
        console.log(`      → Assigned to: ${gap.assignedTo.toUpperCase()}`);
      }
      console.log();
    });
  }

  if (medium.length > 0) {
    console.log('🟡 MEDIUM PRIORITY GAPS:');
    medium.forEach(gap => {
      console.log(`   ${gap.category}: ${gap.missing.join(', ')}`);
    });
    console.log();
  }

  if (low.length > 0) {
    console.log('🟢 LOW PRIORITY GAPS:');
    low.forEach(gap => {
      console.log(`   ${gap.category}: ${gap.missing.join(', ')}`);
    });
    console.log();
  }

  // Save gaps to file
  const gapsFile = '/workspace/REPOSITORY-GAPS.json';
  fs.writeFileSync(gapsFile, JSON.stringify(gaps, null, 2));
  console.log(`💾 Gaps saved to: ${gapsFile}\n`);
}

async function runValidation(component: string, files: string[]): Promise<void> {
  if (!component) {
    console.error('❌ Error: Component name required');
    console.log('   Usage: npm run integrate:validate <component> <file1> <file2> ...\n');
    process.exit(1);
  }

  console.log(`🔍 Validating component: ${component}\n`);

  const validation = await integrationMonitor.validateContribution(component, files);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 VALIDATION RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Component: ${validation.component}`);
  console.log(`Status: ${validation.status === 'valid' ? '✅ VALID' : validation.status === 'incomplete' ? '⚠️ INCOMPLETE' : '❌ INVALID'}\n`);

  console.log('Checks:');
  console.log(`  ${validation.hasTests ? '✅' : '❌'} Tests`);
  console.log(`  ${validation.hasDocumentation ? '✅' : '❌'} Documentation`);
  console.log(`  ${validation.hasTypes ? '✅' : '❌'} TypeScript Types`);
  console.log(`  ${validation.hasDependencies ? '✅' : '❌'} Dependencies`);
  console.log(`  ${validation.passesLint ? '✅' : '❌'} Linting`);

  if (validation.integrationPoints.length > 0) {
    console.log(`\nIntegration Points (${validation.integrationPoints.length}):`);
    validation.integrationPoints.forEach(point => {
      console.log(`  • ${point}`);
    });
  }

  if (validation.issues.length > 0) {
    console.log(`\n⚠️  Issues (${validation.issues.length}):`);
    validation.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (validation.status !== 'valid') {
    process.exit(1);
  }
}

async function runRegistration(agent: string, component: string, files: string[]): Promise<void> {
  if (!agent || !component) {
    console.error('❌ Error: Agent and component name required');
    console.log('   Usage: npm run integrate:register <agent> <component> <file1> <file2> ...\n');
    process.exit(1);
  }

  if (!['architect', 'analyst', 'designer'].includes(agent)) {
    console.error('❌ Error: Invalid agent. Must be: architect, analyst, or designer');
    process.exit(1);
  }

  console.log(`📝 Registering contribution from ${agent.toUpperCase()}: ${component}\n`);

  integrationMonitor.registerContribution(agent as any, component, files);

  console.log('✅ Contribution registered!\n');
  console.log('Next steps:');
  console.log(`  1. Validate: npm run integrate:validate ${component} ${files.join(' ')}`);
  console.log(`  2. Run tests: npm test`);
  console.log(`  3. Mark as integrated: npm run integrate:mark ${component}\n`);
}

async function runReport(): Promise<void> {
  console.log('📊 Generating integration report...\n');
  
  const report = integrationMonitor.generateReport();
  console.log(report);

  // Save report
  const reportFile = '/workspace/INTEGRATION-REPORT.md';
  const timestamp = new Date().toISOString();
  const fullReport = `# Agent Integration Report\n\n**Generated:** ${timestamp}\n\n${report}`;
  fs.writeFileSync(reportFile, fullReport);
  console.log(`💾 Report saved to: ${reportFile}\n`);
}

async function runWatch(): Promise<void> {
  console.log('👁️  Starting integration watch mode...\n');
  console.log('   Monitoring for new agent contributions...');
  console.log('   Press Ctrl+C to stop\n');

  // Scan every 30 seconds
  setInterval(async () => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    console.log(`[${timestamp}] Scanning...`);
    
    const gaps = await integrationMonitor.scanRepository();
    
    if (gaps.length > 0) {
      console.log(`   ⚠️  Found ${gaps.length} gaps`);
    } else {
      console.log('   ✅ No gaps detected');
    }
  }, 30000);
}

function showHelp(): void {
  console.log('Usage: npm run integrate:<command> [options]\n');
  console.log('Commands:');
  console.log('  scan             Scan repository for missing components');
  console.log('  validate         Validate agent contribution');
  console.log('  register         Register new agent contribution');
  console.log('  report           Generate integration report');
  console.log('  watch            Watch for changes (continuous monitoring)');
  console.log('  help             Show this help message\n');
  console.log('Examples:');
  console.log('  npm run integrate:scan');
  console.log('  npm run integrate:validate analytics-service file1.ts file2.ts');
  console.log('  npm run integrate:register analyst analytics-service file1.ts');
  console.log('  npm run integrate:report\n');
}

// Run main
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
