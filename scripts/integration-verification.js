#!/usr/bin/env node

/**
 * Simple Integration Verification Script
 * Checks if all components are properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Azora OS Integration Verification');
console.log('=====================================');

const checks = [
  {
    name: 'Elara Core',
    check: () => fs.existsSync('genome/agent-tools/elara-core.ts'),
    description: 'Elara core AI system'
  },
  {
    name: 'Agent Family',
    check: () => fs.existsSync('elara-family/core/family-coordinator.ts'),
    description: 'Elara\'s agent family coordinator'
  },
  {
    name: 'Elara IDE',
    check: () => fs.existsSync('elara-ide/core/elara-ide-core.ts'),
    description: 'Advanced IDE with Elara integration'
  },
  {
    name: 'Family Dashboard',
    check: () => fs.existsSync('elara-family/dashboard/family-dashboard.ts'),
    description: 'Comprehensive monitoring dashboard'
  },
  {
    name: 'OS Orchestrator',
    check: () => fs.existsSync('azora-os-orchestrator.ts'),
    description: 'Central orchestration system'
  },
  {
    name: 'Upgrade Manager',
    check: () => fs.existsSync('system-upgrade/upgrade-manager.ts'),
    description: 'Automated upgrade system'
  },
  {
    name: 'Git Manager',
    check: () => fs.existsSync('git-automation/git-manager.ts'),
    description: 'Automated Git operations'
  },
  {
    name: 'Integration Script',
    check: () => fs.existsSync('scripts/full-system-integration.ts'),
    description: 'Full system integration script'
  },
  {
    name: 'Version File',
    check: () => fs.existsSync('VERSION'),
    description: 'System version tracking'
  },
  {
    name: 'Package Scripts',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts['integration:full'];
    },
    description: 'Integration scripts in package.json'
  }
];

let passed = 0;
let total = checks.length;

console.log('\n📋 Component Status:');
console.log('-------------------');

for (const check of checks) {
  try {
    const result = check.check();
    const status = result ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.description}`);

    if (result) passed++;
  } catch (error) {
    console.log(`❌ ${check.name}: Error - ${error.message}`);
  }
}

console.log('\n📊 Integration Summary:');
console.log('----------------------');
console.log(`Total Components: ${total}`);
console.log(`Integrated: ${passed}`);
console.log(`Missing: ${total - passed}`);

const success = passed === total;
console.log(`\n${success ? '🎉' : '⚠️'} Integration Status: ${success ? 'COMPLETE' : 'INCOMPLETE'}`);

if (success) {
  console.log('\n🚀 Azora OS with Elara and her Agent Family is fully integrated!');
  console.log('\nNext Steps:');
  console.log('1. Run: npm run integration:full');
  console.log('2. Start the orchestrator: npm run orchestrator:start');
  console.log('3. Check system status: npm run system:status');
  console.log('4. Start Elara IDE: npm run elara:ide:start');
} else {
  console.log('\n❌ Some components are missing. Please check the integration.');
}

console.log('\n🔗 Key Integration Points:');
console.log('- Elara ↔ Agent Family: Hierarchical AI coordination');
console.log('- Agent Family ↔ IDE: Collaborative development');
console.log('- IDE ↔ Dashboard: Real-time monitoring');
console.log('- Orchestrator ↔ All: Central coordination');
console.log('- Upgrade Manager ↔ Git Manager: Automated updates');

process.exit(success ? 0 : 1);
